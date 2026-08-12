const express = require("express");
const mentoriasController = require(
    "../controllers/mentorias.controller"
);
const { autenticarSolicitud } = require("../middleware/auth.middleware");
const {
    permitirRoles,
    permitirEgresadoBodyPropio
} = require("../middleware/roles.middleware");

const router = express.Router();

router.use(autenticarSolicitud);

router.get(
    "/mentores",
    permitirRoles("bienestar", "egresado"),
    mentoriasController.obtenerMentores
);
router.get(
    "/mentores/:id",
    permitirRoles("bienestar", "egresado"),
    mentoriasController.obtenerMentorPorId
);
router.post(
    "/mentores",
    permitirEgresadoBodyPropio("egresadoId", "bienestar"),
    mentoriasController.crearMentor
);
router.put(
    "/mentores/:id",
    permitirRoles("bienestar"),
    mentoriasController.actualizarMentor
);
router.delete(
    "/mentores/:id",
    permitirRoles("bienestar"),
    mentoriasController.eliminarMentor
);

router.get(
    "/solicitudes",
    permitirRoles("bienestar", "egresado"),
    mentoriasController.obtenerSolicitudes
);
router.get(
    "/solicitudes/:id",
    permitirRoles("bienestar", "egresado"),
    mentoriasController.obtenerSolicitudPorId
);
router.post(
    "/solicitudes",
    permitirEgresadoBodyPropio("egresadoId", "bienestar"),
    mentoriasController.crearSolicitud
);
router.put(
    "/solicitudes/:id",
    permitirRoles("bienestar"),
    mentoriasController.actualizarSolicitud
);
router.post(
    "/solicitudes/:id/asignar",
    permitirRoles("bienestar"),
    mentoriasController.asignarMentor
);
router.delete(
    "/solicitudes/:id",
    permitirRoles("bienestar"),
    mentoriasController.eliminarSolicitud
);

router.get(
    "/",
    permitirRoles("bienestar", "egresado"),
    mentoriasController.obtenerMentorias
);
router.get(
    "/:id",
    permitirRoles("bienestar", "egresado"),
    mentoriasController.obtenerMentoriaPorId
);
router.post(
    "/",
    permitirRoles("bienestar"),
    mentoriasController.crearMentoria
);
router.put(
    "/:id",
    permitirRoles("bienestar"),
    mentoriasController.actualizarMentoria
);
router.delete(
    "/:id",
    permitirRoles("bienestar"),
    mentoriasController.eliminarMentoria
);

module.exports = router;
