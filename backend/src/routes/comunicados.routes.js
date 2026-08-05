const express = require("express");
const comunicadosController = require("../controllers/comunicados.controller");

const router = express.Router();

router.get("/", comunicadosController.obtenerComunicados);
router.get("/:id", comunicadosController.obtenerComunicadoPorId);
router.post("/", comunicadosController.crearComunicado);
router.put("/:id", comunicadosController.actualizarComunicado);
router.delete("/:id", comunicadosController.eliminarComunicado);

module.exports = router;
