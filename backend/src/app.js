const express = require("express");
const cors = require("cors");


const {
    manejarError
} = require("./middleware/error.middleware");

const carrerasRoutes = require("./routes/carreras.routes");

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

 
app.use("/api/carreras", carrerasRoutes);

app.use(manejarError);

module.exports = app;
