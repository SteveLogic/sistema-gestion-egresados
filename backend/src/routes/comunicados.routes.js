const express = require("express");
const comunicadosController = require(
    "../controllers/comunicados.controller"
);
const { autenticarSolicitud } = require("../middleware/auth.middleware");
const { permitirRoles } = require("../middleware/roles.middleware");

const router = express.Router();

router.use(autenticarSolicitud);

router.get(
    "/",
    permitirRoles("bienestar", "egresado"),
    comunicadosController.obtenerComunicados
);
router.get(
    "/:id",
    permitirRoles("bienestar", "egresado"),
    comunicadosController.obtenerComunicadoPorId
);
router.post(
    "/",
    permitirRoles("bienestar"),
    comunicadosController.crearComunicado
);
router.put(
    "/:id",
    permitirRoles("bienestar"),
    comunicadosController.actualizarComunicado
);
router.delete(
    "/:id",
    permitirRoles("bienestar"),
    comunicadosController.eliminarComunicado
);

module.exports = router;
