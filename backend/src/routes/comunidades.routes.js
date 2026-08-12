const express = require("express");
const comunidadesController = require(
    "../controllers/comunidades.controller"
);
const { autenticarSolicitud } = require("../middleware/auth.middleware");
const { permitirRoles } = require("../middleware/roles.middleware");

const router = express.Router();

router.use(autenticarSolicitud);

router.get(
    "/",
    permitirRoles("bienestar", "egresado"),
    comunidadesController.obtenerComunidades
);
router.get(
    "/:id/integrantes",
    permitirRoles("bienestar", "egresado"),
    comunidadesController.obtenerIntegrantes
);
router.get(
    "/:id",
    permitirRoles("bienestar", "egresado"),
    comunidadesController.obtenerComunidadPorId
);
router.post(
    "/",
    permitirRoles("bienestar"),
    comunidadesController.crearComunidad
);
router.put(
    "/:id",
    permitirRoles("bienestar"),
    comunidadesController.actualizarComunidad
);
router.delete(
    "/:id",
    permitirRoles("bienestar"),
    comunidadesController.eliminarComunidad
);

module.exports = router;
