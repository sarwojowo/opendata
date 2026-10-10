import axios from "axios";

export const BASE_URL = import.meta.env.VITE_BASE_URL_API || 'https://warung-his-backend.vercel.app/api'

export default axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
});

export const axiosAuth = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
});
