// Mensagem anunciada por leitores de tela (role="alert")
const Alerta = ({ mensagem, tipo = "danger", onFechar }) => {
    if (!mensagem) return null;
    return (
        <div className={`alert alert-${tipo} d-flex justify-content-between align-items-start`} role="alert">
            <span>{mensagem}</span>
            {onFechar && (
                <button type="button" className="btn-close ms-3" aria-label="Fechar mensagem" onClick={onFechar}></button>
            )}
        </div>
    );
};

export default Alerta;
