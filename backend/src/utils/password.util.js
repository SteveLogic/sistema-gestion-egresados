const crypto = require("crypto");

const LONGITUD_HASH = 64;

function generarSalt() {
    return crypto.randomBytes(16).toString("hex");
}

function generarHashContrasena(contrasena, salt) {
    return crypto
        .scryptSync(String(contrasena ?? ""), salt, LONGITUD_HASH)
        .toString("hex");
}

function prepararContrasena(contrasena) {
    const salt = generarSalt();

    return {
        salt,
        hash: generarHashContrasena(contrasena, salt)
    };
}

function verificarContrasena(contrasena, salt, hashGuardado) {
    if (!salt || !hashGuardado) {
        return false;
    }

    const hashRecibido = generarHashContrasena(contrasena, salt);
    const recibido = Buffer.from(hashRecibido, "hex");
    const guardado = Buffer.from(hashGuardado, "hex");

    if (recibido.length !== guardado.length) {
        return false;
    }

    return crypto.timingSafeEqual(recibido, guardado);
}

module.exports = {
    prepararContrasena,
    verificarContrasena
};
