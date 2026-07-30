import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import UserDataService from '../services/UserDataServices';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Shield, HelpCircle, ArrowLeft, Loader, AlertCircle } from 'lucide-react';

const Pricing = () => {
    const user = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const currentPlan = user?.plan || 'free';
    const isSuccess = searchParams.get('success') === 'true';

    useEffect(() => {
        if (isSuccess && user?.token) {
            setPageLoading(true);
            setSuccessMessage("Félicitations ! Votre forfait a été mis à jour avec succès.");
            // Rafraîchir le profil pour obtenir le plan mis à jour depuis MongoDB
            UserDataService.getProfile(user.token)
                .then(res => {
                    const updatedUser = { ...user, plan: res.data.plan };
                    localStorage.setItem("user", JSON.stringify(updatedUser));
                    dispatch({ type: "FETCH_USER_SUCCESS", payload: updatedUser });
                })
                .catch(err => {
                    console.error("Erreur lors de la synchronisation du plan:", err);
                })
                .finally(() => {
                    setPageLoading(false);
                });
        }
    }, [isSuccess, user?.token]);

    const handleUpgrade = async (planName) => {
        if (!user?.token) {
            navigate('/login');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await UserDataService.upgradePlan({ plan: planName, clientType: 'web' }, user.token);
            if (response.data?.url) {
                // Rediriger vers la page Stripe Checkout
                window.location.href = response.data.url;
            } else {
                setError("Impossible de démarrer la session de paiement.");
                setLoading(false);
            }
        } catch (err) {
            console.error("Upgrade error:", err);
            setError(err.response?.data?.message || "Erreur lors de l'initialisation du paiement.");
            setLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader className="animate-spin text-brand-accent h-12 w-12" />
                <p className="text-zinc-400 text-sm">Mise à jour de votre compte...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-12 px-4 space-y-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col items-center text-center space-y-4">
                <button 
                    onClick={() => navigate('/organizer-dashboard')}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm self-start mb-4"
                >
                    <ArrowLeft className="h-4 w-4" /> Retour au tableau de bord
                </button>
                
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
                    Choisissez le forfait qui s'adapte à votre <span className="neon-text font-black">envergure</span>
                </h1>
                <p className="text-zinc-400 max-w-xl text-base">
                    Des commissions dégressives par ticket vendu et des fonctionnalités avancées pour booster la réussite de vos événements.
                </p>
            </div>

            {/* Notification success/error */}
            {successMessage && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center gap-3 max-w-2xl mx-auto">
                    <Zap className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                    <p className="text-sm font-medium">{successMessage}</p>
                </div>
            )}

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 max-w-2xl mx-auto">
                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Grid for Plans */}
            <div className="grid md:grid-cols-3 gap-8 items-stretch pt-4">
                
                {/* FORFAIT GRATUIT */}
                <div className="card glass p-8 flex flex-col justify-between border border-white/5 relative hover:border-white/10 transition-all rounded-2xl">
                    <div className="space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">Gratuit</h3>
                                <p className="text-zinc-500 text-xs">Pour débuter et tester</p>
                            </div>
                            {currentPlan === 'free' && (
                                <span className="bg-zinc-800 text-zinc-300 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border border-zinc-700">
                                    Forfait Actuel
                                </span>
                            )}
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-white">0 €</span>
                            <span className="text-zinc-500 text-xs">/ mois</span>
                        </div>
                        
                        <hr className="border-white/5" />

                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-sm text-zinc-300">
                                <Check className="h-4 w-4 text-brand-accent flex-shrink-0 mt-0.5" />
                                <span>Commission : <strong>5% + 0.99 €</strong> par ticket</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-zinc-300">
                                <Check className="h-4 w-4 text-brand-accent flex-shrink-0 mt-0.5" />
                                <span>Capacité : max. 100 participants</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-zinc-300">
                                <Check className="h-4 w-4 text-brand-accent flex-shrink-0 mt-0.5" />
                                <span>Billet PDF standard</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-zinc-300">
                                <Check className="h-4 w-4 text-brand-accent flex-shrink-0 mt-0.5" />
                                <span>Validation QR Code basique</span>
                            </li>
                        </ul>
                    </div>

                    <button 
                        disabled
                        className="w-full mt-8 bg-zinc-800/50 text-zinc-500 font-bold py-3 px-4 rounded-xl border border-white/5 text-center text-sm cursor-not-allowed"
                    >
                        {currentPlan === 'free' ? 'Déjà actif' : 'Forfait basique'}
                    </button>
                </div>

                {/* FORFAIT PRO */}
                <div className="card glass p-8 flex flex-col justify-between border-2 border-brand-accent relative hover:shadow-[0_0_30px_rgba(255,76,59,0.15)] transition-all rounded-2xl overflow-hidden">
                    <div className="absolute top-0 right-0 bg-brand-accent text-white text-[9px] font-black uppercase tracking-wider py-1.5 px-4 rounded-bl-xl flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5" /> Populaire
                    </div>
                    
                    <div className="space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                                    PRO <Zap className="h-4 w-4 text-brand-accent" />
                                </h3>
                                <p className="text-zinc-400 text-xs">Pour les créateurs d'événements réguliers</p>
                            </div>
                            {currentPlan === 'pro' && (
                                <span className="bg-brand-accent/20 text-brand-accent text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border border-brand-accent/30">
                                    Forfait Actuel
                                </span>
                            )}
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-white">19 €</span>
                            <span className="text-zinc-400 text-xs">/ mois</span>
                        </div>
                        
                        <hr className="border-white/5" />

                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-sm text-zinc-200">
                                <Check className="h-4 w-4 text-brand-accent flex-shrink-0 mt-0.5" />
                                <span>Commission réduite : <strong>2.5% + 0.49 €</strong></span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-zinc-200">
                                <Check className="h-4 w-4 text-brand-accent flex-shrink-0 mt-0.5" />
                                <span>Participants <strong>illimités</strong></span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-zinc-200">
                                <Check className="h-4 w-4 text-brand-accent flex-shrink-0 mt-0.5" />
                                <span>Layouts de billets <strong>modern/badge</strong></span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-zinc-200">
                                <Check className="h-4 w-4 text-brand-accent flex-shrink-0 mt-0.5" />
                                <span>Outil d'écriture IA (génération de billets)</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-zinc-200">
                                <Check className="h-4 w-4 text-brand-accent flex-shrink-0 mt-0.5" />
                                <span>Options d'envoi de billets par SMS</span>
                            </li>
                        </ul>
                    </div>

                    <button 
                        onClick={() => handleUpgrade('pro')}
                        disabled={loading || currentPlan === 'pro' || currentPlan === 'enterprise'}
                        className={`w-full mt-8 font-bold py-3 px-4 rounded-xl text-center text-sm transition-all flex justify-center items-center gap-2 ${
                            currentPlan === 'pro'
                                ? 'bg-brand-accent/20 text-brand-accent border border-brand-accent/30 cursor-not-allowed'
                                : currentPlan === 'enterprise'
                                ? 'bg-zinc-800 text-zinc-500 border border-white/5 cursor-not-allowed'
                                : 'bg-brand-accent hover:bg-brand-accentHover text-white shadow-lg shadow-brand-accent/20 cursor-pointer'
                        }`}
                    >
                        {loading ? (
                            <Loader className="animate-spin h-4 w-4" />
                        ) : currentPlan === 'pro' ? (
                            'Forfait Actuel'
                        ) : currentPlan === 'enterprise' ? (
                            'Forfait supérieur actif'
                        ) : (
                            'Passer à Bantu PRO'
                        )}
                    </button>
                </div>

                {/* FORFAIT ENTERPRISE */}
                <div className="card glass p-8 flex flex-col justify-between border border-white/5 relative hover:border-white/10 transition-all rounded-2xl">
                    <div className="space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                                    Entreprise <Shield className="h-4 w-4 text-zinc-400" />
                                </h3>
                                <p className="text-zinc-500 text-xs">Pour les grandes structures et festivals</p>
                            </div>
                            {currentPlan === 'enterprise' && (
                                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border border-emerald-500/30">
                                    Forfait Actuel
                                </span>
                            )}
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-white">99 €</span>
                            <span className="text-zinc-500 text-xs">/ mois</span>
                        </div>
                        
                        <hr className="border-white/5" />

                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-sm text-zinc-300">
                                <Check className="h-4 w-4 text-brand-accent flex-shrink-0 mt-0.5" />
                                <span>Commission minimale : <strong>1.0% flat</strong></span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-zinc-300">
                                <Check className="h-4 w-4 text-brand-accent flex-shrink-0 mt-0.5" />
                                <span>Multi-organisateurs et rôles</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-zinc-300">
                                <Check className="h-4 w-4 text-brand-accent flex-shrink-0 mt-0.5" />
                                <span>Personnalisation complète & logo sponsor</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-zinc-300">
                                <Check className="h-4 w-4 text-brand-accent flex-shrink-0 mt-0.5" />
                                <span>SMS illimités pour envois de billets</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-zinc-300">
                                <Check className="h-4 w-4 text-brand-accent flex-shrink-0 mt-0.5" />
                                <span>Support dédié 24/7 et API</span>
                            </li>
                        </ul>
                    </div>

                    <button 
                        onClick={() => handleUpgrade('enterprise')}
                        disabled={loading || currentPlan === 'enterprise'}
                        className={`w-full mt-8 font-bold py-3 px-4 rounded-xl text-center text-sm transition-all flex justify-center items-center gap-2 ${
                            currentPlan === 'enterprise'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-not-allowed'
                                : 'bg-white/5 hover:bg-white/10 text-white border border-white/10 cursor-pointer'
                        }`}
                    >
                        {loading ? (
                            <Loader className="animate-spin h-4 w-4" />
                        ) : currentPlan === 'enterprise' ? (
                            'Forfait Actuel'
                        ) : (
                            'Passer à l\'offre Entreprise'
                        )}
                    </button>
                </div>

            </div>

            {/* Pricing FAQ or Help info */}
            <div className="card glass p-6 md:p-8 border border-white/5 rounded-2xl max-w-4xl mx-auto space-y-6">
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-brand-accent" /> Questions fréquentes
                </h4>
                <div className="grid md:grid-cols-2 gap-6 text-left">
                    <div>
                        <h5 className="font-bold text-zinc-200 text-sm mb-2">Comment fonctionne le calcul des commissions ?</h5>
                        <p className="text-zinc-400 text-xs leading-relaxed">
                            Les commissions sont déduites automatiquement lors de l'achat d'un billet par un participant via Stripe. Aucuns frais de création d'événement ne vous sont facturés au préalable.
                        </p>
                    </div>
                    <div>
                        <h5 className="font-bold text-zinc-200 text-sm mb-2">Puis-je changer d'offre à tout moment ?</h5>
                        <p className="text-zinc-400 text-xs leading-relaxed">
                            Oui, vous pouvez passer au plan PRO ou rétrograder directement depuis ce tableau. Le changement est effectif instantanément pour tous vos futurs événements et ventes de billets.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Pricing;
