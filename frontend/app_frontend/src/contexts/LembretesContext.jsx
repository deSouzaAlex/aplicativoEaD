/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getLembretes } from "../services/AnaliseService";
import { useAuth } from "./AuthContext";

const LembretesContext = createContext({ lembretes: [], recarregar: () => {} });
const INTERVALO_MS = 5 * 60 * 1000;
const CHAVE_NOTIFICADOS = "academico.lembretesNotificados";

function lerNotificados() {
    try {
        return new Set(JSON.parse(sessionStorage.getItem(CHAVE_NOTIFICADOS) || "[]"));
    } catch {
        return new Set();
    }
}

function gravarNotificados(conjunto) {
    try {
        sessionStorage.setItem(CHAVE_NOTIFICADOS, JSON.stringify([...conjunto]));
    } catch {
        /* sem armazenamento de sessão: pode repetir a notificação ao recarregar */
    }
}

const TEXTO_TIPO = { atrasada: "está atrasada", hoje: "vence hoje", proxima: "vence em breve" };

// Notificações do navegador (opcionais) para lembretes ainda não avisados nesta sessão
function notificar(lembretes) {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const notificados = lerNotificados();
    for (const l of lembretes) {
        const chave = `${l.tarefa._id}:${l.tipo}`;
        if (notificados.has(chave)) continue;
        new Notification(`Tarefa ${TEXTO_TIPO[l.tipo]}`, {
            body: `${l.tarefa.nome}${l.tarefa.disciplina?.nome ? ` — ${l.tarefa.disciplina.nome}` : ""}`,
            tag: chave,
        });
        notificados.add(chave);
    }
    gravarNotificados(notificados);
}

export function LembretesProvider({ children }) {
    const { usuario } = useAuth();
    const [lembretes, setLembretes] = useState([]);
    const notificacoesAtivas = Boolean(usuario?.preferencias?.notificacoesNavegador);

    const recarregar = useCallback(() => {
        if (!usuario) return Promise.resolve();
        return getLembretes()
            .then((res) => {
                setLembretes(res.data);
                if (notificacoesAtivas) notificar(res.data);
            })
            .catch(() => {});
    }, [usuario, notificacoesAtivas]);

    useEffect(() => {
        if (!usuario) return undefined;
        recarregar();
        const id = setInterval(recarregar, INTERVALO_MS);
        return () => clearInterval(id);
    }, [usuario, recarregar]);

    const valor = useMemo(() => ({ lembretes: usuario ? lembretes : [], recarregar }), [usuario, lembretes, recarregar]);
    return <LembretesContext.Provider value={valor}>{children}</LembretesContext.Provider>;
}

export const useLembretes = () => useContext(LembretesContext);
