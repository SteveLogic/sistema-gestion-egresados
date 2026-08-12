const express = require("express");
const {
    obtenerCarreras,
    obtenerCarreraPorId,
    crearCarrera,
    actualizarCarrera,
    eliminarCarrera
} = require("../controllers/carreras.controller");
const { autenticarSolicitud } = require("../middleware/auth.middleware");
const { permitirRoles } = require("../middleware/roles.middleware");

const router = express.Router();

router.use(autenticarSolicitud);

// Registro administra carreras. Bienestar puede consultarlas para
// utilizar los filtros académicos de egresados.
router.get("/", permitirRoles("registro", "bienestar"), obtenerCarreras);
router.get("/:id", permitirRoles("registro", "bienestar"), obtenerCarreraPorId);
router.post("/", permitirRoles("registro"), crearCarrera);
router.put("/:id", permitirRoles("registro"), actualizarCarrera);
router.delete("/:id", permitirRoles("registro"), eliminarCarrera);

module.exports = router;
