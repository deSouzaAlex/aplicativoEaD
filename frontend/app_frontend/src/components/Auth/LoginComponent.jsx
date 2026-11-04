import React, { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { mensagemErro } from "../../utils/rotulos";
import useTitulo from "../../hooks/useTitulo";
import Alerta from "../Alerta";
import AuthLayout from "./AuthLayout";

const LoginComponent = () => {
    useTitulo("Entrar");
    const { usuario, entrar } = useAuth();
    const navigator = useNavigate();
    const location = useLocation();
    const [form, setForm] = useState({ email: "", senha: "" });
    const [erro, setErro] = useState("");
    const [enviando, setEnviando] = useState(false);

    if (usuario) return <Navigate to="/" replace />;

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    async function handleSubmit(e) {
        e.preventDefault();
        setErro("");
        if (!form.email.trim() || !form.senha) {
            setErro("Informe e-mail e senha.");
            return;
        }
        setEnviando(true);
        try {
            await entrar(form.email, form.senha);
            navigator(location.state?.de || "/", { replace: true });
        } catch (error) {
            setErro(mensagemErro(error, "Não foi possível entrar."));
        } finally {
            setEnviando(false);
        }
    }

    return (
        <AuthLayout titulo="Entrar" subtitulo="Acesse sua conta para organizar seus estudos.">
            <Alerta mensagem={erro} />
            <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                    <label htmlFor="login-email" className="form-label fw-semibold">E-mail</label>
                    <input id="login-email" type="email" name="email" autoComplete="email" required
                        className="form-control" value={form.email} onChange={handleChange} />
                </div>
                <div className="mb-3">
                    <label htmlFor="login-senha" className="form-label fw-semibold">Senha</label>
                    <input id="login-senha" type="password" name="senha" autoComplete="current-password" required
                        className="form-control" value={form.senha} onChange={handleChange} />
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={enviando}>
                    {enviando ? "Entrando..." : "Entrar"}
                </button>
            </form>
            <p className="text-center mt-3 mb-0" style={{ fontSize: "14px" }}>
                Ainda não tem conta? <Link to="/cadastro">Cadastre-se</Link>
            </p>
        </AuthLayout>
    );
};

export default LoginComponent;
