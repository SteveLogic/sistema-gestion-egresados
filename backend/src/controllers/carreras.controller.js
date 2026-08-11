const carrerasService = require(
    "../services/carreras.service"
);

function validarDatosCarrera(datosCarrera) {
    const errores = [];

    if (
        !datosCarrera.codigo ||
        datosCarrera.codigo.trim() === ""
    ) {
        errores.push(
            "El código de la carrera es obligatorio"
        );
    } else {
        const patronCodigo =
            /^[A-Za-z0-9-]{2,20}$/;

        if (
            !patronCodigo.test(
                datosCarrera.codigo.trim()
            )
        ) {
            errores.push(
                "El código debe tener entre 2 y 20 caracteres y solamente puede contener letras, números o guiones"
            );
        }
    }

    if (
        !datosCarrera.nombre ||
        datosCarrera.nombre.trim() === ""
    ) {
        errores.push(
            "El nombre de la carrera es obligatorio"
        );
    }

    if (
        !datosCarrera.escuela ||
        datosCarrera.escuela.trim() === ""
    ) {
        errores.push(
            "La escuela académica es obligatoria"
        );
    }

    if (
        !datosCarrera.descripcion ||
        datosCarrera.descripcion.trim() === ""
    ) {
        errores.push(
            "La descripción es obligatoria"
        );
    }

    const estadosPermitidos = [
        "Activa",
        "Inactiva"
    ];

    if (
        !datosCarrera.estado ||
        !estadosPermitidos.includes(
            datosCarrera.estado
        )
    ) {
        errores.push(
            "El estado debe ser Activa o Inactiva"
        );
    }

    return errores;
}

async function obtenerCarreras(
    solicitud,
    respuesta
) {
    try {
        const carreras =
            await carrerasService.obtenerCarreras();

        return respuesta.status(200).json({
            exito: true,
            mensaje:
                "Carreras obtenidas correctamente",
            datos: carreras
        });
    } catch (error) {
        return respuesta.status(500).json({
            exito: false,
            mensaje:
                "No fue posible obtener las carreras",
            errores: [error.message]
        });
    }
}

async function obtenerCarreraPorId(
    solicitud,
    respuesta
) {
    const { id } = solicitud.params;

    try {
        const carrera =
            await carrerasService.buscarCarreraPorId(
                id
            );

        if (!carrera) {
            return respuesta.status(404).json({
                exito: false,
                mensaje:
                    "La carrera no fue encontrada",
                errores: []
            });
        }

        return respuesta.status(200).json({
            exito: true,
            mensaje:
                "Carrera obtenida correctamente",
            datos: carrera
        });
    } catch (error) {
        return respuesta.status(500).json({
            exito: false,
            mensaje:
                "No fue posible consultar la carrera",
            errores: [error.message]
        });
    }
}

async function crearCarrera(
    solicitud,
    respuesta
) {
    const datosCarrera =
        solicitud.body || {};

    const errores =
        validarDatosCarrera(datosCarrera);

    if (errores.length > 0) {
        return respuesta.status(400).json({
            exito: false,
            mensaje:
                "Los datos de la carrera no son válidos",
            errores
        });
    }

    try {
        const nuevaCarrera =
            await carrerasService.crearCarrera(
                datosCarrera
            );

        return respuesta.status(201).json({
            exito: true,
            mensaje:
                "Carrera registrada correctamente",
            datos: nuevaCarrera
        });
    } catch (error) {
        return respuesta.status(409).json({
            exito: false,
            mensaje: error.message,
            errores: []
        });
    }
}

async function actualizarCarrera(
    solicitud,
    respuesta
) {
    const { id } = solicitud.params;
    const datosCarrera =
        solicitud.body || {};

    const errores =
        validarDatosCarrera(datosCarrera);

    if (errores.length > 0) {
        return respuesta.status(400).json({
            exito: false,
            mensaje:
                "Los datos de la carrera no son válidos",
            errores
        });
    }

    try {
        const carreraActualizada =
            await carrerasService.actualizarCarrera(
                id,
                datosCarrera
            );

        if (!carreraActualizada) {
            return respuesta.status(404).json({
                exito: false,
                mensaje:
                    "La carrera no fue encontrada",
                errores: []
            });
        }

        return respuesta.status(200).json({
            exito: true,
            mensaje:
                "Carrera actualizada correctamente",
            datos: carreraActualizada
        });
    } catch (error) {
        return respuesta.status(409).json({
            exito: false,
            mensaje: error.message,
            errores: []
        });
    }
}

async function eliminarCarrera(
    solicitud,
    respuesta
) {
    const { id } = solicitud.params;

    try {
        const carreraEliminada =
            await carrerasService.eliminarCarrera(
                id
            );

        if (!carreraEliminada) {
            return respuesta.status(404).json({
                exito: false,
                mensaje:
                    "La carrera no fue encontrada",
                errores: []
            });
        }

        return respuesta.status(200).json({
            exito: true,
            mensaje:
                "Carrera eliminada correctamente",
            datos: carreraEliminada
        });
    } catch (error) {
        return respuesta.status(500).json({
            exito: false,
            mensaje:
                "No fue posible eliminar la carrera",
            errores: [error.message]
        });
    }
}

module.exports = {
    obtenerCarreras,
    obtenerCarreraPorId,
    crearCarrera,
    actualizarCarrera,
    eliminarCarrera
};
