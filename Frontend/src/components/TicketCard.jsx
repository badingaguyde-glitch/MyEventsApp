import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Trash2, CheckCircle2 } from 'lucide-react';

const TicketCard = ({ ticket, index, onCancel }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card relative group border transition-all overflow-hidden"
            style={{ borderColor: 'var(--border-white)' }}
        >
            <div className="p-4 md:p-6 space-y-6">
                <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-primary shrink-0" />
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest truncate">Confirmed Ticket</span>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold truncate">{ticket.event?.title}</h3>
                    </div>
                    <button 
                        onClick={() => onCancel(ticket._id)}
                        className="p-2 glass text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg transition-all"
                        style={{ background: 'rgba(244, 63, 94, 0.1)' }}
                        title="Cancel Booking"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Date & Time</p>
                        <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                            <Calendar size={14} className="text-primary" />
                            <span>{new Date(ticket.event?.date).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Location</p>
                        <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                            <MapPin size={14} className="text-primary" />
                            <span className="line-clamp-1">{ticket.event?.location.venue}, {ticket.event?.location.address}, {ticket.event?.location.city}</span>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-b flex flex-wrap sm:flex-nowrap justify-between items-end gap-4" style={{ borderTop: '1px dashed var(--border-white)', borderBottom: 'none' }}>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1 truncate">Receipt Number</p>
                        <p className="text-xs font-mono text-slate-400 truncate">{ticket._id.toUpperCase()}</p>
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Price Paid</p>
                        <p className="text-xl font-black text-white">${ticket.event?.price}</p>
                    </div>
                </div>
            </div>
            
            {/* Ticket Cutout Effect */}
            <div className="absolute top-1/2 -left-3 w-6 h-6 bg-bg-dark rounded-full -translate-y-1/2" style={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-white)' }}></div>
            <div className="absolute top-1/2 -right-3 w-6 h-6 bg-bg-dark rounded-full -translate-y-1/2" style={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-white)' }}></div>
        </motion.div>
    );
};

export default TicketCard;
