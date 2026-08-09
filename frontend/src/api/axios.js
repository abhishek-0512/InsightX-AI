import axios from "axios";

export const getBaseURL = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL.replace(/\/+$/, "");
    }
    if (import.meta.env.VITE_BACKEND_URL) {
        const base = import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, "");
        return base.endsWith("/api") ? base : `${base}/api`;
    }
    if (typeof window !== "undefined") {
        if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
            return "http://localhost:5001/api";
        }
        // In production on Render/Vercel: use relative API path
        return "/api";
    }
    return "http://localhost:5001/api";
};

export const getBackendOrigin = () => {
    const apiBase = getBaseURL();
    return apiBase.replace(/\/api\/?$/, "");
};

const api = axios.create({
    baseURL: getBaseURL(),
    timeout: 120000
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API error:", error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default api;