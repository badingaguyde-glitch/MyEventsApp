import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserDataService from '../services/UserDataServices';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Tags, AlertCircle } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        lastName: '',
        email: '',
        password: '',
        interests: ''
    });
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            const interestsArray = formData.interests.split(',').map(i => i.trim()).filter(i => i !== '');
            const dataToSubmit = { ...formData, interests: interestsArray };
            
            await UserDataService.register(dataToSubmit);
            navigate('/login');
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center py-10 md:py-20 px-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg p-6 md:p-8 card glass"
            >
                <h2 className="text-2xl md:text-3xl font-black text-center mb-6">Join the Community</h2>
                {errorMsg && (
                    <div className="p-4 mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center gap-3 text-sm">
                        <AlertCircle size={18} /> {errorMsg}
                    </div>
                )}
                <form onSubmit={handleRegister} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">First Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input name="name" type="text" required className="input pl-12" placeholder="John" value={formData.name} onChange={handleChange} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Last Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input name="lastName" type="text" required className="input pl-12" placeholder="Doe" value={formData.lastName} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input name="email" type="email" required className="input pl-12" placeholder="name@example.com" value={formData.email} onChange={handleChange} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Secure Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input name="password" type="password" required className="input pl-12" placeholder="••••••••" value={formData.password} onChange={handleChange} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Interests (comma separated)</label>
                        <div className="relative">
                            <Tags className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input name="interests" type="text" required className="input pl-12" placeholder="Music, Art, Tech" value={formData.interests} onChange={handleChange} />
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="btn-primary w-full py-4 mt-4"
                    >
                        {loading ? 'Creating Account...' : 'Get Started Now'}
                    </button>
                </form>
                <p className="mt-6 text-center text-sm text-slate-400">
                    Already have an account? <Link to="/login" className="text-indigo-400 font-bold" style={{ textDecoration: 'none' }}>Sign In</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
