process.env.NODE_ENV = "test";
const request = require("supertest");
const { criarApp } = require("../../app");

const app = criarApp();
const API = "/api/v1";

async function registrar(dados = {}) {
    const corpo = {
        nome: "Estudante Teste",
        email: `teste${Math.random().toString(36).slice(2, 8)}@exemplo.com`,
        senha: "senhaSegura1",
        consentimento: true,
        ...dados,
    };
    const res = await request(app).post(`${API}/auth/registrar`).send(corpo);
    return { token: res.body.token, usuario: res.body.usuario, res, corpo };
}

function comToken(token) {
    const h = { Authorization: `Bearer ${token}` };
    return {
        get: (url) => request(app).get(API + url).set(h),
        post: (url, body) => request(app).post(API + url).set(h).send(body),
        put: (url, body) => request(app).put(API + url).set(h).send(body),
        delete: (url) => request(app).delete(API + url).set(h),
    };
}

const disciplinaExemplo = (extra = {}) => ({
    nome: "Banco de Dados",
    codigo: "COM210",
    professor: "Profa. Ana",
    cargaHoraria: 80,
    semestre: "2026.2",
    ...extra,
});

const diasAPartirDeHoje = (dias) => new Date(Date.now() + dias * 24 * 60 * 60 * 1000).toISOString();

module.exports = { app, API, request, registrar, comToken, disciplinaExemplo, diasAPartirDeHoje };
