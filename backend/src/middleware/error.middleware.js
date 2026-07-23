function manejarError(error, solicitud, respuesta, siguiente) {
    console.error(error);

    respuesta.status(500).json({
        exito: false,
        mensaje: "Ocurrió un error interno",
        errores: []
    });
}

module.exports = {
    manejarError
};
