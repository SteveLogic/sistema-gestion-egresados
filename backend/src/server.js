require("dotenv").config();

const app = require("./app");
const {
    conectarBaseDatos
} = require("./config/database");

const PUERTO = process.env.PORT || 3000;

/**
 * Inicia primero la conexión con MongoDB y después
 * habilita el servidor HTTP.
 */
async function iniciarServidor() {
    try {
        await conectarBaseDatos();

        app.listen(PUERTO, () => {
            console.log(
                `Servidor disponible en http://localhost:${PUERTO}`
            );
        });
    } catch (error) {
        console.error(
            "No fue posible iniciar el servidor:",
            error.message
        );

        process.exit(1);
    }
}

iniciarServidor();