/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as AuthService from "../services/AuthService";
import { gravarToken, lerToken } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null);
    const [carregando, setCarregando] = useState(() => Boolean(lerToken()));

    const sair = useCallback(() => {
        gravarToken(null);
        setUsuario(null);
    }, []);

    useEffect(() => {
        if (!lerToken()) return;
        AuthService.getPerfil()
            .then((res) => setUsuario(res.data))
            .catch(() => sair())
            .finally(() => setCarregando(false));
    }, [sair]);

    useEffect(() => {
        window.addEventListener("sessao-expirada", sair);
        return () => window.removeEventListener("sessao-expirada", sair);
    }, [sair]);

    const entrar = useCallback(async (email, senha) => {
        const res = await AuthService.login(email, senha);
        gravarToken(res.data.token);
        setUsuario(res.data.usuario);
        return res.data.usuario;
    }, []);

    const cadastrar = useCallback(async (dados) => {
        const res = await AuthService.registrar(dados);
        gravarToken(res.data.token);
        setUsuario(res.data.usuario);
        return res.data.usuario;
    }, []);

    const atualizarPerfil = useCallback(async (dados) => {
        const res = await AuthService.updatePerfil(dados);
        setUsuario(res.data);
        return res.data;
    }, []);

    const valor = useMemo(
        () => ({ usuario, carregando, entrar, cadastrar, sair, atualizarPerfil }),
        [usuario, carregando, entrar, cadastrar, sair, atualizarPerfil]
    );

    return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
    return ctx;
}
