import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

const TicketCard = ({ ticket, index, onCancel }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card relative group border border-light transition-all overflow-hidden"
        >
            <div className="p-4 md:p-6 space-y-6">
                <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                            {ticket.status === 'pending_payment' ? (
                                <AlertCircle size={16} className="text-amber-500 shrink-0" />
                            ) : (
                                <CheckCircle2 size={16} className="text-primary shrink-0" />
                            )}
                            <span className={`text-[10px] font-bold uppercase tracking-widest truncate ${ticket.status === 'pending_payment' ? 'text-amber-500' : 'text-primary'}`}>
                                {ticket.status === 'pending_payment' ? 'Pending Payment' : 'Confirmed Ticket'}
                            </span>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold truncate">{ticket.event?.title}</h3>
                    </div>
                    <button 
                        onClick={() => onCancel(ticket._id)}
                        className="p-2 glass text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg transition-all bg-rose-500/10"
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

                {ticket.status === 'pending_payment' && (
                    <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl text-xs font-semibold flex items-start gap-2">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        <span>Payment pending. Please check your email (including spam) to complete the payment for this ticket.</span>
                    </div>
                )}

                <div className="pt-6 border-b border-t-dashed flex flex-wrap sm:flex-nowrap justify-between items-end gap-4 border-b-none">
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
            <div className="ticket-cutout-left"></div>
            <div className="ticket-cutout-right"></div>
        </motion.div>
    );
};

export default TicketCard;
