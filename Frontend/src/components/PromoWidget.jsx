import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ArrowRight, ShieldCheck, Zap, Percent, CheckCircle2 } from 'lucide-react';

const PromoWidget = ({ userPlan }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isPulsing, setIsPulsing] = useState(true);
    const [mounted, setMounted] = useState(false);

    // Éviter les erreurs de rendu côté serveur (SSR) ou pendant l'hydratation
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Arrêter le clignotement fort après 10 secondes pour le confort de lecture
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsPulsing(false);
        }, 10000);
        return () => clearTimeout(timer);
    }, []);

    if (!userPlan || !isVisible || !mounted) {
        return null;
    }

    const isFree = userPlan === 'free';

    const widgetContent = (
        <AnimatePresence>
            {userPlan === 'enterprise' ? (
                <div className="fixed bottom-6 right-6 z-[9999] px-4 py-3 rounded-2xl border border-emerald-500/30 text-emerald-300 text-xs font-black flex items-center gap-2 shadow-2xl bg-slate-900/95 backdrop-blur-md shadow-emerald-500/10">
                    <ShieldCheck size={16} className="text-emerald-400 animate-pulse" />
                    <span>PARTENAIRE ENTREPRISE (1.0% Flat)</span>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 80, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 40, scale: 0.9 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 120 }}
                    className={`fixed bottom-6 right-6 z-[9999] max-w-[360px] rounded-3xl p-6 border shadow-2xl text-left overflow-hidden ${
                        isPulsing ? 'promo-glow-active' : 'promo-glow-idle'
                    }`}
                    style={{
                        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
                        borderColor: isFree ? 'rgba(255, 76, 59, 0.3)' : 'rgba(99, 102, 241, 0.3)',
                        backdropBlur: '12px',
                    }}
                >
                    {/* CSS Injecté pour les effets lumineux animés de fond et de bordure */}
                    <style dangerouslySetInnerHTML={{__html: `
                        @keyframes border-glow-free {
                            0%, 100% { box-shadow: 0 0 15px rgba(255, 76, 59, 0.2), inset 0 0 10px rgba(255, 76, 59, 0.05); border-color: rgba(255, 76, 59, 0.3); }
                            50% { box-shadow: 0 0 30px rgba(255, 76, 59, 0.55), inset 0 0 20px rgba(255, 76, 59, 0.2); border-color: rgba(255, 76, 59, 0.8); }
                        }
                        @keyframes border-glow-pro {
                            0%, 100% { box-shadow: 0 0 15px rgba(99, 102, 241, 0.2), inset 0 0 10px rgba(99, 102, 241, 0.05); border-color: rgba(99, 102, 241, 0.3); }
                            50% { box-shadow: 0 0 30px rgba(99, 102, 241, 0.55), inset 0 0 20px rgba(99, 102, 241, 0.2); border-color: rgba(99, 102, 241, 0.8); }
                        }
                        @keyframes grid-move {
                            0% { background-position: 0 0; }
                            100% { background-position: 24px 24px; }
                        }
                        .promo-glow-active {
                            animation: ${isFree ? 'border-glow-free' : 'border-glow-pro'} 2.5s infinite ease-in-out;
                        }
                        .promo-glow-idle {
                            border-color: ${isFree ? 'rgba(255, 76, 59, 0.45)' : 'rgba(99, 102, 241, 0.45)'};
                            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
                        }
                        .promo-grid-bg {
                            position: absolute;
                            top: 0; left: 0; right: 0; bottom: 0;
                            background-image: radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px);
                            background-size: 12px 12px;
                            opacity: 0.9;
                            z-index: 0;
                            animation: grid-move 10s linear infinite;
                        }
                        .neon-text-glow {
                            text-shadow: 0 0 8px rgba(255, 255, 255, 0.15);
                        }
                    `}} />

                    {/* Grillage en arrière-plan en mouvement */}
                    <div className="promo-grid-bg" />

                    <div className="relative z-10 space-y-5">
                        {/* En-tête : Titre & Bouton Fermer */}
                        <div className="flex justify-between items-center gap-4">
                            <div className="flex items-center gap-2.5">
                                <div className={`p-2.5 rounded-xl flex items-center justify-center shrink-0 ${
                                    isFree ? 'bg-red-500/10 text-red-400' : 'bg-indigo-500/10 text-indigo-400'
                                }`}>
                                    {isFree ? <Sparkles size={20} className="animate-pulse" /> : <Zap size={20} className="animate-bounce" />}
                                </div>
                                <span className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
                                    {isFree ? "Offre de Surclassement" : "Avantage Partenaire"}
                                </span>
                            </div>
                            <button
                                onClick={() => setIsVisible(false)}
                                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Titre principal & Description */}
                        <div className="space-y-2">
                            <h3 className="text-lg font-black text-white leading-tight neon-text-glow">
                                {isFree
                                    ? "Divisez vos frais par deux !"
                                    : "Débloquez l'accès Entreprise"}
                            </h3>
                            <p className="text-xs text-slate-300 leading-relaxed font-medium">
                                {isFree
                                    ? "Passez au forfait PRO pour réduire la commission de 5.0% à seulement 2.5%, et débloquez la personnalisation complète de vos billets."
                                    : "Bénéficiez du taux de 1.0% flat (sans frais fixe), ajoutez des équipes de co-organisateurs et gérez de grands stades."}
                            </p>
                        </div>

                        {/* Comparatif Visuel Avant / Après */}
                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                                <span>Plan Actuel ({isFree ? "Gratuit" : "PRO"})</span>
                                <span className="text-white">Cible ({isFree ? "PRO" : "ENTREPRISE"})</span>
                            </div>

                            {/* Barre d'échelle interactive */}
                            <div className="h-2 rounded-full bg-slate-800 relative overflow-hidden flex items-center">
                                <div className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500 rounded-full"
                                     style={{ width: isFree ? '50%' : '75%' }} />
                            </div>

                            {/* Badges de Taux de Commission */}
                            <div className="flex justify-between items-center">
                                <div className="text-[10px] font-black text-red-400 flex items-center gap-1">
                                    <Percent size={10} />
                                    <span>{isFree ? "5.0% + 0.99$" : "2.5% + 0.49$"}</span>
                                </div>
                                <ArrowRight size={12} className="text-slate-500" />
                                <div className="text-[10px] font-black text-emerald-400 flex items-center gap-1">
                                    <Percent size={10} />
                                    <span>{isFree ? "2.5% + 0.49$" : "1.0% Flat"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Liste des Avantages majeurs */}
                        <div className="space-y-2 text-xs">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Inclus dans la mise à niveau :</span>
                            <div className="grid grid-cols-1 gap-1.5 text-slate-300 font-medium">
                                {isFree ? (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                                            <span>Création d'événements illimités</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                                            <span>Éditeur de billets PDF personnalisés (couleurs, texte)</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 size={12} className="text-indigo-400 shrink-0" />
                                            <span>Taux minimal garanti de 1.0%</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 size={12} className="text-indigo-400 shrink-0" />
                                            <span>Ajout de co-organisateurs & logos sponsors</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* CTA Footer */}
                        <div className="pt-2 border-t border-white/5 flex justify-end">
                            <a
                                href="/pricing"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`px-4 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all flex items-center gap-1.5 no-underline shadow-lg ${
                                    isFree
                                        ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20'
                                        : 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-indigo-500/20'
                                }`}
                            >
                                {isFree ? "Passer à PRO" : "Découvrir Entreprise"}
                                <ArrowRight size={12} />
                            </a>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return createPortal(widgetContent, document.body);
};

export default PromoWidget;
