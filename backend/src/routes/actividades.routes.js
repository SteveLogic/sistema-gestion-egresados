const express = require("express");
const actividadesController = require(
    "../controllers/actividades.controller"
);
const { autenticarSolicitud } = require("../middleware/auth.middleware");
const { permitirRoles } = require("../middleware/roles.middleware");

const router = express.Router();

router.use(autenticarSolicitud);

router.get(
    "/",
    permitirRoles("bienestar", "egresado"),
    actividadesController.obtenerActividades
);
router.get(
    "/:id",
    permitirRoles("bienestar", "egresado"),
    actividadesController.obtenerActividadPorId
);
router.post(
    "/",
    permitirRoles("bienestar"),
    actividadesController.crearActividad
);
router.put(
    "/:id",
    permitirRoles("bienestar"),
    actividadesController.actualizarActividad
);
router.delete(
    "/:id",
    permitirRoles("bienestar"),
    actividadesController.eliminarActividad
);

module.exports = router;
