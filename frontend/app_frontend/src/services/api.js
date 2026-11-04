import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1";
export const CHAVE_TOKEN = "academico.token";

export function lerToken() {
    try {
        return localStorage.getItem(CHAVE_TOKEN);
    } catch {
        return null;
    }
}

export function gravarToken(token) {
    try {
        if (token) localStorage.setItem(CHAVE_TOKEN, token);
        else localStorage.removeItem(CHAVE_TOKEN);
    } catch {
        /* armazenamento indisponível: a sessão dura apenas enquanto a página estiver aberta */
    }
}

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
    const token = lerToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (error) => {
        const url = error.config?.url || "";
        if (error.response?.status === 401 && !url.startsWith("/auth/login")) {
            window.dispatchEvent(new Event("sessao-expirada"));
        }
        return Promise.reject(error);
    }
);

export default api;
