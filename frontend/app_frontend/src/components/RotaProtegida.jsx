import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Carregando from "./Carregando";

const RotaProtegida = () => {
    const { usuario, carregando } = useAuth();
    const location = useLocation();
    if (carregando) return <Carregando />;
    if (!usuario) return <Navigate to="/login" replace state={{ de: location.pathname }} />;
    return <Outlet />;
};

export default RotaProtegida;
