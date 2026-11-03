const mongoose = require("mongoose");

// Responde 400 quando o parâmetro :id não é um ObjectId válido,
// evitando que um CastError do Mongoose seja devolvido como erro 500.
function validarId(req, res, next, id) {
    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ success: false, error: "Identificador inválido." });
    }
    next();
}

module.exports = { validarId };
