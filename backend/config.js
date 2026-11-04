require("dotenv").config({ quiet: true });

const NODE_ENV = process.env.NODE_ENV || "development";

const config = {
    NODE_ENV,
    PORT: Number(process.env.PORT) || 3001,
    API_URL: process.env.API_URL || "/api/v1",
    MONGODB_URI: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/academico-app",
    JWT_SECRET: process.env.JWT_SECRET || (NODE_ENV === "production" ? "" : "segredo-de-desenvolvimento"),
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
    // Lista de origens separadas por vírgula. Vazio = qualquer origem (apenas desenvolvimento).
    CORS_ORIGIN: process.env.CORS_ORIGIN || "",
};

if (NODE_ENV === "production" && !config.JWT_SECRET) {
    throw new Error("A variável de ambiente JWT_SECRET é obrigatória em produção.");
}

module.exports = config;
