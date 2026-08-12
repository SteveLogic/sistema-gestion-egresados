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
router.use(permitirRoles("registro"));

router.get("/", obtenerCarreras);
router.get("/:id", obtenerCarreraPorId);
router.post("/", crearCarrera);
router.put("/:id", actualizarCarrera);
router.delete("/:id", eliminarCarrera);

module.exports = router;
