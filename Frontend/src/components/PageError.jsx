import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';

const PageError = ({ title = "Page Not Found", message = "The page you are looking for doesn't exist or has been moved.", code = "404" }) => {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 space-y-8">
            <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
            >
                <div className="text-[12rem] font-black text-white/5 select-none">{code}</div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <AlertTriangle size={80} className="text-rose-500 opacity-20" />
                </div>
            </motion.div>

            <div className="space-y-4 max-w-lg">
                <h1 className="text-4xl font-bold">{title}</h1>
                <p className="text-slate-400 text-lg">{message}</p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 pt-4">
                <Link to="/" className="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20">
                    <Home size={20} /> Back to Home
                </Link>
                <button onClick={() => window.history.back()} className="flex items-center gap-2 px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all">
                    <ArrowLeft size={20} /> Go Back
                </button>
            </div>
        </div>
    );
};

export default PageError;
