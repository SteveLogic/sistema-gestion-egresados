const express = require("express");
const oportunidadesController = require(
    "../controllers/oportunidades.controller"
);
const { autenticarSolicitud } = require("../middleware/auth.middleware");
const { permitirRoles } = require("../middleware/roles.middleware");

const router = express.Router();

router.use(autenticarSolicitud);

router.get(
    "/",
    permitirRoles("bienestar", "egresado"),
    oportunidadesController.obtenerOportunidades
);
router.get(
    "/:id",
    permitirRoles("bienestar", "egresado"),
    oportunidadesController.obtenerOportunidadPorId
);
router.post(
    "/",
    permitirRoles("bienestar"),
    oportunidadesController.crearOportunidad
);
router.put(
    "/:id",
    permitirRoles("bienestar"),
    oportunidadesController.actualizarOportunidad
);
router.delete(
    "/:id",
    permitirRoles("bienestar"),
    oportunidadesController.eliminarOportunidad
);

module.exports = router;
