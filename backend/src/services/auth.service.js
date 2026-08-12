const Usuario = require("../models/usuario.model");
const {
    verificarContrasena
} = require("../utils/password.util");

function limpiarTexto(valor) {
    return String(valor ?? "").trim();
}

function normalizarCorreo(correo) {
    return limpiarTexto(correo).toLowerCase();
}

function normalizarRol(rol) {
    return limpiarTexto(rol).toLowerCase();
}

async function autenticarUsuario({ correo, contrasena, rol }) {
    const correoNormalizado = normalizarCorreo(correo);
    const rolNormalizado = normalizarRol(rol);

    const usuario = await Usuario.findOne({
        correo: correoNormalizado,
        rol: rolNormalizado,
        activo: true
    }).lean();

    if (!usuario) {
        return null;
    }

    const contrasenaValida = verificarContrasena(
        contrasena,
        usuario.contrasenaSalt,
        usuario.contrasenaHash
    );

    if (!contrasenaValida) {
        return null;
    }

    return {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        nombreRol: usuario.nombreRol,
        dashboard: usuario.dashboard,
        egresadoId: usuario.egresadoId ?? null
    };
}

module.exports = {
    autenticarUsuario
};
