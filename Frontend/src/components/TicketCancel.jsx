import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, Search } from 'lucide-react';

const TicketCancel = () => {
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
                    <div className="h-24 w-24 rounded-full bg-rose-500/10 flex items-center justify-center border-4 border-rose-500/20 shadow-[0_0_50px_rgba(244,63,94,0.2)]">
                        <XCircle size={48} className="text-rose-400" />
                    </div>
                </div>
                
                <div className="space-y-3">
                    <h1 className="text-3xl font-black text-white">Payment Cancelled</h1>
                    <p className="text-slate-400 font-medium leading-relaxed">
                        Your transaction was cancelled or an error occurred during the process. No charges have been made to your account.
                    </p>
                </div>

                <div className="pt-6 space-y-4">
                    <button
                        onClick={() => navigate('/events')}
                        className="btn-primary w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-rose-600 shadow-rose-500/30"
                    >
                        <Search size={20} /> Browse More Events
                    </button>
                    
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full py-3 px-6 rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 text-slate-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"
                    >
                        <ArrowLeft size={16} /> Go Back
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default TicketCancel;
