import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { retrieveEvents, retrieveNearbyEvents } from '../redux/reducer';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import EventCard from './EventCard';

const Home = () => {
    const dispatch = useDispatch();
    const events = useSelector((state) => state.data);
    const user = useSelector((state) => state.user);
    const [showingNearby, setShowingNearby] = useState(false);

    useEffect(() => {
        dispatch(retrieveEvents());
    }, [dispatch]);

    const handleNearby = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                dispatch(retrieveNearbyEvents(position.coords.latitude, position.coords.longitude));
                setShowingNearby(true);
            }, (error) => {
                console.error("Error obtaining location", error);
                alert("Please enable location services to find nearby events.");
            });
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    };

    const resetEvents = () => {
        dispatch(retrieveEvents());
        setShowingNearby(false);
    };

    return (
        <div className="space-y-8">

            <section className="relative py-20 overflow-hidden rounded-3xl glass border-indigo-500/20">
                <div className="container relative z-10 mx-auto text-center px-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-black mb-4"
                    >
                        Experience Unforgettable <br />
                        <span className="text-indigo-400">Local Events</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-sm md:text-lg text-slate-400 mx-auto mb-8 px-2 max-w-2xl"
                    >
                        Discover the best concerts, festivals, workshops, and sports events happening around you.
                        Join the community and make every moment count.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-wrap justify-center gap-4"
                    >
                        <Link to="/events" className="btn-primary flex items-center gap-2">
                            Explore Events <ArrowRight size={20} />
                        </Link>
                        <Link to={user?.token ? '/create-event' : '/login'} className="btn-secondary">
                            Host an Event
                        </Link>
                    </motion.div>
                </div>


                <div className="hero-gradient-top"></div>
                <div className="hero-gradient-bottom"></div>
            </section>


            <section>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <h2 className="text-3xl font-bold">
                        {showingNearby ? "Events Near You" : "Upcoming Events"}
                    </h2>
                    <div className="flex items-center gap-4">
                        {showingNearby ? (
                            <button onClick={resetEvents} className="btn-secondary text-xs px-4 py-2 flex items-center gap-2">
                                Clear Filter
                            </button>
                        ) : (
                            <button onClick={handleNearby} className="btn-primary text-xs px-4 py-2 flex items-center gap-2">
                                <MapPin size={16} /> Near Me
                            </button>
                        )}
                        <Link to="/events" className="text-indigo-400 font-bold flex items-center gap-1 no-underline">
                            View all <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events?.slice(0, 3).map((event, index) => (
                        <EventCard key={event._id} event={event} index={index} />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
