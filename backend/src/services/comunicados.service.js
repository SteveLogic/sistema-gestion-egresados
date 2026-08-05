const comunicados = require("../data/comunicados.data");
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
    if (typeof valor === "boolean") {
        return valor;
    }

    const texto = normalizarTexto(valor);
    return ["true", "1", "si", "sí", "on"].includes(texto);
}

function buscarComunicadoPorId(id) {
    return comunicados.find((comunicado) => comunicado.id === id) || null;
}

function existeTituloDuplicado(titulo, idExcluir = "") {
    const tituloNormalizado = normalizarTexto(titulo);

    return comunicados.some(
        (comunicado) =>
            comunicado.id !== idExcluir &&
            normalizarTexto(comunicado.titulo) === tituloNormalizado
    );
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

function obtenerComunicados() {
    return comunicados.map((comunicado) => ({ ...comunicado }));
}

function crearComunicado(datos) {
    if (existeTituloDuplicado(datos.titulo)) {
        const error = new Error("Ya existe un comunicado con ese título");
        error.codigo = "DUPLICADO";
        throw error;
    }

    const nuevoComunicado = {
        id: generarId("cmd"),
        ...prepararDatos(datos)
    };

    comunicados.push(nuevoComunicado);
    return { ...nuevoComunicado };
}

function actualizarComunicado(id, datos) {
    const indice = comunicados.findIndex((comunicado) => comunicado.id === id);

    if (indice === -1) {
        return null;
    }

    if (existeTituloDuplicado(datos.titulo, id)) {
        const error = new Error("Ya existe otro comunicado con ese título");
        error.codigo = "DUPLICADO";
        throw error;
    }

    comunicados[indice] = {
        id,
        ...prepararDatos(datos)
    };

    return { ...comunicados[indice] };
}

function eliminarComunicado(id) {
    const indice = comunicados.findIndex((comunicado) => comunicado.id === id);

    if (indice === -1) {
        return null;
    }

    const [eliminado] = comunicados.splice(indice, 1);
    return { ...eliminado };
}

module.exports = {
    obtenerComunicados,
    buscarComunicadoPorId,
    crearComunicado,
    actualizarComunicado,
    eliminarComunicado
};
