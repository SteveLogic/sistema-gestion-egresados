const express = require("express");

const {
    obtenerEscuelas,
    obtenerEscuelaPorId,
    crearEscuela,
    actualizarEscuela,
    eliminarEscuela
} = require("../controllers/escuelas.controller");

const router = express.Router();

router.get("/", obtenerEscuelas);

router.get("/:id", obtenerEscuelaPorId);

router.post("/", crearEscuela);

router.put("/:id", actualizarEscuela);

router.delete("/:id", eliminarEscuela);

module.exports = router;