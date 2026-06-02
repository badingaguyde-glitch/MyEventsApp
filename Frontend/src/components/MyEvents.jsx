import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import EventService from '../services/EventServices';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Users, Calendar, MapPin, AlertCircle } from 'lucide-react';
import Loader from './Loader';

const MyEvents = () => {
    const user = useSelector((state) => state.user);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        if (user?.token) {
            fetchMyEvents();
        }
    }, [user]);

    const fetchMyEvents = async () => {
        try {
            const res = await EventService.getMyEvents(user.token);
            setEvents(res.data);
        } catch (err) {
            setMessage({ text: 'Failed to load your events.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this event? This will cancel all booked tickets.')) return;

        try {
            await EventService.deleteEvent(id, user.token);
            setMessage({ text: 'Event cancelled successfully.', type: 'success' });
            fetchMyEvents();
        } catch (err) {
            setMessage({ text: 'Failed to cancel event.', type: 'error' });
        }
    };

    const handlePay = async (id) => {
        try {
            setMessage({ text: 'Generating payment session...', type: 'success' });
            const res = await EventService.payEvent(id, user.token);
            if (res.data && res.data.stripeUrl) {
                window.location.href = res.data.stripeUrl;
            } else {
                setMessage({ text: 'Event activated successfully!', type: 'success' });
                fetchMyEvents();
            }
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Failed to initiate payment.', type: 'error' });
        }
    };

    if (loading) return <Loader message="Loading your events..." />;

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
                <h1 className="text-3xl md:text-4xl font-black shrink-0">Hosted Events</h1>
                <Link to="/create-event" className="btn-primary py-3 md:py-4 px-6 md:px-8 w-full md:w-auto shrink-0 justify-center">
                    <Plus size={20} className="mr-2" /> Create New Event
                </Link>
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl flex items-center gap-3 text-sm ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                    <AlertCircle size={18} />
                    {message.text}
                </div>
            )}

            {events.some(e => e.status === 'pending_payment') && (
                <div className="p-4 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-start gap-3 text-sm">
                    <AlertCircle className="shrink-0 mt-0.5" size={18} />
                    <div>
                        <h4 className="font-bold text-amber-300">Action Required: Unpaid Activation Fees</h4>
                        <p className="mt-1 text-xs">
                            One or more of your hosted events require an activation fee. Please check your emails (including spam) for the payment link to publish your events, or click "Pay Activation Fee" on the event card below.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map((event, index) => (
                    <motion.div
                        key={event._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="card glass border border-light transition-all"
                    >
                        <div className="p-6 space-y-6">
                            <div className="flex justify-between items-start gap-3">
                                <h3 className="text-xl font-bold truncate min-w-0">{event.title}</h3>
                                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest shrink-0 ${
                                    event.status === 'active' 
                                        ? 'bg-emerald-500/10 text-emerald-400' 
                                        : event.status === 'pending_payment'
                                        ? 'bg-amber-500/10 text-amber-400'
                                        : 'bg-rose-500/10 text-rose-400'
                                }`}>
                                    {event.status === 'pending_payment' ? 'pending payment' : event.status}
                                </div>
                            </div>

                            <div className="space-y-4 text-xs font-medium text-slate-400">
                                <p className="flex items-center gap-2"><Calendar size={14} className="text-primary" /> {new Date(event.date).toLocaleDateString()}</p>
                                <p className="flex items-center gap-2">
                                    <MapPin size={14} className="text-primary" />
                                    {event.location?.venue} - {event.location?.address}, {event.location?.city}
                                </p>
                                <p className="flex items-center gap-2"><Users size={14} className="text-primary" /> {event.soldTickets || 0} / {event.capacity} Spots Filled</p>
                            </div>

                            {event.status === 'pending_payment' && (
                                <div className="space-y-3 mt-4">
                                    <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl text-xs font-semibold flex items-start gap-2">
                                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                        <span>Activation fee pending. Please check your email (including spam) to complete the payment, or pay directly below.</span>
                                    </div>
                                    <button
                                        onClick={() => handlePay(event._id)}
                                        className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-all uppercase tracking-widest cursor-pointer border-none flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
                                    >
                                        💳 Pay Activation Fee
                                    </button>
                                </div>
                            )}

                            <div className="pt-6 flex flex-wrap sm:flex-nowrap items-center justify-between border-b-none border-light border-t gap-3">
                                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
                                    <Link to={`/events/${event._id}/participants`} className="p-2 glass text-slate-400 hover:text-white rounded-lg transition-all shrink-0" title="View Participants">
                                        <Users size={18} />
                                    </Link>
                                    <Link to={`/edit-event/${event._id}`} className="p-2 glass text-slate-400 hover:text-white rounded-lg transition-all shrink-0" title="Edit Event">
                                        <Edit2 size={18} />
                                    </Link>
                                </div>
                                <button
                                    onClick={() => handleDelete(event._id)}
                                    className="p-2 glass text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg transition-all shrink-0 sm:w-auto bg-rose-500/10 border-none cursor-pointer"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {events.length === 0 && (
                <div className="text-center py-20 card glass border-dashed border-2 border-light">
                    <p className="text-slate-400 mb-6 text-xl">You haven't created any events yet.</p>
                    <Link to="/create-event" className="text-primary font-black uppercase tracking-widest no-underline">
                        Create your first event
                    </Link>
                </div>
            )}
        </div>
    );
};

export default MyEvents;
