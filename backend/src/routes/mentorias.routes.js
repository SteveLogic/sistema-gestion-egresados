const express = require("express");

const mentoriasController = require(
    "../controllers/mentorias.controller"
);

const router = express.Router();

router.get(
    "/mentores",
    mentoriasController.obtenerMentores
);
router.get(
    "/mentores/:id",
    mentoriasController.obtenerMentorPorId
);
router.post(
    "/mentores",
    mentoriasController.crearMentor
);
router.put(
    "/mentores/:id",
    mentoriasController.actualizarMentor
);
router.delete(
    "/mentores/:id",
    mentoriasController.eliminarMentor
);

router.get(
    "/solicitudes",
    mentoriasController.obtenerSolicitudes
);
router.get(
    "/solicitudes/:id",
    mentoriasController.obtenerSolicitudPorId
);
router.post(
    "/solicitudes",
    mentoriasController.crearSolicitud
);
router.put(
    "/solicitudes/:id",
    mentoriasController.actualizarSolicitud
);
router.post(
    "/solicitudes/:id/asignar",
    mentoriasController.asignarMentor
);
router.delete(
    "/solicitudes/:id",
    mentoriasController.eliminarSolicitud
);

router.get("/", mentoriasController.obtenerMentorias);
router.get("/:id", mentoriasController.obtenerMentoriaPorId);
router.post("/", mentoriasController.crearMentoria);
router.put("/:id", mentoriasController.actualizarMentoria);
router.delete("/:id", mentoriasController.eliminarMentoria);

module.exports = router;
