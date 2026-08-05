const mentores = require("../data/mentores.data");
const solicitudes = require("../data/solicitudes-mentoria.data");
const mentorias = require("../data/mentorias.data");
const egresados = require("../data/egresados.data");

const {
    generarId
} = require("../utils/generar-id");

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

function buscarEgresadoPorId(id) {
    return egresados.find((egresado) => egresado.id === id);
}

function buscarMentorInternoPorId(id) {
    return mentores.find((mentor) => mentor.id === id);
}

function buscarSolicitudInternaPorId(id) {
    return solicitudes.find((solicitud) => solicitud.id === id);
}

function buscarMentoriaInternaPorId(id) {
    return mentorias.find((mentoria) => mentoria.id === id);
}

function obtenerNombreMentor(mentorId) {
    const mentor = buscarMentorInternoPorId(mentorId);
    const egresado = mentor
        ? buscarEgresadoPorId(mentor.egresadoId)
        : null;

    return egresado?.nombreCompleto || "Sin asignar";
}

function construirMentorDetallado(mentor) {
    const egresado = buscarEgresadoPorId(mentor.egresadoId);

    return {
        ...mentor,
        egresadoNombre:
            egresado?.nombreCompleto || "Egresado no encontrado",
        egresadoIdentificacion:
            egresado?.identificacion || "No disponible",
        egresadoCorreo:
            egresado?.correo || "No disponible"
    };
}

function construirSolicitudDetallada(solicitud) {
    const egresado = buscarEgresadoPorId(solicitud.egresadoId);

    return {
        ...solicitud,
        egresadoNombre:
            egresado?.nombreCompleto || "Egresado no encontrado",
        egresadoIdentificacion:
            egresado?.identificacion || "No disponible",
        mentorNombre:
            solicitud.mentorId
                ? obtenerNombreMentor(solicitud.mentorId)
                : "Sin asignar"
    };
}

function construirMentoriaDetallada(mentoria) {
    const egresado = buscarEgresadoPorId(mentoria.egresadoId);
    const mentor = buscarMentorInternoPorId(mentoria.mentorId);
    const egresadoMentor = mentor
        ? buscarEgresadoPorId(mentor.egresadoId)
        : null;

    return {
        ...mentoria,
        egresadoNombre:
            egresado?.nombreCompleto || "Egresado no encontrado",
        egresadoIdentificacion:
            egresado?.identificacion || "No disponible",
        mentorNombre:
            egresadoMentor?.nombreCompleto || "Mentor no encontrado",
        mentorArea:
            mentor?.areaExperiencia || "No disponible"
    };
}

function validarEgresado(egresadoId) {
    const egresado = buscarEgresadoPorId(egresadoId);

    if (!egresado) {
        throw crearError(
            "La persona egresada seleccionada no existe",
            404
        );
    }

    return egresado;
}

function validarMentor(mentorId) {
    const mentor = buscarMentorInternoPorId(mentorId);

    if (!mentor) {
        throw crearError(
            "La persona mentora seleccionada no existe",
            404
        );
    }

    return mentor;
}

function validarParticipantesDistintos(egresadoId, mentor) {
    if (mentor.egresadoId === egresadoId) {
        throw crearError(
            "Una persona no puede ser mentora de sí misma"
        );
    }
}

function sincronizarEstadoMentor(mentorId) {
    const mentor = buscarMentorInternoPorId(mentorId);

    if (!mentor || mentor.estado === "Inactivo") {
        return;
    }

    const tieneMentoriaVigente = mentorias.some(
        (mentoria) =>
            mentoria.mentorId === mentorId &&
            ["Pendiente", "Activa"].includes(mentoria.estado)
    );

    const tieneSolicitudAsignada = solicitudes.some(
        (solicitud) =>
            solicitud.mentorId === mentorId &&
            solicitud.estado === "Asignada"
    );

    mentor.estado =
        tieneMentoriaVigente || tieneSolicitudAsignada
            ? "Asignado"
            : "Disponible";
}

/*
    MENTORES
*/

function obtenerMentores() {
    return mentores.map(construirMentorDetallado);
}

function buscarMentorPorId(id) {
    const mentor = buscarMentorInternoPorId(id);
    return mentor ? construirMentorDetallado(mentor) : null;
}

