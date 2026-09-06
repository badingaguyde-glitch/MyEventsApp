import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import EventService from '../services/EventServices';
import TicketService from '../services/TicketServices';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Users, ShieldCheck, Ticket, AlertCircle } from 'lucide-react';
import Loader from './Loader';

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const user = useSelector((state) => state.user);

    const [event, setEvent] = useState(null);
    const long = event?.coordinates?.[0];
    const lat = event?.coordinates?.[1];
    const hasCoordinates = (lat !== undefined && long !== undefined && lat !== 0 && long !== 0);
    const googleMapsUrl = hasCoordinates ? `https://www.google.com/maps/search/?api=1&query=${lat},${long}` :
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event?.location?.venue || ''} ${event?.location?.address || ''} ${event?.location?.city || ''}`)}`;

    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    console.log("event details loaded:", event);

    useEffect(() => {
        fetchEvent();
    }, [id]);

    const fetchEvent = async () => {
        try {
            const res = await EventService.getEventById(id);
            setEvent(res.data);
        } catch (err) {
            setMessage({ text: 'Failed to load event details.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleBooking = async () => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }

        setBooking(true);
        setMessage({ text: '', type: '' });

        try {

            const response = await TicketService.buyTicket({ eventId: id, price: event.price, user: user._id || user.id, clientType: 'web' }, user.token);
            if (response.data && response.data.stripeUrl) {
                window.location.href = response.data.stripeUrl;
            } else {
                setMessage({ text: 'Ticket booked successfully!', type: 'success' });
                fetchEvent();
            }
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Booking failed.', type: 'error' });
        } finally {
            setBooking(false);
        }
    };

    if (loading) return <Loader message="Loading event details..." />;
    if (!event) return <div className="text-center py-20 text-slate-400">Event not found.</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-12 py-6 md:py-12">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card glass border border-light transition-all overflow-hidden"
            >
                <div className="h-64 sm:h-80 md:h-[450px] relative">
                    <img
                        src={event.image?.startsWith('http') ? event.image : `${import.meta.env.VITE_API_BASE_URL || 'https://138-68-145-245.nip.io'}/uploads/${event.image || 'default.jpg'}`}
                        alt={event.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=1200' }}
                    />
                    <div className="event-details-hero-overlay"></div>
                    <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 md:right-10">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="px-4 py-1.5 bg-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20">
                                {event.category}
                            </span>
                            {event.availableSpots <= 5 && event.availableSpots > 0 && (
                                <span className="px-4 py-1.5 bg-rose-500 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-rose-500/20">
                                    Last few spots
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                    <div className="md:col-span-2 space-y-10">
                        <section className="space-y-4">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight line-clamp-3">{event.title}</h1>
                            <h2 className="text-2xl font-black border-l-4 border-primary pl-4">About This Event</h2>
                            <p className="text-slate-400 text-lg leading-relaxed font-medium">{event.description}</p>
                        </section>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="p-6 glass border border-light rounded-2xl space-y-3">
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Date & Time</p>
                                <div className="space-y-2">
                                    <p className="flex items-center gap-2 font-bold text-white">
                                        <Calendar size={18} className="text-primary" />
                                        {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                    <p className="flex items-center gap-2 text-sm text-slate-400 font-bold">
                                        <Clock size={16} /> {event.time || 'Heure non précisée'}
                                    </p>
                                </div>
                            </div>
                            <div className="p-6 glass border border-light rounded-2xl space-y-3">
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Venue Location</p>
                                <div className="space-y-2">
                                    <p className="flex items-center gap-2 font-bold text-white">
                                        <MapPin size={18} className="text-primary" />
                                        {event.location
                                            ? `${event.location.venue}, ${event.location.city}`
                                            : "Location not specified"}
                                    </p>
                                    <p className="text-sm text-slate-400 font-bold">In-person experience</p>
                                </div>
                                <div onClick={() => window.open(googleMapsUrl, '_blank', 'noopener,noreferrer')}
                                    className='group relative w-full h-48 rounded-2xl overflow-hidden border border-light bg-slate-900 cursor-pointer shadow-lg hover:border-primary/50 transition-all duration-300'>
                                    {hasCoordinates ? (
                                        <iframe
                                            title="Event Location"
                                            width="100%"
                                            height="100%"
                                            frameBorder="0"
                                            scrolling="no"
                                            marginHeight="0"
                                            marginWidth="0"
                                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${long - 0.005}%2C${lat - 0.005}%2C${long + 0.005}%2C${lat + 0.005}&layer=mapnik&marker=${lat}%2C${long}`}
                                            className="pointer-events-none filter grayscale opacity-80 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-6 text-center bg-slate-900/60">
                                            <span className="text-3xl">📍</span>
                                            <p className="text-sm font-bold text-white">Voir sur Google Maps</p>
                                            <p className="text-[10px] text-slate-400 font-medium">Cliquez pour ouvrir l'itinéraire</p>
                                        </div>
                                    )}
                                    {/* Overlay interactif qui s'affiche au survol */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center pointer-events-none">
                                        <span className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-lg flex items-center gap-2">
                                            🗺️ Ouvrir Google Maps
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="event-details-booking-card">
                            <div className="flex justify-between items-center mb-8 pb-6 border-b border-light">
                                <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Standard Pass</span>
                                <span className="text-4xl font-black text-primary">${event.price}</span>
                            </div>

                            <div className="space-y-6 mb-10">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-3 text-slate-400 font-bold uppercase tracking-widest text-[10px]"><Users size={16} className="text-primary" /> Capacity</span>
                                    <span className="font-black text-white">{event.capacity} Attendees</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-3 text-slate-400 font-bold uppercase tracking-widest text-[10px]"><ShieldCheck size={16} className="text-primary" /> Status</span>
                                    <span className={`font-black uppercase tracking-widest text-[10px] px-3 py-1 rounded-full ${event.availableSpots > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                        {event.availableSpots > 0 ? `${event.availableSpots} spots left` : 'Sold Out'}
                                    </span>
                                </div>
                            </div>

                            {message.text && (
                                <div className={`p-4 mb-6 rounded-xl text-xs font-bold flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                    }`}>
                                    {message.type === 'success' ? <ShieldCheck size={18} /> : <AlertCircle size={18} />}
                                    {message.text}
                                </div>
                            )}

                            <button
                                onClick={handleBooking}
                                disabled={booking || event.availableSpots <= 0}
                                className="btn-primary btn-purchase disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                {booking ? 'Processing...' : <><Ticket size={20} className="gap-2" /> Purchase Secret Ticket</>}
                            </button>

                            <button
                                onClick={async () => {
                                    if (!isLoggedIn) {
                                        setMessage({ text: 'Vous devez être connecté pour accéder au chat.', type: 'error' });
                                        return;
                                    }
                                    const organizerId = event.organizer?._id || event.organizer;
                                    const myId = user._id || user.id;
                                    if (user.role === 'admin' || (organizerId && myId && organizerId.toString() === myId.toString())) {
                                        navigate(`/events/${id}/chat`);
                                        return;
                                    }
                                    try {
                                        const res = await TicketService.getUserTickets(user.token);
                                        const myTickets = res.data;
                                        const hasTicket = myTickets.some(t => {
                                            const tEventId = t.event?._id || t.event;
                                            return tEventId && tEventId.toString() === id.toString();
                                        });
                                        if (hasTicket) {
                                            navigate(`/events/${id}/chat`);
                                        } else {
                                            setMessage({ text: 'Vous devez acheter un billet pour accéder au chat de cet événement.', type: 'error' });
                                        }
                                    } catch (err) {
                                        setMessage({ text: 'Erreur lors de la vérification des accès.', type: 'error' });
                                    }
                                }}
                                className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-slate-800 text-white hover:bg-slate-700 transition-colors border border-slate-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
                                Rejoindre le Chat de l'Événement
                            </button>

                            {!isLoggedIn && (
                                <p className="text-center text-[10px] font-bold text-slate-500 mt-6 uppercase tracking-[0.2em]">Authentication Required</p>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default EventDetails;
