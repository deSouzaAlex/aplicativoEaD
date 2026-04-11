import axios from "axios";

const REST_API_BASE_URL = "http://localhost:3001/api/v1/disciplinas";

export const getAllDisciplinas = () => axios.get(REST_API_BASE_URL);

export const createDisciplina = (disciplina) => axios.post(REST_API_BASE_URL, disciplina);

export const getDisciplinaById = (id) => axios.get(REST_API_BASE_URL + "/" + id);

export const updateDisciplina = (id, disciplina) =>
    axios.put(REST_API_BASE_URL + "/" + id, disciplina);

export const deleteDisciplina = (id) => axios.delete(REST_API_BASE_URL + "/" + id);
