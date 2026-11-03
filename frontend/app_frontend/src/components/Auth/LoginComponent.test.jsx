import { describe, expect, test, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderComRota, verificarAcessibilidade } from "../../test/utils";

const entrar = vi.fn();
vi.mock("../../contexts/AuthContext", () => ({ useAuth: () => ({ usuario: null, entrar }) }));

import LoginComponent from "./LoginComponent";

describe("LoginComponent", () => {
    test("campos possuem rótulos associados e a página não tem violações de acessibilidade", async () => {
        const { container } = renderComRota(<LoginComponent />);
        expect(screen.getByLabelText("E-mail")).toHaveAttribute("type", "email");
        expect(screen.getByLabelText("Senha")).toHaveAttribute("type", "password");
        expect(await verificarAcessibilidade(container)).toHaveNoViolations();
    });

    test("mostra alerta quando os campos estão vazios e não chama a API", async () => {
        renderComRota(<LoginComponent />);
        await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
        expect(screen.getByRole("alert")).toHaveTextContent("Informe e-mail e senha.");
        expect(entrar).not.toHaveBeenCalled();
    });

    test("exibe a mensagem de erro devolvida pela API", async () => {
        entrar.mockRejectedValueOnce({ response: { data: { error: "E-mail ou senha incorretos." } } });
        renderComRota(<LoginComponent />);
        await userEvent.type(screen.getByLabelText("E-mail"), "maria@exemplo.com");
        await userEvent.type(screen.getByLabelText("Senha"), "errada123");
        await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
        expect(await screen.findByRole("alert")).toHaveTextContent("E-mail ou senha incorretos.");
        expect(entrar).toHaveBeenCalledWith("maria@exemplo.com", "errada123");
    });
});
