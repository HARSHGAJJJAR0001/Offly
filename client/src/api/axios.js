import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Attach token to every request
API.interceptors.request.use((req) => {
    const token = sessionStorage.getItem("token");
    if (token) req.headers.Authorization = token;
    return req;
});

// Auto-logout on 401
API.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
            window.location.href = "/";
        }
        return Promise.reject(err);
    }
);

export default API;