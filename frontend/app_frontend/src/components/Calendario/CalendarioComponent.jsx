import React, { useEffect, useState } from "react";
import { getAllTarefas } from "../../services/TarefaService";

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES = [
    "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
    "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

const CalendarioComponent = () => {
    const hoje = new Date();
    const [mes, setMes] = useState(hoje.getMonth());
    const [ano, setAno] = useState(hoje.getFullYear());
    const [tarefas, setTarefas] = useState([]);

    useEffect(() => {
        getAllTarefas()
            .then((res) => setTarefas(res.data))
            .catch((err) => console.error(err));
    }, []);

    const primeiroDia = new Date(ano, mes, 1).getDay();
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();

    const tarefasPorDia = (dia) =>
        tarefas.filter((t) => {
            const d = new Date(t.dataEntrega);
            return d.getDate() === dia && d.getMonth() === mes && d.getFullYear() === ano;
        });

    const corPrioridade = (p) => {
        if (p === "alta") return "#dc3545";
        if (p === "media") return "#ffc107";
        return "#198754";
    };

    const cells = [];
    for (let i = 0; i < primeiroDia; i++) cells.push(null);
    for (let d = 1; d <= diasNoMes; d++) cells.push(d);

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold mb-0">Calendário</h2>
                <div className="d-flex align-items-center gap-3">
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => {
                        if (mes === 0) { setMes(11); setAno(ano - 1); } else setMes(mes - 1);
                    }}>‹</button>
                    <span className="fw-semibold" style={{ minWidth: "160px", textAlign: "center" }}>
                        {MESES[mes]} {ano}
                    </span>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => {
                        if (mes === 11) { setMes(0); setAno(ano + 1); } else setMes(mes + 1);
                    }}>›</button>
                </div>
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-body p-3">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
                        {DIAS_SEMANA.map((d) => (
                            <div key={d} className="text-center text-muted fw-bold py-2"
                                style={{ fontSize: "11px", textTransform: "uppercase" }}>
                                {d}
                            </div>
                        ))}
                        {cells.map((dia, idx) => {
                            const isHoje =
                                dia === hoje.getDate() &&
                                mes === hoje.getMonth() &&
                                ano === hoje.getFullYear();
                            const tarefasDia = dia ? tarefasPorDia(dia) : [];
                            return (
                                <div key={idx}
                                    className={`rounded p-1 ${!dia ? "" : isHoje ? "border border-primary bg-primary bg-opacity-10" : "bg-light"}`}
                                    style={{ minHeight: "80px", fontSize: "12px" }}>
                                    {dia && (
                                        <>
                                            <div className={`fw-bold mb-1 ${isHoje ? "text-primary" : ""}`}
                                                style={{ fontSize: "13px" }}>
                                                {dia}
                                            </div>
                                            <div className="d-flex flex-column gap-1">
                                                {tarefasDia.slice(0, 2).map((t) => (
                                                    <div key={t._id}
                                                        className="rounded text-white px-1"
                                                        style={{
                                                            background: corPrioridade(t.prioridade),
                                                            fontSize: "10px",
                                                            whiteSpace: "nowrap",
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                        }}
                                                        title={t.nome}>
                                                        {t.nome}
                                                    </div>
                                                ))}
                                                {tarefasDia.length > 2 && (
                                                    <div className="text-muted" style={{ fontSize: "10px" }}>
                                                        +{tarefasDia.length - 2}
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarioComponent;
