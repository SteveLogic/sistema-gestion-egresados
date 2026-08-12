const express = require("express");
const {
    obtenerEscuelas,
    obtenerEscuelaPorId,
    crearEscuela,
    actualizarEscuela,
    eliminarEscuela
} = require("../controllers/escuelas.controller");
const { autenticarSolicitud } = require("../middleware/auth.middleware");
const { permitirRoles } = require("../middleware/roles.middleware");

const router = express.Router();

router.use(autenticarSolicitud);

// Registro administra escuelas. Bienestar puede consultarlas para
// utilizar los filtros académicos de egresados.
router.get("/", permitirRoles("registro", "bienestar"), obtenerEscuelas);
router.get("/:id", permitirRoles("registro", "bienestar"), obtenerEscuelaPorId);
router.post("/", permitirRoles("registro"), crearEscuela);
router.put("/:id", permitirRoles("registro"), actualizarEscuela);
router.delete("/:id", permitirRoles("registro"), eliminarEscuela);

module.exports = router;
