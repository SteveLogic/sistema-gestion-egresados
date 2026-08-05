const egresadosService = require(
    "../services/egresados.service"
);


/*
    VALIDACIONES
*/

function validarDatosEgresado(
    datosEgresado
) {
    const errores = [];

    validarIdentificacion(
        datosEgresado,
        errores
    );

    validarNombreCompleto(
        datosEgresado,
        errores
    );

    validarCorreo(
        datosEgresado,
        errores
    );

    validarTelefono(
        datosEgresado,
        errores
    );

    validarFechaRegistro(
        datosEgresado,
        errores
    );

    validarLugarTrabajo(
        datosEgresado,
        errores
    );

    validarEstado(
        datosEgresado,
        errores
    );

    validarEnlaceOpcional(
        datosEgresado.linkedin,
        "El perfil de LinkedIn",
        errores
    );

    validarEnlaceOpcional(
        datosEgresado.portafolio,
        "El portafolio profesional",
        errores
    );

    return errores;
}


function validarIdentificacion(
    datosEgresado,
    errores
) {
    if (
        !datosEgresado.identificacion ||
        datosEgresado.identificacion
            .trim() === ""
    ) {
        errores.push(
            "La identificación es obligatoria"
        );

        return;
    }

    const patronIdentificacion =
        /^[A-Za-z0-9-]{5,25}$/;

    if (
        !patronIdentificacion.test(
            datosEgresado.identificacion.trim()
        )
    ) {
        errores.push(
            "La identificación debe tener entre 5 y 25 caracteres y solamente puede contener letras, números o guiones"
        );
    }
}


function validarNombreCompleto(
    datosEgresado,
    errores
) {
    if (
        !datosEgresado.nombreCompleto ||
        datosEgresado.nombreCompleto
            .trim() === ""
    ) {
        errores.push(
            "El nombre completo es obligatorio"
        );

        return;
    }

    if (
        datosEgresado.nombreCompleto
            .trim()
            .length < 3
    ) {
        errores.push(
            "El nombre completo debe tener al menos 3 caracteres"
        );
    }
}


function validarCorreo(
    datosEgresado,
    errores
) {
    if (
        !datosEgresado.correo ||
        datosEgresado.correo
            .trim() === ""
    ) {
        errores.push(
            "El correo electrónico es obligatorio"
        );

        return;
    }

    const patronCorreo =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
        !patronCorreo.test(
            datosEgresado.correo.trim()
        )
    ) {
        errores.push(
            "El correo electrónico no tiene un formato válido"
        );
    }
}


function validarTelefono(
    datosEgresado,
    errores
) {
    if (
        !datosEgresado.telefono ||
        datosEgresado.telefono
            .trim() === ""
    ) {
        errores.push(
            "El teléfono es obligatorio"
        );

        return;
    }

    const patronTelefono =
        /^\d{4}-?\d{4}$/;

    if (
        !patronTelefono.test(
            datosEgresado.telefono.trim()
        )
    ) {
        errores.push(
            "El teléfono debe contener ocho números, con o sin guion"
        );
    }
}


function validarFechaRegistro(
    datosEgresado,
    errores
) {
    if (
        !datosEgresado.fechaRegistro ||
        datosEgresado.fechaRegistro
            .trim() === ""
    ) {
        errores.push(
            "La fecha de registro es obligatoria"
        );

        return;
    }

    const patronFecha =
        /^\d{4}-\d{2}-\d{2}$/;

    if (
        !patronFecha.test(
            datosEgresado.fechaRegistro.trim()
        )
    ) {
        errores.push(
            "La fecha de registro debe utilizar el formato AAAA-MM-DD"
        );

        return;
    }

    const fecha = new Date(
        `${datosEgresado.fechaRegistro}T00:00:00`
    );

    if (
        Number.isNaN(
            fecha.getTime()
        )
    ) {
        errores.push(
            "La fecha de registro no es válida"
        );
    }
}


