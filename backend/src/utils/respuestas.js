function crearRespuestaExitosa(mensaje, datos = null) {
    return {
        exito: true,
        mensaje,
        datos
    };
}

function crearRespuestaError(mensaje, errores = []) {
    return {
        exito: false,
        mensaje,
        errores
    };
}

module.exports = {
    crearRespuestaExitosa,
    crearRespuestaError
};
