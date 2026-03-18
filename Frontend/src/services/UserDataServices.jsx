import http from "./http-common";

const register = (data) => {
    return http.post("/user", data);
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

const UserDataService = {
    register,
    login,
    updateProfile,
    deleteUser
};

export default UserDataService;
