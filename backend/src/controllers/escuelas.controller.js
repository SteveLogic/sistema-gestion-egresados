const escuelasService = require(
    "../services/escuelas.service"
);

function validarDatosEscuela(datosEscuela) {
    const errores = [];

    if (
        !datosEscuela.codigo ||
        datosEscuela.codigo.trim() === ""
    ) {
        errores.push(
            "El código de la escuela es obligatorio"
        );
    } else {
        const patronCodigo =
            /^[A-Za-z0-9-]{2,20}$/;

        if (
            !patronCodigo.test(
                datosEscuela.codigo.trim()
            )
        ) {
            errores.push(
                "El código debe tener entre 2 y 20 caracteres y solamente puede contener letras, números o guiones"
            );
        }
    }

    if (
        !datosEscuela.nombre ||
        datosEscuela.nombre.trim() === ""
    ) {
        errores.push(
            "El nombre de la escuela es obligatorio"
        );
    }

    if (
        !datosEscuela.responsable ||
        datosEscuela.responsable.trim() === ""
    ) {
        errores.push(
            "El nombre de la persona responsable es obligatorio"
        );
    }

    if (
        !datosEscuela.correo ||
        datosEscuela.correo.trim() === ""
    ) {
        errores.push(
            "El correo electrónico es obligatorio"
        );
    } else {
        const patronCorreo =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
            !patronCorreo.test(
                datosEscuela.correo.trim()
            )
        ) {
            errores.push(
                "El correo electrónico no tiene un formato válido"
            );
        }
    }

    if (
        !datosEscuela.telefono ||
        datosEscuela.telefono.trim() === ""
    ) {
        errores.push(
            "El teléfono es obligatorio"
        );
    } else {
        const patronTelefono =
            /^\d{4}-?\d{4}$/;

        if (
            !patronTelefono.test(
                datosEscuela.telefono.trim()
            )
        ) {
            errores.push(
                "El teléfono debe contener ocho números, con o sin guion"
            );
        }
    }

    if (
        !datosEscuela.descripcion ||
        datosEscuela.descripcion.trim() === ""
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
        !datosEscuela.estado ||
        !estadosPermitidos.includes(
            datosEscuela.estado
        )
    ) {
        errores.push(
            "El estado debe ser Activa o Inactiva"
        );
    }

    return errores;
}

async function obtenerEscuelas(
    solicitud,
    respuesta
) {
    try {
        const escuelas =
            await escuelasService.obtenerEscuelas();

        return respuesta.status(200).json({
            exito: true,
            mensaje:
                "Escuelas obtenidas correctamente",
            datos: escuelas
        });
    } catch (error) {
        return respuesta.status(500).json({
            exito: false,
            mensaje:
                "No fue posible obtener las escuelas",
            errores: [error.message]
        });
    }
}

async function obtenerEscuelaPorId(
    solicitud,
    respuesta
) {
    const { id } = solicitud.params;

    try {
        const escuela =
            await escuelasService.buscarEscuelaPorId(
                id
            );

        if (!escuela) {
            return respuesta.status(404).json({
                exito: false,
                mensaje:
                    "La escuela no fue encontrada",
                errores: []
            });
        }

        return respuesta.status(200).json({
            exito: true,
            mensaje:
                "Escuela obtenida correctamente",
            datos: escuela
        });
    } catch (error) {
        return respuesta.status(500).json({
            exito: false,
            mensaje:
                "No fue posible consultar la escuela",
            errores: [error.message]
        });
    }
}

async function crearEscuela(
    solicitud,
    respuesta
) {
    const datosEscuela =
        solicitud.body || {};

    const errores =
        validarDatosEscuela(datosEscuela);

    if (errores.length > 0) {
        return respuesta.status(400).json({
            exito: false,
            mensaje:
                "Los datos de la escuela no son válidos",
            errores
        });
    }

    try {
        const nuevaEscuela =
            await escuelasService.crearEscuela(
                datosEscuela
            );

        return respuesta.status(201).json({
            exito: true,
            mensaje:
                "Escuela registrada correctamente",
            datos: nuevaEscuela
        });
    } catch (error) {
        return respuesta.status(409).json({
            exito: false,
            mensaje: error.message,
            errores: []
        });
    }
}

async function actualizarEscuela(
    solicitud,
    respuesta
) {
    const { id } = solicitud.params;
    const datosEscuela =
        solicitud.body || {};

    const errores =
        validarDatosEscuela(datosEscuela);

    if (errores.length > 0) {
        return respuesta.status(400).json({
            exito: false,
            mensaje:
                "Los datos de la escuela no son válidos",
            errores
        });
    }

    try {
        const escuelaActualizada =
            await escuelasService.actualizarEscuela(
                id,
                datosEscuela
            );

        if (!escuelaActualizada) {
            return respuesta.status(404).json({
                exito: false,
                mensaje:
                    "La escuela no fue encontrada",
                errores: []
            });
        }

        return respuesta.status(200).json({
            exito: true,
            mensaje:
                "Escuela actualizada correctamente",
            datos: escuelaActualizada
        });
    } catch (error) {
        return respuesta.status(409).json({
            exito: false,
            mensaje: error.message,
            errores: []
        });
    }
}

async function eliminarEscuela(
    solicitud,
    respuesta
) {
    const { id } = solicitud.params;

    try {
        const escuelaEliminada =
            await escuelasService.eliminarEscuela(
                id
            );

        if (!escuelaEliminada) {
            return respuesta.status(404).json({
                exito: false,
                mensaje:
                    "La escuela no fue encontrada",
                errores: []
            });
        }

        return respuesta.status(200).json({
            exito: true,
            mensaje:
                "Escuela eliminada correctamente",
            datos: escuelaEliminada
        });
    } catch (error) {
        return respuesta.status(500).json({
            exito: false,
            mensaje:
                "No fue posible eliminar la escuela",
            errores: [error.message]
        });
    }
}

module.exports = {
    obtenerEscuelas,
    obtenerEscuelaPorId,
    crearEscuela,
    actualizarEscuela,
    eliminarEscuela
};
