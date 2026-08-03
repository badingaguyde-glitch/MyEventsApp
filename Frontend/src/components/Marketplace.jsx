import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import ServiceProviderService from '../services/ServiceProviderServices';

const SERVICE_LABELS = {
    dj: 'DJ / Ambianceur',
    decorator: 'Décorateur',
    photographer: 'Photographe',
    videographer: 'Vidéaste',
    caterer: 'Traiteur',
    animator: 'Animateur',
    security: 'Société de sécurité',
    chairs_rental: 'Location de chaises',
    tents_rental: 'Location de tentes',
    venue: 'Salle de réception',
    music_group: 'Groupe musical'
};

const Marketplace = () => {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        type: '',
        city: '',
        minPrice: '',
        maxPrice: '',
        minRating: ''
    });
    const [showAdvanced, setShowAdvanced] = useState(false);

    useEffect(() => {
        fetchProviders();
    }, [filters.type, filters.minRating]);

    const fetchProviders = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.type) params.type = filters.type;
            if (filters.city) params.city = filters.city;
            if (filters.minPrice) params.minPrice = filters.minPrice;
            if (filters.maxPrice) params.maxPrice = filters.maxPrice;
            if (filters.minRating) params.minRating = filters.minRating;

            const res = await ServiceProviderService.getProviders(params);
            setProviders(res.data);
        } catch (error) {
            console.error("Failed to fetch providers", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchProviders();
    };

    return (
        <div className="space-y-8">
            <section className="relative py-16 overflow-hidden rounded-3xl glass border-indigo-500/20 text-center">
                <div className="relative z-10 max-w-3xl mx-auto px-4">
                    <h1 className="text-3xl md:text-5xl font-black mb-3">Marketplace des Prestataires</h1>
                    <p className="text-sm md:text-md text-slate-400 mb-6">
                        Trouvez le DJ, le traiteur, le photographe ou la salle de réception idéal pour faire de votre mariage, concert ou conférence une réussite totale.
                    </p>
                </div>
                <div className="hero-gradient-top"></div>
            </section>

            <div className="card glass p-6">
                <form onSubmit={handleSearchSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1 text-left">
                            <label className="text-xs font-bold text-slate-400 uppercase">Métier / Service</label>
                            <select 
                                className="input w-full py-3 px-4 rounded-xl border border-white/10 bg-white/5"
                                value={filters.type}
                                onChange={(e) => setFilters({...filters, type: e.target.value})}
                            >
                                <option value="">Tous les prestataires</option>
                                {Object.entries(SERVICE_LABELS).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1 text-left">
                            <label className="text-xs font-bold text-slate-400 uppercase">Ville</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Ex: Douala, Paris..." 
                                    className="input w-full py-3 pl-10 pr-4 rounded-xl border border-white/10 bg-white/5"
                                    value={filters.city}
                                    onChange={(e) => setFilters({...filters, city: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="flex items-end gap-2">
                            <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                                <Search size={18} /> Rechercher
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="btn-secondary py-3 px-4 flex items-center justify-center"
                                title="Filtres avancés"
                            >
                                <SlidersHorizontal size={18} />
                            </button>
                        </div>
                    </div>

                    {showAdvanced && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/10 text-left"
                        >
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-slate-400 uppercase">Prix Minimum</label>
                                <input 
                                    type="number" 
                                    placeholder="Budget Min" 
                                    className="input w-full py-2 px-3 rounded-xl border border-white/10 bg-white/5"
                                    value={filters.minPrice}
                                    onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-slate-400 uppercase">Prix Maximum</label>
                                <input 
                                    type="number" 
                                    placeholder="Budget Max" 
                                    className="input w-full py-2 px-3 rounded-xl border border-white/10 bg-white/5"
                                    value={filters.maxPrice}
                                    onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-slate-400 uppercase">Note minimale</label>
                                <select 
                                    className="input w-full py-2 px-3 rounded-xl border border-white/10 bg-white/5"
                                    value={filters.minRating}
                                    onChange={(e) => setFilters({...filters, minRating: e.target.value})}
                                >
                                    <option value="">Toutes les notes</option>
                                    <option value="4">⭐ 4 étoiles et plus</option>
                                    <option value="3">⭐ 3 étoiles et plus</option>
                                    <option value="2">⭐ 2 étoiles et plus</option>
                                </select>
                            </div>
                        </motion.div>
                    )}
                </form>
            </div>

            {loading ? (
                <div className="text-center py-10">
                    <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-slate-400">Chargement des prestataires...</p>
                </div>
            ) : providers.length === 0 ? (
                <div className="card text-center py-12 text-slate-400">
                    <p className="text-lg">Aucun prestataire ne correspond à vos critères de recherche.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {providers.map((p) => (
                        <motion.div 
                            key={p._id} 
                            whileHover={{ y: -4 }}
                            className="card glass flex flex-col justify-between h-full text-left"
                        >
                            <div>
                                <div className="h-40 rounded-xl overflow-hidden mb-4 bg-slate-800 relative">
                                    {p.photos && p.photos.length > 0 ? (
                                        <img src={p.photos[0]} alt={p.businessName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-600 bg-gradient-to-br from-indigo-950 to-slate-900 font-bold uppercase text-2xl">
                                            {p.businessName[0]}
                                        </div>
                                    )}
                                    <span className="absolute top-2 right-2 px-3 py-1 text-xs font-black uppercase rounded-full bg-indigo-600 text-white">
                                        {SERVICE_LABELS[p.serviceType] || p.serviceType}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold mb-1 truncate text-white">{p.businessName}</h3>
                                
                                <div className="flex items-center gap-1 text-slate-400 text-xs mb-3">
                                    <MapPin size={14} className="text-indigo-400" />
                                    <span>{p.location.city}</span>
                                    <span className="mx-2">•</span>
                                    <Star size={14} className="text-amber-400 fill-amber-400" />
                                    <span className="font-bold text-white">{p.ratingAverage || 'N/A'}</span>
                                    <span>({p.reviews.length} avis)</span>
                                </div>

                                <p className="text-slate-400 text-xs line-clamp-3 mb-4">{p.bio}</p>
                            </div>

                            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                <div>
                                    <span className="text-xs text-slate-400 block">Tarif indicatif</span>
                                    <span className="text-md font-black text-white">{p.rates.price}€ / {p.rates.unit === 'day' ? 'Jour' : p.rates.unit === 'hour' ? 'Heure' : 'Événement'}</span>
                                </div>
                                <Link to={`/providers/${p._id}`} className="btn-primary py-2 px-4 text-xs flex items-center gap-1">
                                    Profil <ArrowRight size={14} />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Marketplace;
