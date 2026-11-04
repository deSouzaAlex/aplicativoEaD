import api from "./api";

export const getLembretes = () => api.get("/lembretes");

export const getAnaliseRisco = () => api.get("/analise/risco");

export const getDatasetCsv = () => api.get("/analise/dataset", { params: { formato: "csv" }, responseType: "text" });
