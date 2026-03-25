import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import EventService from '../services/EventServices';
import { motion } from 'framer-motion';
import { Users, Mail, Phone, Calendar, ArrowLeft, Download, Circle } from 'lucide-react';
import Loader from './Loader';

const EventParticipants = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = useSelector((state) => state.user);
    const [participants, setParticipants] = useState([]);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.token) {
            fetchData();
        }
    }, [id, user]);

    const fetchData = async () => {
        try {
            const [eventRes, partRes] = await Promise.all([
                EventService.getEventById(id),
                EventService.getEventParticipants(id, user.token)
            ]);
            setEvent(eventRes.data);
            setParticipants(partRes.data.participants || []);
        } catch (err) {
            console.error('Failed to load participants');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader message="Loading participants..." />;

    const exportCSV = () => {
    const validParticipants = Array.isArray(participants) ? participants : [];
    const rows = validParticipants.map(p => ({
        name: p.user?.name || 'Unknown',
        lastName: p.user?.lastName || '',
        email: p.user?.email || 'N/A',
        ticketCode: p.ticketCode,
        date: p.purchaseDate
    }));

    const csv = [
        Object.keys(rows[0]).join(","),
        ...rows.map(r => Object.values(r).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "participants.csv";
    a.click();
};

    return (
        <div className="space-y-10 py-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-all font-black uppercase tracking-widest text-[10px]"
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    <ArrowLeft size={20} className="text-primary" /> Back to Dashboard
                </button>
                <button className="flex items-center gap-2 px-6 py-3 glass rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:bg-white/10" style={{ border: '1px solid var(--border-white)' }}>
                    <Download size={18} className="text-primary" onClick={exportCSV} /> Export Manifest
                </button>
            </div>

            <div className="card glass p-10 border" style={{ borderColor: 'var(--border-white)' }}>
                <div className="flex items-center gap-6 mb-12">
                    <div className="p-5 bg-primary/10 rounded-2xl border border-primary/20 shadow-lg shadow-primary/10">
                        <Users size={32} className="text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black mb-1">{event?.title || 'Event Manifest'}</h1>
                        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                             <Circle className="w-2 h-2 fill-emerald-400 text-emerald-400" /> {participants.length} SECURED ATTENDEES
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b text-slate-500 text-[10px] font-black uppercase tracking-widest" style={{ borderBottom: '1px solid var(--border-white)' }}>
                                <th className="px-4 py-6">Attendee Profile</th>
                                <th className="px-4 py-6">Contact Access</th>
                                <th className="px-4 py-6">Ticket Reference</th>
                                <th className="px-4 py-6 text-right">Registered On</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {Array.isArray(participants) && participants.map((p, index) => (
                                <motion.tr 
                                    key={p._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="hover:bg-white/[0.02] transition-colors border-b"
                                    style={{ borderBottom: '1px solid var(--border-white)' }}
                                >
                                    <td className="px-4 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl glass border border-primary/20 flex items-center justify-center font-black text-primary">
                                                {p.user?.name?.charAt(0) || "?"}
                                            </div>
                                            <span className="font-black text-white">{p.user?.name} {p.user?.lastName}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-6 text-slate-400 font-medium">{p.user?.email}</td>
                                    <td className="px-4 py-6 text-slate-400 font-medium">{p.ticketCode || 'N/A'}</td>
                                    <td className="px-4 py-6 text-right text-slate-500 font-black uppercase tracking-widest text-[10px]">
                                        {p.purchaseDate ? new Date(p.purchaseDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                    {(!Array.isArray(participants) || participants.length === 0) && (
                        <div className="text-center py-20 card glass border-dashed" style={{ borderWidth: '2px', borderColor: 'var(--border-white)' }}>
                            <p className="text-slate-500 text-xl font-medium tracking-tight">No attendance records found for this secure event.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventParticipants;