function crearMentor(datos) {
    validarEgresado(datos.egresadoId);

    const yaRegistrado = mentores.some(
        (mentor) => mentor.egresadoId === datos.egresadoId
    );

    if (yaRegistrado) {
        throw crearError(
            "La persona egresada ya está registrada como mentora",
            409
        );
    }

    const mentor = {
        id: generarId("men"),
        egresadoId: datos.egresadoId,
        areaExperiencia: limpiarTexto(datos.areaExperiencia),
        especialidades: limpiarTexto(datos.especialidades),
        aniosExperiencia: Number(datos.aniosExperiencia),
        disponibilidad: limpiarTexto(datos.disponibilidad),
        modalidad: obtenerValorCanonico(
            datos.modalidad,
            ["Virtual", "Presencial", "Híbrida"],
            "La modalidad"
        ),
        estado: obtenerValorCanonico(
            datos.estado,
            ["Disponible", "Asignado", "Inactivo"],
            "El estado"
        )
    };

    mentores.push(mentor);
    return construirMentorDetallado(mentor);
}

function actualizarMentor(id, datos) {
    const mentor = buscarMentorInternoPorId(id);

    if (!mentor) {
        return null;
    }

    validarEgresado(datos.egresadoId);

    const duplicado = mentores.some(
        (otroMentor) =>
            otroMentor.id !== id &&
            otroMentor.egresadoId === datos.egresadoId
    );

    if (duplicado) {
        throw crearError(
            "La persona egresada ya está registrada como mentora",
            409
        );
    }

    Object.assign(mentor, {
        egresadoId: datos.egresadoId,
        areaExperiencia: limpiarTexto(datos.areaExperiencia),
        especialidades: limpiarTexto(datos.especialidades),
        aniosExperiencia: Number(datos.aniosExperiencia),
        disponibilidad: limpiarTexto(datos.disponibilidad),
        modalidad: obtenerValorCanonico(
            datos.modalidad,
            ["Virtual", "Presencial", "Híbrida"],
            "La modalidad"
        ),
        estado: obtenerValorCanonico(
            datos.estado,
            ["Disponible", "Asignado", "Inactivo"],
            "El estado"
        )
    });

    sincronizarEstadoMentor(id);
    return construirMentorDetallado(mentor);
}

function eliminarMentor(id) {
    const indice = mentores.findIndex((mentor) => mentor.id === id);

    if (indice === -1) {
        return null;
    }

    const estaRelacionado =
        mentorias.some((mentoria) => mentoria.mentorId === id) ||
        solicitudes.some((solicitud) => solicitud.mentorId === id);

    if (estaRelacionado) {
        throw crearError(
            "No se puede eliminar una persona mentora vinculada a solicitudes o mentorías",
            409
        );
    }

    const [mentorEliminado] = mentores.splice(indice, 1);
    return construirMentorDetallado(mentorEliminado);
}

/*
    SOLICITUDES
*/

function obtenerSolicitudes() {
    return solicitudes.map(construirSolicitudDetallada);
}

function buscarSolicitudPorId(id) {
    const solicitud = buscarSolicitudInternaPorId(id);
    return solicitud ? construirSolicitudDetallada(solicitud) : null;
}

function crearSolicitud(datos) {
    validarEgresado(datos.egresadoId);

    const duplicada = solicitudes.some(
        (solicitud) =>
            solicitud.egresadoId === datos.egresadoId &&
            normalizarTexto(solicitud.oportunidad) ===
                normalizarTexto(datos.oportunidad) &&
            ["Pendiente", "Asignada"].includes(solicitud.estado)
    );

    if (duplicada) {
        throw crearError(
            "Ya existe una solicitud vigente para esa oportunidad de mentoría",
            409
        );
    }

    const solicitud = {
        id: generarId("sol"),
        egresadoId: datos.egresadoId,
        objetivo: limpiarTexto(datos.objetivo),
        oportunidad: limpiarTexto(datos.oportunidad),
        comentarios: limpiarTexto(datos.comentarios),
        fechaSolicitud:
            limpiarTexto(datos.fechaSolicitud) ||
            new Date().toISOString().slice(0, 10),
        estado: obtenerValorCanonico(
            datos.estado || "Pendiente",
            ["Pendiente", "Asignada", "Rechazada", "Cancelada"],
            "El estado"
        ),
        mentorId: limpiarTexto(datos.mentorId),
        observacionesAsignacion:
            limpiarTexto(datos.observacionesAsignacion)
    };

    if (solicitud.mentorId) {
        const mentor = validarMentor(solicitud.mentorId);
        validarParticipantesDistintos(solicitud.egresadoId, mentor);
    }

    solicitudes.push(solicitud);

    if (solicitud.mentorId) {
        sincronizarEstadoMentor(solicitud.mentorId);
    }

    return construirSolicitudDetallada(solicitud);
}

