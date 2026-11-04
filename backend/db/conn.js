const mongoose = require("mongoose");

async function conectar(uri) {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("Conectou ao MongoDB");
    return mongoose.connection;
}

module.exports = { conectar, mongoose };
