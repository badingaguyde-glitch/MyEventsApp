import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import EventService from '../services/EventServices';
import { motion } from 'framer-motion';
import { Save, X, Calendar, MapPin, Users, DollarSign, Tag, Clock, AlertCircle } from 'lucide-react';
import Loader from './Loader';

const EditEvent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = useSelector((state) => state.user);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        date: '',
        time: '',
        location: '',
        capacity: '',
        price: '',
        image: '',
        status: ''
    });

    useEffect(() => {
        fetchEvent();
    }, [id]);

    const fetchEvent = async () => {
        try {
            const res = await EventService.getEventById(id);
            const data = res.data;
            
            const formattedDate = data.date ? new Date(data.date).toISOString().split('T')[0] : '';
            setFormData({
                ...data,
                date: formattedDate
            });
        } catch (err) {
            setError('Failed to fetch event data.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            await EventService.updateEvent(id, formData, user.token);
            navigate('/my-events');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update event.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loader message="Loading event data..." />;

    return (
        <div className="max-w-3xl mx-auto py-12">
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card glass p-10 space-y-10 border border-light"
            >
                <div className="flex justify-between items-center pb-6 border-b border-light">
                    <div>
                        <h1 className="text-3xl font-black text-white">Refine Experience</h1>
                        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">Adjust parameters for your published event</p>
                    </div>
                    <button onClick={() => navigate(-1)} className="p-3 glass rounded-full text-slate-400 hover:text-white transition-all shadow-lg">
                        <X size={24} />
                    </button>
                </div>

                {error && (
                    <div className="p-5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-sm font-bold flex items-center gap-4 shadow-inner">
                        <AlertCircle size={20} className="text-rose-500" /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Event Title</label>
                            <input 
                                type="text" name="title" required 
                                className="input"
                                value={formData.title} onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Description Manifest</label>
                            <textarea 
                                name="description" required rows="5"
                                className="input py-4 leading-relaxed"
                                value={formData.description} onChange={handleChange}
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Categorization</label>
                                <div className="relative">
                                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                                    <select 
                                        name="category" 
                                        className="input pl-12 appearance-none cursor-pointer"
                                        value={formData.category} onChange={handleChange}
                                    >
                                        <option value="Conference">Conference</option>
                                        <option value="Workshop">Workshop</option>
                                        <option value="Concert">Concert</option>
                                        <option value="Sports">Sports</option>
                                        <option value="Art">Art</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Operational Status</label>
                                <select 
                                    name="status" 
                                    className="input cursor-pointer font-bold"
                                    value={formData.status} onChange={handleChange}
                                >
                                    <option value="active">Active Sequence</option>
                                    <option value="cancelled">Terminated</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Calendar Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                                    <input 
                                        type="date" name="date" required 
                                        className="input pl-12"
                                        value={formData.date} onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Operational Time</label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                                    <input 
                                        type="time" name="time" required 
                                        className="input pl-12"
                                        value={formData.time} onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Guest Capacity</label>
                                <div className="relative">
                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                                    <input 
                                        type="number" name="capacity" required 
                                        className="input pl-12"
                                        value={formData.capacity} onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Premium Pricing ($)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                                    <input 
                                        type="number" name="price" required 
                                        className="input pl-12"
                                        value={formData.price} onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-10">
                        <button 
                            type="submit" 
                            disabled={saving}
                            className="btn-primary w-full py-5 text-sm uppercase tracking-[0.3em] font-black shadow-2xl shadow-primary/30"
                        >
                            {saving ? 'Synchronizing...' : <><Save size={20} className="mr-3" /> Execute Changes</>}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default EditEvent;
