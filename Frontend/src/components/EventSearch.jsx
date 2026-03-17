import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import EventService from '../services/EventServices';
import EventCard from './EventCard';
import Loader from './Loader';

const EventSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const navigate = useNavigate();

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setSearching(true);
        try {
            const res = await EventService.searchEvents(query);
            setResults(res.data);
        } catch (err) {
            console.error('Search failed');
        } finally {
            setSearching(false);
        }
    };

    return (
        <div className="space-y-12">
            <div className="text-center max-w-4xl mx-auto space-y-6">
                <div className="space-y-4 px-2">
                    <h1 className="text-3xl md:text-5xl font-black">Find Your Next <span className="text-gradient">Experience</span></h1>
                    <p className="text-slate-400 font-medium">Search for concerts, workshops, sports and more.</p>
                </div>
                
                <form onSubmit={handleSearch} className="event-search-container px-4">
                    <div className="event-search-wrapper">
                        <Search className="event-search-icon" size={20} />
                        <input 
                            type="text" 
                            className="event-search-input"
                            placeholder="Artist, event, or city..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button 
                            type="submit"
                            className="event-search-btn"
                        >
                            {searching ? '...' : 'SEARCH'}
                        </button>
                    </div>
                </form>
            </div>

            {searching ? (
                <Loader message={`Searching for "${query}"...`} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.map((event, index) => (
                        <EventCard key={event._id} event={event} index={index} />
                    ))}
                </div>
            )}

            {!searching && results.length === 0 && query && (
                <div className="text-center py-12 text-slate-500">No events found for "{query}"</div>
            )}
        </div>
    );
};

export default EventSearch;
