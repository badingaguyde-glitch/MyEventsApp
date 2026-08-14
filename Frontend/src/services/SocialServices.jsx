import http from "./http-common";

const getFeed = (token) => {
    return http.get("/posts", { headers: { Authorization: `Bearer ${token}` } });
};

const createPost = (data, token) => {
    return http.post("/posts", data, { headers: { Authorization: `Bearer ${token}` } });
};

const toggleLikePost = (postId, token) => {
    return http.post(`/posts/${postId}/like`, {}, { headers: { Authorization: `Bearer ${token}` } });
};

const addComment = (postId, content, token) => {
    return http.post(`/posts/${postId}/comments`, { content }, { headers: { Authorization: `Bearer ${token}` } });
};

const toggleFollow = (userId, token) => {
    return http.post(`/users/${userId}/follow`, {}, { headers: { Authorization: `Bearer ${token}` } });
};

const toggleLikeEvent = (eventId, token) => {
    return http.post(`/events/${eventId}/like`, {}, { headers: { Authorization: `Bearer ${token}` } });
};

const getAttendees = (eventId, token) => {
    return http.get(`/events/${eventId}/attendees`, { headers: { Authorization: `Bearer ${token}` } });
};

const getChatMessages = (eventId, token) => {
    return http.get(`/events/${eventId}/chat`, { headers: { Authorization: `Bearer ${token}` } });
};

const sendChatMessage = (eventId, content, token) => {
    return http.post(`/events/${eventId}/chat`, { content }, { headers: { Authorization: `Bearer ${token}` } });
};

const uploadPostMedia = (formData, token) => {
    return http.post("/posts/upload", formData, { 
        headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        } 
    });
};

const getUserPosts = (userId, token) => {
    return http.get(`/posts/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

const SocialServices = {
    getFeed,
    createPost,
    toggleLikePost,
    addComment,
    toggleFollow,
    toggleLikeEvent,
    getAttendees,
    getChatMessages,
    sendChatMessage,
    uploadPostMedia,
    getUserPosts
};

export default SocialServices;
