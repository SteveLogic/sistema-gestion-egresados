const Mentor = require("../models/mentor.model");
const SolicitudMentoria = require(
    "../models/solicitud-mentoria.model"
);
const Mentoria = require("../models/mentoria.model");
const Egresado = require("../models/egresado.model");

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

function limpiarDocumento(documento) {
    if (!documento) {
        return null;
    }

    const objeto =
        typeof documento.toObject === "function"
            ? documento.toObject()
            : { ...documento };

    delete objeto._id;
    delete objeto.createdAt;
    delete objeto.updatedAt;

    return objeto;
}

async function buscarEgresadoInternoPorId(id) {
    return Egresado.findOne({ id })
        .select("-_id -createdAt -updatedAt")
        .lean();
}

async function buscarMentorInternoPorId(id) {
    return Mentor.findOne({ id });
}

async function buscarSolicitudInternaPorId(id) {
    return SolicitudMentoria.findOne({ id });
}

async function buscarMentoriaInternaPorId(id) {
    return Mentoria.findOne({ id });
}

async function obtenerNombreMentor(mentorId) {
    if (!mentorId) {
        return "Sin asignar";
    }

    const mentor = await Mentor.findOne({ id: mentorId })
        .select("egresadoId -_id")
        .lean();

    if (!mentor) {
        return "Mentor no encontrado";
    }

    const egresado = await buscarEgresadoInternoPorId(
        mentor.egresadoId
    );

    return egresado?.nombreCompleto || "Mentor no encontrado";
}

async function construirMentorDetallado(mentor) {
    const mentorLimpio = limpiarDocumento(mentor);
    const egresado = await buscarEgresadoInternoPorId(
        mentorLimpio.egresadoId
    );

    return {
        ...mentorLimpio,
        egresadoNombre:
            egresado?.nombreCompleto || "Egresado no encontrado",
        egresadoIdentificacion:
            egresado?.identificacion || "No disponible",
        egresadoCorreo:
            egresado?.correo || "No disponible"
    };
}

async function construirSolicitudDetallada(solicitud) {
    const solicitudLimpia = limpiarDocumento(solicitud);
    const egresado = await buscarEgresadoInternoPorId(
        solicitudLimpia.egresadoId
    );

    return {
        ...solicitudLimpia,
        egresadoNombre:
            egresado?.nombreCompleto || "Egresado no encontrado",
        egresadoIdentificacion:
            egresado?.identificacion || "No disponible",
        mentorNombre: solicitudLimpia.mentorId
            ? await obtenerNombreMentor(solicitudLimpia.mentorId)
            : "Sin asignar"
    };
}

