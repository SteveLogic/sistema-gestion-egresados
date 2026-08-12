const mentoriasService = require(
    "../services/mentorias.service"
);

function texto(valor) {
    return String(valor ?? "").trim();
}

function esFechaValida(valor) {
    return /^\d{4}-\d{2}-\d{2}$/.test(texto(valor)) &&
        !Number.isNaN(Date.parse(`${texto(valor)}T00:00:00`));
}

function responderError(respuesta, error) {
    console.error("Error en mentorías:", error);

    return respuesta.status(error.estado || 500).json({
        exito: false,
        mensaje:
            error.estado
                ? error.message
                : "Ocurrió un error interno en el módulo de mentorías",
        errores: error.errores || []
    });
}

function validarMentor(datos) {
    const errores = [];

    if (!texto(datos.egresadoId)) {
        errores.push("Debe seleccionar una persona egresada");
    }

    if (texto(datos.areaExperiencia).length < 3) {
        errores.push("El área de experiencia es obligatoria");
    }

    if (texto(datos.especialidades).length < 10) {
        errores.push(
            "Las especialidades deben contener al menos 10 caracteres"
        );
    }

    const anios = Number(datos.aniosExperiencia);

    if (!Number.isInteger(anios) || anios < 1 || anios > 60) {
        errores.push(
            "Los años de experiencia deben estar entre 1 y 60"
        );
    }

    if (texto(datos.disponibilidad).length < 3) {
        errores.push("La disponibilidad es obligatoria");
    }

    if (!texto(datos.modalidad)) {
        errores.push("Debe seleccionar una modalidad");
    }

    if (!texto(datos.estado)) {
        errores.push("Debe seleccionar un estado");
    }

    return errores;
}

function validarSolicitud(datos, esCreacion = false) {
    const errores = [];

    if (!texto(datos.egresadoId)) {
        errores.push("Debe seleccionar una persona egresada");
    }

    if (texto(datos.objetivo).length < 10) {
        errores.push(
            "El objetivo debe contener al menos 10 caracteres"
        );
    }

    if (texto(datos.objetivo).length > 600) {
        errores.push("El objetivo no puede superar 600 caracteres");
    }

    if (texto(datos.oportunidad).length < 3) {
        errores.push("Debe indicar una oportunidad de mentoría");
    }

    if (texto(datos.comentarios).length > 500) {
        errores.push(
            "Los comentarios no pueden superar 500 caracteres"
        );
    }

    if (
        !esCreacion &&
        !esFechaValida(datos.fechaSolicitud)
    ) {
        errores.push("La fecha de solicitud no es válida");
    }

    if (!esCreacion && !texto(datos.estado)) {
        errores.push("Debe seleccionar un estado");
    }

    return errores;
}

function validarMentoria(datos) {
    const errores = [];

    if (!texto(datos.egresadoId)) {
        errores.push("Debe seleccionar una persona egresada");
    }

    if (!texto(datos.mentorId)) {
        errores.push("Debe seleccionar una persona mentora");
    }

    if (texto(datos.areaProfesional).length < 3) {
        errores.push("El área profesional es obligatoria");
    }

    if (!texto(datos.modalidad)) {
        errores.push("Debe seleccionar una modalidad");
    }

    if (!esFechaValida(datos.fechaInicio)) {
        errores.push("La fecha de inicio no es válida");
    }

    if (!esFechaValida(datos.fechaFinalizacion)) {
        errores.push("La fecha de finalización no es válida");
    }

    if (
        esFechaValida(datos.fechaInicio) &&
        esFechaValida(datos.fechaFinalizacion) &&
        datos.fechaFinalizacion < datos.fechaInicio
    ) {
        errores.push(
            "La fecha de finalización no puede ser anterior a la fecha de inicio"
        );
    }

    if (!texto(datos.estado)) {
        errores.push("Debe seleccionar un estado");
    }

    if (texto(datos.objetivo).length < 10) {
        errores.push(
            "El objetivo debe contener al menos 10 caracteres"
        );
    }

    if (texto(datos.objetivo).length > 700) {
        errores.push("El objetivo no puede superar 700 caracteres");
    }

    if (texto(datos.observaciones).length > 700) {
        errores.push(
            "Las observaciones no pueden superar 700 caracteres"
        );
    }

    return errores;
}

function responderValidacion(respuesta, errores) {
    return respuesta.status(400).json({
        exito: false,
        mensaje: "Los datos enviados no son válidos",
        errores
    });
}

/*
    MENTORES
*/

