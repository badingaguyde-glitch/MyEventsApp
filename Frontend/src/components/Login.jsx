import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { login, checkOrganizerStatus } from '../redux/reducer';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            const resultAction = await dispatch(login({ email, password }));
            if (resultAction.meta.requestStatus === 'fulfilled') {
                
                if (resultAction.payload.token) {
                    dispatch(checkOrganizerStatus(resultAction.payload.token));
                }
                navigate('/');
            } else {
                setErrorMsg(resultAction.payload || 'Login failed.');
            }
        } catch (err) {
            setErrorMsg('An unexpected error occurred.');
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
                <h2 className="text-2xl md:text-3xl font-black text-center mb-6">Welcome Back</h2>
                {errorMsg && (
                    <div className="p-4 mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center gap-3 text-sm">
                        <AlertCircle size={18} /> {errorMsg}
                    </div>
                )}
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input 
                                type="email" 
                                required 
                                className="input pl-12"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input 
                                type="password" 
                                required 
                                className="input pl-12"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="btn-primary w-full py-4"
                    >
                        {loading ? 'Authenticating...' : <><LogIn size={18} className="gap-2" /> Sign In</>}
                    </button>
                </form>
                <p className="mt-6 text-center text-sm text-slate-400">
                    Don't have an account? <Link to="/register" className="text-indigo-400 font-bold no-underline">Create Account</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