function validarLugarTrabajo(
    datosEgresado,
    errores
) {
    if (
        !datosEgresado.lugarTrabajo ||
        datosEgresado.lugarTrabajo
            .trim() === ""
    ) {
        errores.push(
            "El lugar de trabajo es obligatorio"
        );
    }
}


function validarEstado(
    datosEgresado,
    errores
) {
    const estadosPermitidos = [
        "Activo",
        "Pendiente",
        "Inactivo"
    ];

    if (
        !datosEgresado.estado ||
        !estadosPermitidos.includes(
            datosEgresado.estado
        )
    ) {
        errores.push(
            "El estado debe ser Activo, Pendiente o Inactivo"
        );
    }
}


function validarEnlaceOpcional(
    enlace,
    nombreCampo,
    errores
) {
    if (
        !enlace ||
        enlace.trim() === ""
    ) {
        return;
    }

    try {
        const url = new URL(
            enlace.trim()
        );

        const protocolosPermitidos = [
            "http:",
            "https:"
        ];

        if (
            !protocolosPermitidos.includes(
                url.protocol
            )
        ) {
            errores.push(
                `${nombreCampo} debe utilizar http o https`
            );
        }
    } catch {
        errores.push(
            `${nombreCampo} no contiene una dirección válida`
        );
    }
}


/*
    CONSULTAR TODOS LOS EGRESADOS
*/

function obtenerEgresados(
    solicitud,
    respuesta
) {
    const egresados =
        egresadosService.obtenerEgresados();

    return respuesta.status(200).json({
        exito: true,
        mensaje:
            "Egresados obtenidos correctamente",
        datos: egresados
    });
}


/*
    CONSULTAR UN EGRESADO POR ID
*/

function obtenerEgresadoPorId(
    solicitud,
    respuesta
) {
    const { id } = solicitud.params;

    const egresado =
        egresadosService
            .buscarEgresadoPorId(id);

    if (!egresado) {
        return respuesta.status(404).json({
            exito: false,
            mensaje:
                "El egresado no fue encontrado",
            errores: []
        });
    }

    return respuesta.status(200).json({
        exito: true,
        mensaje:
            "Egresado obtenido correctamente",
        datos: egresado
    });
}


/*
    CREAR UN EGRESADO
*/

function crearEgresado(
    solicitud,
    respuesta
) {
    const datosEgresado =
        solicitud.body || {};

    const errores =
        validarDatosEgresado(
            datosEgresado
        );

    if (errores.length > 0) {
        return respuesta.status(400).json({
            exito: false,
            mensaje:
                "Los datos del egresado no son válidos",
            errores
        });
    }

    try {
        const nuevoEgresado =
            egresadosService.crearEgresado(
                datosEgresado
            );

        return respuesta.status(201).json({
            exito: true,
            mensaje:
                "Egresado registrado correctamente",
            datos: nuevoEgresado
        });
    } catch (error) {
        return respuesta.status(409).json({
            exito: false,
            mensaje: error.message,
            errores: []
        });
    }
}


/*
    IMPORTAR EGRESADOS DESDE CSV
    El navegador convierte el archivo en objetos JSON y
    este controlador valida cada fila antes de almacenarla.
*/

