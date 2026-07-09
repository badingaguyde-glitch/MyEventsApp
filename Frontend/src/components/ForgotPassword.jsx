import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import UserDataService from '../services/UserDataServices';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            await UserDataService.forgotPassword({ email });
            setSuccessMsg('Un code de réinitialisation a été envoyé à votre adresse e-mail.');
            setTimeout(() => {
                navigate(`/reset-password?email=${encodeURIComponent(email)}`);
            }, 2000);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Une erreur est survenue lors de la demande.');
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
                <div className="flex items-center gap-2 mb-6">
                    <Link to="/login" className="text-slate-400 hover:text-slate-200 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <h2 className="text-xl md:text-2xl font-black">Récupération</h2>
                </div>

                <p className="text-sm text-slate-400 mb-6">
                    Saisissez votre adresse e-mail ci-dessous pour recevoir un code de réinitialisation de mot de passe.
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
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Adresse E-mail</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input 
                                type="email" 
                                required 
                                className="input pl-12"
                                placeholder="nom@exemple.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="btn-primary w-full py-4"
                    >
                        {loading ? 'Envoi du code...' : 'Envoyer le code'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
