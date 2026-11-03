const { conectarBancoTeste, limparBanco, desconectarBancoTeste } = require("../helpers/db");
const { registrar, comToken, disciplinaExemplo, diasAPartirDeHoje } = require("../helpers/api");

beforeAll(conectarBancoTeste);
afterEach(limparBanco);
afterAll(desconectarBancoTeste);

describe("API de disciplinas (RF01)", () => {
    test("CRUD completo", async () => {
        const api = comToken((await registrar()).token);
        const criada = await api.post("/disciplinas", disciplinaExemplo());
        expect(criada.status).toBe(201);
        expect(criada.body.cor).toBe("#4F46E5");

        const id = criada.body._id;
        expect((await api.get("/disciplinas")).body).toHaveLength(1);
        expect((await api.get(`/disciplinas/${id}`)).body.codigo).toBe("COM210");

        const editada = await api.put(`/disciplinas/${id}`, disciplinaExemplo({ nome: "BD II", cor: "#0E7490" }));
        expect(editada.status).toBe(200);
        expect(editada.body.nome).toBe("BD II");

        expect((await api.delete(`/disciplinas/${id}`)).status).toBe(200);
        expect((await api.get(`/disciplinas/${id}`)).status).toBe(404);
    });

    test("valida campos obrigatórios e identificadores", async () => {
        const api = comToken((await registrar()).token);
        expect((await api.post("/disciplinas", { nome: "Sem código" })).status).toBe(400);
        expect((await api.post("/disciplinas", disciplinaExemplo({ cor: "azul" }))).status).toBe(400);
        expect((await api.get("/disciplinas/123")).status).toBe(400);
        expect((await api.get("/disciplinas/507f1f77bcf86cd799439011")).status).toBe(404);
    });

    test("isola os dados de cada conta", async () => {
        const ana = comToken((await registrar()).token);
        const beto = comToken((await registrar()).token);
        const d = await ana.post("/disciplinas", disciplinaExemplo());

        expect((await beto.get("/disciplinas")).body).toHaveLength(0);
        expect((await beto.get(`/disciplinas/${d.body._id}`)).status).toBe(404);
        expect((await beto.put(`/disciplinas/${d.body._id}`, disciplinaExemplo({ nome: "x" }))).status).toBe(404);
        expect((await beto.delete(`/disciplinas/${d.body._id}`)).status).toBe(404);
        expect((await ana.get(`/disciplinas/${d.body._id}`)).body.nome).toBe("Banco de Dados");
    });

    test("excluir disciplina remove as tarefas vinculadas", async () => {
        const api = comToken((await registrar()).token);
        const d1 = await api.post("/disciplinas", disciplinaExemplo());
        const d2 = await api.post("/disciplinas", disciplinaExemplo({ nome: "IA", codigo: "COM310" }));
        await api.post("/tarefas", { nome: "A", dataEntrega: diasAPartirDeHoje(1), disciplina: d1.body._id });
        await api.post("/tarefas", { nome: "B", dataEntrega: diasAPartirDeHoje(2), disciplina: d1.body._id });
        await api.post("/tarefas", { nome: "C", dataEntrega: diasAPartirDeHoje(3), disciplina: d2.body._id });

        const r = await api.delete(`/disciplinas/${d1.body._id}`);
        expect(r.body.tarefasRemovidas).toBe(2);
        const restantes = (await api.get("/tarefas")).body;
        expect(restantes.map((t) => t.nome)).toEqual(["C"]);
    });
});
