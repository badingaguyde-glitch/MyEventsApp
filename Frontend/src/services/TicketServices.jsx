import http from "./http-common";

const buyTicket = (data, token) => {
    return http.post("/tickets", data, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

const getUserTickets = (token) => {
    return http.get("/tickets", {
        headers: { Authorization: `Bearer ${token}` }
    });
};

const cancelTicket = (id, token) => {
    return http.delete(`/tickets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

const verifyTicket = (data, token) => {
    return http.post("/tickets/verify", data, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

const getTicketByCode = (code, token) => {
    return http.get(`/tickets/code/${code}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

const checkAvailability = (eventId) => {
    return http.get(`/tickets/event/${eventId}/availability`);
};

const bulkVerifyTickets = (data, token) => {
    return http.post("/tickets/bulk-verify", data, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

const TicketService = {
    buyTicket,
    getUserTickets,
    cancelTicket,
    verifyTicket,
    getTicketByCode,
    checkAvailability,
    bulkVerifyTickets
};

export default TicketService;
