import { describe, expect, test, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import { emDias, renderComRota, tarefa } from "../test/utils";
import { diasDaSemana } from "../utils/datas";

// Uma tarefa nesta semana e outra exatamente 7 dias depois (mesmo dia da semana)
const semana = diasDaSemana(new Date());
const indiceHoje = (new Date().getDay() + 6) % 7;
const meioDia = (d) => { const x = new Date(d); x.setHours(12, 0, 0, 0); return x.toISOString(); };
const estaSemana = tarefa({ _id: "a", nome: "Entrega desta semana", prioridade: "alta", dataEntrega: meioDia(semana[indiceHoje]) });
const proximaSemana = tarefa({ _id: "b", nome: "Entrega da próxima semana", prioridade: "baixa", dataEntrega: emDias(7) });

vi.mock("../services/TarefaService", () => ({
    getAllTarefas: vi.fn(() => Promise.resolve({ data: [estaSemana, proximaSemana] })),
}));
vi.mock("../services/DisciplinaService", () => ({ getAllDisciplinas: vi.fn(() => Promise.resolve({ data: [] })) }));
vi.mock("../services/AnaliseService", () => ({
    getAnaliseRisco: vi.fn(() =>
        Promise.resolve({
            data: {
                tarefas: [{ tarefa: { _id: "a" }, nivel: "alto", indice: 80, explicacao: [] }],
                sobrecarga: [{ inicio: emDias(0), fim: emDias(6), maximoEm7Dias: 5, tarefas: [] }],
            },
        })
    ),
}));
vi.mock("../contexts/AuthContext", () => ({ useAuth: () => ({ usuario: { nome: "Maria Silva" } }) }));

import IndexComponent from "./IndexComponent";

describe("IndexComponent (dashboard)", () => {
    test("saúda o usuário autenticado pelo primeiro nome", async () => {
        renderComRota(<IndexComponent />);
        expect(await screen.findByRole("heading", { name: "Olá, Maria!" })).toBeInTheDocument();
    });

    test("a visão semanal considera apenas a semana corrente", async () => {
        renderComRota(<IndexComponent />);
        const dia = await screen.findByTestId(`dia-${indiceHoje}`);
        expect(within(dia).getByText(/Prioridade Alta: Entrega desta semana/)).toBeInTheDocument();
        expect(within(dia).queryByText(/Entrega da próxima semana/)).not.toBeInTheDocument();
    });

    test("exibe alertas de risco e de sobrecarga com link para a análise", async () => {
        renderComRota(<IndexComponent />);
        const alerta = await screen.findByText(/tarefa\(s\) com risco alto/);
        expect(alerta.closest("[role=status]")).toHaveTextContent(/Período de sobrecarga/);
        expect(screen.getByRole("link", { name: "Ver análise" })).toHaveAttribute("href", "/analise");
    });
});