function importarEgresados(
    solicitud,
    respuesta
) {
    const registros = Array.isArray(
        solicitud.body
    )
        ? solicitud.body
        : solicitud.body?.registros;

    if (
        !Array.isArray(registros) ||
        registros.length === 0
    ) {
        return respuesta.status(400).json({
            exito: false,
            mensaje:
                "Debe enviar al menos un egresado para importar",
            errores: []
        });
    }

    if (registros.length > 200) {
        return respuesta.status(400).json({
            exito: false,
            mensaje:
                "El archivo no puede contener más de 200 registros",
            errores: []
        });
    }

    const detalles = [];
    const importados = [];

    registros.forEach((registro, indice) => {
        const filaCsv = Number(
            registro?.__filaCsv
        ) || indice + 2;

        const datosEgresado = {
            identificacion:
                registro?.identificacion || "",
            nombreCompleto:
                registro?.nombreCompleto || "",
            correo:
                registro?.correo || "",
            telefono:
                registro?.telefono || "",
            fechaRegistro:
                registro?.fechaRegistro || "",
            lugarTrabajo:
                registro?.lugarTrabajo || "",
            estado:
                registro?.estado || "",
            puestoActual:
                registro?.puestoActual || "",
            areaProfesional:
                registro?.areaProfesional || "",
            linkedin:
                registro?.linkedin || "",
            portafolio:
                registro?.portafolio || ""
        };

        const errores =
            validarDatosEgresado(
                datosEgresado
            );

        if (errores.length > 0) {
            detalles.push({
                fila: filaCsv,
                exito: false,
                identificacion:
                    datosEgresado.identificacion,
                nombreCompleto:
                    datosEgresado.nombreCompleto,
                errores
            });

            return;
        }

        try {
            const nuevoEgresado =
                egresadosService.crearEgresado(
                    datosEgresado
                );

            importados.push(
                nuevoEgresado
            );

            detalles.push({
                fila: filaCsv,
                exito: true,
                id: nuevoEgresado.id,
                identificacion:
                    nuevoEgresado.identificacion,
                nombreCompleto:
                    nuevoEgresado.nombreCompleto,
                errores: []
            });
        } catch (error) {
            detalles.push({
                fila: filaCsv,
                exito: false,
                identificacion:
                    datosEgresado.identificacion,
                nombreCompleto:
                    datosEgresado.nombreCompleto,
                errores: [error.message]
            });
        }
    });

    const rechazadas =
        detalles.length - importados.length;

    return respuesta.status(200).json({
        exito: true,
        mensaje:
            "Importación de egresados procesada correctamente",
        datos: {
            procesadas: detalles.length,
            importadas: importados.length,
            rechazadas,
            egresados: importados,
            detalles
        }
    });
}


/*
    ACTUALIZAR UN EGRESADO
*/

function actualizarEgresado(
    solicitud,
    respuesta
) {
    const { id } = solicitud.params;

    const datosEgresado =
        solicitud.body || {};

    const errores =
        validarDatosEgresado(
            datosEgresado
        );

    if (errores.length > 0) {
        return respuesta.status(400).json({
            exito: false,
            mensaje:
                "Los datos del egresado no son válidos",
            errores
        });
    }

    try {
        const egresadoActualizado =
            egresadosService
                .actualizarEgresado(
                    id,
                    datosEgresado
                );

        if (!egresadoActualizado) {
            return respuesta
                .status(404)
                .json({
                    exito: false,
                    mensaje:
                        "El egresado no fue encontrado",
                    errores: []
                });
        }

        return respuesta.status(200).json({
            exito: true,
            mensaje:
                "Egresado actualizado correctamente",
            datos: egresadoActualizado
        });
    } catch (error) {
        return respuesta.status(409).json({
            exito: false,
            mensaje: error.message,
            errores: []
        });
    }
}


/*
    ELIMINAR UN EGRESADO
*/

function eliminarEgresado(
    solicitud,
    respuesta
) {
    const { id } = solicitud.params;

    const egresadoEliminado =
        egresadosService
            .eliminarEgresado(id);

    if (!egresadoEliminado) {
        return respuesta.status(404).json({
            exito: false,
            mensaje:
                "El egresado no fue encontrado",
            errores: []
        });
    }

    return respuesta.status(200).json({
        exito: true,
        mensaje:
            "Egresado eliminado correctamente",
        datos: egresadoEliminado
    });
}


module.exports = {
    obtenerEgresados,
    obtenerEgresadoPorId,
    crearEgresado,
    importarEgresados,
    actualizarEgresado,
    eliminarEgresado
};