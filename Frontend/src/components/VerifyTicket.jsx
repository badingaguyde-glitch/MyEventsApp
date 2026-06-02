import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import TicketService from '../services/TicketServices';
import EventService from '../services/EventServices';
import { motion } from 'framer-motion';
import { QrCode, Search, CheckCircle2, XCircle, AlertCircle, User, Calendar } from 'lucide-react';

const VerifyTicket = () => {
    const user = useSelector((state) => state.user);
    const [ticketCode, setTicketCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [loadingEvents, setLoadingEvents] = useState(true);

    useEffect(() => {
        if (user?.token) {
            fetchOrganizerEvents();
        }
    }, [user]);

    const fetchOrganizerEvents = async () => {
        try {
            const res = await EventService.getMyEvents(user.token);
            const userEvents = Array.isArray(res.data) ? res.data : [];
            setEvents(userEvents);
            if (userEvents.length > 0) {
                setSelectedEventId(userEvents[0]._id);
            }
        } catch (err) {
            console.error('Failed to load events for verification:', err);
        } finally {
            setLoadingEvents(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!ticketCode.trim() || !selectedEventId) return;

        setLoading(true);
        setResult(null);
        setMessage({ text: '', type: '' });

        try {
            const res = await TicketService.verifyTicket({ ticketCode, eventId: selectedEventId }, user.token);
            setResult(res.data);
            setMessage({ text: 'Ticket verified successfully!', type: 'success' });
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Verification failed.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-12 py-12">
            <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto border border-primary/20 shadow-2xl shadow-primary/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 animate-pulse"></div>
                    <QrCode size={48} className="text-primary relative z-10" />
                </div>
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-white mb-2">Gate Verification</h1>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em]">Scan or Reference Entry Authentication</p>
                </div>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="card glass p-10 border shadow-2xl border-light"
            >
                <form onSubmit={handleVerify} className="space-y-10">
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Select Event to Verify</label>
                        {loadingEvents ? (
                            <div className="text-slate-400 text-xs font-bold animate-pulse">Loading events...</div>
                        ) : events.length === 0 ? (
                            <div className="p-4 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20 text-xs font-bold flex items-center gap-3">
                                <AlertCircle size={18} />
                                You have not created any active events yet.
                            </div>
                        ) : (
                            <select 
                                value={selectedEventId}
                                onChange={(e) => setSelectedEventId(e.target.value)}
                                className="input h-18 text-base font-bold bg-white/[0.03] border-white/10 text-white focus:bg-white/[0.05] w-full px-4 rounded-xl cursor-pointer"
                                style={{ colorScheme: 'dark' }}
                            >
                                {events.map(ev => (
                                    <option key={ev._id} value={ev._id} className="bg-slate-900 text-white">
                                        {ev.title} ({new Date(ev.date).toLocaleDateString()})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Secure Ticket Reference</label>
                        <div className="relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary group-focus-within:scale-110 transition-transform" size={24} />
                            <input 
                                type="text" 
                                className="input pl-14 h-18 text-xl font-black uppercase tracking-widest bg-white/[0.03] border-white/10 focus:bg-white/[0.05]"
                                placeholder="E.G. TKT-7382-XXXX"
                                value={ticketCode}
                                onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
                                disabled={events.length === 0}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading || !ticketCode.trim() || !selectedEventId}
                        className="btn-primary w-full py-6 text-sm uppercase tracking-[0.3em] font-black shadow-xl shadow-primary/20"
                    >
                        {loading ? 'Authenticating...' : 'Authorize Access'}
                    </button>
                </form>

                {message.text && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`mt-10 p-10 rounded-3xl flex flex-col items-center text-center gap-6 glass border ${
                            message.type === 'success' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-rose-500/30 bg-rose-500/5'
                        }`}
                    >
                        {message.type === 'success' ? 
                            <CheckCircle2 size={64} className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" /> : 
                            <XCircle size={64} className="text-rose-400 drop-shadow-[0_0_15px_rgba(251,113,133,0.5)]" />
                        }
                        <div className="w-full">
                            <p className={`text-2xl font-black uppercase tracking-wider mb-2 ${message.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {message.text}
                            </p>
                            {result && (
                                <div className="mt-8 pt-8 border-t border-white/10 space-y-6 w-full">
                                    <div className="grid grid-cols-2 gap-8 text-left">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Authorized Attendee</p>
                                            <div className="flex items-center gap-3 text-white font-bold">
                                                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                                    <User size={16} className="text-primary" />
                                                </div>
                                                <span className="text-sm">{result.user?.name} {result.user?.lastName}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Designated Event</p>
                                            <div className="flex items-center gap-3 text-white font-bold">
                                                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                                    <Calendar size={16} className="text-primary" />
                                                </div>
                                                <span className="text-sm line-clamp-1">{result.event?.title}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-between shadow-inner">
                                        <span className="text-[10px] font-black text-emerald-400/80 uppercase tracking-widest">Access Verification</span>
                                        <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">Identity Confirmed</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default VerifyTicket;