async function construirMentoriaDetallada(mentoria) {
    const mentoriaLimpia = limpiarDocumento(mentoria);

    const [egresado, mentor] = await Promise.all([
        buscarEgresadoInternoPorId(mentoriaLimpia.egresadoId),
        Mentor.findOne({ id: mentoriaLimpia.mentorId })
            .select("-_id -createdAt -updatedAt")
            .lean()
    ]);

    const egresadoMentor = mentor
        ? await buscarEgresadoInternoPorId(mentor.egresadoId)
        : null;

    return {
        ...mentoriaLimpia,
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

async function validarEgresado(egresadoId) {
    const egresado = await buscarEgresadoInternoPorId(egresadoId);

    if (!egresado) {
        throw crearError(
            "La persona egresada seleccionada no existe",
            404
        );
    }

    return egresado;
}

async function validarMentor(mentorId) {
    const mentor = await buscarMentorInternoPorId(mentorId);

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

async function sincronizarEstadoMentor(mentorId) {
    if (!mentorId) {
        return;
    }

    const mentor = await buscarMentorInternoPorId(mentorId);

    if (!mentor || mentor.estado === "Inactivo") {
        return;
    }

    const [tieneMentoriaVigente, tieneSolicitudAsignada] =
        await Promise.all([
            Mentoria.exists({
                mentorId,
                estado: { $in: ["Pendiente", "Activa"] }
            }),
            SolicitudMentoria.exists({
                mentorId,
                estado: "Asignada"
            })
        ]);

    mentor.estado =
        tieneMentoriaVigente || tieneSolicitudAsignada
            ? "Asignado"
            : "Disponible";

    await mentor.save();
}

function traducirErrorDuplicado(error) {
    if (error?.code === 11000) {
        const campo = Object.keys(
            error.keyPattern || error.keyValue || {}
        )[0];

        if (campo === "egresadoId") {
            throw crearError(
                "La persona egresada ya está registrada como mentora",
                409
            );
        }

        if (campo === "id") {
            throw crearError(
                "Ya existe un registro con ese identificador",
                409
            );
        }
    }

    throw error;
}

/* MENTORES */

async function obtenerMentores() {
    const mentores = await Mentor.find()
        .sort({ id: 1 })
        .lean();

    return Promise.all(
        mentores.map(construirMentorDetallado)
    );
}

async function buscarMentorPorId(id) {
    const mentor = await Mentor.findOne({ id }).lean();
    return mentor
        ? construirMentorDetallado(mentor)
        : null;
}

async function crearMentor(datos) {
    await validarEgresado(datos.egresadoId);

    if (await Mentor.exists({ egresadoId: datos.egresadoId })) {
        throw crearError(
            "La persona egresada ya está registrada como mentora",
            409
        );
    }

    try {
        const mentor = await Mentor.create({
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
        });

        await sincronizarEstadoMentor(mentor.id);
        const actualizado = await Mentor.findOne({ id: mentor.id });
        return construirMentorDetallado(actualizado);
    } catch (error) {
        traducirErrorDuplicado(error);
    }
}

async function actualizarMentor(id, datos) {
    const mentor = await buscarMentorInternoPorId(id);

    if (!mentor) {
        return null;
    }

    await validarEgresado(datos.egresadoId);

    const duplicado = await Mentor.exists({
        egresadoId: datos.egresadoId,
        id: { $ne: id }
    });

    if (duplicado) {
        throw crearError(
            "La persona egresada ya está registrada como mentora",
            409
        );
    }

    mentor.egresadoId = datos.egresadoId;
    mentor.areaExperiencia = limpiarTexto(datos.areaExperiencia);
    mentor.especialidades = limpiarTexto(datos.especialidades);
    mentor.aniosExperiencia = Number(datos.aniosExperiencia);
    mentor.disponibilidad = limpiarTexto(datos.disponibilidad);
    mentor.modalidad = obtenerValorCanonico(
        datos.modalidad,
        ["Virtual", "Presencial", "Híbrida"],
        "La modalidad"
    );
    mentor.estado = obtenerValorCanonico(
        datos.estado,
        ["Disponible", "Asignado", "Inactivo"],
        "El estado"
    );

    try {
        await mentor.save();
        await sincronizarEstadoMentor(id);
        const actualizado = await Mentor.findOne({ id });
        return construirMentorDetallado(actualizado);
    } catch (error) {
        traducirErrorDuplicado(error);
    }
}

async function eliminarMentor(id) {
    const mentor = await buscarMentorInternoPorId(id);

    if (!mentor) {
        return null;
    }

    const [tieneMentorias, tieneSolicitudes] = await Promise.all([
        Mentoria.exists({ mentorId: id }),
        SolicitudMentoria.exists({ mentorId: id })
    ]);

    if (tieneMentorias || tieneSolicitudes) {
        throw crearError(
            "No se puede eliminar una persona mentora vinculada a solicitudes o mentorías",
            409
        );
    }

    const detalle = await construirMentorDetallado(mentor);
    await Mentor.deleteOne({ id });
    return detalle;
}

/* SOLICITUDES */

async function obtenerSolicitudes() {
    const solicitudes = await SolicitudMentoria.find()
        .sort({ fechaSolicitud: -1, id: 1 })
        .lean();

    return Promise.all(
        solicitudes.map(construirSolicitudDetallada)
    );
}

async function buscarSolicitudPorId(id) {
    const solicitud = await SolicitudMentoria.findOne({ id }).lean();
    return solicitud
        ? construirSolicitudDetallada(solicitud)
        : null;
}

async function crearSolicitud(datos) {
    await validarEgresado(datos.egresadoId);

    const vigentes = await SolicitudMentoria.find({
        egresadoId: datos.egresadoId,
        estado: { $in: ["Pendiente", "Asignada"] }
    })
        .select("oportunidad -_id")
        .lean();

    const duplicada = vigentes.some(
        (solicitud) =>
            normalizarTexto(solicitud.oportunidad) ===
            normalizarTexto(datos.oportunidad)
    );

    if (duplicada) {
        throw crearError(
            "Ya existe una solicitud vigente para esa oportunidad de mentoría",
            409
        );
    }

    const mentorId = limpiarTexto(datos.mentorId);

    if (mentorId) {
        const mentor = await validarMentor(mentorId);
        validarParticipantesDistintos(datos.egresadoId, mentor);
    }

    const solicitud = await SolicitudMentoria.create({
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
        mentorId,
        observacionesAsignacion:
            limpiarTexto(datos.observacionesAsignacion)
    });

    if (mentorId) {
        await sincronizarEstadoMentor(mentorId);
    }

    return construirSolicitudDetallada(solicitud);
}

async function actualizarSolicitud(id, datos) {
    const solicitud = await buscarSolicitudInternaPorId(id);

    if (!solicitud) {
        return null;
    }

    await validarEgresado(datos.egresadoId);

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
        const mentor = await validarMentor(mentorId);
        validarParticipantesDistintos(datos.egresadoId, mentor);
    }

    solicitud.egresadoId = datos.egresadoId;
    solicitud.objetivo = limpiarTexto(datos.objetivo);
    solicitud.oportunidad = limpiarTexto(datos.oportunidad);
    solicitud.comentarios = limpiarTexto(datos.comentarios);
    solicitud.fechaSolicitud = limpiarTexto(datos.fechaSolicitud);
    solicitud.estado = estado;
    solicitud.mentorId = mentorId;
    solicitud.observacionesAsignacion =
        limpiarTexto(datos.observacionesAsignacion);

    await solicitud.save();

    if (mentorAnteriorId) {
        await sincronizarEstadoMentor(mentorAnteriorId);
    }

    if (mentorId) {
        await sincronizarEstadoMentor(mentorId);
    }

    return construirSolicitudDetallada(solicitud);
}

async function asignarMentorASolicitud(id, datos) {
    const solicitud = await buscarSolicitudInternaPorId(id);

    if (!solicitud) {
        return null;
    }

    if (["Rechazada", "Cancelada"].includes(solicitud.estado)) {
        throw crearError(
            "No se puede asignar una solicitud rechazada o cancelada",
            409
        );
    }

    const mentor = await validarMentor(datos.mentorId);

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

    await solicitud.save();

    if (mentorAnteriorId && mentorAnteriorId !== mentor.id) {
        await sincronizarEstadoMentor(mentorAnteriorId);
    }

    await sincronizarEstadoMentor(mentor.id);
    return construirSolicitudDetallada(solicitud);
}

async function eliminarSolicitud(id) {
    const solicitud = await buscarSolicitudInternaPorId(id);

    if (!solicitud) {
        return null;
    }

    if (await Mentoria.exists({ solicitudId: id })) {
        throw crearError(
            "No se puede eliminar una solicitud vinculada a una mentoría",
            409
        );
    }

    const mentorId = solicitud.mentorId;
    const detalle = await construirSolicitudDetallada(solicitud);

    await SolicitudMentoria.deleteOne({ id });

    if (mentorId) {
        await sincronizarEstadoMentor(mentorId);
    }

    return detalle;
}

/* MENTORÍAS */

async function obtenerMentorias() {
    const mentorias = await Mentoria.find()
        .sort({ fechaInicio: -1, id: 1 })
        .lean();

    return Promise.all(
        mentorias.map(construirMentoriaDetallada)
    );
}

async function buscarMentoriaPorId(id) {
    const mentoria = await Mentoria.findOne({ id }).lean();
    return mentoria
        ? construirMentoriaDetallada(mentoria)
        : null;
}

async function prepararDatosMentoria(datos) {
    await validarEgresado(datos.egresadoId);
    const mentor = await validarMentor(datos.mentorId);
    validarParticipantesDistintos(datos.egresadoId, mentor);

    if (mentor.estado === "Inactivo") {
        throw crearError(
            "La persona mentora seleccionada está inactiva",
            409
        );
    }

    const solicitudId = limpiarTexto(datos.solicitudId);

    if (solicitudId) {
        const solicitud = await buscarSolicitudInternaPorId(solicitudId);

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

async function vincularSolicitudConMentoria(solicitudId, mentorId) {
    if (!solicitudId) {
        return;
    }

    const solicitud = await buscarSolicitudInternaPorId(solicitudId);

    if (!solicitud) {
        return;
    }

    const mentorAnteriorId = solicitud.mentorId;
    solicitud.estado = "Asignada";
    solicitud.mentorId = mentorId;
    await solicitud.save();

    if (mentorAnteriorId && mentorAnteriorId !== mentorId) {
        await sincronizarEstadoMentor(mentorAnteriorId);
    }
}

async function liberarSolicitud(solicitudId) {
    if (!solicitudId) {
        return;
    }

    const solicitud = await buscarSolicitudInternaPorId(solicitudId);

    if (!solicitud) {
        return;
    }

    const mentorAnteriorId = solicitud.mentorId;
    solicitud.estado = "Pendiente";
    solicitud.mentorId = "";
    solicitud.observacionesAsignacion = "";
    await solicitud.save();

    if (mentorAnteriorId) {
        await sincronizarEstadoMentor(mentorAnteriorId);
    }
}

async function crearMentoria(datos) {
    const datosPreparados = await prepararDatosMentoria(datos);

    if (
        datosPreparados.solicitudId &&
        await Mentoria.exists({
            solicitudId: datosPreparados.solicitudId
        })
    ) {
        throw crearError(
            "La solicitud seleccionada ya está vinculada a una mentoría",
            409
        );
    }

    const mentoria = await Mentoria.create({
        id: generarId("ment"),
        ...datosPreparados
    });

    await vincularSolicitudConMentoria(
        mentoria.solicitudId,
        mentoria.mentorId
    );

    await sincronizarEstadoMentor(mentoria.mentorId);
    return construirMentoriaDetallada(mentoria);
}

async function actualizarMentoria(id, datos) {
    const mentoria = await buscarMentoriaInternaPorId(id);

    if (!mentoria) {
        return null;
    }

    const mentorAnteriorId = mentoria.mentorId;
    const solicitudAnteriorId = mentoria.solicitudId;
    const datosPreparados = await prepararDatosMentoria(datos);

    if (
        datosPreparados.solicitudId &&
        await Mentoria.exists({
            solicitudId: datosPreparados.solicitudId,
            id: { $ne: id }
        })
    ) {
        throw crearError(
            "La solicitud seleccionada ya está vinculada a otra mentoría",
            409
        );
    }

    if (
        solicitudAnteriorId &&
        solicitudAnteriorId !== datosPreparados.solicitudId
    ) {
        await liberarSolicitud(solicitudAnteriorId);
    }

    Object.assign(mentoria, datosPreparados);
    await mentoria.save();

    await vincularSolicitudConMentoria(
        mentoria.solicitudId,
        mentoria.mentorId
    );

    if (mentorAnteriorId) {
        await sincronizarEstadoMentor(mentorAnteriorId);
    }

    await sincronizarEstadoMentor(mentoria.mentorId);
    return construirMentoriaDetallada(mentoria);
}

async function eliminarMentoria(id) {
    const mentoria = await buscarMentoriaInternaPorId(id);

    if (!mentoria) {
        return null;
    }

    const detalle = await construirMentoriaDetallada(mentoria);
    const mentorId = mentoria.mentorId;
    const solicitudId = mentoria.solicitudId;

    await Mentoria.deleteOne({ id });
    await liberarSolicitud(solicitudId);
    await sincronizarEstadoMentor(mentorId);

    return detalle;
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
