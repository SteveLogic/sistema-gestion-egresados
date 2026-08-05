const express = require("express");
const oportunidadesController = require("../controllers/oportunidades.controller");

const router = express.Router();

router.get("/", oportunidadesController.obtenerOportunidades);
router.get("/:id", oportunidadesController.obtenerOportunidadPorId);
router.post("/", oportunidadesController.crearOportunidad);
router.put("/:id", oportunidadesController.actualizarOportunidad);
router.delete("/:id", oportunidadesController.eliminarOportunidad);

module.exports = router;