async function obtenerMentores(solicitud, respuesta) {
    try {
        return respuesta.json({
            exito: true,
            mensaje: "Mentores consultados correctamente",
            datos: await mentoriasService.obtenerMentores()
        });
    } catch (error) {
        return responderError(respuesta, error);
    }
}

async function obtenerMentorPorId(solicitud, respuesta) {
    try {
        const mentor = await mentoriasService.buscarMentorPorId(
            solicitud.params.id
        );

        if (!mentor) {
            return respuesta.status(404).json({
                exito: false,
                mensaje: "La persona mentora no fue encontrada",
                errores: []
            });
        }

        return respuesta.json({
            exito: true,
            mensaje: "Mentor consultado correctamente",
            datos: mentor
        });
    } catch (error) {
        return responderError(respuesta, error);
    }
}

async function crearMentor(solicitud, respuesta) {
    try {
        const errores = validarMentor(solicitud.body);

        if (errores.length > 0) {
            return responderValidacion(respuesta, errores);
        }

        const mentor = await mentoriasService.crearMentor(solicitud.body);

        return respuesta.status(201).json({
            exito: true,
            mensaje: "Persona mentora registrada correctamente",
            datos: mentor
        });
    } catch (error) {
        return responderError(respuesta, error);
    }
}

async function actualizarMentor(solicitud, respuesta) {
    try {
        const errores = validarMentor(solicitud.body);

        if (errores.length > 0) {
            return responderValidacion(respuesta, errores);
        }

        const mentor = await mentoriasService.actualizarMentor(
            solicitud.params.id,
            solicitud.body
        );

        if (!mentor) {
            return respuesta.status(404).json({
                exito: false,
                mensaje: "La persona mentora no fue encontrada",
                errores: []
            });
        }

        return respuesta.json({
            exito: true,
            mensaje: "Persona mentora actualizada correctamente",
            datos: mentor
        });
    } catch (error) {
        return responderError(respuesta, error);
    }
}

async function eliminarMentor(solicitud, respuesta) {
    try {
        const mentor = await mentoriasService.eliminarMentor(
            solicitud.params.id
        );

        if (!mentor) {
            return respuesta.status(404).json({
                exito: false,
                mensaje: "La persona mentora no fue encontrada",
                errores: []
            });
        }

        return respuesta.json({
            exito: true,
            mensaje: "Persona mentora eliminada correctamente",
            datos: mentor
        });
    } catch (error) {
        return responderError(respuesta, error);
    }
}

/*
    SOLICITUDES
*/

async function obtenerSolicitudes(solicitud, respuesta) {
    try {
        return respuesta.json({
            exito: true,
            mensaje: "Solicitudes consultadas correctamente",
            datos: await mentoriasService.obtenerSolicitudes()
        });
    } catch (error) {
        return responderError(respuesta, error);
    }
}

async function obtenerSolicitudPorId(solicitud, respuesta) {
    try {
        const datos = await mentoriasService.buscarSolicitudPorId(
            solicitud.params.id
        );

        if (!datos) {
            return respuesta.status(404).json({
                exito: false,
                mensaje: "La solicitud de mentoría no fue encontrada",
                errores: []
            });
        }

        return respuesta.json({
            exito: true,
            mensaje: "Solicitud consultada correctamente",
            datos
        });
    } catch (error) {
        return responderError(respuesta, error);
    }
}

async function crearSolicitud(solicitud, respuesta) {
    try {
        const errores = validarSolicitud(solicitud.body, true);

        if (errores.length > 0) {
            return responderValidacion(respuesta, errores);
        }

        const datos = await mentoriasService.crearSolicitud({
            ...solicitud.body,
            estado: "Pendiente",
            mentorId: ""
        });

        return respuesta.status(201).json({
            exito: true,
            mensaje: "Solicitud de mentoría registrada correctamente",
            datos
        });
    } catch (error) {
        return responderError(respuesta, error);
    }
}

async function actualizarSolicitud(solicitud, respuesta) {
    try {
        const errores = validarSolicitud(solicitud.body);

        if (errores.length > 0) {
            return responderValidacion(respuesta, errores);
        }

        const datos = await mentoriasService.actualizarSolicitud(
            solicitud.params.id,
            solicitud.body
        );

        if (!datos) {
            return respuesta.status(404).json({
                exito: false,
                mensaje: "La solicitud de mentoría no fue encontrada",
                errores: []
            });
        }

        return respuesta.json({
            exito: true,
            mensaje: "Solicitud de mentoría actualizada correctamente",
            datos
        });
    } catch (error) {
        return responderError(respuesta, error);
    }
}

