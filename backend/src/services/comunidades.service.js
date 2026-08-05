const comunidades = require("../data/comunidades.data");
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

function copiarComunidad(comunidad) {
    return {
        ...comunidad,
        integrantes: comunidad.integrantes.map((integrante) => ({
            ...integrante
        }))
    };
}

function buscarComunidadInternaPorId(id) {
    return comunidades.find((comunidad) => comunidad.id === id);
}

function obtenerComunidades() {
    return comunidades.map(copiarComunidad);
}

function buscarComunidadPorId(id) {
    const comunidad = buscarComunidadInternaPorId(id);
    return comunidad ? copiarComunidad(comunidad) : null;
}

function obtenerIntegrantes(id) {
    const comunidad = buscarComunidadInternaPorId(id);

    if (!comunidad) {
        return null;
    }

    return {
        comunidadId: comunidad.id,
        comunidadNombre: comunidad.nombre,
        cantidadIntegrantes: comunidad.cantidadIntegrantes,
        integrantes: comunidad.integrantes.map((integrante) => ({
            ...integrante
        }))
    };
}

function validarDuplicado(datos, idActual = "") {
    const duplicada = comunidades.some(
        (comunidad) =>
            comunidad.id !== idActual &&
            normalizarTexto(comunidad.nombre) ===
                normalizarTexto(datos.nombre)
    );

    if (duplicada) {
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

function crearComunidad(datos) {
    validarDuplicado(datos);

    const comunidad = {
        id: generarId("com"),
        ...construirDatosComunidad(datos)
    };

    comunidades.push(comunidad);
    return copiarComunidad(comunidad);
}

function actualizarComunidad(id, datos) {
    const comunidad = buscarComunidadInternaPorId(id);

    if (!comunidad) {
        return null;
    }

    validarDuplicado(datos, id);

    Object.assign(
        comunidad,
        construirDatosComunidad(datos, comunidad)
    );

    return copiarComunidad(comunidad);
}

function eliminarComunidad(id) {
    const indice = comunidades.findIndex(
        (comunidad) => comunidad.id === id
    );

    if (indice === -1) {
        return null;
    }

    const [comunidadEliminada] = comunidades.splice(indice, 1);
    return copiarComunidad(comunidadEliminada);
}

module.exports = {
    obtenerComunidades,
    buscarComunidadPorId,
    obtenerIntegrantes,
    crearComunidad,
    actualizarComunidad,
    eliminarComunidad
};
