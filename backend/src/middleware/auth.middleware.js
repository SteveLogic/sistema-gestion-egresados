const {
    verificarToken
} = require("../utils/token.util");

function autenticarSolicitud(solicitud, respuesta, siguiente) {
    const encabezado = String(
        solicitud.headers.authorization || ""
    ).trim();

    if (!encabezado.toLowerCase().startsWith("bearer ")) {
        return respuesta.status(401).json({
            exito: false,
            mensaje: "Debe iniciar sesión para utilizar esta funcionalidad.",
            errores: []
        });
    }

    const token = encabezado.slice(7).trim();

    try {
        const datos = verificarToken(token);

        solicitud.usuario = {
            id: datos.sub,
            rol: datos.rol,
            egresadoId: datos.egresadoId || null
        };

        return siguiente();
    } catch (error) {
        return respuesta.status(401).json({
            exito: false,
            mensaje: error.message || "La sesión no es válida.",
            errores: []
        });
    }
}

module.exports = {
    autenticarSolicitud
};
