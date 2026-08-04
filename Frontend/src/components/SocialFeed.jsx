import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Heart, MessageCircle, Send } from 'lucide-react';
import SocialServices from '../services/SocialServices';

const SocialFeed = () => {
    const token = useSelector(state => state.user?.token);
    const localUser = JSON.parse(localStorage.getItem('user'));
    
    const [posts, setPosts] = useState([]);
    const [caption, setCaption] = useState('');
    const [mediaFile, setMediaFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [mediaType, setMediaType] = useState('image');
    const [newComment, setNewComment] = useState({});

    useEffect(() => {
        if (token) {
            loadFeed();
        }
    }, [token]);

    const loadFeed = async () => {
        try {
            const res = await SocialServices.getFeed(token);
            setPosts(res.data);
        } catch (e) { console.error("Error loading feed", e); }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!mediaFile) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('media', mediaFile);
            
            const uploadRes = await SocialServices.uploadPostMedia(formData, token);
            const { mediaUrl, mediaType: uploadedMediaType } = uploadRes.data;

            await SocialServices.createPost({ mediaUrl, mediaType: uploadedMediaType, caption }, token);
            setCaption('');
            setMediaFile(null);
            document.getElementById('social-feed-file-input').value = "";
            loadFeed();
        } catch (e) { 
            console.error("Error creating post", e);
            alert("Erreur lors de la publication : " + (e.response?.data?.message || e.message));
        } finally {
            setUploading(false);
        }
    };

    const handleLike = async (postId) => {
        try {
            await SocialServices.toggleLikePost(postId, token);
            loadFeed();
        } catch (e) { console.error(e); }
    };

    const handleCommentSubmit = async (postId) => {
        if (!newComment[postId] || !newComment[postId].trim()) return;
        try {
            await SocialServices.addComment(postId, newComment[postId], token);
            setNewComment({ ...newComment, [postId]: '' });
            loadFeed();
        } catch (e) { console.error(e); }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 text-left">
            <h1 className="text-3xl font-black text-white font-sans uppercase">Fil d'actualité Sociale</h1>
            
            {/* Create Post Card */}
            <div className="card glass p-6 space-y-4">
                <h3 className="font-bold text-white text-md">Partagez un souvenir</h3>
                <form onSubmit={handleCreatePost} className="space-y-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-400 uppercase">Fichier média (Image ou Vidéo)</label>
                        <input 
                            type="file" 
                            id="social-feed-file-input"
                            accept="image/*,video/*"
                            className="input w-full p-2 rounded-xl border border-white/10 bg-white/5 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/80"
                            onChange={(e) => setMediaFile(e.target.files[0])} 
                            required
                        />
                    </div>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-xs text-white">
                            <input 
                                type="radio" 
                                name="mediaType" 
                                checked={mediaType === 'image'} 
                                onChange={() => setMediaType('image')} 
                            /> Image
                        </label>
                        <label className="flex items-center gap-2 text-xs text-white">
                            <input 
                                type="radio" 
                                name="mediaType" 
                                checked={mediaType === 'video'} 
                                onChange={() => setMediaType('video')} 
                            /> Vidéo
                        </label>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-400 uppercase">Légende</label>
                        <textarea 
                            placeholder="Que voulez-vous partager ?" 
                            rows="2"
                            className="input w-full p-3 rounded-xl border border-white/10 bg-white/5 text-xs"
                            value={caption} 
                            onChange={(e) => setCaption(e.target.value)}
                        />
                    </div>
                    <button type="submit" disabled={uploading} className="btn-primary py-2 px-6 text-xs uppercase font-bold disabled:opacity-50">
                        {uploading ? 'Publication en cours...' : 'Publier'}
                    </button>
                </form>
            </div>

            {/* Feed list */}
            <div className="space-y-6">
                {posts.length === 0 ? (
                    <div className="card glass text-center py-12 text-slate-400">
                        Abonnez-vous à des organisateurs pour voir leurs publications ici.
                    </div>
                ) : (
                    posts.map(post => {
                        const isLiked = post.likes.includes(localUser?.id);
                        return (
                            <div key={post._id} className="card glass p-0 overflow-hidden border border-white/10 flex flex-col">
                                <div className="p-4 flex items-center gap-2 border-b border-white/5">
                                    <div className="w-8 h-8 rounded-full bg-slate-700 font-bold flex items-center justify-center text-xs text-indigo-400">
                                        {post.user?.name ? post.user.name[0].toUpperCase() : 'U'}
                                    </div>
                                    <div>
                                        <span className="text-sm font-bold text-white block">{post.user?.name} {post.user?.lastName}</span>
                                        {post.event && <span className="text-[10px] text-slate-400">Événement : {post.event.title}</span>}
                                    </div>
                                </div>

                                <div className="bg-black w-full h-96 flex items-center justify-center overflow-hidden">
                                    {post.mediaType === 'image' ? (
                                        <img src={post.mediaUrl} alt="Publication" className="w-full h-full object-cover" />
                                    ) : (
                                        <video src={post.mediaUrl} controls className="w-full h-full object-cover" />
                                    )}
                                </div>

                                <div className="p-4 space-y-4">
                                    <div className="flex gap-4">
                                        <button 
                                            onClick={() => handleLike(post._id)}
                                            className="flex items-center gap-1.5 text-slate-300 hover:text-rose-500 bg-transparent border-0 cursor-pointer"
                                        >
                                            <Heart size={20} className={isLiked ? 'fill-rose-500 text-rose-500' : ''} />
                                            <span className="text-xs font-bold">{post.likes.length}</span>
                                        </button>
                                        <span className="flex items-center gap-1.5 text-slate-300 text-xs">
                                            <MessageCircle size={20} />
                                            <span className="font-bold">{post.comments.length}</span>
                                        </span>
                                    </div>

                                    {post.caption && (
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                            <strong className="text-white mr-1.5">{post.user?.name}</strong> 
                                            {post.caption}
                                        </p>
                                    )}

                                    {/* Comments section */}
                                    {post.comments.length > 0 && (
                                        <div className="space-y-2 pt-3 border-t border-white/5 max-h-40 overflow-y-auto">
                                            {post.comments.map((comment, index) => (
                                                <p key={index} className="text-[11px] text-slate-300">
                                                    <strong className="text-white mr-1.5">{comment.user?.name} {comment.user?.lastName} :</strong>
                                                    {comment.content}
                                                </p>
                                            ))}
                                        </div>
                                    )}

                                    {/* Add Comment input */}
                                    <div className="flex gap-2 pt-2 border-t border-white/5">
                                        <input 
                                            type="text" 
                                            placeholder="Ajouter un commentaire..."
                                            className="input py-2 px-3 rounded-lg border border-white/10 bg-white/5 text-xs grow text-white"
                                            value={newComment[post._id] || ''}
                                            onChange={(e) => setNewComment({ ...newComment, [post._id]: e.target.value })}
                                        />
                                        <button 
                                            onClick={() => handleCommentSubmit(post._id)} 
                                            className="btn-primary py-2 px-3 text-xs flex items-center justify-center shrink-0"
                                        >
                                            <Send size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default SocialFeed;
