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
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
     console.log("event details loaded:", event); // Debug log

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
            // Using direct token passing as requested
            await TicketService.buyTicket({ eventId: id, price: event.price }, user.token);
            setMessage({ text: 'Ticket booked successfully!', type: 'success' });
            fetchEvent(); // Refresh availability
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
                className="card glass border transition-all overflow-hidden"
                style={{ borderColor: 'var(--border-white)' }}
            >
                <div className="h-64 sm:h-80 md:h-[450px] relative">
                    <img
                        src={event.image?.startsWith('http') ? event.image : `http://localhost:5000/uploads/${event.image || 'default.jpg'}`}
                        alt={event.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=1200' }}
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10, 11, 14, 1), rgba(10, 11, 14, 0.4), transparent)' }}></div>
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
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight">{event.title}</h1>
                    </div>
                </div>

                <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                    <div className="md:col-span-2 space-y-10">
                        <section className="space-y-4">
                            <h2 className="text-2xl font-black border-l-4 border-primary pl-4">About This Event</h2>
                            <p className="text-slate-400 text-lg leading-relaxed font-medium">{event.description}</p>
                        </section>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="p-6 glass border rounded-2xl space-y-3" style={{ borderColor: 'var(--border-white)' }}>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Date & Time</p>
                                <div className="space-y-2">
                                    <p className="flex items-center gap-2 font-bold text-white">
                                        <Calendar size={18} className="text-primary" />
                                        {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                    <p className="flex items-center gap-2 text-sm text-slate-400 font-bold">
                                        <Clock size={16} /> {event.time}
                                    </p>
                                </div>
                            </div>
                            <div className="p-6 glass border rounded-2xl space-y-3" style={{ borderColor: 'var(--border-white)' }}>
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
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="p-8 glass border rounded-3xl sticky top-24" style={{ borderColor: 'var(--border-white)', background: 'rgba(255,255,255,0.02)' }}>
                            <div className="flex justify-between items-center mb-8 pb-6 border-b" style={{ borderBottom: '1px solid var(--border-white)' }}>
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
                                className="btn-primary w-full py-5 text-sm uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed"
                                style={{ boxShadow: '0 10px 30px rgba(59, 130, 246, 0.2)' }}
                            >
                                {booking ? 'Processing...' : <><Ticket size={20} className="gap-2" /> Purchase Secret Ticket</>}
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
