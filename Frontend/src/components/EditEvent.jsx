import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import EventService from '../services/EventServices';
import { motion } from 'framer-motion';
import { Save, X, Calendar, MapPin, Users, DollarSign, Tag, Clock, AlertCircle } from 'lucide-react';
import Loader from './Loader';
import PromoWidget from './PromoWidget';

const EditEvent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = useSelector((state) => state.user);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        date: '',
        time: '',
        location: '',
        capacity: '',
        price: '',
        image: '',
        status: '',
        ticketTemplate: {
            layoutType: 'classic',
            showEventImage: true,
            showOrganizerLogo: false,
            showPrice: true,
            showLocationDetails: true,
            primaryColor: '#1e3c72',
            textColor: '#333333',
            backgroundColor: '#ffffff',
            accentColor: '#ff4c3b',
            borderColor: '#e2e8f0',
            fontFamily: 'Helvetica',
            titleFontSize: 22,
            bodyFontSize: 11,
            customTitle: '',
            customNotes: '',
            termsAndConditions: '',
            sponsorLogoUrl: ''
        }
    });

    useEffect(() => {
        fetchEvent();
    }, [id]);

    const fetchEvent = async () => {
        try {
            const res = await EventService.getEventById(id);
            const data = res.data;

            const formattedDate = data.date ? new Date(data.date).toISOString().split('T')[0] : '';
            setFormData({
                ...data,
                date: formattedDate
            });
        } catch (err) {
            setError('Failed to fetch event data.');
        } finally {
            setLoading(false);
        }
    };

    const handleTemplateChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            ticketTemplate: {
                ...formData.ticketTemplate,
                [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
            }
        })
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            await EventService.updateEvent(id, formData, user.token);
            navigate('/my-events');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update event.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loader message="Loading event data..." />;

    return (
        <div className="max-w-3xl mx-auto py-12">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card glass p-10 space-y-10 border border-light"
            >
                <div className="flex justify-between items-center pb-6 border-b border-light">
                    <div>
                        <h1 className="text-3xl font-black text-white">Refine Experience</h1>
                        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">Adjust parameters for your published event</p>
                    </div>
                    <button onClick={() => navigate(-1)} className="p-3 glass rounded-full text-slate-400 hover:text-white transition-all shadow-lg">
                        <X size={24} />
                    </button>
                </div>

                {error && (
                    <div className="p-5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-sm font-bold flex items-center gap-4 shadow-inner">
                        <AlertCircle size={20} className="text-rose-500" /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-6">
                        <div>
                            <label className=" block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Event Title</label>
                            <input
                                type="text" name="title" required
                                className="input"
                                value={formData.title} onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Description Manifest</label>
                            <textarea
                                name="description" required rows="5"
                                className="input py-4 leading-relaxed"
                                value={formData.description} onChange={handleChange}
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Categorization</label>
                                <div className="relative">
                                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                                    <select
                                        name="category"
                                        className="input pl-12 appearance-none cursor-pointer"
                                        value={formData.category} onChange={handleChange}
                                    >
                                        <option value="Conference">Conference</option>
                                        <option value="Workshop">Workshop</option>
                                        <option value="Concert">Concert</option>
                                        <option value="Sports">Sports</option>
                                        <option value="Art">Art</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Operational Status</label>
                                <select
                                    name="status"
                                    className="input cursor-pointer font-bold"
                                    value={formData.status} onChange={handleChange}
                                >
                                    <option value="active">Active Sequence</option>
                                    <option value="cancelled">Terminated</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Calendar Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                                    <input
                                        type="date" name="date" required
                                        className="input pl-12"
                                        value={formData.date} onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Operational Time</label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                                    <input
                                        type="time" name="time" required
                                        className="input pl-12"
                                        value={formData.time} onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Guest Capacity</label>
                                <div className="relative">
                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                                    <input
                                        type="number" name="capacity" required
                                        className="input pl-12"
                                        value={formData.capacity} onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Premium Pricing ($)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                                    <input
                                        type="number" name="price" required
                                        className="input pl-12"
                                        value={formData.price} onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    {user && (user.plan === 'pro' || user.plan === 'enterprise') ? (
                        <div className="pt-10 border-t border-slate-700 space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Personnalisation du Billet PDF (Option PRO)</h2>
                                <p className="text-sm text-slate-400">Configurez l'aspect et la mise en page de vos billets électroniques avec prévisualisation en temps réel.</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                {/* Formulaire de configuration */}
                                <div className="lg:col-span-7 space-y-6 bg-slate-900/50 p-6 rounded-3xl border border-slate-700">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Modèle de billet</label>
                                            <select
                                                name="layoutType" className="input text-sm cursor-pointer"
                                                value={formData.ticketTemplate?.layoutType || 'classic'} onChange={handleTemplateChange}
                                            >
                                                <option value="classic">Billet Classique (A4)</option>
                                                <option value="modern">Cinéma / Concert (Détachable)</option>
                                                <option value="badge">Badge Événementiel (A plier)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Police de caractères</label>
                                            <select
                                                name="fontFamily" className="input text-sm cursor-pointer"
                                                value={formData.ticketTemplate?.fontFamily || 'Helvetica'} onChange={handleTemplateChange}
                                            >
                                                <option value="Helvetica">Helvetica (Moderne)</option>
                                                <option value="Courier">Courier (Monospace/Retro)</option>
                                                <option value="Times-Roman">Times New Roman (Sérif/Classique)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-[9px] font-black text-slate-400 uppercase mb-2">Header / Bordures</label>
                                            <input
                                                type="color" name="primaryColor" className="w-full h-10 rounded-lg cursor-pointer bg-transparent border-0"
                                                value={formData.ticketTemplate?.primaryColor || '#1e3c72'} onChange={handleTemplateChange}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-black text-slate-400 uppercase mb-2">Texte principal</label>
                                            <input
                                                type="color" name="textColor" className="w-full h-10 rounded-lg cursor-pointer bg-transparent border-0"
                                                value={formData.ticketTemplate?.textColor || '#333333'} onChange={handleTemplateChange}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-black text-slate-400 uppercase mb-2">Fond de page</label>
                                            <input
                                                type="color" name="backgroundColor" className="w-full h-10 rounded-lg cursor-pointer bg-transparent border-0"
                                                value={formData.ticketTemplate?.backgroundColor || '#ffffff'} onChange={handleTemplateChange}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-black text-slate-400 uppercase mb-2">Badges & Accents</label>
                                            <input
                                                type="color" name="accentColor" className="w-full h-10 rounded-lg cursor-pointer bg-transparent border-0"
                                                value={formData.ticketTemplate?.accentColor || '#ff4c3b'} onChange={handleTemplateChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase">Paramètres d'affichage</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-300">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" name="showEventImage" checked={formData.ticketTemplate?.showEventImage ?? true} onChange={handleTemplateChange} className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-500" />
                                                Afficher la bannière d'événement
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" name="showPrice" checked={formData.ticketTemplate?.showPrice ?? true} onChange={handleTemplateChange} className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-500" />
                                                Afficher le prix sur le billet
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" name="showLocationDetails" checked={formData.ticketTemplate?.showLocationDetails ?? true} onChange={handleTemplateChange} className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-500" />
                                                Afficher l'adresse de l'événement
                                            </label>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Titre du billet (Optionnel - Surcharge)</label>
                                            <input
                                                type="text" name="customTitle" className="input text-sm" placeholder="Ex: ACCÈS ZONE VIP (vide par défaut)"
                                                value={formData.ticketTemplate?.customTitle || ''} onChange={handleTemplateChange}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Consignes et notes aux participants</label>
                                            <textarea
                                                name="customNotes" rows="2" className="input text-sm py-2.5" placeholder="Ex: Entrée interdite aux mineurs non accompagnés..."
                                                value={formData.ticketTemplate?.customNotes || ''} onChange={handleTemplateChange}
                                            ></textarea>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Mentions Légales & CGV (Affichées en bas de page)</label>
                                            <textarea
                                                name="termsAndConditions" rows="2" className="input text-sm py-2.5" placeholder="Ex: Billet non remboursable. Toute revente est interdite..."
                                                value={formData.ticketTemplate?.termsAndConditions || ''} onChange={handleTemplateChange}
                                            ></textarea>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">URL Logo de Sponsor Officiel (Affiché au pied de page)</label>
                                            <input
                                                type="text" name="sponsorLogoUrl" className="input text-sm" placeholder="Ex: https://image.com/sponsor-logo.png"
                                                value={formData.ticketTemplate?.sponsorLogoUrl || ''} onChange={handleTemplateChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Aperçu en direct (Live Preview) */}
                                <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 border border-dashed border-slate-700 rounded-3xl bg-slate-950/20">
                                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider mb-4">Aperçu en Direct ({formData.ticketTemplate?.layoutType})</span>

                                    {/* MODÈLE VISUEL CLASSIC */}
                                    {(!formData.ticketTemplate?.layoutType || formData.ticketTemplate.layoutType === 'classic') && (
                                        <div className="w-full max-w-[320px] border shadow-2xl transition-all"
                                            style={{
                                                backgroundColor: formData.ticketTemplate?.backgroundColor || '#ffffff',
                                                borderColor: formData.ticketTemplate?.primaryColor || '#1e3c72',
                                                borderRadius: `12px`,
                                                borderWidth: '2px',
                                                color: formData.ticketTemplate?.textColor || '#333333',
                                                fontFamily: formData.ticketTemplate?.fontFamily || 'Helvetica'
                                            }}
                                        >
                                            <div className="p-3 text-center text-white font-bold text-xs" style={{ backgroundColor: formData.ticketTemplate?.primaryColor || '#1e3c72' }}>
                                                BANTU MyEvents - TICKET
                                            </div>
                                            {formData.ticketTemplate?.showEventImage && formData.image && (
                                                <img src={formData.image} alt="Bannière" className="w-full h-20 object-cover" />
                                            )}
                                            <div className="p-4 space-y-3">
                                                <h4 className="font-bold text-sm">{formData.ticketTemplate?.customTitle || formData.title || "Nom Événement"}</h4>
                                                <div className="text-[9px] space-y-1 opacity-90">
                                                    <p><strong>DATE :</strong> {formData.date || "25 Décembre 2026"}</p>
                                                    {formData.ticketTemplate?.showLocationDetails && (
                                                        <p><strong>LIEU :</strong> {formData.location?.venue || "Paris"}</p>
                                                    )}
                                                    <p><strong>PARTICIPANT :</strong> Jean Dupont</p>
                                                    {formData.ticketTemplate?.showPrice && (
                                                        <p><strong>TARIF :</strong> <span style={{ color: formData.ticketTemplate?.accentColor || '#ff4c3b' }}>{formData.price || 0} $</span></p>
                                                    )}
                                                </div>
                                                <div className="border-t border-dashed my-2" style={{ borderColor: formData.ticketTemplate?.borderColor || '#e2e8f0' }} />
                                                <div className="flex flex-col items-center">
                                                    <div className="w-20 h-20 bg-zinc-200 border border-zinc-300 flex items-center justify-center text-[8px] text-zinc-500 font-bold">QR CODE</div>
                                                    <span className="text-[7px] text-zinc-500 font-mono mt-1">Code: TKT-12345678</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* MODÈLE VISUEL MODERN */}
                                    {formData.ticketTemplate?.layoutType === 'modern' && (
                                        <div className="w-full max-w-[325px] border shadow-2xl flex transition-all overflow-hidden"
                                            style={{
                                                backgroundColor: formData.ticketTemplate?.backgroundColor || '#ffffff',
                                                borderColor: formData.ticketTemplate?.primaryColor || '#1e3c72',
                                                borderRadius: '12px',
                                                borderWidth: '2px',
                                                color: formData.ticketTemplate?.textColor || '#333333',
                                                fontFamily: formData.ticketTemplate?.fontFamily || 'Helvetica'
                                            }}
                                        >
                                            <div className="w-3" style={{ backgroundColor: formData.ticketTemplate?.primaryColor || '#1e3c72' }} />
                                            <div className="flex-1 p-3 flex flex-col justify-between min-h-[180px]">
                                                <div>
                                                    <h4 className="font-bold text-xs" style={{ color: formData.ticketTemplate?.primaryColor || '#1e3c72' }}>
                                                        {formData.ticketTemplate?.customTitle || formData.title || "Nom Événement"}
                                                    </h4>
                                                    <div className="text-[8px] space-y-0.5 mt-2 opacity-90">
                                                        <p><strong>Date :</strong> {formData.date || "25 Déc. 2026"}</p>
                                                        {formData.ticketTemplate?.showLocationDetails && (
                                                            <p><strong>Lieu :</strong> {formData.location?.venue || "Paris"}</p>
                                                        )}
                                                        <p><strong>Acheteur :</strong> Jean Dupont</p>
                                                    </div>
                                                </div>
                                                {formData.ticketTemplate?.showPrice && (
                                                    <span className="text-xs font-bold" style={{ color: formData.ticketTemplate?.accentColor || '#ff4c3b' }}>
                                                        {formData.price || 0} $
                                                    </span>
                                                )}
                                            </div>
                                            {/* Pointillé de découpe */}
                                            <div className="w-0 border-l border-dashed" style={{ borderColor: formData.ticketTemplate?.borderColor || '#e2e8f0' }} />
                                            <div className="w-20 p-2 flex flex-col items-center justify-center bg-slate-50/50">
                                                <div className="w-14 h-14 bg-zinc-200 border border-zinc-300 flex items-center justify-center text-[6px] text-zinc-500 font-bold">QR CODE</div>
                                                <span className="text-[5px] text-zinc-500 font-mono mt-1">TKT-12345</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* MODÈLE VISUEL BADGE */}
                                    {formData.ticketTemplate?.layoutType === 'badge' && (
                                        <div className="w-full max-w-[200px] border shadow-2xl transition-all rounded-xl p-3 flex flex-col items-center"
                                            style={{
                                                backgroundColor: formData.ticketTemplate?.backgroundColor || '#ffffff',
                                                borderColor: formData.ticketTemplate?.primaryColor || '#1e3c72',
                                                borderWidth: '3px',
                                                color: formData.ticketTemplate?.textColor || '#333333',
                                                fontFamily: formData.ticketTemplate?.fontFamily || 'Helvetica'
                                            }}
                                        >
                                            {/* Perforation du clip */}
                                            <div className="w-6 h-2 rounded-full border mb-3 bg-white" style={{ borderColor: formData.ticketTemplate?.primaryColor || '#1e3c72' }} />
                                            <span className="text-[7px] font-bold tracking-wider" style={{ color: formData.ticketTemplate?.primaryColor || '#1e3c72' }}>BADGE DE CONFÉRENCE</span>
                                            <h4 className="font-bold text-[10px] text-center my-2 leading-tight">{formData.ticketTemplate?.customTitle || formData.title || "Nom Événement"}</h4>

                                            <div className="w-20 h-20 bg-zinc-200 border border-zinc-300 flex items-center justify-center text-[8px] text-zinc-500 font-bold my-2">QR CODE</div>

                                            <span className="font-bold text-xs mt-2" style={{ color: formData.ticketTemplate?.primaryColor || '#1e3c72' }}>Jean Dupont</span>
                                            <span className="text-[7px] opacity-80 mt-1">{formData.date || "25 Déc. 2026"}</span>
                                        </div>
                                    )}

                                    {/* Bloc sponsor simulé */}
                                    {formData.ticketTemplate?.sponsorLogoUrl && (
                                        <div className="mt-4 flex flex-col items-center opacity-85">
                                            <span className="text-[6px] font-bold text-slate-500 mb-1">PARTENAIRE OFFICIEL</span>
                                            <div className="w-24 h-10 border border-dashed border-slate-700 bg-white/10 rounded flex items-center justify-center overflow-hidden">
                                                <img src={formData.ticketTemplate.sponsorLogoUrl} alt="Sponsor" className="max-h-full max-w-full object-contain" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 rounded-3xl bg-indigo-950/25 border border-indigo-500/20 text-center space-y-4">
                            <h3 className="text-white font-bold">✨ Édition & Personnalisation de Tickets PDF (PRO)</h3>
                            <p className="text-xs text-slate-400 max-w-lg mx-auto">
                                Devenez membre <strong>BANTU PRO</strong> pour déverrouiller l'accès complet à la personnalisation graphique des billets (modèles Classique/Modern/Badge, choix des couleurs et polices, logos sponsors, et prévisualisation live).
                            </p>
                            <a href='/pricing'>
                            <button type="button" className="btn-primary text-xs py-2.5 px-6">
                                Découvrir l'offre PRO
                            </button></a>
                        </div>
                    )}

                    <div className="pt-10">
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn-primary w-full py-5 text-sm uppercase tracking-[0.3em] font-black shadow-2xl shadow-primary/30"
                        >
                            {saving ? 'Synchronizing...' : <><Save size={20} className="mr-3" /> Execute Changes</>}
                        </button>
                    </div>
                </form>
            </motion.div>
            <PromoWidget userPlan={user?.plan} />
        </div>
    );
};

export default EditEvent;
