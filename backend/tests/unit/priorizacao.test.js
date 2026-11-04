const { indiceUrgencia, ordenarPorPrioridade } = require("../../services/priorizacao");

const agora = new Date("2026-10-20T12:00:00");
const emDias = (d) => new Date(agora.getTime() + d * 86400000);

describe("priorizacao (RF06)", () => {
    test("prioridade mais alta gera urgência maior para o mesmo prazo", () => {
        const alta = indiceUrgencia({ prioridade: "alta", dataEntrega: emDias(3) }, agora);
        const baixa = indiceUrgencia({ prioridade: "baixa", dataEntrega: emDias(3) }, agora);
        expect(alta).toBeGreaterThan(baixa);
    });

    test("prazo mais próximo gera urgência maior para a mesma prioridade", () => {
        const perto = indiceUrgencia({ prioridade: "media", dataEntrega: emDias(1) }, agora);
        const longe = indiceUrgencia({ prioridade: "media", dataEntrega: emDias(10) }, agora);
        expect(perto).toBeGreaterThan(longe);
    });

    test("ordena vencidas primeiro, depois por urgência e concluídas ao final", () => {
        const tarefas = [
            { _id: "concluida", prioridade: "alta", dataEntrega: emDias(1), concluida: true },
            { _id: "baixa-longe", prioridade: "baixa", dataEntrega: emDias(12), concluida: false },
            { _id: "alta-perto", prioridade: "alta", dataEntrega: emDias(2), concluida: false },
            { _id: "vencida", prioridade: "baixa", dataEntrega: emDias(-2), concluida: false },
            { _id: "media-amanha", prioridade: "media", dataEntrega: emDias(0.5), concluida: false },
        ];
        const ids = ordenarPorPrioridade(tarefas, agora).map((t) => t._id);
        expect(ids).toEqual(["vencida", "media-amanha", "alta-perto", "baixa-longe", "concluida"]);
    });

    test("não altera o vetor original", () => {
        const tarefas = [
            { _id: "b", prioridade: "baixa", dataEntrega: emDias(5), concluida: false },
            { _id: "a", prioridade: "alta", dataEntrega: emDias(1), concluida: false },
        ];
        ordenarPorPrioridade(tarefas, agora);
        expect(tarefas[0]._id).toBe("b");
    });
});
