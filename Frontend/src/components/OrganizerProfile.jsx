import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { User, Calendar, MapPin, Users, Video, Image as ImageIcon, Search, Check, Lock, ChevronRight, Play } from 'lucide-react';
import UserDataService from '../services/UserDataServices';
import SocialServices from '../services/SocialServices';
import EventService from '../services/EventServices';

const OrganizerProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = useSelector((state) => state.user?.token);
    const currentUserInfo = useSelector((state) => state.user);

    const [organizer, setOrganizer] = useState(null);
    const [events, setEvents] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followLoading, setFollowLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('events'); // 'events', 'photos', 'videos'

    useEffect(() => {
        if (id) {
            loadProfileAndEvents();
        }
    }, [id, token]);

    const loadProfileAndEvents = async () => {
        setLoading(true);
        try {
            // Load public profile
            const profileRes = await UserDataService.getPublicProfile(id, token);
            const userProfile = profileRes.data;
            setOrganizer(userProfile);
            setFollowersCount(userProfile.followers?.length || 0);

            // Check if current user is following
            if (currentUserInfo && userProfile.followers) {
                const myId = currentUserInfo.id || currentUserInfo._id;
                setIsFollowing(userProfile.followers.includes(myId));
            }

            // Load events organized by this user
            const nameQuery = userProfile.name || '';
            const eventsRes = await EventService.searchEvents(nameQuery);
            // Filter events where organizer matches this ID
            const filtered = eventsRes.data.filter(e => e.organizer?._id === id || e.organizer === id);
            setEvents(filtered);

            // Load posts published by this organizer
            if (token) {
                try {
                    const postsRes = await SocialServices.getUserPosts(id, token);
                    setPosts(postsRes.data);
                } catch (err) {
                    console.error("Error loading organizer posts", err);
                }
            }
        } catch (error) {
            console.error("Error loading organizer profile", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFollowToggle = async () => {
        if (!token) {
            navigate('/login');
            return;
        }
        if (organizer.plan === 'free') {
            return;
        }

        setFollowLoading(true);
        try {
            const res = await SocialServices.toggleFollow(id, token);
            setIsFollowing(res.data.isFollowing);
            setFollowersCount(prev => res.data.isFollowing ? prev + 1 : Math.max(0, prev - 1));
        } catch (error) {
            alert(error.response?.data?.message || "Erreur lors de l'abonnement");
        } finally {
            setFollowLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-20">
                <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-2 text-slate-400">Chargement du profil...</p>
            </div>
        );
    }

    if (!organizer) {
        return (
            <div className="card text-center py-12">
                <p className="text-slate-400 text-lg">Profil introuvable ou privé.</p>
            </div>
        );
    }

    const isOrganizerRole = organizer.role === 'event_organizer' || organizer.role === 'admin';
    const isPaidPlan = organizer.plan && organizer.plan !== 'free';

    return (
        <div className="max-w-4xl mx-auto space-y-8 text-left">
            {/* Banner card */}
            <div className="card glass p-6 relative overflow-hidden rounded-3xl border border-white/10 shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>
                
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                    {/* Dynamic Avatar with Initial */}
                    <div className="w-24 h-24 rounded-2xl bg-indigo-600 text-white font-black text-3xl flex items-center justify-center shadow-lg shrink-0 select-none">
                        {organizer.name ? organizer.name.charAt(0).toUpperCase() : '?'}
                    </div>

                    <div className="space-y-3 grow">
                        <div className="flex flex-wrap gap-2 items-center justify-center md:justify-start">
                            <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                {isOrganizerRole ? 'Organisateur BANTU' : 'Participant'}
                            </span>
                            {isOrganizerRole && (
                                <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                                    organizer.plan === 'enterprise' 
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                                        : organizer.plan === 'pro' 
                                            ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' 
                                            : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                                }`}>
                                    {organizer.plan === 'enterprise' ? '✨ Entreprise' : organizer.plan === 'pro' ? '⭐ PRO' : 'Standard'}
                                </span>
                            )}
                        </div>

                        <h2 className="text-3xl font-black text-white">{organizer.name} {organizer.lastName}</h2>
                        
                        {isOrganizerRole && (
                            <div className="flex items-center justify-center md:justify-start gap-4 text-slate-400 text-xs">
                                <span className="flex items-center gap-1.5"><Users size={14} /> <strong>{followersCount}</strong> abonnés</span>
                                <span>•</span>
                                <span className="flex items-center gap-1.5"><Calendar size={14} /> <strong>{events.length}</strong> événements</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Subscription CTA / Banner */}
            {isOrganizerRole && (
                <div className="card glass p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg text-slate-200">
                    <div className="space-y-1 text-center md:text-left grow max-w-xl">
                        <p className="text-sm font-semibold leading-relaxed">
                            {isPaidPlan 
                                ? "Pour avoir les dernières nouvelles sur les événements créés, leurs dates et des infos exclusives, abonnez-vous !" 
                                : "Les abonnements ne sont disponibles que pour les organisateurs possédant un forfait payant (PRO ou Entreprise)."
                            }
                        </p>
                    </div>

                    <div className="shrink-0 w-full md:w-auto">
                        {isPaidPlan ? (
                            <button
                                onClick={handleFollowToggle}
                                disabled={followLoading}
                                className={`w-full md:w-auto py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition ${
                                    isFollowing 
                                        ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400' 
                                        : 'btn-primary'
                                }`}
                            >
                                {isFollowing ? (
                                    <>
                                        <Check size={14} /> Abonné
                                    </>
                                ) : (
                                    "S'abonner"
                                )}
                            </button>
                        ) : (
                            <div className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-[10px] uppercase font-bold text-slate-400 select-none">
                                <Lock size={12} /> Abonnements Bloqués
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Content Tabs */}
            {isOrganizerRole && (
                <div className="space-y-6">
                    {/* Navigation tabs */}
                    <div className="flex border-b border-white/10 gap-6">
                        <button 
                            className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'events' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400 hover:text-white'}`}
                            onClick={() => setActiveTab('events')}
                        >
                            Événements ({events.length})
                        </button>
                        <button 
                            className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'photos' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400 hover:text-white'}`}
                            onClick={() => setActiveTab('photos')}
                        >
                            Galerie Photos
                        </button>
                        <button 
                            className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'videos' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400 hover:text-white'}`}
                            onClick={() => setActiveTab('videos')}
                        >
                            Aftermovies & Clips
                        </button>
                    </div>

                    {/* Tab contents */}
                    {activeTab === 'events' && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 border border-white/5 p-4 rounded-2xl">
                                <div>
                                    <h4 className="font-bold text-white text-sm">Parcourir la liste complète</h4>
                                    <p className="text-xs text-slate-400 mt-1">Découvrez tous les événements organisés par {organizer.name} (passés, présents et futurs).</p>
                                </div>
                                <button 
                                    onClick={() => navigate(`/search?q=${encodeURIComponent(organizer.name + ' ' + (organizer.lastName || ''))}`)}
                                    className="btn-primary py-2.5 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0"
                                >
                                    <Search size={14} /> Voir sur la recherche
                                </button>
                            </div>

                            {events.length === 0 ? (
                                <p className="text-sm text-slate-400 text-center py-8">Aucun événement à afficher actuellement.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {events.map(event => (
                                        <div key={event._id} className="card glass p-4 flex gap-4 items-center border border-white/5 hover:border-indigo-500/20 transition rounded-2xl">
                                            {event.imageUrl && (
                                                <img src={event.imageUrl} alt={event.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                                            )}
                                            <div className="grow min-w-0">
                                                <h4 className="font-bold text-white text-sm truncate">{event.title}</h4>
                                                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><MapPin size={12} /> {event.location?.city}</p>
                                                <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider mt-1.5 inline-block bg-indigo-500/10 px-2 py-0.5 rounded">
                                                    {event.category}
                                                </span>
                                            </div>
                                            <Link to={`/events/${event._id}`} className="p-2 bg-white/5 rounded-full hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-400 transition">
                                                <ChevronRight size={16} />
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'photos' && (() => {
                        const postPhotos = posts.filter(p => p.mediaType === 'image');
                        if (postPhotos.length === 0) {
                            return <p className="text-sm text-slate-400 text-center py-8">Aucune photo publiée par cet organisateur.</p>;
                        }
                        return (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {postPhotos.map((post, idx) => (
                                    <div key={post._id || idx} className="rounded-2xl overflow-hidden aspect-square bg-slate-900 border border-white/5 group relative cursor-pointer shadow-md">
                                        <img src={post.mediaUrl} alt={post.caption || "activité"} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition flex flex-col justify-end p-3 text-left">
                                            {post.event && <span className="text-[9px] text-indigo-300 font-bold uppercase tracking-wider mb-1 truncate">📅 {post.event.title}</span>}
                                            <p className="text-[10px] text-white font-medium truncate">{post.caption || "Publication de l'organisateur"}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}

                    {activeTab === 'videos' && (() => {
                        const postVideos = posts.filter(p => p.mediaType === 'video');
                        if (postVideos.length === 0) {
                            return <p className="text-sm text-slate-400 text-center py-8">Aucun clip ou aftermovie publié par cet organisateur.</p>;
                        }
                        return (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {postVideos.map((post, idx) => (
                                    <div key={post._id || idx} className="card glass overflow-hidden border border-white/5 rounded-2xl shadow-lg flex flex-col">
                                        <div className="relative aspect-[9/16] max-h-[300px] bg-black">
                                            <video 
                                                src={post.mediaUrl} 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                controls
                                                preload="metadata"
                                            />
                                        </div>
                                        <div className="p-3 text-left">
                                            <h4 className="font-bold text-white text-xs truncate">{post.caption || "Clip d'événement"}</h4>
                                            {post.event && <p className="text-[10px] text-indigo-300 font-bold mt-1 uppercase tracking-wider truncate">📍 {post.event.title}</p>}
                                            <p className="text-[9px] text-slate-500 mt-0.5">{new Date(post.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
                </div>
            )}

            {!isOrganizerRole && (
                <div className="card glass p-6 rounded-3xl border border-white/10 space-y-4">
                    <h3 className="text-lg font-black text-white">Centre d'Intérêts</h3>
                    <div className="flex flex-wrap gap-2">
                        {organizer.interests && organizer.interests.length > 0 ? (
                            organizer.interests.map((interest, idx) => (
                                <span key={idx} className="px-3.5 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold">
                                    ✨ {interest}
                                </span>
                            ))
                        ) : (
                            <p className="text-xs text-slate-400">Aucun intérêt spécifié.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrganizerProfile;
