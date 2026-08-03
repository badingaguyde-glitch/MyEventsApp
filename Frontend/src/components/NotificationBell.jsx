import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import NotificationServices from '../services/NotificationServices';

const NotificationBell = () => {
    const token = useSelector(state => state.user?.token);
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const panelRef = useRef(null);

    // Poll the unread count every 15 seconds
    useEffect(() => {
        if (!token) return;
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 15000);
        return () => clearInterval(interval);
    }, [token]);

    // Close panel on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const res = await NotificationServices.getUnreadCount(token);
            setUnreadCount(res.data.count);
        } catch (e) { /* silently ignore */ }
    };

    const handleOpen = async () => {
        if (!open) {
            try {
                const res = await NotificationServices.getAll(token);
                setNotifications(res.data);
            } catch (e) { console.error(e); }
        }
        setOpen(!open);
    };

    const handleMarkAllRead = async () => {
        try {
            await NotificationServices.markAllAsRead(token);
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (e) { console.error(e); }
    };

    const handleClickNotification = async (notif) => {
        // Mark individual as read
        if (!notif.isRead) {
            try {
                await NotificationServices.markAsRead(notif._id, token);
                setUnreadCount(prev => Math.max(0, prev - 1));
                setNotifications(prev =>
                    prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n)
                );
            } catch (e) { console.error(e); }
        }
        // Navigate to event if applicable
        if (notif.refModel === 'Event' && notif.refId) {
            navigate(`/events/${notif.refId}`);
            setOpen(false);
        }
    };

    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'À l\'instant';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} min`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} h`;
        return `${Math.floor(seconds / 86400)} j`;
    };

    if (!token) return null;

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell button */}
            <button
                id="notification-bell-btn"
                onClick={handleOpen}
                className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Notifications"
            >
                <Bell size={20} className="text-white" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 leading-none">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown panel */}
            {open && (
                <div
                    className="absolute right-0 top-10 w-80 z-50 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    id="notification-panel"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                        <span className="text-sm font-black text-white">Notifications</span>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold"
                            >
                                Tout marquer comme lu
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-96 overflow-y-auto divide-y divide-white/5">
                        {notifications.length === 0 ? (
                            <p className="text-center text-xs text-slate-500 py-8">
                                Aucune notification pour l'instant.
                            </p>
                        ) : (
                            notifications.map(notif => (
                                <button
                                    key={notif._id}
                                    onClick={() => handleClickNotification(notif)}
                                    className={`w-full text-left flex gap-3 items-start px-4 py-3 hover:bg-white/5 transition-colors ${!notif.isRead ? 'bg-indigo-950/40' : ''}`}
                                >
                                    {/* Unread dot */}
                                    <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!notif.isRead ? 'bg-indigo-400' : 'bg-transparent'}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-white leading-snug truncate">
                                            {notif.title}
                                        </p>
                                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug line-clamp-2">
                                            {notif.body}
                                        </p>
                                        <p className="text-[10px] text-slate-600 mt-1">
                                            {timeAgo(notif.createdAt)}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
