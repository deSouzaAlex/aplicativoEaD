const { conectarBancoTeste, limparBanco, desconectarBancoTeste } = require("../helpers/db");
const { app, API, request, registrar, comToken, disciplinaExemplo, diasAPartirDeHoje } = require("../helpers/api");

beforeAll(conectarBancoTeste);
afterEach(limparBanco);
afterAll(desconectarBancoTeste);

describe("Autenticação (RF08)", () => {
    test("registra usuário, devolve token e não expõe a senha", async () => {
        const { res } = await registrar({ nome: "Maria" });
        expect(res.status).toBe(201);
        expect(res.body.token).toBeTruthy();
        expect(res.body.usuario.nome).toBe("Maria");
        expect(res.body.usuario.senhaHash).toBeUndefined();
        expect(res.body.usuario.preferencias.antecedenciaLembreteDias).toBe(2);
    });

    test("recusa e-mail duplicado, senha curta e ausência de consentimento", async () => {
        await registrar({ email: "dup@exemplo.com" });
        expect((await registrar({ email: "DUP@exemplo.com" })).res.status).toBe(409);
        expect((await registrar({ senha: "123" })).res.status).toBe(400);
        expect((await registrar({ consentimento: false })).res.status).toBe(400);
    });

    test("login com credenciais válidas e inválidas", async () => {
        await registrar({ email: "login@exemplo.com", senha: "minhaSenha9" });
        const ok = await request(app).post(`${API}/auth/login`).send({ email: "login@exemplo.com", senha: "minhaSenha9" });
        expect(ok.status).toBe(200);
        expect(ok.body.token).toBeTruthy();
        const errado = await request(app).post(`${API}/auth/login`).send({ email: "login@exemplo.com", senha: "outra" });
        expect(errado.status).toBe(401);
    });

    test("rotas protegidas exigem token válido", async () => {
        expect((await request(app).get(`${API}/tarefas`)).status).toBe(401);
        const invalido = await request(app).get(`${API}/tarefas`).set("Authorization", "Bearer abc.def.ghi");
        expect(invalido.status).toBe(401);
    });

    test("GET e PUT /auth/me atualizam nome e preferências", async () => {
        const { token } = await registrar();
        const api = comToken(token);
        const r = await api.put("/auth/me", { nome: "Novo Nome", preferencias: { antecedenciaLembreteDias: 5, limiteSobrecarga: 3 } });
        expect(r.status).toBe(200);
        expect(r.body.nome).toBe("Novo Nome");
        expect(r.body.preferencias.antecedenciaLembreteDias).toBe(5);
        expect(r.body.preferencias.limiteSobrecarga).toBe(3);
        expect((await api.put("/auth/me", { preferencias: { antecedenciaLembreteDias: 99 } })).status).toBe(400);
        expect((await api.get("/auth/me")).body.nome).toBe("Novo Nome");
    });

    test("LGPD: exporta e exclui todos os dados do titular", async () => {
        const { token } = await registrar();
        const api = comToken(token);
        const d = await api.post("/disciplinas", disciplinaExemplo());
        await api.post("/tarefas", { nome: "T1", dataEntrega: diasAPartirDeHoje(2), disciplina: d.body._id });

        const exp = await api.get("/auth/me/exportar");
        expect(exp.status).toBe(200);
        expect(exp.body.disciplinas).toHaveLength(1);
        expect(exp.body.tarefas).toHaveLength(1);

        expect((await api.delete("/auth/me")).status).toBe(200);
        expect((await api.get("/auth/me")).status).toBe(404);
    });
});
