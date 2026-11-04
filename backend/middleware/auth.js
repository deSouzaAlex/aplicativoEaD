const jwt = require("jsonwebtoken");
const config = require("../config");

function gerarToken(usuario) {
    return jwt.sign({ sub: String(usuario._id), nome: usuario.nome }, config.JWT_SECRET, {
        expiresIn: config.JWT_EXPIRES_IN,
    });
}

// Exige o cabeçalho "Authorization: Bearer <token>" e disponibiliza req.usuarioId (RF08)
function autenticar(req, res, next) {
    const cabecalho = req.headers.authorization || "";
    const [tipo, token] = cabecalho.split(" ");
    if (tipo !== "Bearer" || !token) {
        return res.status(401).json({ success: false, error: "Autenticação necessária." });
    }
    try {
        const payload = jwt.verify(token, config.JWT_SECRET);
        req.usuarioId = payload.sub;
        next();
    } catch {
        return res.status(401).json({ success: false, error: "Sessão inválida ou expirada." });
    }
}

module.exports = { autenticar, gerarToken };
