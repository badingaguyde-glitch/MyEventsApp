import axios from "axios";

export default axios.create({
    baseURL: "https://my-events-app-backend.vercel.app/api",
    headers: {
        "Content-type": "application/json"
    }
});
