const AuthLayout = ({ titulo, subtitulo, children }) => (
    <main id="conteudo" className="min-vh-100 d-flex align-items-center justify-content-center p-3 bg-light">
        <div className="card shadow-sm border-0 w-100" style={{ maxWidth: "420px" }}>
            <div className="card-body p-4">
                <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary text-white rounded d-flex align-items-center justify-content-center me-2"
                        style={{ width: "36px", height: "36px", fontWeight: "bold", fontSize: "18px" }} aria-hidden="true">
                        A
                    </div>
                    <span className="fw-bold">Acadêmico</span>
                </div>
                <h1 className="h4 fw-bold mb-1">{titulo}</h1>
                {subtitulo && <p className="text-secondary mb-4">{subtitulo}</p>}
                {children}
            </div>
        </div>
    </main>
);

export default AuthLayout;
