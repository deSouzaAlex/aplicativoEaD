import { BrowserRouter, Routes, Route } from "react-router-dom";
import HeaderComponent from "./components/HeaderComponent";
import IndexComponent from "./components/IndexComponent";
import ListDisciplinaComponent from "./components/Disciplinas/ListDisciplinaComponent";
import DisciplinaComponent from "./components/Disciplinas/DisciplinaComponent";
import ListTarefaComponent from "./components/Tarefas/ListTarefaComponent";
import TarefaComponent from "./components/Tarefas/TarefaComponent";
import CalendarioComponent from "./components/Calendario/CalendarioComponent";
import "./App.css";

function App() {
    return (
        <BrowserRouter>
            <div style={{ display: "flex", minHeight: "100vh" }}>
                <HeaderComponent />
                <main style={{ marginLeft: "220px", flex: 1, padding: "32px", background: "#f8f9fa" }}>
                    <Routes>
                        <Route path="/" element={<IndexComponent />} />
                        <Route path="/disciplinas" element={<ListDisciplinaComponent />} />
                        <Route path="/disciplinas/nova" element={<DisciplinaComponent />} />
                        <Route path="/disciplinas/editar/:id" element={<DisciplinaComponent />} />
                        <Route path="/tarefas" element={<ListTarefaComponent />} />
                        <Route path="/tarefas/nova" element={<TarefaComponent />} />
                        <Route path="/tarefas/editar/:id" element={<TarefaComponent />} />
                        <Route path="/calendario" element={<CalendarioComponent />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;
