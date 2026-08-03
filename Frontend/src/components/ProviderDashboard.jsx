import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Check, X, Calendar, User } from 'lucide-react';
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

const ProviderDashboard = () => {
    const token = useSelector((state) => state.user?.token);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('bookings');

    const [profile, setProfile] = useState({
        businessName: '',
        serviceType: 'dj',
        bio: '',
        city: '',
        address: '',
        price: '',
        unit: 'event',
        paymentMethods: ['offline'],
        unavailableDateInput: ''
    });
    const [savedUnavailableDates, setSavedUnavailableDates] = useState([]);
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        loadJobs();
        loadProfileData();
    }, []);

    const loadJobs = async () => {
        try {
            const res = await ServiceProviderService.getMyJobs(token);
            setJobs(res.data);
        } catch (error) {
            console.error("Error loading provider jobs", error);
        } finally {
            setLoading(false);
        }
    };

    const loadProfileData = async () => {
        try {
            const res = await ServiceProviderService.getProviders();
            const localUser = JSON.parse(localStorage.getItem("user"));
            if (!localUser) return;
            
            const userProfile = res.data.find(p => p.user && p.user._id === localUser.id);
            if (userProfile) {
                setProfile({
                    businessName: userProfile.businessName,
                    serviceType: userProfile.serviceType,
                    bio: userProfile.bio,
                    city: userProfile.location.city,
                    address: userProfile.location.address || '',
                    price: userProfile.rates.price,
                    unit: userProfile.rates.unit,
                    paymentMethods: userProfile.paymentMethods || ['offline'],
                    unavailableDateInput: ''
                });
                setSavedUnavailableDates(userProfile.unavailableDates || []);
            }
        } catch (error) {
            console.error("Error retrieving profile data", error);
        }
    };

    const handleStatusUpdate = async (bookingId, newStatus) => {
        try {
            await ServiceProviderService.updateBookingStatus(bookingId, newStatus, token);
            loadJobs();
            loadProfileData();
        } catch (error) {
            alert(error.response?.data?.message || "Une erreur est survenue.");
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setStatusMessage('');
        try {
            const data = {
                businessName: profile.businessName,
                serviceType: profile.serviceType,
                bio: profile.bio,
                city: profile.city,
                address: profile.address,
                rates: {
                    price: Number(profile.price),
                    unit: profile.unit
                },
                paymentMethods: profile.paymentMethods
            };
            await ServiceProviderService.upsertProfile(data, token);
            setStatusMessage('Profil mis à jour avec succès !');
        } catch (error) {
            setStatusMessage("Erreur lors de la mise à jour du profil.");
        }
    };

    const handleAddUnavailableDate = async (e) => {
        e.preventDefault();
        if (!profile.unavailableDateInput) return;
        
        const newDates = [...savedUnavailableDates, new Date(profile.unavailableDateInput)];
        try {
            await ServiceProviderService.updateAvailability(newDates, token);
            setSavedUnavailableDates(newDates);
            setProfile({...profile, unavailableDateInput: ''});
        } catch (error) {
            alert("Erreur lors de l'ajout de la date.");
        }
    };

    const handleRemoveUnavailableDate = async (dateToRemove) => {
        const newDates = savedUnavailableDates.filter(d => d !== dateToRemove);
        try {
            await ServiceProviderService.updateAvailability(newDates, token);
            setSavedUnavailableDates(newDates);
        } catch (error) {
            alert("Erreur lors du retrait de la date.");
        }
    };

    return (
        <div className="space-y-8 text-left">
            <h2 className="text-3xl font-black text-white font-sans uppercase">Espace Prestataire</h2>

            <div className="flex gap-4 border-b border-white/10 pb-2">
                <button 
                    onClick={() => setTab('bookings')} 
                    className={`pb-2 font-bold text-xs uppercase tracking-wider bg-transparent border-0 cursor-pointer ${tab === 'bookings' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400'}`}
                >
                    Demandes reçues
                </button>
                <button 
                    onClick={() => setTab('profile')} 
                    className={`pb-2 font-bold text-xs uppercase tracking-wider bg-transparent border-0 cursor-pointer ${tab === 'profile' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400'}`}
                >
                    Mon profil & disponibilités
                </button>
            </div>

            {tab === 'bookings' ? (
                <div className="space-y-6">
                    {loading ? (
                        <p className="text-slate-400">Chargement...</p>
                    ) : jobs.length === 0 ? (
                        <div className="card glass p-6 text-center text-slate-400">
                            Aucune demande de réservation reçue pour le moment.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {jobs.map((job) => (
                                <div key={job._id} className="card glass p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                job.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                                                job.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400' :
                                                'bg-rose-500/10 text-rose-400'
                                            }`}>
                                                {job.status === 'pending' ? 'En attente' : job.status === 'accepted' ? 'Accepté' : 'Refusé'}
                                            </span>
                                            <span className="text-xs text-slate-400">Demandé le : {new Date(job.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <h4 className="text-lg font-black text-white">Prestation pour {job.organizer?.name} {job.organizer?.lastName}</h4>
                                        <div className="text-xs text-slate-300 space-y-1">
                                            <p>📅 <strong>Date prévue :</strong> {new Date(job.bookingDate).toLocaleDateString()}</p>
                                            {job.event && <p>🏟️ <strong>Événement :</strong> {job.event.title}</p>}
                                            {job.notes && <p>✉️ <strong>Notes :</strong> "{job.notes}"</p>}
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-end gap-3 shrink-0 w-full md:w-auto">
                                        <div className="text-right">
                                            <span className="text-xs text-slate-400 block font-bold">Rémunération</span>
                                            <span className="text-lg font-black text-indigo-400">{job.totalPrice}€</span>
                                        </div>
                                        
                                        {job.status === 'pending' && (
                                            <div className="flex gap-2 w-full md:w-auto">
                                                <button 
                                                    onClick={() => handleStatusUpdate(job._id, 'accepted')}
                                                    className="btn-primary py-2 px-4 text-xs flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700"
                                                >
                                                    <Check size={14} /> Accepter
                                                </button>
                                                <button 
                                                    onClick={() => handleStatusUpdate(job._id, 'rejected')}
                                                    className="btn-secondary py-2 px-4 text-xs flex items-center gap-1 bg-rose-950 text-rose-400 border-rose-500/20 hover:bg-rose-900"
                                                >
                                                    <X size={14} /> Refuser
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 card glass p-6">
                        <h3 className="text-lg font-black text-white mb-4">Informations Professionnelles</h3>
                        {statusMessage && (
                            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs mb-4">
                                {statusMessage}
                            </div>
                        )}
                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Nom commercial / Scène</label>
                                    <input 
                                        type="text" 
                                        className="input w-full p-3 rounded-xl border border-white/10 bg-white/5"
                                        value={profile.businessName}
                                        onChange={(e) => setProfile({...profile, businessName: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Type de Service</label>
                                    <select 
                                        className="input w-full p-3 rounded-xl border border-white/10 bg-white/5"
                                        value={profile.serviceType}
                                        onChange={(e) => setProfile({...profile, serviceType: e.target.value})}
                                    >
                                        {Object.entries(SERVICE_LABELS).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-slate-400 uppercase">Ville principale d'activité</label>
                                <input 
                                    type="text" 
                                    className="input w-full p-3 rounded-xl border border-white/10 bg-white/5"
                                    value={profile.city}
                                    onChange={(e) => setProfile({...profile, city: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-slate-400 uppercase">Adresse (Optionnelle)</label>
                                <input 
                                    type="text" 
                                    className="input w-full p-3 rounded-xl border border-white/10 bg-white/5"
                                    value={profile.address}
                                    onChange={(e) => setProfile({...profile, address: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Tarif standard (€)</label>
                                    <input 
                                        type="number" 
                                        className="input w-full p-3 rounded-xl border border-white/10 bg-white/5"
                                        value={profile.price}
                                        onChange={(e) => setProfile({...profile, price: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Unité de facturation</label>
                                    <select 
                                        className="input w-full p-3 rounded-xl border border-white/10 bg-white/5"
                                        value={profile.unit}
                                        onChange={(e) => setProfile({...profile, unit: e.target.value})}
                                    >
                                        <option value="event">Par événement</option>
                                        <option value="day">Par jour</option>
                                        <option value="hour">Par heure</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-slate-400 uppercase">Modes de paiement acceptés</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 text-xs text-white">
                                        <input 
                                            type="checkbox" 
                                            checked={profile.paymentMethods.includes('offline')}
                                            onChange={(e) => {
                                                const methods = e.target.checked 
                                                    ? [...profile.paymentMethods, 'offline'] 
                                                    : profile.paymentMethods.filter(m => m !== 'offline');
                                                setProfile({...profile, paymentMethods: methods});
                                            }}
                                        />
                                        Paiement Hors-ligne
                                    </label>
                                    <label className="flex items-center gap-2 text-xs text-white">
                                        <input 
                                            type="checkbox" 
                                            checked={profile.paymentMethods.includes('stripe')}
                                            onChange={(e) => {
                                                const methods = e.target.checked 
                                                    ? [...profile.paymentMethods, 'stripe'] 
                                                    : profile.paymentMethods.filter(m => m !== 'stripe');
                                                setProfile({...profile, paymentMethods: methods});
                                            }}
                                        />
                                        Paiement en ligne via Stripe
                                    </label>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-slate-400 uppercase">Description de votre offre & bio</label>
                                <textarea 
                                    rows="5"
                                    placeholder="Présentez votre matériel..."
                                    className="input w-full p-3 rounded-xl border border-white/10 bg-white/5 text-xs"
                                    value={profile.bio}
                                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                                    required
                                />
                            </div>

                            <button type="submit" className="btn-primary py-3 px-6 text-xs uppercase tracking-wider">
                                Enregistrer mon profil
                            </button>
                        </form>
                    </div>

                    <div className="space-y-6">
                        <div className="card glass border-indigo-500/30 p-6 flex flex-col gap-4 text-center">
                            <h4 className="text-md font-bold text-white">🔥 Mode Premium</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Pour 29.99€/mois, apparaissez en tête de liste de toutes les recherches sur la plateforme.
                            </p>
                            <button 
                                type="button" 
                                onClick={async () => {
                                    try {
                                        const res = await ServiceProviderService.createPremiumSubscriptionSession(token);
                                        if (res.data.url) {
                                            window.location.href = res.data.url;
                                        }
                                    } catch(e) {
                                        alert("Erreur Stripe");
                                    }
                                }}
                                className="btn-primary w-full py-2.5 text-xs uppercase font-black"
                            >
                                Passer Premium
                            </button>
                        </div>

                        <div className="card glass p-6 space-y-4">
                            <h3 className="text-lg font-black text-white">Bloquer des dates</h3>
                            <p className="text-xs text-slate-400">
                                Bloquez des jours où vous n'êtes pas disponible.
                            </p>
                            
                            <form onSubmit={handleAddUnavailableDate} className="flex gap-2">
                                <input 
                                    type="date" 
                                    className="input p-2 rounded-xl border border-white/10 bg-white/5 text-xs grow"
                                    value={profile.unavailableDateInput}
                                    onChange={(e) => setProfile({...profile, unavailableDateInput: e.target.value})}
                                />
                                <button type="submit" className="btn-primary text-xs py-2 px-3">Ajouter</button>
                            </form>

                            <div className="pt-4 border-t border-white/5 space-y-2">
                                <h4 className="text-xs font-bold text-slate-400 uppercase">Dates bloquées ({savedUnavailableDates.length})</h4>
                                {savedUnavailableDates.length === 0 ? (
                                    <p className="text-[10px] text-slate-500">Aucune date bloquée.</p>
                                ) : (
                                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
                                        {savedUnavailableDates.map((date, idx) => (
                                            <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 border border-white/5 rounded-full text-[10px] text-slate-300">
                                                <span>{new Date(date).toLocaleDateString()}</span>
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleRemoveUnavailableDate(date)}
                                                    className="text-rose-400 hover:text-white p-0 bg-transparent border-0 cursor-pointer flex items-center justify-center"
                                                >
                                                    <X size={10} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProviderDashboard;