function actualizarSolicitud(id, datos) {
    const solicitud = buscarSolicitudInternaPorId(id);

    if (!solicitud) {
        return null;
    }

    validarEgresado(datos.egresadoId);

    const estado = obtenerValorCanonico(
        datos.estado,
        ["Pendiente", "Asignada", "Rechazada", "Cancelada"],
        "El estado"
    );

    const mentorAnteriorId = solicitud.mentorId;
    let mentorId = limpiarTexto(datos.mentorId);

    if (["Rechazada", "Cancelada", "Pendiente"].includes(estado)) {
        mentorId = "";
    }

    if (estado === "Asignada" && !mentorId) {
        throw crearError(
            "Una solicitud asignada debe tener una persona mentora"
        );
    }

    if (mentorId) {
        const mentor = validarMentor(mentorId);
        validarParticipantesDistintos(datos.egresadoId, mentor);
    }

    Object.assign(solicitud, {
        egresadoId: datos.egresadoId,
        objetivo: limpiarTexto(datos.objetivo),
        oportunidad: limpiarTexto(datos.oportunidad),
        comentarios: limpiarTexto(datos.comentarios),
        fechaSolicitud: limpiarTexto(datos.fechaSolicitud),
        estado,
        mentorId,
        observacionesAsignacion:
            limpiarTexto(datos.observacionesAsignacion)
    });

    if (mentorAnteriorId) {
        sincronizarEstadoMentor(mentorAnteriorId);
    }

    if (mentorId) {
        sincronizarEstadoMentor(mentorId);
    }

    return construirSolicitudDetallada(solicitud);
}

function asignarMentorASolicitud(id, datos) {
    const solicitud = buscarSolicitudInternaPorId(id);

    if (!solicitud) {
        return null;
    }

    if (["Rechazada", "Cancelada"].includes(solicitud.estado)) {
        throw crearError(
            "No se puede asignar una solicitud rechazada o cancelada",
            409
        );
    }

    const mentor = validarMentor(datos.mentorId);

    if (mentor.estado === "Inactivo") {
        throw crearError(
            "La persona mentora seleccionada está inactiva",
            409
        );
    }

    validarParticipantesDistintos(solicitud.egresadoId, mentor);

    const mentorAnteriorId = solicitud.mentorId;

    solicitud.mentorId = mentor.id;
    solicitud.estado = "Asignada";
    solicitud.observacionesAsignacion =
        limpiarTexto(datos.observacionesAsignacion);

    if (mentorAnteriorId && mentorAnteriorId !== mentor.id) {
        sincronizarEstadoMentor(mentorAnteriorId);
    }

    sincronizarEstadoMentor(mentor.id);
    return construirSolicitudDetallada(solicitud);
}

function eliminarSolicitud(id) {
    const indice = solicitudes.findIndex(
        (solicitud) => solicitud.id === id
    );

    if (indice === -1) {
        return null;
    }

    const tieneMentoria = mentorias.some(
        (mentoria) => mentoria.solicitudId === id
    );

    if (tieneMentoria) {
        throw crearError(
            "No se puede eliminar una solicitud vinculada a una mentoría",
            409
        );
    }

    const [solicitudEliminada] = solicitudes.splice(indice, 1);

    if (solicitudEliminada.mentorId) {
        sincronizarEstadoMentor(solicitudEliminada.mentorId);
    }

    return construirSolicitudDetallada(solicitudEliminada);
}

/*
    MENTORÍAS
*/

function obtenerMentorias() {
    return mentorias.map(construirMentoriaDetallada);
}

function buscarMentoriaPorId(id) {
    const mentoria = buscarMentoriaInternaPorId(id);
    return mentoria ? construirMentoriaDetallada(mentoria) : null;
}

