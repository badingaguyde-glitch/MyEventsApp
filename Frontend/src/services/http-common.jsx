import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 
    ? `${import.meta.env.VITE_API_BASE_URL}/api` 
    : "https://138-68-145-245.nip.io/api";

export default axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "x-bantu-client-key": "BantuAppClientSecretSecured2026!"
    }
});
