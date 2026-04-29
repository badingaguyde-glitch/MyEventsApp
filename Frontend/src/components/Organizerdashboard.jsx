import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import EventService from '../services/EventServices';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Calendar, Ticket, ArrowUpRight, Plus, QrCode } from 'lucide-react';
import Loader from './Loader';

const Organizerdashboard = () => {
    const user = useSelector((state) => state.user);
    const [stats, setStats] = useState({
        totalEvents: 0,
        totalTicketsSold: 0,
        totalRevenue: 0,
        activeEvents: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.token) {
            fetchStats();
        }
    }, [user]);

    const fetchStats = async () => {
        try {
            const res = await EventService.getMyEvents(user.token);
            const events = Array.isArray(res.data) ? res.data : [];
            
            const sold = events.reduce((acc, ev) => acc + (ev.soldTickets || 0), 0);
            const revenue = events.reduce((acc, ev) => acc + ((ev.soldTickets || 0) * ev.price), 0);
            const active = events.filter(ev => ev.status === 'active').length;

            setStats({
                totalEvents: events.length,
                totalTicketsSold: sold,
                totalRevenue: revenue,
                activeEvents: active
            });
        } catch (err) {
            console.error('Failed to load stats');
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { title: 'Total Events', value: stats.totalEvents, icon: Calendar, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
        { title: 'Active Events', value: stats.activeEvents, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        { title: 'Tickets Sold', value: stats.totalTicketsSold, icon: Ticket, color: 'text-rose-400', bg: 'bg-rose-400/10' },
        { title: 'Total Revenue', value: `$${stats.totalRevenue}`, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    ];

    if (loading) return <Loader message="Loading dashboard statistics..." />;

    return (
        <div className="space-y-12 py-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6">
                <div className="min-w-0">
                    <h1 className="text-3xl md:text-4xl font-black mb-2 truncate">Organizer Hub</h1>
                    <p className="text-sm md:text-base text-slate-400 font-medium break-words">Event orchestration and real-time impact tracking.</p>
                </div>
                <Link to="/create-event" className="btn-primary py-3 md:py-4 px-6 md:px-8 h-fit shadow-none w-full md:w-auto shrink-0 text-sm md:text-base">
                    <Plus size={20} className="mr-2 shrink-0" /> CREATE EVENT
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {statCards.map((card, index) => (
                    <motion.div 
                        key={card.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="card glass p-4 md:p-6 flex items-center gap-4 md:gap-6 border border-light"
                    >
                        <div className={`p-3 md:p-4 rounded-2xl ${card.bg} shadow-lg shadow-black/20 shrink-0`}>
                            <card.icon size={24} className={card.color} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 truncate">{card.title}</p>
                            <p className="text-2xl md:text-3xl font-black truncate">{card.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <h2 className="text-2xl font-black">Quick Operations</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link to="/verify-ticket" className="card glass border border-light p-8 flex flex-col justify-center items-center text-center space-y-3 h-full no-underline">
                            <div className="p-3 bg-primary/10 rounded-xl w-fit mb-6 group-hover:bg-primary transition-all">
                                <QrCode size={24} className="text-primary group-hover:text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Verify Tickets</h3>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed">Instantly validate attendee credentials via QR scan or reference code.</p>
                        </Link>
                        <Link to="/my-events" className="card glass border border-light p-8 flex flex-col justify-center items-center text-center space-y-3 h-full no-underline">
                            <div className="p-3 bg-indigo-400/10 rounded-xl w-fit mb-6 group-hover:bg-indigo-400 transition-all">
                                <ArrowUpRight size={24} className="text-indigo-400 group-hover:text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Portfolio Management</h3>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed">Refine your published events, monitor registrations, or adjust capacity.</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Organizerdashboard;
