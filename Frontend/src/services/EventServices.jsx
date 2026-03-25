import http from "./http-common";

const getAllEvents = () => {
    return http.get("/events");
};

const getEventById = (id) => {
    return http.get(`/events/${id}`);
};

const BASE_URL = "https://my-events-app-backend.vercel.app/api";

const createEvent = async (data, token) => {
    const response = await fetch(`${BASE_URL}/events`, {
        method: 'POST',
        headers: {
            // Pas de Content-Type ici — très important ! fetch gérera le 'multipart/form-data; boundary=...' natif
            "Authorization": `Bearer ${token}`
        },
        body: data
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw { response: { data: errorData } };
    }
    return response.json();
};

const updateEvent = async (id, data, token) => {
    const response = await fetch(`${BASE_URL}/events/${id}`, {
        method: 'PUT',
        headers: {
            "Authorization": `Bearer ${token}`
        },
        body: data
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw { response: { data: errorData } };
    }
    return response.json();
};

const deleteEvent = (id, token) => {
    return http.delete(`/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

const searchEvents = (query) => {
    return http.get(`/events/search?q=${query}`);
};

const getNearbyEvents = (lat, lng, radius = 10) => {
    return http.get(`/events/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
};

const filterByCategory = (category) => {
    return http.get(`/events/category/?category=${category}`);
};

const getMyEvents = (token) => {
    return http.get("/events/mine", {
        headers: { Authorization: `Bearer ${token}` }
    });
};

const getEventParticipants = (id, token) => {
    return http.get(`/events/${id}/participants`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

const EventService = {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    searchEvents,
    getNearbyEvents,
    filterByCategory,
    getMyEvents,
    getEventParticipants
};

export default EventService;
