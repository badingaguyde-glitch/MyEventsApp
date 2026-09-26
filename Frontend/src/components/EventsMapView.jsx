import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Crosshair, AlertCircle } from 'lucide-react';

const EventsMapView = ({ events = [], userLocation = null, radius = null }) => {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const layerGroupRef = useRef(null);
    const navigate = useNavigate();
    const [missingCoordsCount, setMissingCoordsCount] = useState(0);

    // 1. Initialisation de la carte (une seule fois au montage)
    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;

        const defaultCenter = [48.8566, 2.3522]; // Paris par défaut
        const initialCenter = userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter;

        const map = L.map(mapContainerRef.current, {
            zoomControl: false // On déplace le zoom pour un rendu plus épuré
        }).setView(initialCenter, 12);

        // Ajout des contrôles de zoom en haut à droite
        L.control.zoom({ position: 'topright' }).addTo(map);

        // Tuiles modernes et épurées (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);

        const layerGroup = L.layerGroup().addTo(map);

        mapInstanceRef.current = map;
        layerGroupRef.current = layerGroup;

        // Force le calcul des dimensions (résout le bug des tuiles grises Leaflet)
        const resizeTimer = setTimeout(() => {
            map.invalidateSize();
        }, 150);

        // Nettoyage complet au démontage du composant
        return () => {
            clearTimeout(resizeTimer);
            map.remove();
            mapInstanceRef.current = null;
            layerGroupRef.current = null;
        };
    }, []);

    // 2. Mise à jour des marqueurs et du rayon quand les données changent
    useEffect(() => {
        const map = mapInstanceRef.current;
        const layerGroup = layerGroupRef.current;
        if (!map || !layerGroup) return;

        layerGroup.clearLayers();
        const bounds = L.latLngBounds();

        // A. Marqueur de l'utilisateur (pulsation bleue) + Cercle de rayon
        if (userLocation && userLocation.lat && userLocation.lng) {
            const userLatLng = [userLocation.lat, userLocation.lng];
            bounds.extend(userLatLng);

            const userIcon = L.divIcon({
                className: 'user-location-marker',
                html: `
                    <div style="position: relative; width: 24px; height: 24px;">
                        <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background-color: rgba(59, 130, 246, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                        <div style="position: absolute; top: 4px; left: 4px; width: 16px; height: 16px; border-radius: 50%; background-color: #3b82f6; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>
                    </div>
                `,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });

            L.marker(userLatLng, { icon: userIcon })
                .bindTooltip("Votre position", { permanent: false, direction: 'top' })
                .addTo(layerGroup);

            if (radius) {
                L.circle(userLatLng, {
                    radius: radius * 1000,
                    color: '#6366f1',
                    fillColor: '#6366f1',
                    fillOpacity: 0.08,
                    weight: 1.5,
                    dashArray: '5, 8'
                }).addTo(layerGroup);
            }
        }

        // B. Marqueurs des événements
        let validCoords = 0;
        let missingCoords = 0;

        events.forEach((event) => {
            const lng = event.coordinates && event.coordinates[0];
            const lat = event.coordinates && event.coordinates[1];

            if (lat && lng && lat !== 0 && lng !== 0) {
                validCoords++;
                const eventLatLng = [lat, lng];
                bounds.extend(eventLatLng);

                // Badge de prix personnalisé
                const eventIcon = L.divIcon({
                    className: 'custom-event-marker',
                    html: `
                        <div style="
                            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                            color: white;
                            padding: 4px 10px;
                            border-radius: 20px;
                            font-weight: 800;
                            font-size: 11px;
                            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
                            display: flex;
                            align-items: center;
                            gap: 4px;
                            white-space: nowrap;
                            border: 2px solid white;
                            cursor: pointer;
                        ">
                            <span>🎟️</span>
                            <span>${event.price === 0 ? 'GRATUIT' : `$${event.price}`}</span>
                        </div>
                    `,
                    iconSize: [65, 28],
                    iconAnchor: [32, 14]
                });

                const eventImg = event.image?.startsWith('http')
                    ? event.image
                    : `${import.meta.env.VITE_API_BASE_URL || 'https://138-68-145-245.nip.io'}/uploads/${event.image || 'default.jpg'}`;

                const distanceInfo = event.distance
                    ? `<div style="color: #10b981; font-weight: 700; font-size: 11px; margin-top: 4px;">📍 À ${event.distance.value} ${event.distance.unit} de vous</div>`
                    : '';

                // Popup interactif
                const popupContent = document.createElement('div');
                popupContent.style.width = '230px';
                popupContent.style.fontFamily = 'inherit';
                popupContent.innerHTML = `
                    <img src="${eventImg}" alt="${event.title}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" onerror="this.src='https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=400'" />
                    <div style="font-weight: bold; font-size: 14px; color: #1e293b; line-height: 1.2; margin-bottom: 4px;">${event.title}</div>
                    <div style="font-size: 12px; color: #64748b;">📅 ${new Date(event.date).toLocaleDateString()} • ${event.time || ''}</div>
                    <div style="font-size: 12px; color: #64748b;">📍 ${event.location?.venue || ''}, ${event.location?.city || ''}</div>
                    ${distanceInfo}
                    <button id="btn-event-${event._id}" style="width: 100%; margin-top: 10px; background: #6366f1; color: white; border: none; padding: 7px 12px; border-radius: 6px; font-weight: bold; font-size: 12px; cursor: pointer; transition: background 0.2s;">
                        Voir l'événement →
                    </button>
                `;

                // Navigation SPA sans recharger la page
                popupContent.querySelector(`#btn-event-${event._id}`)?.addEventListener('click', () => {
                    navigate(`/events/${event._id}`);
                });

                L.marker(eventLatLng, { icon: eventIcon })
                    .bindPopup(popupContent)
                    .addTo(layerGroup);
            } else {
                missingCoords++;
            }
        });

        setMissingCoordsCount(missingCoords);

        // Recadrage automatique
        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
    }, [events, userLocation, radius, navigate]);

    // Fonction de recentrage sur l'utilisateur ou la sélection
    const handleRecenter = () => {
        const map = mapInstanceRef.current;
        if (!map) return;

        if (userLocation && userLocation.lat && userLocation.lng) {
            map.setView([userLocation.lat, userLocation.lng], 13);
        } else if (events.length > 0) {
            const bounds = L.latLngBounds();
            events.forEach((ev) => {
                if (ev.coordinates && ev.coordinates[0] && ev.coordinates[1]) {
                    bounds.extend([ev.coordinates[1], ev.coordinates[0]]);
                }
            });
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
            }
        }
    };

    return (
        <div className="relative w-full h-[450px] md:h-[540px] rounded-2xl border border-light overflow-hidden shadow-2xl z-10">
            {/* Conteneur DOM Leaflet */}
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Bouton flottant de recentrage */}
            <button
                type="button"
                onClick={handleRecenter}
                title="Recentrer sur ma position"
                className="absolute bottom-5 right-5 z-[400] bg-slate-900/90 hover:bg-slate-900 text-white p-3 rounded-full shadow-lg border border-light backdrop-blur-md transition-transform active:scale-95 flex items-center gap-2 text-xs font-bold"
            >
                <Crosshair size={16} className="text-primary" />
                <span className="hidden sm:inline">Recentrer</span>
            </button>

            {/* Alerte si des événements n'ont pas de coordonnées GPS */}
            {missingCoordsCount > 0 && (
                <div className="absolute top-4 left-4 z-[400] bg-slate-900/85 backdrop-blur-md text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 shadow-lg">
                    <AlertCircle size={14} />
                    <span>
                        {missingCoordsCount} événement{missingCoordsCount > 1 ? 's' : ''} sans coordonnées GPS (masqué{missingCoordsCount > 1 ? 's' : ''} sur la carte)
                    </span>
                </div>
            )}
        </div>
    );
};

export default EventsMapView;