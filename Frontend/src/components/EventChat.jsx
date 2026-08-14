import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Send, Paperclip, X, Play, Archive, Image as ImageIcon, Smile } from 'lucide-react';
import JSZip from 'jszip';
import SocialServices from '../services/SocialServices';
import http from '../services/http-common';
import UserDataService from '../services/UserDataServices';

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;   // 5 MB
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;   // 100 MB
const MAX_VIDEO_SECS = 120;                  // 2 minutes

async function compressImage(file) {
    const attempts = [
        { quality: 0.80, maxDim: 1920 },
        { quality: 0.60, maxDim: 1280 },
        { quality: 0.30, maxDim: 800 },
    ];

    let currentBlob = file;

    for (const { quality, maxDim } of attempts) {
        if (currentBlob.size <= MAX_PHOTO_BYTES) break;

        currentBlob = await new Promise((resolve) => {
            const img = new window.Image();
            const url = URL.createObjectURL(currentBlob);
            img.onload = () => {
                let { width, height } = img;
                if (width > maxDim || height > maxDim) {
                    if (width > height) { height = Math.round(height * maxDim / width); width = maxDim; }
                    else { width = Math.round(width * maxDim / height); height = maxDim; }
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                URL.revokeObjectURL(url);
                canvas.toBlob((b) => resolve(b), 'image/jpeg', quality);
            };
            img.src = url;
        });
    }

    return currentBlob;
}

/** Zippe un Blob et renvoie un nouveau Blob .zip */
async function zipBlob(blob, fileName) {
    const zip = new JSZip();
    zip.file(fileName, blob);
    return zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 9 } });
}

/** Lit la durée d'une vidéo en secondes. */
function getVideoDuration(file) {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        const url = URL.createObjectURL(file);
        video.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve(video.duration); };
        video.onerror = reject;
        video.src = url;
    });
}

