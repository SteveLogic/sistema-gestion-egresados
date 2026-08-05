const express = require("express");
const comunidadesController = require(
    "../controllers/comunidades.controller"
);

const router = express.Router();

router.get("/", comunidadesController.obtenerComunidades);
router.get(
    "/:id/integrantes",
    comunidadesController.obtenerIntegrantes
);
router.get("/:id", comunidadesController.obtenerComunidadPorId);
router.post("/", comunidadesController.crearComunidad);
router.put("/:id", comunidadesController.actualizarComunidad);
router.delete("/:id", comunidadesController.eliminarComunidad);

module.exports = router;
