const {
    calcularHistorico,
    avaliarTarefa,
    detectarSobrecarga,
    analisar,
    montarDataset,
    classificar,
} = require("../../services/analiseRisco");

const agora = new Date("2026-10-20T12:00:00");
const emDias = (d) => new Date(agora.getTime() + d * 86400000);
let seq = 0;
const tarefa = (dias, extra = {}) => ({ _id: `t${++seq}`, dataEntrega: emDias(dias), concluida: false, prioridade: "media", ...extra });
const historicoNeutro = { taxaAtrasoSuavizada: 0.2, concluidas: 0, pendentesVencidas: 0 };

describe("analiseRisco - indicador baseado em regras (RF07)", () => {
    test("classificação por limiares", () => {
        expect(classificar(80)).toBe("alto");
        expect(classificar(60)).toBe("alto");
        expect(classificar(40)).toBe("medio");
        expect(classificar(10)).toBe("baixo");
    });

    test("tarefa vencida recebe nível 'atrasada' e índice 100", () => {
        const t = tarefa(-1);
        const r = avaliarTarefa(t, [t], historicoNeutro, agora);
        expect(r.nivel).toBe("atrasada");
        expect(r.indice).toBe(100);
    });

    test("risco cresce com a proximidade do prazo", () => {
        const perto = tarefa(1);
        const longe = tarefa(13);
        const rPerto = avaliarTarefa(perto, [perto], historicoNeutro, agora);
        const rLonge = avaliarTarefa(longe, [longe], historicoNeutro, agora);
        expect(rPerto.indice).toBeGreaterThan(rLonge.indice);
        expect(rLonge.nivel).toBe("baixo");
    });

    test("risco cresce com a concentração de entregas na janela de ±3 dias", () => {
        const alvo = tarefa(5);
        const sozinha = avaliarTarefa(alvo, [alvo], historicoNeutro, agora);
        const vizinhas = [tarefa(4), tarefa(5), tarefa(6), tarefa(7)];
        const carregada = avaliarTarefa(alvo, [alvo, ...vizinhas], historicoNeutro, agora);
        expect(carregada.indice - sozinha.indice).toBe(30);
        expect(carregada.explicacao.join(" ")).toMatch(/4 outra\(s\) entrega/);
    });

    test("tarefas distantes não entram na carga da janela", () => {
        const alvo = tarefa(5);
        const r = avaliarTarefa(alvo, [alvo, tarefa(12), tarefa(-3)], historicoNeutro, agora);
        expect(r.fatores.carga).toBe(0);
    });

    test("histórico de atrasos eleva o risco", () => {
        const atrasadas = Array.from({ length: 6 }, (_, i) =>
            tarefa(-10 - i, { concluida: true, dataConclusao: emDias(-8 - i) })
        );
        const pontuais = Array.from({ length: 6 }, (_, i) =>
            tarefa(-10 - i, { concluida: true, dataConclusao: emDias(-11 - i) })
        );
        const hRuim = calcularHistorico(atrasadas, agora);
        const hBom = calcularHistorico(pontuais, agora);
        expect(hRuim.taxaPontualidade).toBe(0);
        expect(hBom.taxaPontualidade).toBe(1);
        const alvo = tarefa(6);
        expect(avaliarTarefa(alvo, [alvo], hRuim, agora).indice).toBeGreaterThan(
            avaliarTarefa(alvo, [alvo], hBom, agora).indice
        );
    });

    test("sem histórico, a taxa suavizada assume o valor a priori de 20%", () => {
        expect(calcularHistorico([], agora).taxaAtrasoSuavizada).toBeCloseTo(0.2);
        expect(calcularHistorico([], agora).taxaPontualidade).toBeNull();
    });

    test("detecta e funde períodos de sobrecarga", () => {
        const pend = [tarefa(2), tarefa(3), tarefa(4), tarefa(5), tarefa(20)];
        const periodos = detectarSobrecarga(pend, 4, agora);
        expect(periodos).toHaveLength(1);
        expect(periodos[0].maximoEm7Dias).toBe(4);
        expect(periodos[0].tarefas).toHaveLength(4);
        expect(detectarSobrecarga(pend, 5, agora)).toHaveLength(0);
    });

    test("analisar resume níveis e ordena pelo índice", () => {
        const tarefas = [tarefa(12), tarefa(-2), tarefa(1), tarefa(3, { concluida: true, dataConclusao: emDias(0) })];
        const r = analisar(tarefas, { agora });
        expect(r.tarefas).toHaveLength(3);
        expect(r.tarefas[0].nivel).toBe("atrasada");
        expect(r.resumo.atrasada).toBe(1);
        const indices = r.tarefas.map((a) => a.indice);
        expect([...indices].sort((a, b) => b - a)).toEqual(indices);
    });
});

describe("montarDataset - atributos para a fase supervisionada", () => {
    test("gera um exemplo rotulado por tarefa concluída", () => {
        const t1 = tarefa(-20, { concluida: true, dataConclusao: emDias(-21), createdAt: emDias(-30), prioridade: "alta" });
        const t2 = tarefa(-5, { concluida: true, dataConclusao: emDias(-3), createdAt: emDias(-10) });
        const t3 = tarefa(4, { createdAt: emDias(-1) });
        const ds = montarDataset([t1, t2, t3]);
        expect(ds).toHaveLength(2);
        const e1 = ds.find((d) => d.id === t1._id);
        const e2 = ds.find((d) => d.id === t2._id);
        expect(e1.atrasou).toBe(0);
        expect(e1.prioridadeNum).toBe(3);
        expect(e1.antecedenciaCadastroDias).toBe(10);
        expect(e2.atrasou).toBe(1);
        expect(e2.historicoTarefas).toBe(1);
        expect(e2.taxaAtrasoAnterior).toBe(0);
    });
});
