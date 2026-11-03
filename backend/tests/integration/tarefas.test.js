const { conectarBancoTeste, limparBanco, desconectarBancoTeste } = require("../helpers/db");
const { registrar, comToken, disciplinaExemplo, diasAPartirDeHoje } = require("../helpers/api");

beforeAll(conectarBancoTeste);
afterEach(limparBanco);
afterAll(desconectarBancoTeste);

async function contexto() {
    const api = comToken((await registrar()).token);
    const d = await api.post("/disciplinas", disciplinaExemplo());
    return { api, disciplinaId: d.body._id };
}

describe("API de tarefas (RF02, RF06)", () => {
    test("cria tarefa com valores padrão e disciplina expandida na consulta", async () => {
        const { api, disciplinaId } = await contexto();
        const criada = await api.post("/tarefas", { nome: "Lista 1", dataEntrega: diasAPartirDeHoje(3), disciplina: disciplinaId });
        expect(criada.status).toBe(201);
        expect(criada.body.prioridade).toBe("media");
        expect(criada.body.concluida).toBe(false);
        expect(criada.body.dataConclusao).toBeNull();

        const lida = await api.get(`/tarefas/${criada.body._id}`);
        expect(lida.body.disciplina.nome).toBe("Banco de Dados");
    });

    test("recusa disciplina inexistente ou de outra conta e prioridade inválida", async () => {
        const { api, disciplinaId } = await contexto();
        const outro = await contexto();
        expect((await api.post("/tarefas", { nome: "x", dataEntrega: diasAPartirDeHoje(1), disciplina: "507f1f77bcf86cd799439011" })).status).toBe(404);
        expect((await api.post("/tarefas", { nome: "x", dataEntrega: diasAPartirDeHoje(1), disciplina: outro.disciplinaId })).status).toBe(404);
        expect((await api.post("/tarefas", { nome: "x", dataEntrega: diasAPartirDeHoje(1), disciplina: disciplinaId, prioridade: "urgente" })).status).toBe(400);
    });

    test("registra e limpa a data de conclusão conforme a situação", async () => {
        const { api, disciplinaId } = await contexto();
        const t = await api.post("/tarefas", { nome: "Quiz", dataEntrega: diasAPartirDeHoje(1), disciplina: disciplinaId });
        const concluida = await api.put(`/tarefas/${t.body._id}`, { concluida: true });
        expect(concluida.body.concluida).toBe(true);
        expect(concluida.body.dataConclusao).toBeTruthy();
        expect(concluida.body.disciplina.nome).toBe("Banco de Dados");

        // Reenviar o objeto completo (com disciplina populada) não altera a data de conclusão
        const reenvio = await api.put(`/tarefas/${t.body._id}`, { ...concluida.body, nome: "Quiz 1" });
        expect(reenvio.body.dataConclusao).toBe(concluida.body.dataConclusao);
        expect(reenvio.body.nome).toBe("Quiz 1");

        const reaberta = await api.put(`/tarefas/${t.body._id}`, { concluida: false });
        expect(reaberta.body.dataConclusao).toBeNull();
    });

    test("ordenação automática e filtros por situação", async () => {
        const { api, disciplinaId } = await contexto();
        const nova = (nome, dias, prioridade, concluida = false) =>
            api.post("/tarefas", { nome, dataEntrega: diasAPartirDeHoje(dias), prioridade, disciplina: disciplinaId, concluida });
        await nova("baixa-longe", 10, "baixa");
        await nova("alta-perto", 1, "alta");
        await nova("vencida", -1, "media");
        await nova("feita", 2, "alta", true);

        const auto = (await api.get("/tarefas?ordenar=auto")).body.map((t) => t.nome);
        expect(auto).toEqual(["vencida", "alta-perto", "baixa-longe", "feita"]);

        expect((await api.get("/tarefas?situacao=pendentes")).body).toHaveLength(3);
        expect((await api.get("/tarefas?situacao=concluidas")).body).toHaveLength(1);
    });

    test("uma conta não acessa tarefas de outra", async () => {
        const a = await contexto();
        const b = await contexto();
        const t = await a.api.post("/tarefas", { nome: "Privada", dataEntrega: diasAPartirDeHoje(1), disciplina: a.disciplinaId });
        expect((await b.api.get(`/tarefas/${t.body._id}`)).status).toBe(404);
        expect((await b.api.put(`/tarefas/${t.body._id}`, { nome: "hack" })).status).toBe(404);
        expect((await b.api.delete(`/tarefas/${t.body._id}`)).status).toBe(404);
        expect((await b.api.get("/tarefas")).body).toHaveLength(0);
    });

    test("exclusão de tarefa", async () => {
        const { api, disciplinaId } = await contexto();
        const t = await api.post("/tarefas", { nome: "Apagar", dataEntrega: diasAPartirDeHoje(1), disciplina: disciplinaId });
        expect((await api.delete(`/tarefas/${t.body._id}`)).status).toBe(200);
        expect((await api.delete(`/tarefas/${t.body._id}`)).status).toBe(404);
    });
});