function UserAvatar({ name, onClick }) {
    const letter = name ? name.charAt(0).toUpperCase() : '?';

    const colors = [
        '#ef4444', '#22c55e', '#3b82f6', '#eab308',
        '#a855f7', '#ec4899', '#6366f1', '#14b8a6',
        '#f97316', '#06b6d4', '#84cc16', '#f43f5e',
        '#d946ef', '#8b5cf6', '#0ea5e9', '#10b981',
        '#f59e0b', '#64748b', '#6b7280', '#78716c'
    ];
    let hash = 0;

    const nameString = name || '';
    for (let i = 0; i < nameString.length; i++) {
        hash = nameString.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = colors[Math.abs(hash) % colors.length];

    return (
        <button
            type="button"
            className="chat-profil-btn text-white font-bold"
            style={{ backgroundColor: color }}
            onClick={onClick}
            title={name}
        >
            {letter}
        </button>
    );
}

/** Retourne { blob, mediaType, fileName } prêt pour FormData. */
async function prepareFile(file) {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    let blob = file;
    let name = file.name;
    let type = 'file';

    if (isImage) {
        type = 'image';
        if (blob.size > MAX_PHOTO_BYTES) {
            blob = await compressImage(blob);
            name = name.replace(/\.[^/.]+$/, '') + '_compressed.jpg';
        }
        // Dernier recours : zip
        if (blob.size > MAX_PHOTO_BYTES) {
            blob = await zipBlob(blob, name);
            name = name.replace(/\.[^/.]+$/, '') + '.zip';
            type = 'file';
        }
    } else if (isVideo) {
        type = 'video';
        const duration = await getVideoDuration(file);
        if (duration > MAX_VIDEO_SECS) {
            throw new Error(`La vidéo dure ${Math.round(duration)}s — maximum autorisé : ${MAX_VIDEO_SECS}s (2 minutes).`);
        }
        if (blob.size > MAX_VIDEO_BYTES) {
            blob = await zipBlob(blob, name);
            name = name.replace(/\.[^/.]+$/, '') + '.zip';
            type = 'file';
        }
    }

    return { blob, name, type };
}

// ─── Composant ────────────────────────────────────────────────────────────────

const EventChat = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = useSelector(state => state.user?.token);
    const localUser = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();

    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadInfo, setUploadInfo] = useState('');
    const [preview, setPreview] = useState(null); // { name, type, objectUrl }
    const [pendingFile, setPendingFile] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false); // Emoji picker toggle state
    const chatContainerRef = useRef(null);
    const fileInputRef = useRef(null);
    const [isNewMessage, setIsNewMessage] = useState(false); // Flag to indicate if a new message has been sent

    const popularEmojis = [
        '😀', '😂', '😍', '🔥', '🎉', '👍', '❤️', '👏', 
        '🙌', '🚀', '💯', '✨', '🌟', '😎', '💡', '🤔',
        '🎫', '📅', '🎵', '🍻', '🎈', '🤩', '🎯', '💪'
    ];

    const handleEmojiSelect = (emoji) => {
        setText(prev => prev + emoji);
    };

    useEffect(() => {
        if (token && id) {
            loadMessages();
            const interval = setInterval(loadMessages, 4000);
            return () => clearInterval(interval);
        }
    }, [id, token]);

    useEffect(() => {
        const container = chatContainerRef.current;
        if (isNewMessage && container) {
            container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth'
            });
            setIsNewMessage(false); // Reset flag to prevent repeating scrolls
        }
    }, [isNewMessage]);

    const loadMessages = async () => {
        try {
            const res = await SocialServices.getChatMessages(id, token);
            setIsNewMessage(messages.length === res.data.length ? false : true);
            setMessages(res.data);
        } catch (e) { console.error('Error loading chat', e); }
    };

    // ── Sélection de fichier ─────────────────────────────────────────────────
    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = null; // reset so same file can be re-selected

        setUploadInfo('Analyse du fichier…');
        try {
            const { blob, name, type } = await prepareFile(file);
            const objectUrl = URL.createObjectURL(blob);
            setPreview({ name, type, objectUrl });
            setPendingFile({ blob, name, mimeType: blob.type });
            setUploadInfo('');
        } catch (err) {
            setUploadInfo('');
            alert(`❌ ${err.message}`);
        }
    };

    const clearPreview = () => {
        if (preview?.objectUrl) URL.revokeObjectURL(preview.objectUrl);
        setPreview(null);
        setPendingFile(null);
    };

    // ── Envoi ────────────────────────────────────────────────────────────────
    const handleSend = async (e) => {
        e.preventDefault();
        if (!text.trim() && !pendingFile) return;
        setShowEmojiPicker(false);

        if (pendingFile) {
            await sendMedia();
        } else {
            await sendText();
        }
    };

    const handleUserAvatarClick = (userId) => {
        navigate(`/organizer/${userId}`);
    };

    const sendText = async () => {
        try {
            const res = await SocialServices.sendChatMessage(id, text, token);
            setMessages(prev => [...prev, res.data]);
            setIsNewMessage(true);
            setText('');
        } catch (e) { console.error(e); }
    };

    const sendMedia = async () => {
        setUploading(true);
        setUploadInfo('Envoi du média…');
        try {
            const formData = new FormData();
            formData.append('media', pendingFile.blob, pendingFile.name);

            const uploadRes = await http.post(`/events/${id}/chat/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
            });
            const { mediaUrl, mediaType, fileName } = uploadRes.data;

            const msgRes = await http.post(`/events/${id}/chat`, {
                content: text || null,
                mediaUrl,
                mediaType,
                fileName,
            }, { headers: { Authorization: `Bearer ${token}` } });

            setMessages(prev => [...prev, msgRes.data]);
            setIsNewMessage(true);
            setText('');
            clearPreview();
        } catch (err) {
            alert(`❌ ${err.response?.data?.message || err.message}`);
        } finally {
            setUploading(false);
            setUploadInfo('');
        }
    };

    // ── Rendu d'un message ───────────────────────────────────────────────────
    const renderMedia = (msg) => {
        if (!msg.mediaUrl) return null;

        if (msg.mediaType === 'image') {
            return (
                <a href={msg.mediaUrl} target="_blank" rel="noreferrer" className="block mt-1.5">
                    <img
                        src={msg.mediaUrl}
                        alt="média"
                        style={{ maxWidth: '240px', maxHeight: '180px', width: 'auto', height: 'auto', objectFit: 'contain', borderRadius: '12px' }}
                        className="cursor-pointer hover:opacity-90 transition"
                    />
                </a>
            );
        }

        if (msg.mediaType === 'video') {
            return (
                <div className="mt-1.5 rounded-xl overflow-hidden border border-indigo-500/20 bg-black/40" style={{ maxWidth: '280px' }}>
                    <video
                        src={msg.mediaUrl}
                        controls
                        preload="metadata"
                        style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '180px', objectFit: 'contain' }}
                    />
                </div>
            );
        }

        // fichier / zip
        return (
            <a href={msg.mediaUrl} target="_blank" rel="noreferrer" download
                className="flex items-center gap-2 mt-1.5 p-2.5 bg-white/5 border border-white/10 rounded-xl max-w-[280px] hover:bg-white/10 transition">
                <Archive size={20} className="text-slate-400 shrink-0" />
                <div>
                    <p className="text-xs font-bold text-slate-200 truncate">{msg.fileName || 'Fichier compressé'}</p>
                    <p className="text-[10px] text-slate-500">Cliquer pour télécharger</p>
                </div>
            </a>
        );
    };

    return (
        <div className="max-w-3xl mx-auto glass p-6 h-[640px] flex flex-col justify-between text-left">
            {/* Header */}
            <div className="border-b border-white/10 pb-3">
                <h2 className="text-xl font-black text-white font-sans uppercase">Chat Room de l'Événement</h2>
                <p className="text-[10px] text-slate-500 mt-0.5">
                    📷 Photos ≤ 5 MB (auto-compressé) &nbsp;·&nbsp; 🎥 Vidéos ≤ 2 min / 100 MB (auto-zippé)
                </p>
            </div>

            {/* Message list */}
            <div ref={chatContainerRef} className="chat-container chat-messages-doodle flex-grow overflow-y-auto my-4 p-6 space-y-5 rounded-2xl border border-white/5 shadow-inner">
                {messages.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-10 bg-slate-950/20 rounded-xl">Aucun message pour le moment. Lancez la discussion !</p>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.user?._id === localUser?.id;
                        return (
                            <div key={msg._id} className={`chat-messages-container flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className={`flex items-center gap-2 mb-1.5 ${isMe ? 'display-right' : 'display-left'}`}>
                                    <UserAvatar 
                                        name={msg.user?.name + ' ' + msg.user?.lastName} 
                                        onClick={() => handleUserAvatarClick(msg.user?._id)} 
                                    />
                                    <span className="text-[10px] text-slate-400 font-medium">
                                        {msg.user?.name} {msg.user?.lastName} ({msg.user?.role})
                                    </span>
                                </div>
                                {msg.content && (
                                    <div className={`p-3.5 rounded-2xl max-w-md  border shadow-sm ${isMe ? 'bg-indigo-600/90 text-white border-indigo-500/30 rounded-tr-none' : 'bg-slate-900/80 text-slate-200 border-white/10 rounded-tl-none'}`}>
                                        {msg.content}
                                    </div>
                                )}
                                {renderMedia(msg)}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Prévisualisation du fichier sélectionné */}
            {preview && (
                <div className="flex items-center gap-3 p-2.5 mb-2 bg-white/5 border border-white/10 rounded-xl">
                    {preview.type === 'image'
                        ? <img src={preview.objectUrl} alt="aperçu" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                        : preview.type === 'video'
                            ? <video src={preview.objectUrl} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0, backgroundColor: '#000' }} preload="metadata" />
                            : <Archive size={20} className="text-slate-400 shrink-0" />
                    }
                    <p className="text-xs text-slate-300 truncate flex-1">{preview.name}</p>
                    <button onClick={clearPreview} className="text-slate-500 hover:text-rose-400 transition shrink-0">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Upload indicator */}
            {(uploading || uploadInfo) && (
                <div className="flex items-center gap-2 py-1.5 mb-2 text-xs text-indigo-400">
                    <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    {uploadInfo || 'Envoi en cours…'}
                </div>
            )}

            {/* Input bar */}
            <form onSubmit={handleSend} className="flex gap-2 pt-3 border-t border-white/10 items-center relative">
                {/* Emoji Picker Popover */}
                {showEmojiPicker && (
                    <div 
                        className="chat-emoji-display "
                    >
                        {popularEmojis.map((emoji, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => handleEmojiSelect(emoji)}
                                className="text-xl hover:bg-white/10 p-1.5 rounded-lg transition active:scale-90 flex items-center justify-center"
                                style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}

                {/* Smiley button */}
                <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 hover:scale-110 transition shrink-0 text-indigo-400 hover:text-indigo-300"
                    title="Ajouter un emoji"
                >
                    <Smile size={22} />
                </button>

                {/* Bouton fichier */}
                <button
                    type="button"
                    id="chat-attach-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="p-2 hover:scale-110 transition disabled:opacity-40 shrink-0 text-indigo-400 hover:text-indigo-300"
                    title="Joindre une photo ou vidéo"
                >
                    <Paperclip size={22} />
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleFileChange}
                />
                <input
                    type="text"
                    placeholder={pendingFile ? 'Ajouter un message (optionnel)…' : 'Écrire votre message…'}
                    className="input py-3 px-4 rounded-xl border border-white/10 bg-white/5 text-xs grow text-white"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onFocus={() => setShowEmojiPicker(false)}
                />
                <button
                    type="submit"
                    disabled={uploading || (!text.trim() && !pendingFile)}
                    className="btn-primary py-3 px-4 flex items-center justify-center shrink-0 disabled:opacity-40"
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};

export default EventChat;
