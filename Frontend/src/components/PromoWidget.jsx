import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

const PromoWidget = ({ userPlan }) => {
    const [isVisible, setIsVisible] = useState(true);

    if (!userPlan || !isVisible) {
        return null;
    }

    if (userPlan === 'enterprise') {
        return (
            <div className="fixed bottom-6 right-6 z-50 card glass px-4 py-2.5 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2 shadow-2xl">
                <ShieldCheck size={14} />
                <span>Forfait Entreprise Actif (1% Flat)</span>
            </div>
        );
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="fixed bottom-6 right-6 z-50 max-w-[340px] card glass p-5 border border-primary/20 shadow-2xl space-y-4 text-left"
            >
                {/* Header */}
                <div className="flex justify-between items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary w-fit">
                        {userPlan === 'free' ? <Sparkles size={18} /> : <Zap size={18} />}
                    </div>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-1.5">
                    <h4 className="text-sm font-black text-white">
                        {userPlan === 'free'
                            ? "🚀 Optimisez vos bénéfices avec Bantu PRO"
                            : "💼 Passez au forfait ENTREPRISE"}
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                        {userPlan === 'free'
                            ? "Divisez vos frais par deux ! Passez de 5.0% à 2.5% de commission et déverrouillez la personnalisation de billets PDF."
                            : "Réduisez vos frais à 1.0% flat (sans frais fixe), gérez vos équipes et ajoutez vos sponsors sur les billets."}
                    </p>
                </div>

                {/* Call to action */}
                <div className="flex items-center justify-between pt-2 border-t border-light">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {userPlan === 'free' ? "5.0% ➔ 2.5% Commission" : "2.5% ➔ 1.0% Flat"}
                    </span>
                    <a
                        href="/pricing"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-black text-primary hover:text-primary-hover flex items-center gap-1 group/btn no-underline"
                    >
                        En savoir plus
                        <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                    </a>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PromoWidget;
