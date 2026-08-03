import http from "./http-common";

const getProviders = (params) => {
    return http.get("/providers", { params });
};

const getProviderById = (id) => {
    return http.get(`/providers/${id}`);
};

const upsertProfile = (data, token) => {
    return http.post("/providers", data, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

const updateAvailability = (unavailableDates, token) => {
    return http.put("/providers/availability", { unavailableDates }, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

const addReview = (id, reviewData, token) => {
    return http.post(`/providers/${id}/reviews`, reviewData, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

const createBooking = (bookingData, token) => {
    return http.post("/bookings", bookingData, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

const getMyRequests = (token) => {
    return http.get("/bookings/my-requests", {
        headers: { Authorization: `Bearer ${token}` }
    });
};

const getMyJobs = (token) => {
    return http.get("/bookings/my-jobs", {
        headers: { Authorization: `Bearer ${token}` }
    });
};

const updateBookingStatus = (id, status, token) => {
    return http.put(`/bookings/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

const createPremiumSubscriptionSession = (token) => {
    return http.post("/providers/premium-upgrade", {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

const ServiceProviderService = {
    getProviders,
    getProviderById,
    upsertProfile,
    updateAvailability,
    addReview,
    createBooking,
    getMyRequests,
    getMyJobs,
    updateBookingStatus,
    createPremiumSubscriptionSession
};

export default ServiceProviderService;
