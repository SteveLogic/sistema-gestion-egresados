const express = require("express");
const cors = require("cors");


const {
    manejarError
} = require("./middleware/error.middleware");

const carrerasRoutes = require("./routes/carreras.routes");
const escuelasRoutes = require("./routes/escuelas.routes");
const egresadosRoutes = require("./routes/egresados.routes");
const titulosRoutes = require("./routes/titulos.routes");
const mentoriasRoutes = require("./routes/mentorias.routes");
const actividadesRoutes = require("./routes/actividades.routes");
const comunidadesRoutes = require("./routes/comunidades.routes");

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
app.use("/api/escuelas", escuelasRoutes);
app.use("/api/egresados",egresadosRoutes);
app.use("/api/titulos",titulosRoutes);
app.use("/api/mentorias", mentoriasRoutes);
app.use("/api/actividades",actividadesRoutes);
app.use("/api/comunidades",comunidadesRoutes);


app.use(manejarError);

module.exports = app;
