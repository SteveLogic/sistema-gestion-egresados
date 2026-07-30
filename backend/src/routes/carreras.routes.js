// Rutas del módulo de carreras
const express = require("express");

const {
    obtenerCarreras,
    obtenerCarreraPorId,
    crearCarrera,
    actualizarCarrera,
    eliminarCarrera
} = require("../controllers/carreras.controller");

const router = express.Router();

router.get("/", obtenerCarreras);

router.get("/:id", obtenerCarreraPorId);

router.post("/", crearCarrera);

router.put("/:id", actualizarCarrera);

router.delete("/:id", eliminarCarrera);

module.exports = router;