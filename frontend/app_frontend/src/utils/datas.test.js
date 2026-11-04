import { describe, expect, test } from "vitest";
import { diasDaSemana, inicioDaSemana, mesmoDia, paraDataEntregaISO, paraValorInput, tempoRestante } from "./datas";

describe("utils/datas", () => {
    test("data do formulário é gravada como fim do dia local e volta igual ao campo", () => {
        const iso = paraDataEntregaISO("2026-11-05");
        const d = new Date(iso);
        expect(d.getDate()).toBe(5);
        expect(d.getHours()).toBe(23);
        expect(paraValorInput(iso)).toBe("2026-11-05");
    });

    test("valores vazios ou inválidos", () => {
        expect(paraDataEntregaISO("")).toBe("");
        expect(paraValorInput(null)).toBe("");
        expect(paraValorInput("abc")).toBe("");
    });

    test("semana começa na segunda-feira e tem sete dias", () => {
        const quinta = new Date(2026, 9, 29, 15); // 29/10/2026, quinta-feira
        expect(inicioDaSemana(quinta).getDate()).toBe(26);
        const domingo = new Date(2026, 10, 1, 10); // 01/11/2026, domingo
        expect(inicioDaSemana(domingo).getDate()).toBe(26);
        const dias = diasDaSemana(quinta);
        expect(dias).toHaveLength(7);
        expect(dias[6].getDate()).toBe(1);
        expect(mesmoDia(dias[3], quinta)).toBe(true);
    });

    test("tempo restante em horas, dias ou atraso", () => {
        const agora = new Date(2026, 9, 20, 12);
        expect(tempoRestante(new Date(2026, 9, 20, 18), agora).texto).toBe("6h");
        expect(tempoRestante(new Date(2026, 9, 23, 12), agora).texto).toBe("3d");
        expect(tempoRestante(new Date(2026, 9, 19, 12), agora)).toEqual({ texto: "Atrasada", atrasada: true });
    });
});
