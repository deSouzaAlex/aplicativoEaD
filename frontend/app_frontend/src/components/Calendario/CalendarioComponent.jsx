import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllTarefas } from "../../services/TarefaService";
import { getAnaliseRisco } from "../../services/AnaliseService";
import { mensagemErro, prioridade } from "../../utils/rotulos";
import useTitulo from "../../hooks/useTitulo";
import Alerta from "../Alerta";

const DIAS_SEMANA = [
    { curto: "Dom", longo: "Domingo" },
    { curto: "Seg", longo: "Segunda-feira" },
    { curto: "Ter", longo: "Terça-feira" },
    { curto: "Qua", longo: "Quarta-feira" },
    { curto: "Qui", longo: "Quinta-feira" },
    { curto: "Sex", longo: "Sexta-feira" },
    { curto: "Sáb", longo: "Sábado" },
];
const MESES = [
    "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
    "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

const CalendarioComponent = () => {
    useTitulo("Calendário");
    const hoje = new Date();
    const [mes, setMes] = useState(hoje.getMonth());
    const [ano, setAno] = useState(hoje.getFullYear());
    const [tarefas, setTarefas] = useState([]);
    const [sobrecarga, setSobrecarga] = useState([]);
    const [erro, setErro] = useState("");

    useEffect(() => {
        Promise.all([getAllTarefas(), getAnaliseRisco()])
            .then(([tRes, aRes]) => {
                setTarefas(tRes.data);
                setSobrecarga(aRes.data.sobrecarga || []);
            })
            .catch((err) => setErro(mensagemErro(err, "Não foi possível carregar o calendário.")));
    }, []);

    const primeiroDia = new Date(ano, mes, 1).getDay();
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();

    const tarefasPorDia = (dia) =>
        tarefas.filter((t) => {
            const d = new Date(t.dataEntrega);
            return d.getDate() === dia && d.getMonth() === mes && d.getFullYear() === ano;
        });

    const emSobrecarga = (dia) => {
        const data = new Date(ano, mes, dia, 12);
        return sobrecarga.some((p) => {
            const inicio = new Date(p.inicio);
            const fim = new Date(p.fim);
            fim.setHours(23, 59, 59, 999);
            return data >= inicio && data <= fim;
        });
    };

    const mesAnterior = () => {
        if (mes === 0) { setMes(11); setAno(ano - 1); } else setMes(mes - 1);
    };
    const mesSeguinte = () => {
        if (mes === 11) { setMes(0); setAno(ano + 1); } else setMes(mes + 1);
    };
    const irParaHoje = () => {
        setMes(hoje.getMonth());
        setAno(hoje.getFullYear());
    };

    const cells = [];
    for (let i = 0; i < primeiroDia; i++) cells.push(null);
    for (let d = 1; d <= diasNoMes; d++) cells.push(d);

    const nomeMesAnterior = mes === 0 ? `${MESES[11]} de ${ano - 1}` : `${MESES[mes - 1]} de ${ano}`;
    const nomeMesSeguinte = mes === 11 ? `${MESES[0]} de ${ano + 1}` : `${MESES[mes + 1]} de ${ano}`;

    return (
        <div>
            <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-4">
                <h1 className="h2 fw-bold mb-0">Calendário</h1>
                <div className="d-flex align-items-center gap-2">
                    <button className="btn btn-outline-secondary btn-sm" onClick={mesAnterior}
                        aria-label={`Mês anterior, ${nomeMesAnterior}`}>
                        <span aria-hidden="true">‹</span>
                    </button>
                    <span className="fw-semibold text-center" style={{ minWidth: "150px" }} aria-live="polite" id="mes-atual">
                        {MESES[mes]} {ano}
                    </span>
                    <button className="btn btn-outline-secondary btn-sm" onClick={mesSeguinte}
                        aria-label={`Próximo mês, ${nomeMesSeguinte}`}>
                        <span aria-hidden="true">›</span>
                    </button>
                    <button className="btn btn-outline-primary btn-sm" onClick={irParaHoje}>Hoje</button>
                </div>
            </div>

            <Alerta mensagem={erro} />

            <div className="card shadow-sm border-0">
                <div className="card-body p-2 p-md-3">
                    <div className="calendario-grade" role="grid" aria-labelledby="mes-atual">
                        <div role="row" className="calendario-linha">
                            {DIAS_SEMANA.map((d) => (
                                <div key={d.curto} role="columnheader" className="text-center text-secondary fw-bold py-2"
                                    style={{ fontSize: "11px", textTransform: "uppercase" }}>
                                    <abbr title={d.longo} style={{ textDecoration: "none" }}>{d.curto}</abbr>
                                </div>
                            ))}
                        </div>
                        {Array.from({ length: Math.ceil(cells.length / 7) }, (_, semana) => (
                            <div role="row" className="calendario-linha" key={semana}>
                                {cells.slice(semana * 7, semana * 7 + 7).map((dia, idx) => {
                                    const isHoje = dia === hoje.getDate() && mes === hoje.getMonth() && ano === hoje.getFullYear();
                                    const tarefasDia = dia ? tarefasPorDia(dia) : [];
                                    const sobrecarregado = dia && emSobrecarga(dia);
                                    const classes = !dia
                                        ? ""
                                        : isHoje
                                            ? "border border-primary bg-primary bg-opacity-10"
                                            : "bg-light";
                                    return (
                                        <div key={idx} role="gridcell"
                                            className={`rounded p-1 calendario-celula ${classes} ${sobrecarregado ? "dia-sobrecarga" : ""}`}
                                            aria-label={dia ? `${dia} de ${MESES[mes]}${isHoje ? ", hoje" : ""}${sobrecarregado ? ", período de sobrecarga" : ""}, ${tarefasDia.length} entrega(s)` : undefined}>
                                            {dia && (
                                                <>
                                                    <div className={`fw-bold mb-1 d-flex justify-content-between ${isHoje ? "text-primary" : ""}`}
                                                        style={{ fontSize: "13px" }} aria-hidden="true">
                                                        {dia}
                                                        {sobrecarregado && <i className="bi bi-exclamation-triangle-fill text-warning-emphasis" title="Período de sobrecarga"></i>}
                                                    </div>
                                                    <ul className="list-unstyled d-flex flex-column gap-1 mb-0">
                                                        {tarefasDia.slice(0, 2).map((t) => {
                                                            const p = prioridade(t.prioridade);
                                                            return (
                                                                <li key={t._id}>
                                                                    <Link to={`/tarefas/editar/${t._id}`}
                                                                        className={`d-block rounded px-1 text-decoration-none calendario-tarefa ${t.concluida ? "text-decoration-line-through" : ""}`}
                                                                        style={{ background: p.cor, color: p.corTexto }}
                                                                        title={`${t.nome} (prioridade ${p.rotulo.toLowerCase()})`}>
                                                                        <strong aria-hidden="true">{p.sigla}</strong>{" "}
                                                                        <span className="visually-hidden">Prioridade {p.rotulo}{t.concluida ? ", concluída" : ""}:</span>{" "}
                                                                        {t.nome}
                                                                    </Link>
                                                                </li>
                                                            );
                                                        })}
                                                        {tarefasDia.length > 2 && (
                                                            <li className="text-secondary" style={{ fontSize: "10px" }}>
                                                                +{tarefasDia.length - 2}<span className="visually-hidden"> outras entregas</span>
                                                            </li>
                                                        )}
                                                    </ul>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                    <p className="text-secondary mt-3 mb-0" style={{ fontSize: "12px" }}>
                        Legenda: A = prioridade alta, M = média, B = baixa.{" "}
                        <i className="bi bi-exclamation-triangle-fill text-warning-emphasis" aria-hidden="true"></i> = período de sobrecarga.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CalendarioComponent;
