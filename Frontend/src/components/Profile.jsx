import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import UserDataService from '../services/UserDataServices';
import { logout } from '../redux/reducer';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Shield, Tags, Save, AlertCircle, Trash2 } from 'lucide-react';

const Profile = () => {
    const user = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: user?.name || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        interests: user?.interests?.join(', ') || ''
    });
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const dataToSubmit = { 
                ...formData, 
                interests: formData.interests.split(',').map(i => i.trim()) 
            };
            await UserDataService.updateProfile(dataToSubmit, user.token);
            const updatedUser = { ...user, ...dataToSubmit };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            dispatch({ type: "FETCH_USER_SUCCESS", payload: updatedUser });
            setMessage({ text: 'Profile updated successfully!', type: 'success' });
        } catch (err) {
            setMessage({ text: 'Update failed. Please try again.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setDeleting(true);
        try {
            await UserDataService.deleteUser(user._id, user.token);
            dispatch(logout());
            navigate('/');
        } catch (err) {
            setMessage({ text: 'Failed to delete account. Please try again.', type: 'error' });
            setShowConfirm(false);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-12">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6 md:p-8 glass space-y-8"
            >
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b text-center sm:text-left" style={{ borderBottom: '1px solid var(--border-white)' }}>
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary/30 shadow-lg shadow-primary/20">
                        <User size={40} className="text-primary" />
                    </div>
                    <div className="flex flex-col items-center sm:items-start">
                        <h1 className="text-2xl md:text-3xl font-black">{user?.name} {user?.lastName}</h1>
                        <p className="text-primary font-bold flex items-center justify-center sm:justify-start gap-2 mt-1 text-sm uppercase tracking-widest">
                            <Shield size={14} /> {user?.role || 'User'}
                        </p>
                    </div>
                </div>

                {message.text && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
                        message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                        <AlertCircle size={18} />
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleUpdate} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">First Name</label>
                            <input name="firstName" type="text" className="input" value={formData.firstName} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Last Name</label>
                            <input name="lastName" type="text" className="input" value={formData.lastName} onChange={handleChange} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input name="email" type="email" className="input pl-12" value={formData.email} onChange={handleChange} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">My Interests</label>
                        <div className="relative">
                            <Tags className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input name="interests" type="text" className="input pl-12" placeholder="e.g. Music, Tech, Art" value={formData.interests} onChange={handleChange} />
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="btn-primary w-full py-4 mt-6"
                    >
                        {loading ? 'Saving Changes...' : <><Save size={18} className="gap-2" /> Update Profile</>}
                    </button>
                </form>

                {/* Delete Account */}
                <div className="pt-6 border-t" style={{ borderTop: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <button
                        onClick={() => setShowConfirm(true)}
                        className="w-full py-3 flex items-center justify-center gap-2 text-sm font-bold text-rose-400 border border-rose-500/20 rounded-xl hover:bg-rose-500/10 transition-all"
                    >
                        <Trash2 size={16} /> Delete My Account
                    </button>
                </div>
            </motion.div>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {showConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
                        onClick={() => setShowConfirm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="card glass p-8 max-w-sm w-full space-y-6"
                            style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center">
                                    <Trash2 size={32} className="text-rose-400" />
                                </div>
                                <h2 className="text-xl font-black">Supprimer le compte ?</h2>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est <strong className="text-white">irréversible</strong> et supprimera tous vos tickets associés.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="btn-secondary flex-1 py-3 text-sm"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={deleting}
                                    className="flex-1 py-3 text-sm font-bold text-white rounded-xl bg-rose-500 hover:bg-rose-600 transition-all disabled:opacity-50"
                                >
                                    {deleting ? 'Suppression...' : 'Oui, supprimer'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Profile;


