const usuarios = require("../data/usuarios.data");

function limpiarTexto(valor) {
    return String(valor ?? "").trim();
}

function normalizarCorreo(correo) {
    return limpiarTexto(correo).toLowerCase();
}

function normalizarRol(rol) {
    return limpiarTexto(rol).toLowerCase();
}

function autenticarUsuario({ correo, contrasena, rol }) {
    const correoNormalizado = normalizarCorreo(correo);
    const rolNormalizado = normalizarRol(rol);
    const contrasenaRecibida = String(contrasena ?? "");

    const usuario = usuarios.find(
        (elemento) =>
            normalizarCorreo(elemento.correo) === correoNormalizado &&
            elemento.contrasena === contrasenaRecibida &&
            normalizarRol(elemento.rol) === rolNormalizado
    );

    if (!usuario) {
        return null;
    }

    return {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        nombreRol: usuario.nombreRol,
        dashboard: usuario.dashboard,
        egresadoId: usuario.egresadoId
    };
}

module.exports = {
    autenticarUsuario
};
