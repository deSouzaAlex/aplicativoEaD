import axios from "axios";

const REST_API_BASE_URL = "http://localhost:3001/api/v1/tarefas";

export const getAllTarefas = () => axios.get(REST_API_BASE_URL);

export const createTarefa = (tarefa) => axios.post(REST_API_BASE_URL, tarefa);

export const getTarefaById = (id) => axios.get(REST_API_BASE_URL + "/" + id);

export const updateTarefa = (id, tarefa) =>
    axios.put(REST_API_BASE_URL + "/" + id, tarefa);

export const deleteTarefa = (id) => axios.delete(REST_API_BASE_URL + "/" + id);
