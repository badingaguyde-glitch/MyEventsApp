import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Calendar, MapPin, Star, User, CheckCircle } from 'lucide-react';
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

const ProviderProfile = () => {
    const { id } = useParams();
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const token = useSelector((state) => state.user?.token);
    
    const [provider, setProvider] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Booking Form State
    const [bookingDate, setBookingDate] = useState('');
    const [bookingNotes, setBookingNotes] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('offline');
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [bookingError, setBookingError] = useState('');

    // Review Form State
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');

    useEffect(() => {
        loadProvider();
    }, [id]);

    const loadProvider = async () => {
        setLoading(true);
        try {
            const res = await ServiceProviderService.getProviderById(id);
            setProvider(res.data);
            if (res.data.paymentMethods && res.data.paymentMethods.length > 0) {
                setPaymentMethod(res.data.paymentMethods.includes('offline') ? 'offline' : 'stripe');
            }
        } catch (error) {
            console.error("Error loading provider details", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        setBookingError('');
        setBookingSuccess(false);

        if (!isLoggedIn) {
            setBookingError("Vous devez être connecté pour réserver ce prestataire.");
            return;
        }

        try {
            const data = {
                providerId: id,
                bookingDate,
                totalPrice: provider.rates.price,
                notes: bookingNotes,
                paymentMethod
            };
            const res = await ServiceProviderService.createBooking(data, token);
            if (res.data.checkoutUrl) {
                window.location.href = res.data.checkoutUrl;
            } else {
                setBookingSuccess(true);
                setBookingDate('');
                setBookingNotes('');
                loadProvider();
            }
        } catch (error) {
            setBookingError(error.response?.data?.message || "Une erreur est survenue lors de la réservation.");
        }
    };

    const handleAddReview = async (e) => {
        e.preventDefault();
        if (!isLoggedIn) {
            alert("Veuillez vous connecter pour laisser un avis.");
            return;
        }
        try {
            await ServiceProviderService.addReview(id, { rating: reviewRating, comment: reviewComment }, token);
            setReviewComment('');
            loadProvider();
        } catch (error) {
            console.error("Error adding review", error);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-20">
                <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-2 text-slate-400">Chargement du profil...</p>
            </div>
        );
    }

    if (!provider) {
        return (
            <div className="card text-center py-12">
                <p className="text-slate-400 text-lg">Prestataire introuvable.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
            <div className="lg:col-span-2 space-y-8">
                <div className="card glass p-6 relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-800 shrink-0 font-black text-3xl flex items-center justify-center">
                            {provider.photos && provider.photos.length > 0 ? (
                                <img src={provider.photos[0]} alt={provider.businessName} className="w-full h-full object-cover" />
                            ) : (
                                provider.businessName[0]
                            )}
                        </div>
                        <div>
                            <span className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-indigo-600 text-white mb-2 inline-block">
                                {SERVICE_LABELS[provider.serviceType] || provider.serviceType}
                            </span>
                            <h2 className="text-3xl font-black text-white">{provider.businessName}</h2>
                            <div className="flex items-center gap-3 text-slate-400 text-xs mt-2">
                                <span className="flex items-center gap-1"><MapPin size={14} />{provider.location.city}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1 text-amber-400"><Star size={14} className="fill-amber-400" />{provider.ratingAverage || 'N/A'} ({provider.reviews.length} avis)</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card glass p-6">
                    <h3 className="text-lg font-black text-white mb-4">À propos</h3>
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{provider.bio}</p>
                </div>

                {provider.portfolio && provider.portfolio.length > 0 && (
                    <div className="card glass p-6">
                        <h3 className="text-lg font-black text-white mb-4">Portfolio</h3>
                        <div className="space-y-4">
                            {provider.portfolio.map((item, idx) => (
                                <div key={idx} className="p-4 rounded-xl border border-white/5 bg-white/5">
                                    <h4 className="font-bold text-white text-sm">{item.title}</h4>
                                    {item.description && <p className="text-xs text-slate-400 mt-1">{item.description}</p>}
                                    {item.link && (
                                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:underline mt-2 inline-block">
                                            Voir le lien externe →
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="card glass p-6 space-y-6">
                    <h3 className="text-lg font-black text-white">Avis Clients ({provider.reviews.length})</h3>

                    {isLoggedIn ? (
                        <form onSubmit={handleAddReview} className="space-y-3 p-4 rounded-xl bg-white/5 border border-white/5">
                            <h4 className="text-xs font-bold text-slate-400 uppercase">Laisser une note & avis</h4>
                            <div className="flex gap-2 items-center">
                                <span className="text-xs text-slate-400">Note:</span>
                                <select 
                                    className="input py-1 px-2 rounded-lg bg-slate-800 text-white text-xs"
                                    value={reviewRating}
                                    onChange={(e) => setReviewRating(e.target.value)}
                                >
                                    {[5,4,3,2,1].map(num => <option key={num} value={num}>⭐ {num}</option>)}
                                </select>
                            </div>
                            <textarea 
                                placeholder="Comment s'est passée votre prestation ?" 
                                rows="3"
                                className="input w-full p-3 rounded-xl border border-white/10 bg-white/5 text-xs"
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                required
                            />
                            <button type="submit" className="btn-primary text-xs py-2 px-4">Soumettre mon avis</button>
                        </form>
                    ) : (
                        <p className="text-xs text-slate-400 text-center py-2">
                            <Link to="/login" className="text-indigo-400 hover:underline">Connectez-vous</Link> pour laisser un avis.
                        </p>
                    )}

                    <div className="space-y-4">
                        {provider.reviews.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-4">Aucun avis pour l'instant. Soyez le premier !</p>
                        ) : (
                            provider.reviews.map((rev, idx) => (
                                <div key={idx} className="border-b border-white/5 pb-4 last:border-b-0 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-black text-indigo-400">
                                                <User size={14} />
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold text-white block">{rev.user?.name} {rev.user?.lastName}</span>
                                                <span className="text-[10px] text-slate-500">{new Date(rev.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="flex text-amber-400 gap-0.5">
                                            {Array.from({ length: rev.rating }).map((_, i) => (
                                                <Star key={i} size={12} className="fill-amber-400" />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-300 leading-relaxed pl-10">{rev.comment}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                <div className="card glass p-6 text-center space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tarif Forfaitaire</h3>
                    <div className="text-3xl font-black text-white">
                        {provider.rates.price}€ 
                        <span className="text-xs text-slate-400 font-normal"> / {provider.rates.unit === 'day' ? 'Journée' : provider.rates.unit === 'hour' ? 'Heure' : 'Prestation'}</span>
                    </div>
                </div>

                <div className="card glass p-6 space-y-4">
                    <h3 className="text-lg font-black text-white">Réservez ce prestataire</h3>

                    {bookingSuccess && (
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex gap-2 items-center">
                            <CheckCircle size={16} /> Demande de réservation envoyée avec succès ! Le prestataire va l'examiner.
                        </div>
                    )}

                    {bookingError && (
                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                            {bookingError}
                        </div>
                    )}

                    <form onSubmit={handleBooking} className="space-y-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-slate-400 uppercase">Date de l'événement</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input 
                                    type="date" 
                                    className="input w-full py-3 pl-10 pr-4 rounded-xl border border-white/10 bg-white/5"
                                    value={bookingDate}
                                    onChange={(e) => setBookingDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 text-left">
                            <label className="text-xs font-bold text-slate-400 uppercase">Mode de paiement préféré</label>
                            <select 
                                className="input w-full py-2.5 px-3 rounded-xl border border-white/10 bg-white/5 text-xs text-white"
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            >
                                {provider.paymentMethods.includes('offline') && <option value="offline">Paiement Hors-ligne</option>}
                                {provider.paymentMethods.includes('stripe') && <option value="stripe">Paiement en ligne via Stripe</option>}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-slate-400 uppercase">Consignes / Demandes spéciales</label>
                            <textarea 
                                placeholder="Dites-en plus sur votre événement (horaires, playlists...)" 
                                rows="4"
                                className="input w-full p-3 rounded-xl border border-white/10 bg-white/5 text-xs"
                                value={bookingNotes}
                                onChange={(e) => setBookingNotes(e.target.value)}
                            />
                        </div>

                        <button type="submit" className="btn-primary w-full py-3 font-bold text-xs uppercase tracking-wider">
                            Envoyer la demande
                        </button>
                    </form>
                </div>

                {provider.unavailableDates && provider.unavailableDates.length > 0 && (
                    <div className="card glass p-6">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Dates Déjà Réservées</h3>
                        <div className="flex flex-wrap gap-2">
                            {provider.unavailableDates.map((date, idx) => (
                                <span key={idx} className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full text-[10px] font-bold">
                                    {new Date(date).toLocaleDateString()}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProviderProfile;
