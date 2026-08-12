function responderSinPermiso(respuesta) {
    return respuesta.status(403).json({
        exito: false,
        mensaje: "Tu rol no tiene permiso para realizar esta operación.",
        errores: []
    });
}

function permitirRoles(...rolesPermitidos) {
    return function validarRol(solicitud, respuesta, siguiente) {
        if (
            solicitud.usuario &&
            rolesPermitidos.includes(solicitud.usuario.rol)
        ) {
            return siguiente();
        }

        return responderSinPermiso(respuesta);
    };
}

function permitirEgresadoPropio(parametro, ...rolesAdicionales) {
    return function validarPropiedad(solicitud, respuesta, siguiente) {
        const usuario = solicitud.usuario;

        if (!usuario) {
            return responderSinPermiso(respuesta);
        }

        if (rolesAdicionales.includes(usuario.rol)) {
            return siguiente();
        }

        if (
            usuario.rol === "egresado" &&
            usuario.egresadoId &&
            solicitud.params[parametro] === usuario.egresadoId
        ) {
            return siguiente();
        }

        return responderSinPermiso(respuesta);
    };
}

function permitirEgresadoBodyPropio(campo, ...rolesAdicionales) {
    return function validarPropiedadBody(solicitud, respuesta, siguiente) {
        const usuario = solicitud.usuario;

        if (!usuario) {
            return responderSinPermiso(respuesta);
        }

        if (rolesAdicionales.includes(usuario.rol)) {
            return siguiente();
        }

        if (
            usuario.rol === "egresado" &&
            usuario.egresadoId &&
            String(solicitud.body?.[campo] || "") === usuario.egresadoId
        ) {
            return siguiente();
        }

        return responderSinPermiso(respuesta);
    };
}

module.exports = {
    permitirRoles,
    permitirEgresadoPropio,
    permitirEgresadoBodyPropio
};
