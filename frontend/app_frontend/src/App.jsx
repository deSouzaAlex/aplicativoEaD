import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LembretesProvider } from "./contexts/LembretesContext";
import LayoutComponent from "./components/Layout/LayoutComponent";
import RotaProtegida from "./components/RotaProtegida";
import LoginComponent from "./components/Auth/LoginComponent";
import CadastroComponent from "./components/Auth/CadastroComponent";
import PrivacidadeComponent from "./components/Auth/PrivacidadeComponent";
import IndexComponent from "./components/IndexComponent";
import ListDisciplinaComponent from "./components/Disciplinas/ListDisciplinaComponent";
import DisciplinaComponent from "./components/Disciplinas/DisciplinaComponent";
import ListTarefaComponent from "./components/Tarefas/ListTarefaComponent";
import TarefaComponent from "./components/Tarefas/TarefaComponent";
import CalendarioComponent from "./components/Calendario/CalendarioComponent";
import LembretesComponent from "./components/Lembretes/LembretesComponent";
import AnaliseComponent from "./components/Analise/AnaliseComponent";
import PerfilComponent from "./components/Perfil/PerfilComponent";
import "./App.css";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <LembretesProvider>
                    <Routes>
                        <Route path="/login" element={<LoginComponent />} />
                        <Route path="/cadastro" element={<CadastroComponent />} />
                        <Route path="/privacidade" element={<PrivacidadeComponent />} />
                        <Route element={<RotaProtegida />}>
                            <Route element={<LayoutComponent />}>
                                <Route path="/" element={<IndexComponent />} />
                                <Route path="/disciplinas" element={<ListDisciplinaComponent />} />
                                <Route path="/disciplinas/nova" element={<DisciplinaComponent />} />
                                <Route path="/disciplinas/editar/:id" element={<DisciplinaComponent />} />
                                <Route path="/tarefas" element={<ListTarefaComponent />} />
                                <Route path="/tarefas/nova" element={<TarefaComponent />} />
                                <Route path="/tarefas/editar/:id" element={<TarefaComponent />} />
                                <Route path="/calendario" element={<CalendarioComponent />} />
                                <Route path="/lembretes" element={<LembretesComponent />} />
                                <Route path="/analise" element={<AnaliseComponent />} />
                                <Route path="/perfil" element={<PerfilComponent />} />
                            </Route>
                        </Route>
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </LembretesProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
