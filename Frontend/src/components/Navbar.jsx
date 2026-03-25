import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, checkOrganizerStatus } from '../redux/reducer';
import { Calendar, Ticket, User, LogOut, Search, Home as HomeIcon, QrCode, Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const user = useSelector((state) => state.user);
    const myEvents = useSelector((state) => state.myEvents);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (isLoggedIn && user?.token && myEvents.length === 0) {
            dispatch(checkOrganizerStatus(user.token));
        }
    }, [isLoggedIn, user]);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const navLinks = [
        { name: 'Home', path: '/', icon: HomeIcon },
        { name: 'Events', path: '/events', icon: Calendar },
        { name: 'Search', path: '/search', icon: Search },
        ...(isLoggedIn ? [{ name: 'My Tickets', path: '/my-tickets', icon: Ticket }] : []),
        ...(isLoggedIn && (user?.role === 'organizer' || myEvents.length > 0) ? [{ name: 'Organizer', path: '/organizer-dashboard', icon: Shield }] : []),
        ...(isLoggedIn && user?.role === 'admin' ? [{ name: 'Admin', path: '/admin-dashboard', icon: Shield }] : []),
        ...(isLoggedIn && (user?.role === 'organizer' || user?.role === 'admin' || myEvents.length > 0) ? [{ name: 'Verify', path: '/verify-ticket', icon: QrCode }] : []),
    ];

    return (
        <nav className="glass sticky top-0 z-50 w-full border-b py-3">
            <div className="container mx-auto flex items-center justify-between px-4">
                <Link to="/" className="flex items-center gap-2 text-xl md:text-2xl font-bold text-white shrink-0" style={{ textDecoration: 'none' }}>
                    <Calendar className="text-primary shrink-0" size={32} />
                    <span className="text-gradient">
                        MyEvents
                    </span>
                </Link>

                
                <div className="flex items-center gap-4">
                    
                    <div className="flex items-center gap-2 md:gap-4 border-r pr-2 md:pr-4" style={{ borderColor: 'var(--border-white)' }}>
                        {isLoggedIn ? (
                            <>
                                <Link to="/profile" className="nav-link text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                                    <User size={14} className="opacity-60 shrink-0" />
                                    <span className="hidden sm:inline truncate max-w-[80px] md:max-w-none">{user.name.split(' ')[0]}</span>
                                </Link>
                                <button onClick={handleLogout} className="text-rose-400 hover:text-rose-300 transition-colors p-2 shrink-0" title="Log Out" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <LogOut size={18} />
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="nav-link text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">Login</Link>
                                <Link to="/register" className="btn-primary py-2 px-3 md:px-4 text-[10px] tracking-widest shadow-none hidden sm:inline-flex whitespace-nowrap shrink-0">SIGN UP</Link>
                            </>
                        )}
                    </div>

                    
                    <button
                        className="p-2 text-white glass rounded-xl flex items-center justify-center transition-all hover:bg-white/10 shrink-0"
                        onClick={() => setIsOpen(true)}
                        style={{ background: 'none', cursor: 'pointer', border: '1px solid var(--border-white)', width: '44px', height: '44px' }}
                    >
                        <Menu size={24} />
                    </button>
                </div>
            </div>

            
            <AnimatePresence>
                {isOpen && (
                    <>
                        
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
                        />
                        
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-[280px] bg-bg-dark border-l z-[110] shadow-2xl"
                            style={{ borderColor: 'var(--border-white)' }}
                        >
                            <div className="p-6 flex flex-col h-full">
                                <div className="flex justify-between items-center mb-10">
                                    <span className="text-sm font-black uppercase tracking-[0.2em] text-primary">Menu</span>
                                    <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-white transition-all bg-white/5 rounded-lg border border-white/10">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all text-sm font-bold uppercase tracking-widest text-slate-300 hover:text-white"
                                            style={{ textDecoration: 'none' }}
                                        >
                                            <div className="p-2 bg-white/5 rounded-lg">
                                                <link.icon size={18} className="text-primary" />
                                            </div>
                                            {link.name}
                                        </Link>
                                    ))}
                                </div>

                                <div className="mt-auto pt-8 border-t" style={{ borderColor: 'var(--border-white)' }}>
                                    {isLoggedIn ? (
                                        <div className="space-y-4">
                                            <Link
                                                to="/profile"
                                                onClick={() => setIsOpen(false)}
                                                className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 text-sm font-bold uppercase tracking-widest text-white"
                                                style={{ textDecoration: 'none' }}
                                            >
                                                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30">
                                                    <User size={18} className="text-primary" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-slate-500">Account</span>
                                                    <span>{user.name}</span>
                                                </div>
                                            </Link>
                                            <button
                                                onClick={() => { handleLogout(); setIsOpen(false); }}
                                                className="w-full flex items-center gap-4 p-4 rounded-2xl text-rose-400 hover:bg-rose-500/10 transition-all text-sm font-bold uppercase tracking-widest"
                                                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                            >
                                                <LogOut size={18} />
                                                Sign Out
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-4">
                                            <Link to="/login" onClick={() => setIsOpen(false)} className="block w-full text-center py-4 text-sm font-bold uppercase tracking-widest text-white glass rounded-2xl" style={{ textDecoration: 'none' }}>Login</Link>
                                            <Link to="/register" onClick={() => setIsOpen(false)} className="block w-full text-center py-4 text-sm font-bold uppercase tracking-widest text-white btn-primary rounded-2xl" style={{ textDecoration: 'none' }}>Sign Up</Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
