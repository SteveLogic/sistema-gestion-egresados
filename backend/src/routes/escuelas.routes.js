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
router.use(permitirRoles("registro"));

router.get("/", obtenerEscuelas);
router.get("/:id", obtenerEscuelaPorId);
router.post("/", crearEscuela);
router.put("/:id", actualizarEscuela);
router.delete("/:id", eliminarEscuela);

module.exports = router;
