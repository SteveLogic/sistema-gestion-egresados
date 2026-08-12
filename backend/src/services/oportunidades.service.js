const Oportunidad = require("../models/oportunidad.model");
const { generarId } = require("../utils/generar-id");

function limpiarTexto(valor) {
    return String(valor ?? "").trim();
}

function normalizarTexto(valor) {
    return limpiarTexto(valor)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

function obtenerAreaCanonica(valor) {
    const mapa = {
        "desarrollo de software": "Desarrollo de software",
        ciberseguridad: "Ciberseguridad",
        "ciencia de datos": "Ciencia de datos",
        "redes y telecomunicaciones": "Redes y telecomunicaciones",
        "soporte tecnico": "Soporte técnico",
        "gestion tecnologica": "Gestión tecnológica",
        "otra area": "Otra área"
    };

    return mapa[normalizarTexto(valor)] || limpiarTexto(valor);
}

function obtenerModalidadCanonica(valor) {
    const mapa = {
        presencial: "Presencial",
        remota: "Remota",
        hibrida: "Híbrida"
    };

    return mapa[normalizarTexto(valor)] || limpiarTexto(valor);
}

function obtenerEstadoCanonico(valor) {
    const mapa = {
        borrador: "Borrador",
        publicada: "Publicada",
        vencida: "Vencida",
        cerrada: "Cerrada"
    };

    return mapa[normalizarTexto(valor)] || limpiarTexto(valor);
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

async function obtenerOportunidades() {
    return Oportunidad.find()
        .select("-_id -createdAt -updatedAt")
        .sort({ id: 1 })
        .lean();
}

async function buscarOportunidadPorId(id) {
    return Oportunidad.findOne({ id })
        .select("-_id -createdAt -updatedAt")
        .lean();
}

async function existeDuplicado(datos, idExcluir = "") {
    const filtro = {
        empresa: patronExacto(datos.empresa),
        puesto: patronExacto(datos.puesto),
        fechaPublicacion: limpiarTexto(datos.fechaPublicacion)
    };

    if (idExcluir) {
        filtro.id = { $ne: idExcluir };
    }

    return Boolean(await Oportunidad.exists(filtro));
}

function prepararDatos(datos) {
    return {
        empresa: limpiarTexto(datos.empresa),
        puesto: limpiarTexto(datos.puesto),
        descripcion: limpiarTexto(datos.descripcion),
        areaProfesional: obtenerAreaCanonica(datos.areaProfesional),
        modalidad: obtenerModalidadCanonica(datos.modalidad),
        ubicacion: limpiarTexto(datos.ubicacion),
        fechaPublicacion: limpiarTexto(datos.fechaPublicacion),
        fechaVencimiento: limpiarTexto(datos.fechaVencimiento),
        correoContacto: limpiarTexto(datos.correoContacto).toLowerCase(),
        enlaceContacto: limpiarTexto(datos.enlaceContacto),
        estado: obtenerEstadoCanonico(datos.estado)
    };
}

function crearErrorDuplicado(mensaje) {
    const error = new Error(mensaje);
    error.codigo = "DUPLICADO";
    return error;
}

async function crearOportunidad(datos) {
    if (await existeDuplicado(datos)) {
        throw crearErrorDuplicado(
            "Ya existe una oportunidad de esa empresa y puesto con la misma fecha de publicación"
        );
    }

    const oportunidad = await Oportunidad.create({
        id: generarId("opo"),
        ...prepararDatos(datos)
    });

    return limpiarDocumento(oportunidad);
}

async function actualizarOportunidad(id, datos) {
    const oportunidad = await Oportunidad.findOne({ id });

    if (!oportunidad) return null;

    if (await existeDuplicado(datos, id)) {
        throw crearErrorDuplicado(
            "Ya existe otra oportunidad de esa empresa y puesto con la misma fecha de publicación"
        );
    }

    Object.assign(oportunidad, prepararDatos(datos));
    await oportunidad.save();

    return limpiarDocumento(oportunidad);
}

async function eliminarOportunidad(id) {
    const oportunidad = await Oportunidad.findOneAndDelete({ id });
    return limpiarDocumento(oportunidad);
}

module.exports = {
    obtenerOportunidades,
    buscarOportunidadPorId,
    crearOportunidad,
    actualizarOportunidad,
    eliminarOportunidad
};
