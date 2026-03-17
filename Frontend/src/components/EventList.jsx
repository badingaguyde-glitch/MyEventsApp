import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { retrieveEvents, retrieveNearbyEvents } from '../redux/reducer';
import { MapPin } from 'lucide-react';
import EventCard from './EventCard';

const EventList = () => {
    const dispatch = useDispatch();
    const events = useSelector((state) => state.data);
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-4xl font-bold">
                    {showingNearby ? "Events Near You" : "Discover Events"}
                </h1>
                <div className="flex items-center gap-4">
                    {showingNearby ? (
                        <button onClick={resetEvents} className="btn-secondary text-sm px-4 py-2 flex items-center gap-2">
                            Clear Filter
                        </button>
                    ) : (
                        <button onClick={handleNearby} className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
                            <MapPin size={18} /> Near Me
                        </button>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events && events.map((event, index) => (
                    <EventCard key={event._id} event={event} index={index} />
                ))}
            </div>
            {(!events || events.length === 0) && (
                <div className="text-center py-20 text-slate-400">
                    <p className="text-xl">No events found.</p>
                </div>
            )}
        </div>
    );
};

export default EventList;
