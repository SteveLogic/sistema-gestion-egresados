const express = require("express");
const cors = require("cors");

const {
    manejarError
} = require("./middleware/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.get("/api/salud", (solicitud, respuesta) => {
    respuesta.json({
        exito: true,
        mensaje: "El servidor funciona correctamente",
        datos: null
    });
});

// Las rutas de los módulos se conectarán aquí.

app.use(manejarError);

module.exports = app;
