import { Outlet } from "react-router-dom";
import HeaderComponent from "../HeaderComponent";

const LayoutComponent = () => (
    <div className="app-layout">
        <a href="#conteudo" className="link-pular">Pular para o conteúdo</a>
        <HeaderComponent />
        <main id="conteudo" className="app-main" tabIndex={-1}>
            <Outlet />
        </main>
    </div>
);

export default LayoutComponent;
