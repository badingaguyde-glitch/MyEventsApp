import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';

const EventCard = ({ event, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card group overflow-hidden border border-light transition-all flex flex-col h-full"
        >
            <div className="event-card-img-wrapper">
                <img
                    src={event.image?.startsWith('http') ? event.image : `${import.meta.env.VITE_API_BASE_URL || 'https://my-events-app-backend.vercel.app'}/uploads/${event.image || 'default.jpg'}`}
                    alt={event.title}
                    className="event-card-img"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=800' }}
                />
                <div className="absolute top-3 left-3 px-3 py-1 glass rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
                    {event.category}
                </div>
                <div className="absolute top-3 right-3 px-3 py-1 glass rounded-full text-xs font-bold text-primary">
                    ${event.price}
                </div>
            </div>

            <div className="p-4 md:p-6 flex flex-col flex-grow min-w-0">
                <h3 className="text-lg md:text-xl font-bold mb-3 truncate">{event.title}</h3>

                <div className="space-y-4 mb-6 flex-grow min-w-0">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                        <Calendar size={14} className="text-primary shrink-0" />
                        <span className="truncate">{new Date(event.date).toLocaleDateString()} • {event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium min-w-0">
                        <MapPin size={14} className="text-primary shrink-0" />
                        <span className="truncate">
                            {event.location?.venue}, {event.location?.city}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                        <Users size={14} className="text-primary shrink-0" />
                        <span>{event.capacity} total seats</span>
                    </div>
                </div>

                <div className="event-card-footer">
                    <span className="text-2xl font-black text-white truncate min-w-0">
                        {event.price === 0 ? 'FREE' : `$${event.price}`}
                    </span>
                    <Link
                        to={`/events/${event._id}`}
                        className="btn-primary py-2 px-4 shadow-none shrink-0 text-xs"
                    >
                        DETAILS <ArrowRight size={14} className="gap-2 shrink-0" />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

export default EventCard;
