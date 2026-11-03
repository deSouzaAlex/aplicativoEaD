import api from "./api";

const URL = "/disciplinas";

export const getAllDisciplinas = () => api.get(URL);

export const createDisciplina = (disciplina) => api.post(URL, disciplina);

export const getDisciplinaById = (id) => api.get(`${URL}/${id}`);

export const updateDisciplina = (id, disciplina) => api.put(`${URL}/${id}`, disciplina);

export const deleteDisciplina = (id) => api.delete(`${URL}/${id}`);
