const oportunidades = require("../data/oportunidades.data");
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

function buscarOportunidadPorId(id) {
    return oportunidades.find((oportunidad) => oportunidad.id === id) || null;
}

function existeDuplicado(datos, idExcluir = "") {
    const empresa = normalizarTexto(datos.empresa);
    const puesto = normalizarTexto(datos.puesto);
    const fecha = limpiarTexto(datos.fechaPublicacion);

    return oportunidades.some(
        (oportunidad) =>
            oportunidad.id !== idExcluir &&
            normalizarTexto(oportunidad.empresa) === empresa &&
            normalizarTexto(oportunidad.puesto) === puesto &&
            oportunidad.fechaPublicacion === fecha
    );
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

function obtenerOportunidades() {
    return oportunidades.map((oportunidad) => ({ ...oportunidad }));
}

function crearOportunidad(datos) {
    if (existeDuplicado(datos)) {
        const error = new Error(
            "Ya existe una oportunidad de esa empresa y puesto con la misma fecha de publicación"
        );
        error.codigo = "DUPLICADO";
        throw error;
    }

    const nuevaOportunidad = {
        id: generarId("opo"),
        ...prepararDatos(datos)
    };

    oportunidades.push(nuevaOportunidad);
    return { ...nuevaOportunidad };
}

function actualizarOportunidad(id, datos) {
    const indice = oportunidades.findIndex(
        (oportunidad) => oportunidad.id === id
    );

    if (indice === -1) {
        return null;
    }

    if (existeDuplicado(datos, id)) {
        const error = new Error(
            "Ya existe otra oportunidad de esa empresa y puesto con la misma fecha de publicación"
        );
        error.codigo = "DUPLICADO";
        throw error;
    }

    oportunidades[indice] = {
        id,
        ...prepararDatos(datos)
    };

    return { ...oportunidades[indice] };
}

function eliminarOportunidad(id) {
    const indice = oportunidades.findIndex(
        (oportunidad) => oportunidad.id === id
    );

    if (indice === -1) {
        return null;
    }

    const [eliminada] = oportunidades.splice(indice, 1);
    return { ...eliminada };
}

module.exports = {
    obtenerOportunidades,
    buscarOportunidadPorId,
    crearOportunidad,
    actualizarOportunidad,
    eliminarOportunidad
};
