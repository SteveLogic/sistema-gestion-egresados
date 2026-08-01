const escuelas = require("../data/escuelas.data");
const { generarId } = require("../utils/generar-id");

function obtenerEscuelas() {
    return escuelas;
}

function buscarEscuelaPorId(id) {
    return escuelas.find(
        (escuela) => escuela.id === id
    );
}

function existeEscuelaConCodigo(
    codigo,
    idExcluir = null
) {
    const codigoNormalizado =
        codigo.trim().toUpperCase();

    return escuelas.some((escuela) => {
        const mismoCodigo =
            escuela.codigo.trim().toUpperCase() ===
            codigoNormalizado;

        const diferenteId =
            escuela.id !== idExcluir;

        return mismoCodigo && diferenteId;
    });
}

function existeEscuelaConNombre(
    nombre,
    idExcluir = null
) {
    const nombreNormalizado =
        nombre.trim().toLowerCase();

    return escuelas.some((escuela) => {
        const mismoNombre =
            escuela.nombre.trim().toLowerCase() ===
            nombreNormalizado;

        const diferenteId =
            escuela.id !== idExcluir;

        return mismoNombre && diferenteId;
    });
}

function existeEscuelaConCorreo(
    correo,
    idExcluir = null
) {
    const correoNormalizado =
        correo.trim().toLowerCase();

    return escuelas.some((escuela) => {
        const mismoCorreo =
            escuela.correo.trim().toLowerCase() ===
            correoNormalizado;

        const diferenteId =
            escuela.id !== idExcluir;

        return mismoCorreo && diferenteId;
    });
}

function crearEscuela(datosEscuela) {
    if (
        existeEscuelaConCodigo(
            datosEscuela.codigo
        )
    ) {
        throw new Error(
            "Ya existe una escuela con ese código"
        );
    }

    if (
        existeEscuelaConNombre(
            datosEscuela.nombre
        )
    ) {
        throw new Error(
            "Ya existe una escuela con ese nombre"
        );
    }

    if (
        existeEscuelaConCorreo(
            datosEscuela.correo
        )
    ) {
        throw new Error(
            "Ya existe una escuela con ese correo"
        );
    }

    const nuevaEscuela = {
        id: generarId("esc"),
        codigo:
            datosEscuela.codigo
                .trim()
                .toUpperCase(),
        nombre: datosEscuela.nombre.trim(),
        responsable:
            datosEscuela.responsable.trim(),
        correo:
            datosEscuela.correo
                .trim()
                .toLowerCase(),
        telefono:
            datosEscuela.telefono.trim(),
        descripcion:
            datosEscuela.descripcion.trim(),
        estado: datosEscuela.estado
    };

    escuelas.push(nuevaEscuela);

    return nuevaEscuela;
}

function actualizarEscuela(
    id,
    datosEscuela
) {
    const escuela = buscarEscuelaPorId(id);

    if (!escuela) {
        return null;
    }

    if (
        existeEscuelaConCodigo(
            datosEscuela.codigo,
            id
        )
    ) {
        throw new Error(
            "Ya existe otra escuela con ese código"
        );
    }

    if (
        existeEscuelaConNombre(
            datosEscuela.nombre,
            id
        )
    ) {
        throw new Error(
            "Ya existe otra escuela con ese nombre"
        );
    }

    if (
        existeEscuelaConCorreo(
            datosEscuela.correo,
            id
        )
    ) {
        throw new Error(
            "Ya existe otra escuela con ese correo"
        );
    }

    escuela.codigo =
        datosEscuela.codigo
            .trim()
            .toUpperCase();

    escuela.nombre =
        datosEscuela.nombre.trim();

    escuela.responsable =
        datosEscuela.responsable.trim();

    escuela.correo =
        datosEscuela.correo
            .trim()
            .toLowerCase();

    escuela.telefono =
        datosEscuela.telefono.trim();

    escuela.descripcion =
        datosEscuela.descripcion.trim();

    escuela.estado =
        datosEscuela.estado;

    return escuela;
}

function eliminarEscuela(id) {
    const indice = escuelas.findIndex(
        (escuela) => escuela.id === id
    );

    if (indice === -1) {
        return null;
    }

    const escuelasEliminadas =
        escuelas.splice(indice, 1);

    return escuelasEliminadas[0];
}

module.exports = {
    obtenerEscuelas,
    buscarEscuelaPorId,
    crearEscuela,
    actualizarEscuela,
    eliminarEscuela
};