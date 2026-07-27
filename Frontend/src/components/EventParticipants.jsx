import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import EventService from '../services/EventServices';
import TicketService from '../services/TicketServices';
import { motion } from 'framer-motion';
import { Users, Mail, Phone, Calendar, ArrowLeft, Download, Circle, Square, CheckSquare, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import Loader from './Loader';

const EventParticipants = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = useSelector((state) => state.user);
    const [participants, setParticipants] = useState([]);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedTickets, setSelectedTickets] = useState([]);
    const [bulkLoading, setBulkLoading] = useState(false);
    const [bulkMessage, setBulkMessage] = useState('');
    const [bulkMessageType, setBulkMessageType] = useState('success');

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

    const handleSelectTicket = (ticketId) => {
        if (selectedTickets.includes(ticketId)) {
            setSelectedTickets(selectedTickets.filter(tid => tid !== ticketId));
        } else {
            setSelectedTickets([...selectedTickets, ticketId]);
        }
    };

    const handleBulkCancel = async () => {
        if (selectedTickets.length === 0) return;
        if (!window.confirm(`Voulez-vous vraiment annuler et rembourser les ${selectedTickets.length} tickets sélectionnés ?`)) return;
        
        setBulkLoading(true);
        setBulkMessage('');
        try {
            await TicketService.bulkCancelTickets(selectedTickets, user.token);
            setBulkMessageType('success');
            setBulkMessage(`${selectedTickets.length} ticket(s) annulé(s) avec succès.`);
            setSelectedTickets([]);
            await fetchData();
        } catch (err) {
            setBulkMessageType('error');
            setBulkMessage(err.response?.data?.message || "Erreur lors de l'annulation en masse.");
        } finally {
            setBulkLoading(false);
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
                    className="btn-flex items-center gap-2 text-slate-400 hover:text-white transition-all font-black uppercase tracking-widest text-[10px] bg-none border-none cursor-pointer"
                >
                    <ArrowLeft size={20} className="text-primary" /> Back to Dashboard
                </button>
                <div className="flex gap-4">
                    {user?.plan === 'enterprise' && selectedTickets.length > 0 && (
                        <button
                            onClick={handleBulkCancel}
                            disabled={bulkLoading}
                            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold tracking-wider transition-all disabled:opacity-50"
                        >
                            <Trash2 size={18} /> {bulkLoading ? "Annulation..." : `Annuler/Rembourser (${selectedTickets.length})`}
                        </button>
                    )}
                    <button 
                        onClick={exportCSV}
                        className="btn-primary flex items-center gap-2 px-6 py-3 glass rounded-xl text-xs font-black tracking-widest transition-all hover:bg-white/10 border border-light"
                    >
                        <Download size={18} className="text-primary" /> Export Manifest
                    </button>
                </div>
            </div>

            {bulkMessage && (
                <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-bold border ${
                    bulkMessageType === 'success' 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}>
                    {bulkMessageType === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    {bulkMessage}
                </div>
            )}

            <div className="card glass p-10 border border-light">
                <div className="flex items-center gap-6 mb-12">
                    <div className="p-5 bg-primary/10 rounded-2xl border border-primary/20 shadow-lg shadow-primary/10">
                        <Users size={32} className="text-primary gap-6" />
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
                            <tr className="border-b border-light text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                {user?.plan === 'enterprise' && (
                                    <th className="px-4 py-6 w-12">
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                const cancelable = participants.filter(p => p.status !== 'cancelled');
                                                if (selectedTickets.length === cancelable.length) {
                                                    setSelectedTickets([]);
                                                } else {
                                                    setSelectedTickets(cancelable.map(p => p._id));
                                                }
                                            }}
                                            className="text-slate-400 hover:text-white cursor-pointer"
                                        >
                                            {selectedTickets.length > 0 && selectedTickets.length === participants.filter(p => p.status !== 'cancelled').length ? <CheckSquare size={18} /> : <Square size={18} />}
                                        </button>
                                    </th>
                                )}
                                <th className="px-4 py-6">Attendee Profile</th>
                                <th className="px-4 py-6">Contact Access</th>
                                <th className="px-4 py-6">Ticket Reference</th>
                                <th className="px-4 py-6">Status</th>
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
                                    className="hover:bg-white/[0.02] transition-colors border-b border-light"
                                >
                                    {user?.plan === 'enterprise' && (
                                        <td className="px-4 py-6 w-12">
                                            {p.status !== 'cancelled' ? (
                                                <button
                                                    type="button"
                                                    onClick={() => handleSelectTicket(p._id)}
                                                    className="text-slate-400 hover:text-white cursor-pointer"
                                                >
                                                    {selectedTickets.includes(p._id) ? <CheckSquare size={18} /> : <Square size={18} />}
                                                </button>
                                            ) : (
                                                <span className="text-[10px] text-red-500 font-bold uppercase">N/A</span>
                                            )}
                                        </td>
                                    )}
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
                                    <td className="px-4 py-6">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                                            p.status === 'cancelled' 
                                                ? 'bg-red-500/10 text-red-400' 
                                                : p.status === 'used' 
                                                    ? 'bg-blue-500/10 text-blue-400' 
                                                    : 'bg-green-500/10 text-green-400'
                                        }`}>
                                            {p.status || 'active'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-6 text-right text-slate-500 font-black uppercase tracking-widest text-[10px]">
                                        {p.purchaseDate ? new Date(p.purchaseDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                    {(!Array.isArray(participants) || participants.length === 0) && (
                        <div className="text-center py-20 card glass border-dashed border-light border-2">
                            <p className="text-slate-500 text-xl font-medium tracking-tight">No attendance records found for this secure event.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventParticipants;
