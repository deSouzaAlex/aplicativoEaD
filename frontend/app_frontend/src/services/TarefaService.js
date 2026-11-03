import api from "./api";

const URL = "/tarefas";

// params opcionais: { ordenar: "auto" | "prazo", situacao: "pendentes" | "concluidas", disciplina }
export const getAllTarefas = (params) => api.get(URL, { params });

export const createTarefa = (tarefa) => api.post(URL, tarefa);

export const getTarefaById = (id) => api.get(`${URL}/${id}`);

export const updateTarefa = (id, tarefa) => api.put(`${URL}/${id}`, tarefa);

export const deleteTarefa = (id) => api.delete(`${URL}/${id}`);
