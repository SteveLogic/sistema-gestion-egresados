const mongoose = require("mongoose");

/**
 * Establece la conexión del backend con MongoDB.
 *
 * La dirección se obtiene desde la variable MONGODB_URI
 * definida en el archivo .env.
 */
async function conectarBaseDatos() {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error(
            "La variable MONGODB_URI no está definida en el archivo .env"
        );
    }

    await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000
    });

    console.log(
        `MongoDB conectado correctamente: ${mongoose.connection.name}`
    );
}

mongoose.connection.on("disconnected", () => {
    console.warn("La conexión con MongoDB fue interrumpida");
});

mongoose.connection.on("error", (error) => {
    console.error(
        "Error en la conexión con MongoDB:",
        error.message
    );
});

module.exports = {
    conectarBaseDatos
};