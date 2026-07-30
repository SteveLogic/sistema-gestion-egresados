// Lógica de negocio del módulo de carreras
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

function crearCarrera(datosCarrera) {
    if (existeCarreraConNombre(datosCarrera.nombre)) {
        throw new Error("Ya existe una carrera con ese nombre");
    }

    const nuevaCarrera = {
        id: generarId("car"),
        nombre: datosCarrera.nombre.trim(),
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
        throw new Error("Ya existe otra carrera con ese nombre");
    }

    carrera.nombre = datosCarrera.nombre.trim();
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