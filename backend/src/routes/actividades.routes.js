const express = require("express");
const actividadesController = require(
    "../controllers/actividades.controller"
);

const router = express.Router();

router.get("/", actividadesController.obtenerActividades);
router.get("/:id", actividadesController.obtenerActividadPorId);
router.post("/", actividadesController.crearActividad);
router.put("/:id", actividadesController.actualizarActividad);
router.delete("/:id", actividadesController.eliminarActividad);

module.exports = router;
