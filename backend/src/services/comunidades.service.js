const Comunidad = require("../models/comunidad.model");
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

async function obtenerComunidades() {
    return Comunidad.find()
        .select("-_id -createdAt -updatedAt")
        .sort({ id: 1 })
        .lean();
}

async function buscarComunidadPorId(id) {
    return Comunidad.findOne({ id })
        .select("-_id -createdAt -updatedAt")
        .lean();
}

async function obtenerIntegrantes(id) {
    const comunidad = await Comunidad.findOne({ id })
        .select("-_id id nombre cantidadIntegrantes integrantes")
        .lean();

    if (!comunidad) return null;

    return {
        comunidadId: comunidad.id,
        comunidadNombre: comunidad.nombre,
        cantidadIntegrantes: comunidad.cantidadIntegrantes,
        integrantes: comunidad.integrantes || []
    };
}

async function validarDuplicado(datos, idActual = "") {
    const filtro = {
        nombre: patronExacto(datos.nombre)
    };

    if (idActual) {
        filtro.id = { $ne: idActual };
    }

    if (await Comunidad.exists(filtro)) {
        throw crearError(
            "Ya existe una comunidad con el mismo nombre",
            409
        );
    }
}

function construirDatosComunidad(datos, comunidadAnterior = null) {
    const cupoMaximo = Number(datos.cupoMaximo);
    const cantidadIntegrantes = Number(
        datos.cantidadIntegrantes ??
        comunidadAnterior?.cantidadIntegrantes ??
        0
    );

    if (cantidadIntegrantes > cupoMaximo) {
        throw crearError(
            "La cantidad de integrantes no puede superar el cupo máximo"
        );
    }

    return {
        nombre: limpiarTexto(datos.nombre),
        areaProfesional: obtenerValorCanonico(
            datos.areaProfesional,
            [
                "Desarrollo de software",
                "Ciberseguridad",
                "Ciencia de datos",
                "Redes y telecomunicaciones",
                "Gestión tecnológica",
                "Otra área"
            ],
            "El área profesional"
        ),
        responsable: limpiarTexto(datos.responsable),
        correo: limpiarTexto(datos.correo).toLowerCase(),
        modalidad: obtenerValorCanonico(
            datos.modalidad,
            ["Virtual", "Presencial", "Híbrida"],
            "La modalidad"
        ),
        tipoAcceso: obtenerValorCanonico(
            datos.tipoAcceso,
            [
                "Abierto para egresados",
                "Requiere solicitud",
                "Solo mediante invitación"
            ],
            "El tipo de acceso"
        ),
        cupoMaximo,
        cantidadIntegrantes,
        fechaCreacion: limpiarTexto(datos.fechaCreacion),
        estado: obtenerValorCanonico(
            datos.estado,
            ["Activa", "Inactiva", "En revisión"],
            "El estado"
        ),
        descripcion: limpiarTexto(datos.descripcion),
        enlace: limpiarTexto(datos.enlace),
        integrantes: comunidadAnterior?.integrantes || []
    };
}

async function crearComunidad(datos) {
    await validarDuplicado(datos);

    const comunidad = await Comunidad.create({
        id: generarId("com"),
        ...construirDatosComunidad(datos),
        integrantes: []
    });

    return limpiarDocumento(comunidad);
}

async function actualizarComunidad(id, datos) {
    const comunidad = await Comunidad.findOne({ id });

    if (!comunidad) return null;

    await validarDuplicado(datos, id);

    Object.assign(
        comunidad,
        construirDatosComunidad(datos, comunidad)
    );

    await comunidad.save();
    return limpiarDocumento(comunidad);
}

async function eliminarComunidad(id) {
    const comunidad = await Comunidad.findOneAndDelete({ id });
    return limpiarDocumento(comunidad);
}

module.exports = {
    obtenerComunidades,
    buscarComunidadPorId,
    obtenerIntegrantes,
    crearComunidad,
    actualizarComunidad,
    eliminarComunidad
};
