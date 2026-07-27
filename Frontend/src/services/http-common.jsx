import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 
    ? `${import.meta.env.VITE_API_BASE_URL}/api` 
    : "https://my-events-app-backend.vercel.app/api";

export default axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "x-bantu-client-key": "BantuAppClientSecretSecured2026!"
    }
});