async function asignarMentor(solicitud, respuesta) {
    try {
        const errores = [];

        if (!texto(solicitud.body.mentorId)) {
            errores.push("Debe seleccionar una persona mentora");
        }

        if (
            texto(solicitud.body.observacionesAsignacion).length > 500
        ) {
            errores.push(
                "Las observaciones no pueden superar 500 caracteres"
            );
        }

        if (errores.length > 0) {
            return responderValidacion(respuesta, errores);
        }

        const datos = await mentoriasService.asignarMentorASolicitud(
            solicitud.params.id,
            solicitud.body
        );

        if (!datos) {
            return respuesta.status(404).json({
                exito: false,
                mensaje: "La solicitud de mentoría no fue encontrada",
                errores: []
            });
        }

        return respuesta.json({
            exito: true,
            mensaje: "Persona mentora asignada correctamente",
            datos
        });
    } catch (error) {
        return responderError(respuesta, error);
    }
}

async function eliminarSolicitud(solicitud, respuesta) {
    try {
        const datos = await mentoriasService.eliminarSolicitud(
            solicitud.params.id
        );

        if (!datos) {
            return respuesta.status(404).json({
                exito: false,
                mensaje: "La solicitud de mentoría no fue encontrada",
                errores: []
            });
        }

        return respuesta.json({
            exito: true,
            mensaje: "Solicitud de mentoría eliminada correctamente",
            datos
        });
    } catch (error) {
        return responderError(respuesta, error);
    }
}

/*
    MENTORÍAS
*/

async function obtenerMentorias(solicitud, respuesta) {
    try {
        return respuesta.json({
            exito: true,
            mensaje: "Mentorías consultadas correctamente",
            datos: await mentoriasService.obtenerMentorias()
        });
    } catch (error) {
        return responderError(respuesta, error);
    }
}

async function obtenerMentoriaPorId(solicitud, respuesta) {
    try {
        const mentoria = await mentoriasService.buscarMentoriaPorId(
            solicitud.params.id
        );

        if (!mentoria) {
            return respuesta.status(404).json({
                exito: false,
                mensaje: "La mentoría no fue encontrada",
                errores: []
            });
        }

        return respuesta.json({
            exito: true,
            mensaje: "Mentoría consultada correctamente",
            datos: mentoria
        });
    } catch (error) {
        return responderError(respuesta, error);
    }
}

async function crearMentoria(solicitud, respuesta) {
    try {
        const errores = validarMentoria(solicitud.body);

        if (errores.length > 0) {
            return responderValidacion(respuesta, errores);
        }

        const mentoria = await mentoriasService.crearMentoria(
            solicitud.body
        );

        return respuesta.status(201).json({
            exito: true,
            mensaje: "Mentoría registrada correctamente",
            datos: mentoria
        });
    } catch (error) {
        return responderError(respuesta, error);
    }
}

async function actualizarMentoria(solicitud, respuesta) {
    try {
        const errores = validarMentoria(solicitud.body);

        if (errores.length > 0) {
            return responderValidacion(respuesta, errores);
        }

        const mentoria = await mentoriasService.actualizarMentoria(
            solicitud.params.id,
            solicitud.body
        );

        if (!mentoria) {
            return respuesta.status(404).json({
                exito: false,
                mensaje: "La mentoría no fue encontrada",
                errores: []
            });
        }

        return respuesta.json({
            exito: true,
            mensaje: "Mentoría actualizada correctamente",
            datos: mentoria
        });
    } catch (error) {
        return responderError(respuesta, error);
    }
}

async function eliminarMentoria(solicitud, respuesta) {
    try {
        const mentoria = await mentoriasService.eliminarMentoria(
            solicitud.params.id
        );

        if (!mentoria) {
            return respuesta.status(404).json({
                exito: false,
                mensaje: "La mentoría no fue encontrada",
                errores: []
            });
        }

        return respuesta.json({
            exito: true,
            mensaje: "Mentoría eliminada correctamente",
            datos: mentoria
        });
    } catch (error) {
        return responderError(respuesta, error);
    }
}

module.exports = {
    obtenerMentores,
    obtenerMentorPorId,
    crearMentor,
    actualizarMentor,
    eliminarMentor,
    obtenerSolicitudes,
    obtenerSolicitudPorId,
    crearSolicitud,
    actualizarSolicitud,
    asignarMentor,
    eliminarSolicitud,
    obtenerMentorias,
    obtenerMentoriaPorId,
    crearMentoria,
    actualizarMentoria,
    eliminarMentoria
};
