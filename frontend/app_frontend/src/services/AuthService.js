import api from "./api";

export const login = (email, senha) => api.post("/auth/login", { email, senha });

export const registrar = (dados) => api.post("/auth/registrar", dados);

export const getPerfil = () => api.get("/auth/me");

export const updatePerfil = (dados) => api.put("/auth/me", dados);

export const exportarDados = () => api.get("/auth/me/exportar");

export const excluirConta = () => api.delete("/auth/me");
