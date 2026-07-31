const carreras = require("../data/carreras.data");
const { generarId } = require("../utils/generar-id");

function obtenerCarreras() {
    return carreras;
}

function buscarCarreraPorId(id) {
    return carreras.find((carrera) => carrera.id === id);
}

function existeCarreraConNombre(nombre, idExcluir = null) {
    const nombreNormalizado = nombre.trim().toLowerCase();

    return carreras.some((carrera) => {
        const mismoNombre =
            carrera.nombre.trim().toLowerCase() === nombreNormalizado;

        const diferenteId = carrera.id !== idExcluir;

        return mismoNombre && diferenteId;
    });
}

function existeCarreraConCodigo(codigo, idExcluir = null) {
    const codigoNormalizado = codigo.trim().toUpperCase();

    return carreras.some((carrera) => {
        const mismoCodigo =
            carrera.codigo.trim().toUpperCase() === codigoNormalizado;

        const diferenteId = carrera.id !== idExcluir;

        return mismoCodigo && diferenteId;
    });
}

function crearCarrera(datosCarrera) {
    if (existeCarreraConNombre(datosCarrera.nombre)) {
        throw new Error(
            "Ya existe una carrera con ese nombre"
        );
    }

    if (existeCarreraConCodigo(datosCarrera.codigo)) {
        throw new Error(
            "Ya existe una carrera con ese código"
        );
    }

    const nuevaCarrera = {
        id: generarId("car"),
        codigo: datosCarrera.codigo.trim().toUpperCase(),
        nombre: datosCarrera.nombre.trim(),
        escuela: datosCarrera.escuela.trim(),
        descripcion: datosCarrera.descripcion.trim(),
        estado: datosCarrera.estado
    };

    carreras.push(nuevaCarrera);

    return nuevaCarrera;
}

function actualizarCarrera(id, datosCarrera) {
    const carrera = buscarCarreraPorId(id);

    if (!carrera) {
        return null;
    }

    if (existeCarreraConNombre(datosCarrera.nombre, id)) {
        throw new Error(
            "Ya existe otra carrera con ese nombre"
        );
    }

    if (existeCarreraConCodigo(datosCarrera.codigo, id)) {
        throw new Error(
            "Ya existe otra carrera con ese código"
        );
    }

    carrera.codigo =
        datosCarrera.codigo.trim().toUpperCase();

    carrera.nombre = datosCarrera.nombre.trim();
    carrera.escuela = datosCarrera.escuela.trim();
    carrera.descripcion = datosCarrera.descripcion.trim();
    carrera.estado = datosCarrera.estado;

    return carrera;
}

function eliminarCarrera(id) {
    const indice = carreras.findIndex(
        (carrera) => carrera.id === id
    );

    if (indice === -1) {
        return null;
    }

    const carrerasEliminadas = carreras.splice(indice, 1);

    return carrerasEliminadas[0];
}

module.exports = {
    obtenerCarreras,
    buscarCarreraPorId,
    crearCarrera,
    actualizarCarrera,
    eliminarCarrera
};