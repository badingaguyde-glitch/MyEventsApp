import http from "./http-common";

const getAllEvents = () => {
    return http.get("/events");
};

const getEventById = (id) => {
    return http.get(`/events/${id}`);
};

const createEvent = (data, token) => {
    return http.post("/events", data, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

const updateEvent = (id, data, token) => {
    return http.put(`/events/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
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
