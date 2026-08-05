const oportunidadesService = require("../services/oportunidades.service");

const AREAS = [
    "desarrollo de software",
    "ciberseguridad",
    "ciencia de datos",
    "redes y telecomunicaciones",
    "soporte tecnico",
    "gestion tecnologica",
    "otra area"
];

const MODALIDADES = ["presencial", "remota", "hibrida"];
const ESTADOS = ["borrador", "publicada", "vencida", "cerrada"];

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

function correoValido(valor) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
}

function urlValida(valor) {
    try {
        const url = new URL(valor);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

function validarDatosOportunidad(datos) {
    const errores = [];
    const empresa = String(datos.empresa ?? "").trim();
    const puesto = String(datos.puesto ?? "").trim();
    const descripcion = String(datos.descripcion ?? "").trim();
    const area = normalizarTexto(datos.areaProfesional);
    const modalidad = normalizarTexto(datos.modalidad);
    const ubicacion = String(datos.ubicacion ?? "").trim();
    const fechaPublicacion = String(datos.fechaPublicacion ?? "").trim();
    const fechaVencimiento = String(datos.fechaVencimiento ?? "").trim();
    const correo = String(datos.correoContacto ?? "").trim();
    const enlace = String(datos.enlaceContacto ?? "").trim();
    const estado = normalizarTexto(datos.estado);

    if (empresa.length < 2 || empresa.length > 120) {
        errores.push("La empresa debe contener entre 2 y 120 caracteres");
    }

    if (puesto.length < 3 || puesto.length > 150) {
        errores.push("El puesto debe contener entre 3 y 150 caracteres");
    }

    if (descripcion.length < 20 || descripcion.length > 1500) {
        errores.push("La descripción debe contener entre 20 y 1500 caracteres");
    }

    if (!AREAS.includes(area)) {
        errores.push("Seleccione un área profesional válida");
    }

    if (!MODALIDADES.includes(modalidad)) {
        errores.push("La modalidad debe ser Presencial, Remota o Híbrida");
    }

    if (ubicacion.length < 2 || ubicacion.length > 150) {
        errores.push("La ubicación debe contener entre 2 y 150 caracteres");
    }

    if (!fechaValida(fechaPublicacion)) {
        errores.push("La fecha de publicación no es válida");
    }

    if (!fechaValida(fechaVencimiento)) {
        errores.push("La fecha de vencimiento no es válida");
    }

    if (
        fechaValida(fechaPublicacion) &&
        fechaValida(fechaVencimiento) &&
        fechaVencimiento < fechaPublicacion
    ) {
        errores.push(
            "La fecha de vencimiento no puede ser anterior a la fecha de publicación"
        );
    }

    if (!correo && !enlace) {
        errores.push("Registre al menos un correo o un enlace de contacto");
    }

    if (correo && !correoValido(correo)) {
        errores.push("El correo de contacto no tiene un formato válido");
    }

    if (enlace && !urlValida(enlace)) {
        errores.push("El enlace de contacto debe utilizar http o https");
    }

    if (!ESTADOS.includes(estado)) {
        errores.push("El estado debe ser Borrador, Publicada, Vencida o Cerrada");
    }

    return errores;
}

function obtenerOportunidades(_solicitud, respuesta) {
    return respuesta.json({
        exito: true,
        mensaje: "Oportunidades consultadas correctamente",
        datos: oportunidadesService.obtenerOportunidades()
    });
}

function obtenerOportunidadPorId(solicitud, respuesta) {
    const oportunidad = oportunidadesService.buscarOportunidadPorId(
        solicitud.params.id
    );

    if (!oportunidad) {
        return respuesta.status(404).json({
            exito: false,
            mensaje: "La oportunidad no fue encontrada",
            errores: []
        });
    }

    return respuesta.json({
        exito: true,
        mensaje: "Oportunidad consultada correctamente",
        datos: oportunidad
    });
}

function crearOportunidad(solicitud, respuesta) {
    const errores = validarDatosOportunidad(solicitud.body);

    if (errores.length > 0) {
        return respuesta.status(400).json({
            exito: false,
            mensaje: "Los datos de la oportunidad no son válidos",
            errores
        });
    }

    try {
        const oportunidad = oportunidadesService.crearOportunidad(
            solicitud.body
        );

        return respuesta.status(201).json({
            exito: true,
            mensaje: "Oportunidad registrada correctamente",
            datos: oportunidad
        });
    } catch (error) {
        if (error.codigo === "DUPLICADO") {
            return respuesta.status(409).json({
                exito: false,
                mensaje: error.message,
                errores: []
            });
        }

        throw error;
    }
}

function actualizarOportunidad(solicitud, respuesta) {
    const errores = validarDatosOportunidad(solicitud.body);

    if (errores.length > 0) {
        return respuesta.status(400).json({
            exito: false,
            mensaje: "Los datos de la oportunidad no son válidos",
            errores
        });
    }

    try {
        const oportunidad = oportunidadesService.actualizarOportunidad(
            solicitud.params.id,
            solicitud.body
        );

        if (!oportunidad) {
            return respuesta.status(404).json({
                exito: false,
                mensaje: "La oportunidad no fue encontrada",
                errores: []
            });
        }

        return respuesta.json({
            exito: true,
            mensaje: "Oportunidad actualizada correctamente",
            datos: oportunidad
        });
    } catch (error) {
        if (error.codigo === "DUPLICADO") {
            return respuesta.status(409).json({
                exito: false,
                mensaje: error.message,
                errores: []
            });
        }

        throw error;
    }
}

function eliminarOportunidad(solicitud, respuesta) {
    const oportunidad = oportunidadesService.eliminarOportunidad(
        solicitud.params.id
    );

    if (!oportunidad) {
        return respuesta.status(404).json({
            exito: false,
            mensaje: "La oportunidad no fue encontrada",
            errores: []
        });
    }

    return respuesta.json({
        exito: true,
        mensaje: "Oportunidad eliminada correctamente",
        datos: oportunidad
    });
}

module.exports = {
    obtenerOportunidades,
    obtenerOportunidadPorId,
    crearOportunidad,
    actualizarOportunidad,
    eliminarOportunidad
};
