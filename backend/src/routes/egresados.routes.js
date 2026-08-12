const express = require("express");
const egresadosController = require(
    "../controllers/egresados.controller"
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
    permitirRoles("registro", "bienestar"),
    egresadosController.obtenerEgresados
);

router.post(
    "/importar",
    permitirRoles("registro"),
    egresadosController.importarEgresados
);

router.post(
    "/",
    permitirRoles("registro"),
    egresadosController.crearEgresado
);

router.get(
    "/:id",
    permitirEgresadoPropio("id", "registro", "bienestar"),
    egresadosController.obtenerEgresadoPorId
);

router.put(
    "/:id",
    permitirEgresadoPropio("id", "registro"),
    egresadosController.actualizarEgresado
);

router.delete(
    "/:id",
    permitirRoles("registro"),
    egresadosController.eliminarEgresado
);

module.exports = router;
