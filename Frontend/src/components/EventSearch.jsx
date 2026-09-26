import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, Navigation, LayoutGrid, Map as MapIcon, Compass } from 'lucide-react';
import EventService from '../services/EventServices';
import EventCard from './EventCard';
import EventsMapView from './EventsMapView';
import Loader from './Loader';

const RADIUS_OPTIONS = [5, 10, 25, 50, 100];

const EventSearch = () => {
    const [searchParams] = useSearchParams();
    const initialQuery = searchParams.get('q') || '';
    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);

    // Modes : 'keyword' ou 'nearby'
    const [searchMode, setSearchMode] = useState('keyword');
    // Vues : 'grid' ou 'map'
    const [viewMode, setViewMode] = useState('grid');

    // États géographiques
    const [userLocation, setUserLocation] = useState(null);
    const [radius, setRadius] = useState(10);
    const [locating, setLocating] = useState(false);
    const [geoError, setGeoError] = useState(null);

    useEffect(() => {
        if (initialQuery) {
            performKeywordSearch(initialQuery);
        }
    }, [initialQuery]);

    // 1. Recherche par mot-clé
    const performKeywordSearch = async (searchQuery) => {
        setSearching(true);
        setGeoError(null);
        try {
            const res = await EventService.searchEvents(searchQuery);
            const eventList = Array.isArray(res.data) ? res.data : (res.data?.events || []);
            setResults(eventList);
        } catch (err) {
            console.error('Search failed:', err);
        } finally {
            setSearching(false);
        }
    };

    // 2. Recherche géographique à proximité
    const performNearbySearch = async (coords = userLocation, searchRadius = radius) => {
        if (!coords) return;
        setSearching(true);
        setGeoError(null);
        try {
            const res = await EventService.getNearbyEvents(coords.lat, coords.lng, searchRadius);
            const eventList = res.data?.events || (Array.isArray(res.data) ? res.data : []);
            setResults(eventList);
        } catch (err) {
            console.error('Nearby search failed:', err);
            setGeoError("Erreur lors de la recherche des événements à proximité.");
        } finally {
            setSearching(false);
        }
    };

    // 3. Détection de la position de l'utilisateur (HTML5 Geolocation)
    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setGeoError("La géolocalisation n'est pas supportée par votre navigateur.");
            return;
        }

        setLocating(true);
        setGeoError(null);
        setSearchMode('nearby');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setUserLocation(coords);
                setLocating(false);
                performNearbySearch(coords, radius);
            },
            (error) => {
                setLocating(false);
                if (error.code === error.PERMISSION_DENIED) {
                    setGeoError("Accès à votre position refusé. Veuillez autoriser la géolocalisation dans votre navigateur.");
                } else {
                    setGeoError("Impossible de déterminer votre position actuelle.");
                }
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleKeywordSubmit = (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        setSearchMode('keyword');
        performKeywordSearch(query);
    };

    const handleRadiusChange = (newRadius) => {
        setRadius(newRadius);
        if (userLocation) {
            performNearbySearch(userLocation, newRadius);
        }
    };

    return (
        <div className="space-y-10 max-w-7xl mx-auto px-4 py-6">
            {/* Header & Titre */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
                <h1 className="text-3xl md:text-5xl font-black">
                    Explorez vos <span className="text-gradient">Expériences</span>
                </h1>
                <p className="text-slate-400 font-medium text-sm md:text-base">
                    Recherchez par mot-clé, ville, ou découvrez instantanément ce qui se passe autour de vous.
                </p>

                {/* Commutateur de mode : Mot-clé vs Autour de moi */}
                <div className="inline-flex p-1.5 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-light gap-2">
                    <button
                        type="button"
                        onClick={() => setSearchMode('keyword')}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 transition-all ${
                            searchMode === 'keyword'
                                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Search size={16} />
                        Recherche classique
                    </button>
                    <button
                        type="button"
                        onClick={handleGetLocation}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 transition-all ${
                            searchMode === 'nearby'
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Navigation size={16} className={locating ? "animate-spin" : ""} />
                        {locating ? "Localisation..." : "Autour de moi (GPS)"}
                    </button>
                </div>
            </div>

            {/* Formulaire de recherche selon le mode */}
            {searchMode === 'keyword' ? (
                <form onSubmit={handleKeywordSubmit} className="max-w-2xl mx-auto">
                    <div className="event-search-wrapper">
                        <Search className="event-search-icon" size={20} />
                        <input
                            type="text"
                            className="event-search-input"
                            placeholder="Artiste, titre, ville (ex: Paris, Dakar, Festival...)"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button type="submit" className="event-search-btn">
                            {searching ? '...' : 'RECHERCHER'}
                        </button>
                    </div>
                </form>
            ) : (
                /* Mode Autour de moi : Sélecteur de rayon */
                <div className="max-w-2xl mx-auto bg-slate-900/60 p-6 rounded-2xl border border-light space-y-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm">
                        <Compass size={18} className="animate-spin-slow" />
                        <span>Rayon de recherche autour de votre position</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {RADIUS_OPTIONS.map((r) => (
                            <button
                                key={r}
                                type="button"
                                onClick={() => handleRadiusChange(r)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                    radius === r
                                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105'
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                }`}
                            >
                                {r} km
                            </button>
                        ))}
                    </div>

                    {userLocation && (
                        <p className="text-[11px] text-slate-400">
                            Position détectée : [{userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}]
                        </p>
                    )}
                </div>
            )}

            {/* Alerte Erreur Géolocalisation */}
            {geoError && (
                <div className="max-w-xl mx-auto p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium text-center">
                    ⚠️ {geoError}
                </div>
            )}

            {/* Barre de contrôle des résultats (Compteur + Basculeur Grille / Carte) */}
            {!searching && results.length > 0 && (
                <div className="flex items-center justify-between border-b border-light pb-4">
                    <span className="text-xs md:text-sm font-bold text-slate-400">
                        <strong className="text-white">{results.length}</strong> événement{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
                        {searchMode === 'nearby' && ` dans un rayon de ${radius} km`}
                    </span>

                    <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-light">
                        <button
                            type="button"
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${
                                viewMode === 'grid'
                                    ? 'bg-primary text-white shadow'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                            title="Vue Grille"
                        >
                            <LayoutGrid size={16} />
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('map')}
                            className={`p-2 rounded-lg transition-all ${
                                viewMode === 'map'
                                    ? 'bg-primary text-white shadow'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                            title="Vue Carte"
                        >
                            <MapIcon size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Affichage des résultats */}
            {searching ? (
                <Loader message={searchMode === 'nearby' ? `Recherche des événements à moins de ${radius} km...` : `Recherche de "${query}"...`} />
            ) : results.length > 0 ? (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {results.map((event, index) => (
                            <EventCard key={event._id} event={event} index={index} />
                        ))}
                    </div>
                ) : (
                    <EventsMapView
                        events={results}
                        userLocation={userLocation}
                        radius={searchMode === 'nearby' ? radius : null}
                    />
                )
            ) : (
                !searching && (
                    <div className="text-center py-16 space-y-3">
                        <div className="text-4xl">🎈</div>
                        <h3 className="text-lg font-bold text-white">Aucun événement trouvé</h3>
                        <p className="text-slate-400 text-xs max-w-sm mx-auto">
                            {searchMode === 'nearby'
                                ? `Aucun événement actif n'a été trouvé dans un rayon de ${radius} km. Essayez d'augmenter le rayon à 50 ou 100 km.`
                                : `Aucun événement ne correspond à "${query}". Essayez un autre mot-clé ou la recherche par localisation.`}
                        </p>
                    </div>
                )
            )}
        </div>
    );
};

export default EventSearch;