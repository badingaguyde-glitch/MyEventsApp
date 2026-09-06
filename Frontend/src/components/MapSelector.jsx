import 'leaflet/dist/leaflet.css';
import React, {useEffect, useRef} from 'react';
import L from 'leaflet';

const LocationPicker = ({coordinates, onChangeCoordinates}) => {
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const mapContainerRef = useRef(null);

    //Coordonnées par défaut si aucune coordonnée n'est encore définie
    const defaultCoordinates = [48.8566, 2.3522];
    const currentPosition = (coordinates && coordinates[0] !== 0)
        ? [coordinates[1], coordinates[0]] //Leaflet prend [lat, lng]
        : defaultCoordinates;

    useEffect(()=>{
        //Initialiser la carte Leaflet
        if (!mapRef.current){
            mapRef.current = L.map(mapContainerRef.current).setView(currentPosition, 13);

            //charger les tuiles OpenStreetMap
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution : '@ OpenStreetMap contributors'
            }).addTo(mapRef.current);

            //Créer le marqueur glissable
            markerRef.current = L.marker(currentPosition, {
                draggable: true
            }).addTo(mapRef.current);

            //Ecouter la fin du déplacement du marqueur
            markerRef.current.on('dragend', ()=>{
                const position = markerRef.current.getLatLng();
                onChangeCoordinates([position.lng, position.lat]); //Retourner [lng, lat]
            });

            //Ecouter le clic direct sur la carte pour déplacer le marqueur
            mapRef.current.on('click', (e)=>{
                markerRef.current.setLatLng(e.latlng);
                onChangeCoordinates([e.latlng.lng, e.latlng.lat]); //Retourner [lng, lat]
            });
        } else {
            // Si les coordonnées changent (ex : via l'autocomplétion), on déplace le marqueur et la carte
            mapRef.current.setView(currentPosition);
            markerRef.current.setLatLng(currentPosition);
        }
        return ()=>{
            if (mapRef.current){
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    },[coordinates]);

    return (
    <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400">
            Ajustez l'emplacement précis sur la carte (cliquez ou glissez le marqueur)
        </label>
        <div ref={mapContainerRef} className="w-full h-64 rounded-2xl border border-light overflow-hidden z-10" />
    </div>
    );
};

export default LocationPicker;