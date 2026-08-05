const express = require("express");

const egresadosController = require(
    "../controllers/egresados.controller"
);

const router = express.Router();


/*
    GET /api/egresados
    Consultar todos los egresados
*/

router.get(
    "/",
    egresadosController.obtenerEgresados
);


/*
    GET /api/egresados/:id
    Consultar un egresado por ID
*/

router.get(
    "/:id",
    egresadosController.obtenerEgresadoPorId
);


/*
    POST /api/egresados/importar
    Importar varios egresados desde un archivo CSV
*/

router.post(
    "/importar",
    egresadosController.importarEgresados
);


/*
    POST /api/egresados
    Registrar un egresado
*/

router.post(
    "/",
    egresadosController.crearEgresado
);


/*
    PUT /api/egresados/:id
    Actualizar un egresado
*/

router.put(
    "/:id",
    egresadosController.actualizarEgresado
);


/*
    DELETE /api/egresados/:id
    Eliminar un egresado
*/

router.delete(
    "/:id",
    egresadosController.eliminarEgresado
);


module.exports = router;