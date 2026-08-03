import http from "./http-common";

const getAll = (token) =>
    http.get("/notifications", { headers: { Authorization: `Bearer ${token}` } });

const getUnreadCount = (token) =>
    http.get("/notifications/unread-count", { headers: { Authorization: `Bearer ${token}` } });

const markAsRead = (id, token) =>
    http.put(`/notifications/${id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });

const markAllAsRead = (token) =>
    http.put("/notifications/mark-all-read", {}, { headers: { Authorization: `Bearer ${token}` } });

const NotificationServices = { getAll, getUnreadCount, markAsRead, markAllAsRead };
export default NotificationServices;
