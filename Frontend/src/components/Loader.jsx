import React from 'react';
import { motion } from 'framer-motion';

const Loader = ({ message = "Loading..." }) => {
    return (
        <div className="flex flex-col items-center justify-center py-32 space-y-8">
            <div className="relative w-24 h-24">
                <motion.div 
                    animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="w-full h-full border-4 border-primary/5 border-t-primary rounded-full shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                />
                <motion.div 
                    animate={{ rotate: -360, scale: [1, 0.9, 1] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="absolute inset-4 border-2 border-white/5 border-t-white/20 rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
                </div>
            </div>
            <div className="text-center space-y-2">
                <p className="text-white font-black uppercase tracking-[0.4em] text-[10px] opacity-50">{message}</p>
                <div className="flex gap-1 justify-center">
                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
            </div>
        </div>
    );
};

export default Loader;
