const { conectarBancoTeste, limparBanco, desconectarBancoTeste } = require("../helpers/db");
const { registrar, comToken, disciplinaExemplo, diasAPartirDeHoje } = require("../helpers/api");

beforeAll(conectarBancoTeste);
afterEach(limparBanco);
afterAll(desconectarBancoTeste);

async function contexto(preferencias) {
    const api = comToken((await registrar()).token);
    if (preferencias) await api.put("/auth/me", { preferencias });
    const d = await api.post("/disciplinas", disciplinaExemplo());
    const nova = (nome, dias, extra = {}) =>
        api.post("/tarefas", { nome, dataEntrega: diasAPartirDeHoje(dias), disciplina: d.body._id, ...extra });
    return { api, nova };
}

describe("Lembretes (RF05)", () => {
    test("respeita a antecedência do usuário e a da tarefa", async () => {
        const { api, nova } = await contexto({ antecedenciaLembreteDias: 2 });
        await nova("amanha", 1);
        await nova("em-5-dias", 5);
        await nova("em-6-dias-com-lembrete-7", 6, { lembreteAntecedenciaDias: 7 });
        await nova("feita", 1, { concluida: true });
        await nova("vencida", -1);

        const r = await api.get("/lembretes");
        expect(r.status).toBe(200);
        expect(r.body.map((l) => l.tarefa.nome)).toEqual(["vencida", "amanha", "em-6-dias-com-lembrete-7"]);
        expect(r.body[0].tipo).toBe("atrasada");
        expect(r.body[0].tarefa.disciplina.nome).toBe("Banco de Dados");
    });
});

describe("Análise de risco (RF07)", () => {
    test("retorna avaliação por tarefa, histórico e sobrecarga", async () => {
        const { api, nova } = await contexto({ limiteSobrecarga: 3 });
        await nova("a", 1, { prioridade: "alta" });
        await nova("b", 2);
        await nova("c", 3);
        await nova("longe", 30);
        const feita = await nova("feita", 1);
        await api.put(`/tarefas/${feita.body._id}`, { concluida: true });

        const r = await api.get("/analise/risco");
        expect(r.status).toBe(200);
        expect(r.body.metodo).toBe("regras");
        expect(r.body.tarefas).toHaveLength(4);
        expect(r.body.tarefas[0].tarefa.disciplina.nome).toBe("Banco de Dados");
        expect(r.body.tarefas.at(-1).tarefa.nome).toBe("longe");
        expect(r.body.historico.concluidas).toBe(1);
        expect(r.body.historico.taxaPontualidade).toBe(1);
        expect(r.body.sobrecarga.length).toBeGreaterThanOrEqual(1);
        expect(r.body.sobrecarga[0].maximoEm7Dias).toBeGreaterThanOrEqual(3);
    });

    test("exporta o dataset rotulado em JSON e CSV", async () => {
        const { api, nova } = await contexto();
        const t = await nova("feita", 2);
        await api.put(`/tarefas/${t.body._id}`, { concluida: true });
        await nova("pendente", 3);

        const json = await api.get("/analise/dataset");
        expect(json.body).toHaveLength(1);
        expect(json.body[0].atrasou).toBe(0);

        const csv = await api.get("/analise/dataset?formato=csv");
        expect(csv.headers["content-type"]).toMatch(/text\/csv/);
        const linhas = csv.text.trim().split("\n");
        expect(linhas[0]).toMatch(/^antecedenciaCadastroDias,/);
        expect(linhas).toHaveLength(2);
    });
});
