import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { mensagemErro } from "../../utils/rotulos";
import useTitulo from "../../hooks/useTitulo";
import Alerta from "../Alerta";
import AuthLayout from "./AuthLayout";

const SENHA_MINIMA = 8;

const CadastroComponent = () => {
    useTitulo("Criar conta");
    const { usuario, cadastrar } = useAuth();
    const navigator = useNavigate();
    const [form, setForm] = useState({ nome: "", email: "", senha: "", confirmacao: "", consentimento: false });
    const [erros, setErros] = useState({});
    const [erroGeral, setErroGeral] = useState("");
    const [enviando, setEnviando] = useState(false);

    if (usuario) return <Navigate to="/" replace />;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    };

    const validar = () => {
        const novos = {};
        if (!form.nome.trim()) novos.nome = "Informe seu nome.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) novos.email = "Informe um e-mail válido.";
        if (form.senha.length < SENHA_MINIMA) novos.senha = `A senha deve ter ao menos ${SENHA_MINIMA} caracteres.`;
        if (form.confirmacao !== form.senha) novos.confirmacao = "As senhas não conferem.";
        if (!form.consentimento) novos.consentimento = "É necessário aceitar a política de privacidade.";
        setErros(novos);
        return Object.keys(novos).length === 0;
    };

    async function handleSubmit(e) {
        e.preventDefault();
        setErroGeral("");
        if (!validar()) return;
        setEnviando(true);
        try {
            await cadastrar({ nome: form.nome, email: form.email, senha: form.senha, consentimento: form.consentimento });
            navigator("/", { replace: true });
        } catch (error) {
            setErroGeral(mensagemErro(error, "Não foi possível criar a conta."));
        } finally {
            setEnviando(false);
        }
    }

    const campo = (id, rotulo, props) => (
        <div className="mb-3">
            <label htmlFor={`cadastro-${id}`} className="form-label fw-semibold">{rotulo}</label>
            <input id={`cadastro-${id}`} name={id} value={form[id]} onChange={handleChange} required
                aria-invalid={Boolean(erros[id])}
                aria-describedby={erros[id] ? `erro-${id}` : undefined}
                className={`form-control ${erros[id] ? "is-invalid" : ""}`} {...props} />
            {erros[id] && <div id={`erro-${id}`} className="invalid-feedback">{erros[id]}</div>}
        </div>
    );

    return (
        <AuthLayout titulo="Criar conta" subtitulo="Seus dados ficam visíveis apenas para você.">
            <Alerta mensagem={erroGeral} />
            <form onSubmit={handleSubmit} noValidate>
                {campo("nome", "Nome", { type: "text", autoComplete: "name" })}
                {campo("email", "E-mail", { type: "email", autoComplete: "email" })}
                {campo("senha", "Senha (mínimo de 8 caracteres)", { type: "password", autoComplete: "new-password" })}
                {campo("confirmacao", "Confirme a senha", { type: "password", autoComplete: "new-password" })}
                <div className="form-check mb-3">
                    <input id="cadastro-consentimento" type="checkbox" name="consentimento"
                        className={`form-check-input ${erros.consentimento ? "is-invalid" : ""}`}
                        checked={form.consentimento} onChange={handleChange}
                        aria-invalid={Boolean(erros.consentimento)}
                        aria-describedby={erros.consentimento ? "erro-consentimento" : undefined} />
                    <label htmlFor="cadastro-consentimento" className="form-check-label" style={{ fontSize: "14px" }}>
                        Li e aceito a <Link to="/privacidade" target="_blank" rel="noopener">política de privacidade</Link>
                    </label>
                    {erros.consentimento && <div id="erro-consentimento" className="invalid-feedback">{erros.consentimento}</div>}
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={enviando}>
                    {enviando ? "Criando conta..." : "Criar conta"}
                </button>
            </form>
            <p className="text-center mt-3 mb-0" style={{ fontSize: "14px" }}>
                Já tem conta? <Link to="/login">Entrar</Link>
            </p>
        </AuthLayout>
    );
};

export default CadastroComponent;
