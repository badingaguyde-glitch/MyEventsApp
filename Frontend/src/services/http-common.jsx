import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 
    ? `${import.meta.env.VITE_API_BASE_URL}/api` 
    : "http://localhost:5000/api";

export default axios.create({
    baseURL: API_BASE_URL
});
