const crypto = require("crypto");

const DURACION_TOKEN_SEGUNDOS = 8 * 60 * 60;

function obtenerSecreto() {
    const secreto = String(process.env.SESSION_SECRET || "").trim();

    if (secreto.length < 16) {
        throw new Error(
            "SESSION_SECRET debe estar definida en .env y contener al menos 16 caracteres."
        );
    }

    return secreto;
}

function firmar(contenido) {
    return crypto
        .createHmac("sha256", obtenerSecreto())
        .update(contenido)
        .digest("base64url");
}

function generarToken(usuario) {
    const ahora = Math.floor(Date.now() / 1000);

    const payload = {
        sub: usuario.id,
        rol: usuario.rol,
        egresadoId: usuario.egresadoId || null,
        iat: ahora,
        exp: ahora + DURACION_TOKEN_SEGUNDOS
    };

    const contenido = Buffer
        .from(JSON.stringify(payload), "utf8")
        .toString("base64url");

    return `${contenido}.${firmar(contenido)}`;
}

function verificarToken(token) {
    const [contenido, firmaRecibida, extra] = String(token || "").split(".");

    if (!contenido || !firmaRecibida || extra !== undefined) {
        throw new Error("Token de sesión inválido.");
    }

    const firmaEsperada = firmar(contenido);
    const bufferRecibido = Buffer.from(firmaRecibida, "utf8");
    const bufferEsperado = Buffer.from(firmaEsperada, "utf8");

    if (
        bufferRecibido.length !== bufferEsperado.length ||
        !crypto.timingSafeEqual(bufferRecibido, bufferEsperado)
    ) {
        throw new Error("La firma del token no es válida.");
    }

    let payload;

    try {
        payload = JSON.parse(
            Buffer.from(contenido, "base64url").toString("utf8")
        );
    } catch {
        throw new Error("El contenido del token no es válido.");
    }

    const ahora = Math.floor(Date.now() / 1000);

    if (!payload.sub || !payload.rol || !payload.exp || payload.exp <= ahora) {
        throw new Error("La sesión ha expirado o no es válida.");
    }

    return payload;
}

module.exports = {
    generarToken,
    verificarToken
};
