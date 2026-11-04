const { gerarLembretes } = require("../../services/lembretes");

const agora = new Date("2026-10-20T12:00:00");
const emHoras = (h) => new Date(agora.getTime() + h * 3600000);

describe("lembretes (RF05)", () => {
    test("inclui apenas tarefas dentro da janela de antecedência padrão", () => {
        const tarefas = [
            { _id: 1, dataEntrega: emHoras(30), concluida: false },
            { _id: 2, dataEntrega: emHoras(24 * 5), concluida: false },
        ];
        const ids = gerarLembretes(tarefas, 2, agora).map((l) => l.tarefa._id);
        expect(ids).toEqual([1]);
    });

    test("a antecedência da tarefa prevalece sobre a preferência do usuário", () => {
        const tarefas = [{ _id: 1, dataEntrega: emHoras(24 * 5), concluida: false, lembreteAntecedenciaDias: 7 }];
        expect(gerarLembretes(tarefas, 1, agora)).toHaveLength(1);
        const zero = [{ _id: 2, dataEntrega: emHoras(30), concluida: false, lembreteAntecedenciaDias: 0 }];
        expect(gerarLembretes(zero, 5, agora)).toHaveLength(0);
    });

    test("ignora concluídas e classifica atrasada, hoje e próxima", () => {
        const tarefas = [
            { _id: "p", dataEntrega: emHoras(40), concluida: false },
            { _id: "c", dataEntrega: emHoras(5), concluida: true },
            { _id: "h", dataEntrega: emHoras(5), concluida: false },
            { _id: "a", dataEntrega: emHoras(-5), concluida: false },
        ];
        const r = gerarLembretes(tarefas, 2, agora);
        expect(r.map((l) => [l.tarefa._id, l.tipo])).toEqual([
            ["a", "atrasada"],
            ["h", "hoje"],
            ["p", "proxima"],
        ]);
        expect(r[1].horasRestantes).toBe(5);
    });
});
