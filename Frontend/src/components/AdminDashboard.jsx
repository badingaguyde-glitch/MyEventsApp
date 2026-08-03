import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import EventService from '../services/EventServices';
import Loader from './Loader';
import UserDataService from '../services/UserDataServices';
import { Users, Calendar, Shield, Activity, BarChart3, Settings, Search, MoreHorizontal, User, DollarSign, Mail } from 'lucide-react';

const AdminDashboard = () => {
    const user = useSelector((state) => state.user);
    const [stats, setStats] = useState({ users: 0, events: 0, sessions: 'LIVE', growth: 'N/A' });
    const [usersList, setUsersList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.token) {
            fetchPlatformData();
        }
    }, [user]);

    const fetchPlatformData = async () => {
        try {
            const [statsRes, usersRes] = await Promise.all([
                UserDataService.getAdminStats(user.token),
                UserDataService.getAllUsers(user.token)
            ]);
            setStats(statsRes.data);
            setUsersList(usersRes.data);
        } catch (err) {
            console.error('Failed to load platform data', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader message="Accessing global governance data..." />;

    return (
        <div className="space-y-12 py-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6">
                <div className="min-w-0">
                    <h1 className="text-3xl md:text-4xl font-black mb-2 truncate">Admin Control</h1>
                    <p className="text-sm md:text-base text-slate-400 font-medium break-words">Platform-wide governance and global analytics.</p>
                </div>
                <div className="flex flex-wrap md:flex-nowrap gap-4 w-full md:w-auto">
                    <button className="p-3 glass rounded-xl text-slate-400 hover:text-white transition-all border border-light bg-none shrink-0">
                        <Settings size={20} />
                    </button>
                    <button className="btn-primary py-3 px-6 shadow-none flex-1 md:flex-none text-sm md:text-base">
                        SYSTEM LOGS
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: 'Active Users', value: stats.users, icon: Users, color: 'text-indigo-400' },
                    { label: 'Platform Events', value: stats.events, icon: Calendar, color: 'text-primary' },
                    { label: 'Secured Sessions', value: stats.sessions, icon: Activity, color: 'text-emerald-400' },
                    { label: 'Growth Vector', value: stats.growth, icon: BarChart3, color: 'text-amber-400' },
                ].map((stat, i) => (
                    <motion.div 
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="card glass p-4 md:p-6 flex flex-col justify-between h-32 border border-light"
                    >
                        <div className="flex justify-between items-start gap-2">
                            <stat.icon size={20} className={`${stat.color} shrink-0`} />
                            <span className="text-[9px] md:text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded tracking-widest uppercase truncate min-w-0">Real-Time</span>
                        </div>
                        <div className="min-w-0">
                            <p className="text-2xl md:text-3xl font-black truncate">{stat.value}</p>
                            <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">{stat.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                <div className="card glass p-8 border border-light space-y-8">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-black">Platform Activity</h2>
                        <Activity size={20} className="text-primary" />
                    </div>
                    <div className="flex flex-col items-center justify-center h-48 text-center space-y-3 opacity-40">
                        <Activity size={32} className="text-slate-600" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Awaiting stream integration...</p>
                    </div>
                </div>

                <div className="card glass p-8 border border-light space-y-8">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-black">Visual Analytics</h2>
                        <BarChart3 size={20} className="text-primary" />
                    </div>
                    <div className="flex flex-col items-center justify-center h-48 text-center space-y-3 opacity-40">
                        <BarChart3 size={32} className="text-slate-600" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Synthesizing data vectors...</p>
                    </div>
                </div>
            </div>

            <div className="card glass p-8 border border-light">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <h2 className="text-2xl font-black">Identity Management</h2>
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search identities..." 
                            className="input pl-12 py-3"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 text-slate-400 text-sm">
                                <th className="pb-4 font-medium pl-4">User</th>
                                <th className="pb-4 font-medium">Role</th>
                                <th className="pb-4 font-medium">Plan</th>
                                <th className="pb-4 font-medium text-right pr-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usersList.filter(u => `${u.name} ${u.lastName} ${u.email}`.toLowerCase().includes(searchTerm.toLowerCase())).map((u) => (
                                <tr key={u._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="py-4 pl-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                                                {u.name?.charAt(0)}{u.lastName?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white">{u.name} {u.lastName}</p>
                                                <p className="text-xs text-slate-400 flex items-center gap-1"><Mail size={10} /> {u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <span className="px-2 py-1 bg-white/5 rounded text-xs font-medium text-slate-300 capitalize">{u.role?.replace('_', ' ')}</span>
                                    </td>
                                    <td className="py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${u.plan === 'enterprise' ? 'bg-indigo-500/20 text-indigo-400' : u.plan === 'pro' ? 'bg-primary/20 text-primary' : 'bg-slate-500/20 text-slate-400'}`}>
                                            {u.plan || 'Free'}
                                        </span>
                                    </td>
                                    <td className="py-4 text-right pr-4">
                                        <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 transition-colors">
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {usersList.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center py-8 text-slate-500">No users found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
