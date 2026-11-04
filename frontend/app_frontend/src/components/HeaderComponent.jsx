import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLembretes } from "../contexts/LembretesContext";

const HeaderComponent = () => {
    const { usuario, sair } = useAuth();
    const { lembretes } = useLembretes();
    const [menuAberto, setMenuAberto] = useState(false);
    const navigator = useNavigate();
    const totalLembretes = lembretes.length;

    const navItems = [
        { to: "/", label: "Dashboard", icon: "bi-speedometer2" },
        { to: "/disciplinas", label: "Disciplinas", icon: "bi-book" },
        { to: "/calendario", label: "Calendário", icon: "bi-calendar3" },
        { to: "/tarefas", label: "Tarefas", icon: "bi-clipboard-check" },
        { to: "/lembretes", label: "Lembretes", icon: "bi-bell", contador: totalLembretes },
        { to: "/analise", label: "Análise de risco", icon: "bi-graph-up-arrow" },
        { to: "/perfil", label: "Meu perfil", icon: "bi-person-gear" },
    ];

    const inicial = (usuario?.nome || "?").trim().charAt(0).toUpperCase();

    function handleSair() {
        sair();
        navigator("/login");
    }

    return (
        <header className="app-sidebar bg-white border-end shadow-sm p-3">
            <div className="d-flex align-items-center justify-content-between mb-md-4 pb-md-3 border-md-bottom">
                <div className="d-flex align-items-center">
                    <div className="bg-primary text-white rounded d-flex align-items-center justify-content-center me-2"
                        style={{ width: "36px", height: "36px", fontWeight: "bold", fontSize: "18px" }}
                        aria-hidden="true">
                        A
                    </div>
                    <span className="fw-bold fs-6">Acadêmico</span>
                </div>
                <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm d-md-none"
                    aria-expanded={menuAberto}
                    aria-controls="menu-principal"
                    aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
                    onClick={() => setMenuAberto(!menuAberto)}
                >
                    <i className={`bi ${menuAberto ? "bi-x-lg" : "bi-list"}`} aria-hidden="true"></i>
                </button>
            </div>

            <nav id="menu-principal" aria-label="Menu principal"
                className={`app-nav flex-grow-1 ${menuAberto ? "aberto" : ""}`}>
                <ul className="nav nav-pills flex-column gap-1 mt-3 mt-md-0">
                    {navItems.map((item) => (
                        <li key={item.to} className="nav-item">
                            <NavLink
                                to={item.to}
                                end={item.to === "/"}
                                onClick={() => setMenuAberto(false)}
                                className={({ isActive }) =>
                                    "nav-link d-flex align-items-center gap-2 " +
                                    (isActive ? "active bg-primary text-white" : "text-secondary")
                                }
                            >
                                <i className={`bi ${item.icon}`} aria-hidden="true"></i>
                                <span className="flex-grow-1">{item.label}</span>
                                {item.contador > 0 && (
                                    <span className="badge rounded-pill bg-danger">
                                        {item.contador}
                                        <span className="visually-hidden"> lembrete(s) ativo(s)</span>
                                    </span>
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>

                <div className="d-flex align-items-center gap-2 pt-3 border-top mt-3">
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: "34px", height: "34px", fontWeight: "bold" }} aria-hidden="true">
                        {inicial}
                    </div>
                    <div className="flex-grow-1 text-truncate">
                        <div className="fw-semibold text-truncate" style={{ fontSize: "13px" }}>{usuario?.nome}</div>
                        <div className="text-secondary" style={{ fontSize: "11px" }}>Estudante</div>
                    </div>
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleSair}
                        aria-label="Sair da conta" title="Sair">
                        <i className="bi bi-box-arrow-right" aria-hidden="true"></i>
                    </button>
                </div>
            </nav>
        </header>
    );
};

export default HeaderComponent;