function prepararDatosMentoria(datos) {
    validarEgresado(datos.egresadoId);
    const mentor = validarMentor(datos.mentorId);
    validarParticipantesDistintos(datos.egresadoId, mentor);

    if (mentor.estado === "Inactivo") {
        throw crearError(
            "La persona mentora seleccionada está inactiva",
            409
        );
    }

    const solicitudId = limpiarTexto(datos.solicitudId);

    if (solicitudId) {
        const solicitud = buscarSolicitudInternaPorId(solicitudId);

        if (!solicitud) {
            throw crearError(
                "La solicitud de mentoría seleccionada no existe",
                404
            );
        }

        if (solicitud.egresadoId !== datos.egresadoId) {
            throw crearError(
                "La solicitud no pertenece a la persona egresada seleccionada"
            );
        }
    }

    return {
        solicitudId,
        egresadoId: datos.egresadoId,
        mentorId: datos.mentorId,
        areaProfesional: limpiarTexto(datos.areaProfesional),
        modalidad: obtenerValorCanonico(
            datos.modalidad,
            ["Virtual", "Presencial", "Híbrida"],
            "La modalidad"
        ),
        fechaInicio: limpiarTexto(datos.fechaInicio),
        fechaFinalizacion: limpiarTexto(datos.fechaFinalizacion),
        estado: obtenerValorCanonico(
            datos.estado,
            ["Pendiente", "Activa", "Finalizada", "Cancelada"],
            "El estado"
        ),
        objetivo: limpiarTexto(datos.objetivo),
        observaciones: limpiarTexto(datos.observaciones)
    };
}

function crearMentoria(datos) {
    const datosPreparados = prepararDatosMentoria(datos);

    if (datosPreparados.solicitudId) {
        const duplicada = mentorias.some(
            (mentoria) =>
                mentoria.solicitudId === datosPreparados.solicitudId
        );

        if (duplicada) {
            throw crearError(
                "La solicitud seleccionada ya está vinculada a una mentoría",
                409
            );
        }
    }

    const mentoria = {
        id: generarId("ment"),
        ...datosPreparados
    };

    mentorias.push(mentoria);

    if (mentoria.solicitudId) {
        const solicitud = buscarSolicitudInternaPorId(
            mentoria.solicitudId
        );
        solicitud.estado = "Asignada";
        solicitud.mentorId = mentoria.mentorId;
    }

    sincronizarEstadoMentor(mentoria.mentorId);
    return construirMentoriaDetallada(mentoria);
}

function actualizarMentoria(id, datos) {
    const mentoria = buscarMentoriaInternaPorId(id);

    if (!mentoria) {
        return null;
    }

    const mentorAnteriorId = mentoria.mentorId;
    const datosPreparados = prepararDatosMentoria(datos);

    if (datosPreparados.solicitudId) {
        const duplicada = mentorias.some(
            (otraMentoria) =>
                otraMentoria.id !== id &&
                otraMentoria.solicitudId === datosPreparados.solicitudId
        );

        if (duplicada) {
            throw crearError(
                "La solicitud seleccionada ya está vinculada a otra mentoría",
                409
            );
        }
    }

    Object.assign(mentoria, datosPreparados);

    if (mentorAnteriorId) {
        sincronizarEstadoMentor(mentorAnteriorId);
    }

    sincronizarEstadoMentor(mentoria.mentorId);
    return construirMentoriaDetallada(mentoria);
}

function eliminarMentoria(id) {
    const indice = mentorias.findIndex(
        (mentoria) => mentoria.id === id
    );

    if (indice === -1) {
        return null;
    }

    const [mentoriaEliminada] = mentorias.splice(indice, 1);

    if (mentoriaEliminada.solicitudId) {
        const solicitud = buscarSolicitudInternaPorId(
            mentoriaEliminada.solicitudId
        );

        if (solicitud) {
            solicitud.estado = "Pendiente";
            solicitud.mentorId = "";
            solicitud.observacionesAsignacion = "";
        }
    }

    sincronizarEstadoMentor(mentoriaEliminada.mentorId);
    return construirMentoriaDetallada(mentoriaEliminada);
}

module.exports = {
    crearError,
    obtenerMentores,
    buscarMentorPorId,
    crearMentor,
    actualizarMentor,
    eliminarMentor,
    obtenerSolicitudes,
    buscarSolicitudPorId,
    crearSolicitud,
    actualizarSolicitud,
    asignarMentorASolicitud,
    eliminarSolicitud,
    obtenerMentorias,
    buscarMentoriaPorId,
    crearMentoria,
    actualizarMentoria,
    eliminarMentoria
};
