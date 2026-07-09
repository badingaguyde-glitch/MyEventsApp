import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import UserDataService from '../services/UserDataServices';

const NewPassword = () => {
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email') || '';
    const code = searchParams.get('code') || '';

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!email || !code) {
            setErrorMsg("Lien invalide ou paramètres manquants. Veuillez recommencer le processus.");
        }
    }, [email, code]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email || !code) {
            setErrorMsg("Paramètres de réinitialisation manquants.");
            return;
        }

        if (password !== confirmPassword) {
            setErrorMsg("Les mots de passe ne correspondent pas.");
            return;
        }

        if (password.length < 6) {
            setErrorMsg("Le mot de passe doit comporter au moins 6 caractères.");
            return;
        }

        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            await UserDataService.resetPassword({ email, code, newPassword: password });
            setSuccessMsg('Votre mot de passe a été modifié avec succès. Redirection vers la page de connexion...');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Une erreur est survenue lors de la réinitialisation.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center py-10 md:py-20">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md p-6 md:p-8 card glass"
            >
                <h2 className="text-xl md:text-2xl font-black mb-6">Nouveau Mot de Passe</h2>

                <p className="text-sm text-slate-400 mb-6">
                    Entrez votre nouveau mot de passe ci-dessous.
                </p>

                {errorMsg && (
                    <div className="p-4 mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center gap-3 text-sm">
                        <AlertCircle size={18} /> {errorMsg}
                    </div>
                )}

                {successMsg && (
                    <div className="p-4 mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center gap-3 text-sm">
                        <CheckCircle size={18} /> {successMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Nouveau Mot de Passe</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input 
                                type={showPassword ? "text" : "password"} 
                                required 
                                className="input pl-12 pr-12"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Confirmer le Mot de Passe</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input 
                                type={showPassword ? "text" : "password"} 
                                required 
                                className="input pl-12"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading || !email || !code}
                        className="btn-primary w-full py-4"
                    >
                        {loading ? 'Modification...' : 'Modifier le mot de passe'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default NewPassword;
