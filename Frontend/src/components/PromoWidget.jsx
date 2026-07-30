import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
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
                <div className="promo-enterprise-badge">
                    <ShieldCheck size={16} className="text-emerald-400 animate-pulse" />
                    <span>PARTENAIRE ENTREPRISE (1.0% Flat)</span>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 80, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 40, scale: 0.9 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 120 }}
                    className={`promo-card ${
                        isPulsing 
                            ? (isFree ? 'promo-glow-active-free' : 'promo-glow-active-pro') 
                            : (isFree ? 'promo-glow-idle-free' : 'promo-glow-idle-pro')
                    }`}
                    style={{
                        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
                        backdropBlur: '12px',
                    }}
                >
                    {/* Grillage en arrière-plan en mouvement */}
                    <div className="promo-grid-bg" />

                    {/* En-tête */}
                    <div className="promo-header">
                        <div className="promo-header-left">
                            <div className={`promo-icon-box ${isFree ? 'free' : 'pro'}`}>
                                {isFree ? <Sparkles size={20} className="animate-pulse" /> : <Zap size={20} className="animate-bounce" />}
                            </div>
                            <span className="promo-label">
                                {isFree ? "Offre de Surclassement" : "Avantage Partenaire"}
                            </span>
                        </div>
                        <button onClick={() => setIsVisible(false)} className="promo-close-btn">
                            <X size={16} />
                        </button>
                    </div>

                    {/* Titre & Description */}
                    <div className="promo-body">
                        <h3 className="promo-title neon-text-glow">
                            {isFree ? "Divisez vos frais par deux !" : "Débloquez l'accès Entreprise"}
                        </h3>
                        <p className="promo-desc">
                            {isFree
                                ? "Passez au forfait PRO pour réduire la commission de 5.0% à seulement 2.5%, et débloquez la personnalisation complète de vos billets."
                                : "Bénéficiez du taux de 1.0% flat (sans frais fixe), ajoutez des équipes de co-organisateurs et gérez de grands stades."}
                        </p>
                    </div>

                    {/* Comparatif Visuel */}
                    <div className="promo-comparison-box">
                        <div className="promo-comp-header">
                            <span>Plan Actuel ({isFree ? "Gratuit" : "PRO"})</span>
                            <span style={{ color: '#ffffff' }}>Cible ({isFree ? "PRO" : "ENTREPRISE"})</span>
                        </div>
                        <div className="promo-progress-bg">
                            <div className={`promo-progress-fill ${isFree ? 'free' : 'pro'}`} />
                        </div>
                        <div className="promo-scale-labels">
                            <div className={`promo-rate-badge ${isFree ? 'free-act' : 'pro-act'}`}>
                                <Percent size={10} />
                                <span>{isFree ? "5.0% + 0.99$" : "2.5% + 0.49$"}</span>
                            </div>
                            <ArrowRight size={12} style={{ color: '#64748b' }} />
                            <div className="promo-rate-badge pro-target">
                                <Percent size={10} />
                                <span>{isFree ? "2.5% + 0.49$" : "1.0% Flat"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Liste des Avantages */}
                    <div className="promo-perks-section">
                        <span className="promo-perks-title">Inclus dans la mise à niveau :</span>
                        <div className="promo-perks-list">
                            {isFree ? (
                                <>
                                    <div className="promo-perk-item">
                                        <CheckCircle2 size={12} style={{ color: '#34d399', marginRight: 4 }} />
                                        <span>Création d'événements illimités</span>
                                    </div>
                                    <div className="promo-perk-item">
                                        <CheckCircle2 size={12} style={{ color: '#34d399', marginRight: 4 }} />
                                        <span>Éditeur de billets PDF (couleurs, texte, logos)</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="promo-perk-item">
                                        <CheckCircle2 size={12} style={{ color: '#818cf8', marginRight: 4 }} />
                                        <span>Taux minimal garanti de 1.0%</span>
                                    </div>
                                    <div className="promo-perk-item">
                                        <CheckCircle2 size={12} style={{ color: '#818cf8', marginRight: 4 }} />
                                        <span>Ajout de co-organisateurs & logos sponsors</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="promo-footer">
                        <span className="promo-footer-left">
                            {isFree ? "Économie de 50%" : "Commission minimale"}
                        </span>
                        <Link
                            to="/pricing"
                            className={`promo-btn-cta ${isFree ? 'free' : 'pro'}`}
                        >
                            {isFree ? "Passer à PRO" : "Découvrir Entreprise"}
                            <ArrowRight size={12} style={{ marginLeft: 4 }} />
                        </Link>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return createPortal(widgetContent, document.body);
};

export default PromoWidget;
