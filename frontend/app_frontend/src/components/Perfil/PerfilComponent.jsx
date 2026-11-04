import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useLembretes } from "../../contexts/LembretesContext";
import { excluirConta, exportarDados } from "../../services/AuthService";
import { mensagemErro } from "../../utils/rotulos";
import useTitulo from "../../hooks/useTitulo";
import Alerta from "../Alerta";

const suportaNotificacao = typeof Notification !== "undefined";

const PerfilComponent = () => {
    useTitulo("Meu perfil");
    const { usuario, atualizarPerfil, sair } = useAuth();
    const { recarregar } = useLembretes();
    const navigator = useNavigate();
    const [form, setForm] = useState(() => ({
        nome: usuario?.nome || "",
        antecedenciaLembreteDias: usuario?.preferencias?.antecedenciaLembreteDias ?? 2,
        limiteSobrecarga: usuario?.preferencias?.limiteSobrecarga ?? 4,
        notificacoesNavegador: Boolean(usuario?.preferencias?.notificacoesNavegador),
    }));
    const [mensagem, setMensagem] = useState({ texto: "", tipo: "success" });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    };

    async function handleSubmit(e) {
        e.preventDefault();
        setMensagem({ texto: "" });
        if (!form.nome.trim()) {
            setMensagem({ texto: "Informe seu nome.", tipo: "danger" });
            return;
        }
        let notificacoes = form.notificacoesNavegador;
        if (notificacoes && suportaNotificacao && Notification.permission !== "granted") {
            const permissao = await Notification.requestPermission();
            if (permissao !== "granted") {
                notificacoes = false;
                setForm((f) => ({ ...f, notificacoesNavegador: false }));
            }
        }
        try {
            await atualizarPerfil({
                nome: form.nome,
                preferencias: {
                    antecedenciaLembreteDias: Number(form.antecedenciaLembreteDias),
                    limiteSobrecarga: Number(form.limiteSobrecarga),
                    notificacoesNavegador: notificacoes,
                },
            });
            recarregar();
            setMensagem({
                texto: notificacoes === form.notificacoesNavegador
                    ? "Preferências salvas."
                    : "Preferências salvas. As notificações não foram ativadas porque o navegador não concedeu permissão.",
                tipo: "success",
            });
        } catch (error) {
            setMensagem({ texto: mensagemErro(error), tipo: "danger" });
        }
    }

    async function handleExportar() {
        try {
            const res = await exportarDados();
            const url = URL.createObjectURL(new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" }));
            const a = document.createElement("a");
            a.href = url;
            a.download = "meus-dados.json";
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            setMensagem({ texto: mensagemErro(error), tipo: "danger" });
        }
    }

    async function handleExcluir() {
        const confirmacao = window.prompt(
            "Esta ação exclui definitivamente sua conta, disciplinas e tarefas. Digite EXCLUIR para confirmar."
        );
        if (confirmacao !== "EXCLUIR") return;
        try {
            await excluirConta();
            sair();
            navigator("/login", { replace: true });
        } catch (error) {
            setMensagem({ texto: mensagemErro(error), tipo: "danger" });
        }
    }

    return (
        <div style={{ maxWidth: "680px" }}>
            <h1 className="h2 fw-bold mb-4">Meu perfil</h1>
            <Alerta mensagem={mensagem.texto} tipo={mensagem.tipo} onFechar={() => setMensagem({ texto: "" })} />

            <form onSubmit={handleSubmit} className="card shadow-sm border-0 mb-4" noValidate>
                <div className="card-body p-4">
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label htmlFor="perfil-nome" className="form-label fw-semibold">Nome</label>
                            <input id="perfil-nome" name="nome" type="text" className="form-control" autoComplete="name"
                                value={form.nome} onChange={handleChange} required />
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="perfil-email" className="form-label fw-semibold">E-mail</label>
                            <input id="perfil-email" type="email" className="form-control" value={usuario?.email || ""} readOnly />
                        </div>

                        <fieldset className="col-12">
                            <legend className="h6 fw-bold mt-2">Lembretes e análise</legend>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label htmlFor="perfil-antecedencia" className="form-label fw-semibold">
                                        Antecedência padrão dos lembretes (dias)
                                    </label>
                                    <input id="perfil-antecedencia" name="antecedenciaLembreteDias" type="number" min={0} max={30}
                                        className="form-control" value={form.antecedenciaLembreteDias} onChange={handleChange}
                                        aria-describedby="ajuda-antecedencia" />
                                    <div id="ajuda-antecedencia" className="form-text">Pode ser alterada em cada tarefa.</div>
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="perfil-sobrecarga" className="form-label fw-semibold">
                                        Entregas em 7 dias para sinalizar sobrecarga
                                    </label>
                                    <input id="perfil-sobrecarga" name="limiteSobrecarga" type="number" min={2} max={20}
                                        className="form-control" value={form.limiteSobrecarga} onChange={handleChange} />
                                </div>
                                <div className="col-12">
                                    <div className="form-check form-switch">
                                        <input id="perfil-notificacoes" name="notificacoesNavegador" type="checkbox" role="switch"
                                            className="form-check-input" checked={form.notificacoesNavegador}
                                            onChange={handleChange} disabled={!suportaNotificacao}
                                            aria-describedby="ajuda-notificacoes" />
                                        <label htmlFor="perfil-notificacoes" className="form-check-label">
                                            Receber notificações do navegador
                                        </label>
                                    </div>
                                    <div id="ajuda-notificacoes" className="form-text">
                                        {suportaNotificacao
                                            ? "Os lembretes aparecem como notificação enquanto a aplicação estiver aberta."
                                            : "Este navegador não oferece suporte a notificações."}
                                    </div>
                                </div>
                            </div>
                        </fieldset>

                        <div className="col-12 d-flex justify-content-end">
                            <button type="submit" className="btn btn-primary">Salvar preferências</button>
                        </div>
                    </div>
                </div>
            </form>

            <section className="card shadow-sm border-0" aria-labelledby="titulo-privacidade">
                <div className="card-body p-4">
                    <h2 id="titulo-privacidade" className="h6 fw-bold">Privacidade e seus dados (LGPD)</h2>
                    <p className="text-secondary" style={{ fontSize: "14px" }}>
                        Você pode baixar uma cópia de todos os seus dados ou excluir sua conta a qualquer momento.
                    </p>
                    <div className="d-flex flex-wrap gap-2">
                        <button type="button" className="btn btn-outline-secondary" onClick={handleExportar}>
                            <i className="bi bi-download me-1" aria-hidden="true"></i>Exportar meus dados
                        </button>
                        <button type="button" className="btn btn-outline-danger" onClick={handleExcluir}>
                            <i className="bi bi-trash me-1" aria-hidden="true"></i>Excluir minha conta
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PerfilComponent;
