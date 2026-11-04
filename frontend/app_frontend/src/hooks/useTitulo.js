import { useEffect } from "react";

// Define o título da página (WCAG 2.4.2 - Página com título)
export default function useTitulo(titulo) {
    useEffect(() => {
        document.title = titulo ? `${titulo} | Acadêmico` : "Acadêmico";
    }, [titulo]);
}
