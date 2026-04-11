import React from "react";
import { NavLink } from "react-router-dom";

const HeaderComponent = () => {
    const navItems = [
        { to: "/", label: "Dashboard", icon: "bi-speedometer2" },
        { to: "/disciplinas", label: "Disciplinas", icon: "bi-book" },
        { to: "/calendario", label: "Calendário", icon: "bi-calendar3" },
        { to: "/tarefas", label: "Tarefas", icon: "bi-clipboard-check" },
    ];

    return (
        <div className="d-flex flex-column flex-shrink-0 p-3 bg-white border-end shadow-sm"
            style={{ width: "220px", minHeight: "100vh", position: "fixed", top: 0, left: 0 }}>

            <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
                <div className="bg-primary text-white rounded d-flex align-items-center justify-content-center me-2"
                    style={{ width: "36px", height: "36px", fontWeight: "bold", fontSize: "18px" }}>
                    A
                </div>
                <span className="fw-bold fs-6">Acadêmico</span>
            </div>

            <ul className="nav nav-pills flex-column mb-auto gap-1">
                {navItems.map((item) => (
                    <li key={item.to} className="nav-item">
                        <NavLink
                            to={item.to}
                            end={item.to === "/"}
                            className={({ isActive }) =>
                                "nav-link d-flex align-items-center gap-2 " +
                                (isActive ? "active bg-primary text-white" : "text-secondary")
                            }
                        >
                            <i className={`bi ${item.icon}`}></i>
                            {item.label}
                        </NavLink>
                    </li>
                ))}
            </ul>

            <div className="d-flex align-items-center gap-2 pt-3 border-top mt-3">
                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: "34px", height: "34px", fontWeight: "bold" }}>
                    M
                </div>
                <div>
                    <div className="fw-semibold" style={{ fontSize: "13px" }}>Maria</div>
                    <div className="text-muted" style={{ fontSize: "11px" }}>Estudante</div>
                </div>
            </div>
        </div>
    );
};

export default HeaderComponent;
