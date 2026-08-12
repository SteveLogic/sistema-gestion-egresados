const express = require("express");
const titulosController = require(
    "../controllers/titulos.controller"
);
const { autenticarSolicitud } = require("../middleware/auth.middleware");
const {
    permitirRoles,
    permitirEgresadoPropio
} = require("../middleware/roles.middleware");

const router = express.Router();

router.use(autenticarSolicitud);

router.get(
    "/",
    // Bienestar necesita lectura para los filtros académicos de egresados.
    permitirRoles("registro", "bienestar"),
    titulosController.obtenerTitulos
);

router.get(
    "/egresado/:egresadoId",
    permitirEgresadoPropio("egresadoId", "registro"),
    titulosController.obtenerTitulosPorEgresado
);

router.get(
    "/:id",
    permitirRoles("registro"),
    titulosController.obtenerTituloPorId
);

router.post(
    "/",
    permitirRoles("registro"),
    titulosController.crearTitulo
);

router.put(
    "/:id",
    permitirRoles("registro"),
    titulosController.actualizarTitulo
);

router.delete(
    "/:id",
    permitirRoles("registro"),
    titulosController.eliminarTitulo
);

module.exports = router;
