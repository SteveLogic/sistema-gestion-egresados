const Actividad = require("../models/actividad.model");
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

function escaparRegex(texto) {
    return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function patronExacto(texto) {
    return new RegExp(`^${escaparRegex(limpiarTexto(texto))}$`, "i");
}

function limpiarDocumento(documento) {
    if (!documento) return null;

    const objeto = typeof documento.toObject === "function"
        ? documento.toObject()
        : { ...documento };

    delete objeto._id;
    delete objeto.createdAt;
    delete objeto.updatedAt;

    return objeto;
}

async function obtenerActividades() {
    return Actividad.find()
        .select("-_id -createdAt -updatedAt")
        .sort({ id: 1 })
        .lean();
}

async function buscarActividadPorId(id) {
    return Actividad.findOne({ id })
        .select("-_id -createdAt -updatedAt")
        .lean();
}

async function validarDuplicado(datos, idActual = "") {
    const filtro = {
        titulo: patronExacto(datos.titulo),
        fecha: limpiarTexto(datos.fecha),
        hora: limpiarTexto(datos.hora)
    };

    if (idActual) {
        filtro.id = { $ne: idActual };
    }

    if (await Actividad.exists(filtro)) {
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
            actividadAnterior?.fechaCreacion || new Date().toISOString()
    };
}

async function crearActividad(datos) {
    await validarDuplicado(datos);

    const actividad = await Actividad.create({
        id: generarId("act"),
        ...construirDatosActividad(datos)
    });

    return limpiarDocumento(actividad);
}

async function actualizarActividad(id, datos) {
    const actividad = await Actividad.findOne({ id });

    if (!actividad) return null;

    await validarDuplicado(datos, id);

    Object.assign(
        actividad,
        construirDatosActividad(datos, actividad)
    );

    await actividad.save();
    return limpiarDocumento(actividad);
}

async function eliminarActividad(id) {
    const actividad = await Actividad.findOneAndDelete({ id });
    return limpiarDocumento(actividad);
}

module.exports = {
    obtenerActividades,
    buscarActividadPorId,
    crearActividad,
    actualizarActividad,
    eliminarActividad
};
