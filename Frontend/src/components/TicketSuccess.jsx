import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Ticket, ArrowRight } from 'lucide-react';

const TicketSuccess = () => {
    const navigate = useNavigate();

    return (
        <div className="max-w-md mx-auto space-y-6 md:space-y-12 py-20 px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="card glass border border-light p-10 text-center space-y-6"
            >
                <div className="flex justify-center">
                    <div className="h-24 w-24 rounded-full bg-emerald-500/10 flex items-center justify-center border-4 border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                        <ShieldCheck size={48} className="text-emerald-400" />
                    </div>
                </div>
                
                <div className="space-y-3">
                    <h1 className="text-3xl font-black text-white">Payment Successful!</h1>
                    <p className="text-slate-400 font-medium leading-relaxed">
                        Your transaction was completed successfully. We're processing your ticket. Please check your email inbox (including spam folder) for your confirmation email with the ticket QR code shortly.
                    </p>
                </div>

                <div className="pt-6 space-y-4">
                    <button
                        onClick={() => navigate('/my-tickets')}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                        <Ticket size={20} /> View My Tickets
                    </button>
                    
                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-3 px-6 rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 text-slate-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"
                    >
                        Back to Home <ArrowRight size={16} />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default TicketSuccess;
