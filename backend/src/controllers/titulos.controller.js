const titulosService = require(
    "../services/titulos.service"
);

function normalizarTextoValidacion(valor) {
    if (typeof valor !== "string") {
        return "";
    }

    return valor
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function validarDatosTitulo(datosTitulo) {
    const errores = [];

    validarCampoObligatorio(
        datosTitulo.egresadoId,
        "El egresado es obligatorio",
        errores
    );

    validarTipoPrograma(
        datosTitulo.tipoPrograma,
        errores
    );

    validarCampoObligatorio(
        datosTitulo.carreraId,
        "La carrera es obligatoria",
        errores
    );

    validarCampoObligatorio(
        datosTitulo.escuelaId,
        "La escuela académica es obligatoria",
        errores
    );

    validarAnioGraduacion(
        datosTitulo.anioGraduacion,
        errores
    );

    validarEstado(
        datosTitulo.estado,
        errores
    );

    validarObservaciones(
        datosTitulo.observaciones,
        errores
    );

    return errores;
}

function validarCampoObligatorio(
    valor,
    mensaje,
    errores
) {
    if (
        typeof valor !== "string" ||
        valor.trim() === ""
    ) {
        errores.push(mensaje);
    }
}

function validarTipoPrograma(
    tipoPrograma,
    errores
) {
    const tipoNormalizado =
        normalizarTextoValidacion(
            tipoPrograma
        );

    const tiposPermitidos = [
        "tecnico",
        "bachillerato",
        "maestria"
    ];

    if (
        !tiposPermitidos.includes(
            tipoNormalizado
        )
    ) {
        errores.push(
            "El tipo de programa debe ser Técnico, Bachillerato o Maestría"
        );
    }
}

function validarAnioGraduacion(
    anioGraduacion,
    errores
) {
    const anio = Number(anioGraduacion);
    const anioMaximo =
        new Date().getFullYear() + 1;

    if (!Number.isInteger(anio)) {
        errores.push(
            "El año de graduación debe ser un número entero"
        );
        return;
    }

    if (
        anio < 1950 ||
        anio > anioMaximo
    ) {
        errores.push(
            `El año de graduación debe estar entre 1950 y ${anioMaximo}`
        );
    }
}

function validarEstado(estado, errores) {
    const estadoNormalizado =
        normalizarTextoValidacion(estado);

    const estadosPermitidos = [
        "registrado",
        "en revision",
        "inactivo"
    ];

    if (
        !estadosPermitidos.includes(
            estadoNormalizado
        )
    ) {
        errores.push(
            "El estado debe ser Registrado, En revisión o Inactivo"
        );
    }
}

function validarObservaciones(
    observaciones,
    errores
) {
    if (
        typeof observaciones === "string" &&
        observaciones.trim().length > 500
    ) {
        errores.push(
            "Las observaciones no pueden superar los 500 caracteres"
        );
    }
}

async function obtenerTitulos(
    solicitud,
    respuesta
) {
    try {
        const titulos =
            await titulosService.obtenerTitulos();

        return respuesta.status(200).json({
            exito: true,
            mensaje:
                "Títulos obtenidos correctamente",
            datos: titulos
        });
    } catch (error) {
        return respuesta.status(500).json({
            exito: false,
            mensaje:
                "No fue posible obtener los títulos",
            errores: [error.message]
        });
    }
}

async function obtenerTituloPorId(
    solicitud,
    respuesta
) {
    const { id } = solicitud.params;

    try {
        const titulo =
            await titulosService.buscarTituloPorId(
                id
            );

        if (!titulo) {
            return respuesta.status(404).json({
                exito: false,
                mensaje:
                    "El título no fue encontrado",
                errores: []
            });
        }

        return respuesta.status(200).json({
            exito: true,
            mensaje:
                "Título obtenido correctamente",
            datos: titulo
        });
    } catch (error) {
        return respuesta.status(500).json({
            exito: false,
            mensaje:
                "No fue posible consultar el título",
            errores: [error.message]
        });
    }
}

async function obtenerTitulosPorEgresado(
    solicitud,
    respuesta
) {
    const { egresadoId } =
        solicitud.params;

    try {
        const titulos =
            await titulosService
                .buscarTitulosPorEgresado(
                    egresadoId
                );

        return respuesta.status(200).json({
            exito: true,
            mensaje:
                "Títulos del egresado obtenidos correctamente",
            datos: titulos
        });
    } catch (error) {
        return respuesta.status(500).json({
            exito: false,
            mensaje:
                "No fue posible consultar los títulos del egresado",
            errores: [error.message]
        });
    }
}

async function crearTitulo(
    solicitud,
    respuesta
) {
    const datosTitulo =
        solicitud.body || {};

    const errores =
        validarDatosTitulo(datosTitulo);

    if (errores.length > 0) {
        return respuesta.status(400).json({
            exito: false,
            mensaje:
                "Los datos del título no son válidos",
            errores
        });
    }

    try {
        const nuevoTitulo =
            await titulosService.crearTitulo(
                datosTitulo
            );

        return respuesta.status(201).json({
            exito: true,
            mensaje:
                "Título registrado correctamente",
            datos: nuevoTitulo
        });
    } catch (error) {
        const esDuplicado =
            error.message.includes(
                "ya tiene"
            );

        return respuesta
            .status(esDuplicado ? 409 : 400)
            .json({
                exito: false,
                mensaje: error.message,
                errores: []
            });
    }
}

async function actualizarTitulo(
    solicitud,
    respuesta
) {
    const { id } = solicitud.params;
    const datosTitulo =
        solicitud.body || {};

    const errores =
        validarDatosTitulo(datosTitulo);

    if (errores.length > 0) {
        return respuesta.status(400).json({
            exito: false,
            mensaje:
                "Los datos del título no son válidos",
            errores
        });
    }

    try {
        const tituloActualizado =
            await titulosService.actualizarTitulo(
                id,
                datosTitulo
            );

        if (!tituloActualizado) {
            return respuesta.status(404).json({
                exito: false,
                mensaje:
                    "El título no fue encontrado",
                errores: []
            });
        }

        return respuesta.status(200).json({
            exito: true,
            mensaje:
                "Título actualizado correctamente",
            datos: tituloActualizado
        });
    } catch (error) {
        const esDuplicado =
            error.message.includes(
                "otro registro"
            ) ||
            error.message.includes(
                "ya tiene"
            );

        return respuesta
            .status(esDuplicado ? 409 : 400)
            .json({
                exito: false,
                mensaje: error.message,
                errores: []
            });
    }
}

async function eliminarTitulo(
    solicitud,
    respuesta
) {
    const { id } = solicitud.params;

    try {
        const tituloEliminado =
            await titulosService.eliminarTitulo(
                id
            );

        if (!tituloEliminado) {
            return respuesta.status(404).json({
                exito: false,
                mensaje:
                    "El título no fue encontrado",
                errores: []
            });
        }

        return respuesta.status(200).json({
            exito: true,
            mensaje:
                "Título eliminado correctamente",
            datos: tituloEliminado
        });
    } catch (error) {
        return respuesta.status(500).json({
            exito: false,
            mensaje:
                "No fue posible eliminar el título",
            errores: [error.message]
        });
    }
}

module.exports = {
    obtenerTitulos,
    obtenerTituloPorId,
    obtenerTitulosPorEgresado,
    crearTitulo,
    actualizarTitulo,
    eliminarTitulo
};
