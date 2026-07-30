import http from "./http-common";

const register = (data) => {
    return http.post("/user", data);
};

const generateCode = (data) => {
    return http.post("/user/generate-code", data);
};

const verifyCode = (data) => {
    return http.post("/user/verify-code", data);
};

const login = (data) => {
    return http.post("/user/login", data);
};

const updateProfile = (data, token) => {
    return http.put("/user", data, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

const deleteUser = (id, token) => {
    return http.delete(`/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

const forgotPassword = (data) => {
    return http.post("/user/forgot-password", data);
};

const verifyResetCode = (data) => {
    return http.post("/user/verify-reset-code", data);
};

const resetPassword = (data) => {
    return http.post("/user/reset-password", data);
};

const getProfile = (token) => {
    return http.get("/user/profile", {
        headers: { Authorization: `Bearer ${token}` }
    });
};

const upgradePlan = (data, token) => {
    return http.post("/payment/upgrade-plan", data, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

const UserDataService = {
    generateCode,
    verifyCode,
    register,
    login,
    updateProfile,
    deleteUser,
    forgotPassword,
    verifyResetCode,
    resetPassword,
    getProfile,
    upgradePlan
};

export default UserDataService;
