const authService = require("../services/auth.service");

const ROLES_PERMITIDOS = ["registro", "bienestar", "egresado"];

function validarDatosInicioSesion(datos) {
    const errores = [];
    const correo = String(datos.correo ?? "").trim();
    const contrasena = String(datos.contrasena ?? "");
    const rol = String(datos.rol ?? "").trim().toLowerCase();

    if (!correo) {
        errores.push("El correo electrónico es obligatorio.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        errores.push("El correo electrónico no tiene un formato válido.");
    }

    if (!contrasena) {
        errores.push("La contraseña es obligatoria.");
    }

    if (!ROLES_PERMITIDOS.includes(rol)) {
        errores.push("Debe seleccionar un tipo de usuario válido.");
    }

    return errores;
}

function iniciarSesion(solicitud, respuesta) {
    const errores = validarDatosInicioSesion(solicitud.body || {});

    if (errores.length > 0) {
        return respuesta.status(400).json({
            exito: false,
            mensaje: "Los datos de inicio de sesión no son válidos.",
            errores
        });
    }

    const usuario = authService.autenticarUsuario(solicitud.body);

    if (!usuario) {
        return respuesta.status(401).json({
            exito: false,
            mensaje: "El correo, la contraseña o el rol no coinciden.",
            errores: []
        });
    }

    return respuesta.status(200).json({
        exito: true,
        mensaje: "Inicio de sesión correcto.",
        datos: usuario
    });
}

module.exports = {
    iniciarSesion
};
