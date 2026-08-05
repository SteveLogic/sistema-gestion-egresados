const express = require("express");

const titulosController = require(
    "../controllers/titulos.controller"
);

const router = express.Router();


/*
    GET /api/titulos
    Consultar todos los títulos
*/

router.get(
    "/",
    titulosController.obtenerTitulos
);


/*
    GET /api/titulos/egresado/:egresadoId
    Consultar los títulos de un egresado
*/

router.get(
    "/egresado/:egresadoId",
    titulosController.obtenerTitulosPorEgresado
);


/*
    GET /api/titulos/:id
    Consultar un título por ID
*/

router.get(
    "/:id",
    titulosController.obtenerTituloPorId
);


/*
    POST /api/titulos
    Registrar un título
*/

router.post(
    "/",
    titulosController.crearTitulo
);


/*
    PUT /api/titulos/:id
    Actualizar un título
*/

router.put(
    "/:id",
    titulosController.actualizarTitulo
);


/*
    DELETE /api/titulos/:id
    Eliminar un título
*/

router.delete(
    "/:id",
    titulosController.eliminarTitulo
);


module.exports = router;