const actividades = require("../data/actividades.data");
const { generarId } = require("../utils/generar-id");

function crearError(mensaje, estado = 400, errores = []) {
    const error = new Error(mensaje);
    error.estado = estado;
    error.errores = errores;
    return error;
}

function limpiarTexto(valor) {
    return String(valor ?? "").trim();
}

function normalizarTexto(valor) {
    return limpiarTexto(valor)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

function obtenerValorCanonico(valor, opciones, nombreCampo) {
    const normalizado = normalizarTexto(valor);
    const encontrado = opciones.find(
        (opcion) => normalizarTexto(opcion) === normalizado
    );

    if (!encontrado) {
        throw crearError(
            `${nombreCampo} no es válido`,
            400,
            [`Valores permitidos: ${opciones.join(", ")}`]
        );
    }

    return encontrado;
}

function buscarActividadInternaPorId(id) {
    return actividades.find((actividad) => actividad.id === id);
}

function obtenerActividades() {
    return actividades.map((actividad) => ({ ...actividad }));
}

function buscarActividadPorId(id) {
    const actividad = buscarActividadInternaPorId(id);
    return actividad ? { ...actividad } : null;
}

function validarDuplicado(datos, idActual = "") {
    const duplicada = actividades.some(
        (actividad) =>
            actividad.id !== idActual &&
            normalizarTexto(actividad.titulo) ===
                normalizarTexto(datos.titulo) &&
            actividad.fecha === datos.fecha &&
            actividad.hora === datos.hora
    );

    if (duplicada) {
        throw crearError(
            "Ya existe una actividad con el mismo título, fecha y hora",
            409
        );
    }
}

function construirDatosActividad(datos, actividadAnterior = null) {
    const cupoMaximo = Number(datos.cupoMaximo);
    const personasInscritas = Number(datos.personasInscritas ?? 0);

    if (personasInscritas > cupoMaximo) {
        throw crearError(
            "La cantidad de personas inscritas no puede superar el cupo máximo"
        );
    }

    return {
        titulo: limpiarTexto(datos.titulo),
        descripcion: limpiarTexto(datos.descripcion),
        fecha: limpiarTexto(datos.fecha),
        hora: limpiarTexto(datos.hora),
        modalidad: obtenerValorCanonico(
            datos.modalidad,
            ["Presencial", "Virtual", "Híbrida"],
            "La modalidad"
        ),
        ubicacion: limpiarTexto(datos.ubicacion),
        publicoObjetivo: obtenerValorCanonico(
            datos.publicoObjetivo,
            [
                "Todos los egresados",
                "Área de software",
                "Área de ciberseguridad",
                "Área de ciencia de datos",
                "Personas mentoras"
            ],
            "El público objetivo"
        ),
        cupoMaximo,
        personasInscritas,
        estado: obtenerValorCanonico(
            datos.estado,
            ["Borrador", "Publicada", "Finalizada", "Cancelada"],
            "El estado"
        ),
        responsable: limpiarTexto(datos.responsable),
        enlace: limpiarTexto(datos.enlace),
        fechaCreacion:
            actividadAnterior?.fechaCreacion ||
            new Date().toISOString()
    };
}

function crearActividad(datos) {
    validarDuplicado(datos);

    const actividad = {
        id: generarId("act"),
        ...construirDatosActividad(datos)
    };

    actividades.push(actividad);
    return { ...actividad };
}

function actualizarActividad(id, datos) {
    const actividad = buscarActividadInternaPorId(id);

    if (!actividad) {
        return null;
    }

    validarDuplicado(datos, id);

    Object.assign(
        actividad,
        construirDatosActividad(datos, actividad)
    );

    return { ...actividad };
}

function eliminarActividad(id) {
    const indice = actividades.findIndex(
        (actividad) => actividad.id === id
    );

    if (indice === -1) {
        return null;
    }

    const [actividadEliminada] = actividades.splice(indice, 1);
    return { ...actividadEliminada };
}

module.exports = {
    obtenerActividades,
    buscarActividadPorId,
    crearActividad,
    actualizarActividad,
    eliminarActividad
};
