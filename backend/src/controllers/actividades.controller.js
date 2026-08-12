const actividadesService = require(
    "../services/actividades.service"
);

function texto(valor) {
    return String(valor ?? "").trim();
}

function esFechaValida(valor) {
    return /^\d{4}-\d{2}-\d{2}$/.test(texto(valor)) &&
        !Number.isNaN(Date.parse(`${texto(valor)}T00:00:00`));
}

function esHoraValida(valor) {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(texto(valor));
}

function esUrlValida(valor) {
    if (!texto(valor)) {
        return true;
    }

    try {
        const url = new URL(texto(valor));
        return ["http:", "https:"].includes(url.protocol);
    } catch {
        return false;
    }
}

function validarActividad(datos) {
    const errores = [];

    if (texto(datos.titulo).length < 5) {
        errores.push("El título debe contener al menos 5 caracteres");
    }

    if (texto(datos.titulo).length > 120) {
        errores.push("El título no puede superar 120 caracteres");
    }

    if (texto(datos.descripcion).length < 10) {
        errores.push(
            "La descripción debe contener al menos 10 caracteres"
        );
    }

    if (!esFechaValida(datos.fecha)) {
        errores.push("La fecha no es válida");
    }

    if (!esHoraValida(datos.hora)) {
        errores.push("La hora no es válida");
    }

    if (!texto(datos.modalidad)) {
        errores.push("Debe seleccionar una modalidad");
    }

    if (texto(datos.ubicacion).length < 3) {
        errores.push("La ubicación o plataforma es obligatoria");
    }

    if (!texto(datos.publicoObjetivo)) {
        errores.push("Debe seleccionar el público objetivo");
    }

    const cupo = Number(datos.cupoMaximo);
    if (!Number.isInteger(cupo) || cupo < 1 || cupo > 10000) {
        errores.push("El cupo máximo debe ser un entero entre 1 y 10000");
    }

    const inscritas = Number(datos.personasInscritas ?? 0);
    if (!Number.isInteger(inscritas) || inscritas < 0) {
        errores.push(
            "Las personas inscritas deben ser un número entero mayor o igual a cero"
        );
    }

    if (!texto(datos.estado)) {
        errores.push("Debe seleccionar un estado");
    }

    if (texto(datos.responsable).length < 3) {
        errores.push("La persona responsable es obligatoria");
    }

    if (!esUrlValida(datos.enlace)) {
        errores.push("El enlace debe utilizar http o https");
    }

    return errores;
}

function responderError(respuesta, error) {
    console.error("Error en actividades:", error);

    return respuesta.status(error.estado || 500).json({
        exito: false,
        mensaje:
            error.estado
                ? error.message
                : "Ocurrió un error interno en el módulo de actividades",
        errores: error.errores || []
    });
}

function responderValidacion(respuesta, errores) {
    return respuesta.status(400).json({
        exito: false,
        mensaje: "Los datos de la actividad no son válidos",
        errores
    });
}

async function obtenerActividades(solicitud, respuesta) {
    try {
        let actividades = await actividadesService.obtenerActividades();

        if (solicitud.usuario?.rol === "egresado") {
            actividades = actividades.filter(
                (actividad) => texto(actividad.estado).toLowerCase() !== "borrador"
            );
        }

        return respuesta.json({
            exito: true,
            mensaje: "Actividades consultadas correctamente",
            datos: actividades
        });
    } catch (error) {
        return responderError(respuesta, error);
    }
}

async function obtenerActividadPorId(solicitud, respuesta) {
    try {
        const actividad = await actividadesService.buscarActividadPorId(
            solicitud.params.id
        );

        if (
            !actividad ||
            (solicitud.usuario?.rol === "egresado" &&
                texto(actividad.estado).toLowerCase() === "borrador")
        ) {
            return respuesta.status(404).json({
                exito: false,
                mensaje: "La actividad no fue encontrada",
                errores: []
            });
        }

        return respuesta.json({
            exito: true,
            mensaje: "Actividad consultada correctamente",
            datos: actividad
        });
    } catch (error) {
        return responderError(respuesta, error);
    }
}

async function crearActividad(solicitud, respuesta) {
    try {
        const errores = validarActividad(solicitud.body);

        if (errores.length > 0) {
            return responderValidacion(respuesta, errores);
        }

        const actividad = await actividadesService.crearActividad(
            solicitud.body
        );

        return respuesta.status(201).json({
            exito: true,
            mensaje: "Actividad registrada correctamente",
            datos: actividad
        });
    } catch (error) {
        return responderError(respuesta, error);
    }
}

async function actualizarActividad(solicitud, respuesta) {
    try {
        const errores = validarActividad(solicitud.body);

        if (errores.length > 0) {
            return responderValidacion(respuesta, errores);
        }

        const actividad = await actividadesService.actualizarActividad(
            solicitud.params.id,
            solicitud.body
        );

        if (!actividad) {
            return respuesta.status(404).json({
                exito: false,
                mensaje: "La actividad no fue encontrada",
                errores: []
            });
        }

        return respuesta.json({
            exito: true,
            mensaje: "Actividad actualizada correctamente",
            datos: actividad
        });
    } catch (error) {
        return responderError(respuesta, error);
    }
}

async function eliminarActividad(solicitud, respuesta) {
    try {
        const actividad = await actividadesService.eliminarActividad(
            solicitud.params.id
        );

        if (!actividad) {
            return respuesta.status(404).json({
                exito: false,
                mensaje: "La actividad no fue encontrada",
                errores: []
            });
        }

        return respuesta.json({
            exito: true,
            mensaje: "Actividad eliminada correctamente",
            datos: actividad
        });
    } catch (error) {
        return responderError(respuesta, error);
    }
}

module.exports = {
    obtenerActividades,
    obtenerActividadPorId,
    crearActividad,
    actualizarActividad,
    eliminarActividad
};
