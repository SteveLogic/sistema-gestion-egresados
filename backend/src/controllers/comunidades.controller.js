const comunidadesService = require(
    "../services/comunidades.service"
);

function texto(valor) {
    return String(valor ?? "").trim();
}

function esFechaValida(valor) {
    return /^\d{4}-\d{2}-\d{2}$/.test(texto(valor)) &&
        !Number.isNaN(Date.parse(`${texto(valor)}T00:00:00`));
}

function esCorreoValido(valor) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto(valor));
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

function validarComunidad(datos) {
    const errores = [];

    if (texto(datos.nombre).length < 5) {
        errores.push("El nombre debe contener al menos 5 caracteres");
    }

    if (texto(datos.nombre).length > 150) {
        errores.push("El nombre no puede superar 150 caracteres");
    }

    if (!texto(datos.areaProfesional)) {
        errores.push("Debe seleccionar un área profesional");
    }

    if (texto(datos.responsable).length < 3) {
        errores.push("La persona responsable es obligatoria");
    }

    if (!esCorreoValido(datos.correo)) {
        errores.push("El correo de contacto no es válido");
    }

    if (!texto(datos.modalidad)) {
        errores.push("Debe seleccionar una modalidad");
    }

    if (!texto(datos.tipoAcceso)) {
        errores.push("Debe seleccionar un tipo de acceso");
    }

    const cupo = Number(datos.cupoMaximo);
    if (!Number.isInteger(cupo) || cupo < 1 || cupo > 5000) {
        errores.push("El cupo máximo debe ser un entero entre 1 y 5000");
    }

    const cantidad = Number(datos.cantidadIntegrantes ?? 0);
    if (!Number.isInteger(cantidad) || cantidad < 0) {
        errores.push(
            "La cantidad de integrantes debe ser un entero mayor o igual a cero"
        );
    }

    if (!esFechaValida(datos.fechaCreacion)) {
        errores.push("La fecha de creación no es válida");
    }

    if (!texto(datos.estado)) {
        errores.push("Debe seleccionar un estado");
    }

    if (texto(datos.descripcion).length < 10) {
        errores.push(
            "La descripción debe contener al menos 10 caracteres"
        );
    }

    if (texto(datos.descripcion).length > 1000) {
        errores.push("La descripción no puede superar 1000 caracteres");
    }

    if (!esUrlValida(datos.enlace)) {
        errores.push("El enlace debe utilizar http o https");
    }

    return errores;
}

function responderError(respuesta, error) {
    console.error("Error en comunidades:", error);

    return respuesta.status(error.estado || 500).json({
        exito: false,
        mensaje:
            error.estado
                ? error.message
                : "Ocurrió un error interno en el módulo de comunidades",
        errores: error.errores || []
    });
}

function responderValidacion(respuesta, errores) {
    return respuesta.status(400).json({
        exito: false,
        mensaje: "Los datos de la comunidad no son válidos",
        errores
    });
}

function obtenerComunidades(solicitud, respuesta) {
    try {
        return respuesta.json({
            exito: true,
            mensaje: "Comunidades consultadas correctamente",
            datos: comunidadesService.obtenerComunidades()
        });
    } catch (error) {
        return responderError(respuesta, error);
    }
}

function obtenerComunidadPorId(solicitud, respuesta) {
    try {
        const comunidad = comunidadesService.buscarComunidadPorId(
            solicitud.params.id
        );

        if (!comunidad) {
            return respuesta.status(404).json({
                exito: false,
                mensaje: "La comunidad no fue encontrada",
                errores: []
            });
        }

        return respuesta.json({
            exito: true,
            mensaje: "Comunidad consultada correctamente",
            datos: comunidad
        });
    } catch (error) {
        return responderError(respuesta, error);
    }
}

function obtenerIntegrantes(solicitud, respuesta) {
    try {
        const resultado = comunidadesService.obtenerIntegrantes(
            solicitud.params.id
        );

        if (!resultado) {
            return respuesta.status(404).json({
                exito: false,
                mensaje: "La comunidad no fue encontrada",
                errores: []
            });
        }

        return respuesta.json({
            exito: true,
            mensaje: "Integrantes consultados correctamente",
            datos: resultado
        });
    } catch (error) {
        return responderError(respuesta, error);
    }
}

function crearComunidad(solicitud, respuesta) {
    const errores = validarComunidad(solicitud.body);

    if (errores.length > 0) {
        return responderValidacion(respuesta, errores);
    }

    try {
        const comunidad = comunidadesService.crearComunidad(
            solicitud.body
        );

        return respuesta.status(201).json({
            exito: true,
            mensaje: "Comunidad registrada correctamente",
            datos: comunidad
        });
    } catch (error) {
        return responderError(respuesta, error);
    }
}

function actualizarComunidad(solicitud, respuesta) {
    const errores = validarComunidad(solicitud.body);

    if (errores.length > 0) {
        return responderValidacion(respuesta, errores);
    }

    try {
        const comunidad = comunidadesService.actualizarComunidad(
            solicitud.params.id,
            solicitud.body
        );

        if (!comunidad) {
            return respuesta.status(404).json({
                exito: false,
                mensaje: "La comunidad no fue encontrada",
                errores: []
            });
        }

        return respuesta.json({
            exito: true,
            mensaje: "Comunidad actualizada correctamente",
            datos: comunidad
        });
    } catch (error) {
        return responderError(respuesta, error);
    }
}

function eliminarComunidad(solicitud, respuesta) {
    try {
        const comunidad = comunidadesService.eliminarComunidad(
            solicitud.params.id
        );

        if (!comunidad) {
            return respuesta.status(404).json({
                exito: false,
                mensaje: "La comunidad no fue encontrada",
                errores: []
            });
        }

        return respuesta.json({
            exito: true,
            mensaje: "Comunidad eliminada correctamente",
            datos: comunidad
        });
    } catch (error) {
        return responderError(respuesta, error);
    }
}

module.exports = {
    obtenerComunidades,
    obtenerComunidadPorId,
    obtenerIntegrantes,
    crearComunidad,
    actualizarComunidad,
    eliminarComunidad
};
