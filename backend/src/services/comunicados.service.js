const Comunicado = require("../models/comunicado.model");
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

function obtenerEstadoCanonico(valor) {
    const mapa = {
        borrador: "Borrador",
        publicado: "Publicado",
        archivado: "Archivado"
    };

    return mapa[normalizarTexto(valor)] || limpiarTexto(valor);
}

function obtenerPublicoCanonico(valor) {
    const mapa = {
        "todos los egresados": "Todos los egresados",
        "personas mentoras": "Personas mentoras",
        "area de software": "Área de software",
        "area de ciberseguridad": "Área de ciberseguridad",
        "area de ciencia de datos": "Área de ciencia de datos",
        "area de redes": "Área de redes"
    };

    return mapa[normalizarTexto(valor)] || limpiarTexto(valor);
}

function convertirBooleano(valor) {
    if (typeof valor === "boolean") return valor;

    const texto = normalizarTexto(valor);
    return ["true", "1", "si", "sí", "on"].includes(texto);
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

async function obtenerComunicados() {
    return Comunicado.find()
        .select("-_id -createdAt -updatedAt")
        .sort({ id: 1 })
        .lean();
}

async function buscarComunicadoPorId(id) {
    return Comunicado.findOne({ id })
        .select("-_id -createdAt -updatedAt")
        .lean();
}

async function existeTituloDuplicado(titulo, idExcluir = "") {
    const filtro = { titulo: patronExacto(titulo) };

    if (idExcluir) {
        filtro.id = { $ne: idExcluir };
    }

    return Boolean(await Comunicado.exists(filtro));
}

function prepararDatos(datos) {
    return {
        titulo: limpiarTexto(datos.titulo),
        resumen: limpiarTexto(datos.resumen),
        contenido: limpiarTexto(datos.contenido),
        publicoObjetivo: obtenerPublicoCanonico(datos.publicoObjetivo),
        autor: limpiarTexto(datos.autor),
        fechaPublicacion: limpiarTexto(datos.fechaPublicacion),
        estado: obtenerEstadoCanonico(datos.estado),
        destacado: convertirBooleano(datos.destacado),
        paginaPublica: convertirBooleano(datos.paginaPublica),
        enlace: limpiarTexto(datos.enlace)
    };
}

function crearErrorDuplicado(mensaje) {
    const error = new Error(mensaje);
    error.codigo = "DUPLICADO";
    return error;
}

function traducirErrorDuplicado(error, mensaje) {
    if (error && error.code === 11000) {
        throw crearErrorDuplicado(mensaje);
    }

    throw error;
}

async function crearComunicado(datos) {
    if (await existeTituloDuplicado(datos.titulo)) {
        throw crearErrorDuplicado("Ya existe un comunicado con ese título");
    }

    try {
        const comunicado = await Comunicado.create({
            id: generarId("cmd"),
            ...prepararDatos(datos)
        });

        return limpiarDocumento(comunicado);
    } catch (error) {
        traducirErrorDuplicado(
            error,
            "Ya existe un comunicado con ese título"
        );
    }
}

async function actualizarComunicado(id, datos) {
    const comunicado = await Comunicado.findOne({ id });

    if (!comunicado) return null;

    if (await existeTituloDuplicado(datos.titulo, id)) {
        throw crearErrorDuplicado("Ya existe otro comunicado con ese título");
    }

    Object.assign(comunicado, prepararDatos(datos));

    try {
        await comunicado.save();
        return limpiarDocumento(comunicado);
    } catch (error) {
        traducirErrorDuplicado(
            error,
            "Ya existe otro comunicado con ese título"
        );
    }
}

async function eliminarComunicado(id) {
    const comunicado = await Comunicado.findOneAndDelete({ id });
    return limpiarDocumento(comunicado);
}

module.exports = {
    obtenerComunicados,
    buscarComunicadoPorId,
    crearComunicado,
    actualizarComunicado,
    eliminarComunicado
};
