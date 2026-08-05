const comunicadosService = require("../services/comunicados.service");

const ESTADOS = ["borrador", "publicado", "archivado"];
const PUBLICOS = [
    "todos los egresados",
    "personas mentoras",
    "area de software",
    "area de ciberseguridad",
    "area de ciencia de datos",
    "area de redes"
];

function normalizarTexto(valor) {
    return String(valor ?? "")
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

function fechaValida(valor) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
        return false;
    }

    const fecha = new Date(`${valor}T00:00:00`);
    return !Number.isNaN(fecha.getTime());
}

function urlValida(valor) {
    try {
        const url = new URL(valor);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

function validarDatosComunicado(datos) {
    const errores = [];
    const titulo = String(datos.titulo ?? "").trim();
    const resumen = String(datos.resumen ?? "").trim();
    const contenido = String(datos.contenido ?? "").trim();
    const publico = normalizarTexto(datos.publicoObjetivo);
    const autor = String(datos.autor ?? "").trim();
    const fecha = String(datos.fechaPublicacion ?? "").trim();
    const estado = normalizarTexto(datos.estado);
    const enlace = String(datos.enlace ?? "").trim();

    if (titulo.length < 5 || titulo.length > 150) {
        errores.push("El título debe contener entre 5 y 150 caracteres");
    }

    if (resumen.length < 10 || resumen.length > 300) {
        errores.push("El resumen debe contener entre 10 y 300 caracteres");
    }

    if (contenido.length < 20 || contenido.length > 3000) {
        errores.push("El contenido debe contener entre 20 y 3000 caracteres");
    }

    if (!PUBLICOS.includes(publico)) {
        errores.push("Seleccione un público objetivo válido");
    }

    if (autor.length < 3 || autor.length > 100) {
        errores.push("El autor debe contener entre 3 y 100 caracteres");
    }

    if (!ESTADOS.includes(estado)) {
        errores.push("El estado debe ser Borrador, Publicado o Archivado");
    }

    if (fecha && !fechaValida(fecha)) {
        errores.push("La fecha de publicación no es válida");
    }

    if (estado === "publicado" && !fecha) {
        errores.push("Los comunicados publicados requieren fecha de publicación");
    }

    if (enlace && !urlValida(enlace)) {
        errores.push("El enlace debe utilizar http o https");
    }

    return errores;
}

function obtenerComunicados(_solicitud, respuesta) {
    return respuesta.json({
        exito: true,
        mensaje: "Comunicados consultados correctamente",
        datos: comunicadosService.obtenerComunicados()
    });
}

function obtenerComunicadoPorId(solicitud, respuesta) {
    const comunicado = comunicadosService.buscarComunicadoPorId(solicitud.params.id);

    if (!comunicado) {
        return respuesta.status(404).json({
            exito: false,
            mensaje: "El comunicado no fue encontrado",
            errores: []
        });
    }

    return respuesta.json({
        exito: true,
        mensaje: "Comunicado consultado correctamente",
        datos: comunicado
    });
}

function crearComunicado(solicitud, respuesta) {
    const errores = validarDatosComunicado(solicitud.body);

    if (errores.length > 0) {
        return respuesta.status(400).json({
            exito: false,
            mensaje: "Los datos del comunicado no son válidos",
            errores
        });
    }

    try {
        const comunicado = comunicadosService.crearComunicado(solicitud.body);

        return respuesta.status(201).json({
            exito: true,
            mensaje: "Comunicado registrado correctamente",
            datos: comunicado
        });
    } catch (error) {
        const estado = error.codigo === "DUPLICADO" ? 409 : 500;
        return respuesta.status(estado).json({
            exito: false,
            mensaje: error.message || "No fue posible registrar el comunicado",
            errores: []
        });
    }
}

function actualizarComunicado(solicitud, respuesta) {
    const errores = validarDatosComunicado(solicitud.body);

    if (errores.length > 0) {
        return respuesta.status(400).json({
            exito: false,
            mensaje: "Los datos del comunicado no son válidos",
            errores
        });
    }

    try {
        const comunicado = comunicadosService.actualizarComunicado(
            solicitud.params.id,
            solicitud.body
        );

        if (!comunicado) {
            return respuesta.status(404).json({
                exito: false,
                mensaje: "El comunicado no fue encontrado",
                errores: []
            });
        }

        return respuesta.json({
            exito: true,
            mensaje: "Comunicado actualizado correctamente",
            datos: comunicado
        });
    } catch (error) {
        const estado = error.codigo === "DUPLICADO" ? 409 : 500;
        return respuesta.status(estado).json({
            exito: false,
            mensaje: error.message || "No fue posible actualizar el comunicado",
            errores: []
        });
    }
}

function eliminarComunicado(solicitud, respuesta) {
    const comunicado = comunicadosService.eliminarComunicado(solicitud.params.id);

    if (!comunicado) {
        return respuesta.status(404).json({
            exito: false,
            mensaje: "El comunicado no fue encontrado",
            errores: []
        });
    }

    return respuesta.json({
        exito: true,
        mensaje: "Comunicado eliminado correctamente",
        datos: comunicado
    });
}

module.exports = {
    obtenerComunicados,
    obtenerComunicadoPorId,
    crearComunicado,
    actualizarComunicado,
    eliminarComunicado
};
