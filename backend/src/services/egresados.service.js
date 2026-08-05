const egresados = require(
    "../data/egresados.data"
);

const {
    generarId
} = require(
    "../utils/generar-id"
);


/*
    UTILIDADES INTERNAS
*/

function limpiarTexto(valor) {
    if (typeof valor !== "string") {
        return "";
    }

    return valor.trim();
}

function normalizarCorreo(correo) {
    return limpiarTexto(correo)
        .toLowerCase();
}


/*
    CONSULTAR TODOS LOS EGRESADOS
*/

function obtenerEgresados() {
    return egresados;
}


/*
    BUSCAR UN EGRESADO POR ID
*/

function buscarEgresadoPorId(id) {
    return (
        egresados.find(
            (egresado) =>
                egresado.id === id
        ) || null
    );
}


/*
    VALIDAR IDENTIFICACIÓN DUPLICADA
*/

function existeIdentificacion(
    identificacion,
    idExcluir = null
) {
    const identificacionNormalizada =
        limpiarTexto(identificacion)
            .toLowerCase();

    return egresados.some(
        (egresado) => {
            const mismaIdentificacion =
                limpiarTexto(
                    egresado.identificacion
                ).toLowerCase() ===
                identificacionNormalizada;

            const diferenteId =
                egresado.id !== idExcluir;

            return (
                mismaIdentificacion &&
                diferenteId
            );
        }
    );
}


/*
    VALIDAR CORREO DUPLICADO
*/

function existeCorreo(
    correo,
    idExcluir = null
) {
    const correoNormalizado =
        normalizarCorreo(correo);

    return egresados.some(
        (egresado) => {
            const mismoCorreo =
                normalizarCorreo(
                    egresado.correo
                ) === correoNormalizado;

            const diferenteId =
                egresado.id !== idExcluir;

            return (
                mismoCorreo &&
                diferenteId
            );
        }
    );
}


/*
    CREAR UN EGRESADO
*/

function crearEgresado(
    datosEgresado
) {
    if (
        existeIdentificacion(
            datosEgresado.identificacion
        )
    ) {
        throw new Error(
            "Ya existe un egresado con esa identificación"
        );
    }

    if (
        existeCorreo(
            datosEgresado.correo
        )
    ) {
        throw new Error(
            "Ya existe un egresado con ese correo"
        );
    }

    const nuevoEgresado = {
        id: generarId("egr"),

        identificacion:
            limpiarTexto(
                datosEgresado.identificacion
            ),

        nombreCompleto:
            limpiarTexto(
                datosEgresado.nombreCompleto
            ),

        correo:
            normalizarCorreo(
                datosEgresado.correo
            ),

        telefono:
            limpiarTexto(
                datosEgresado.telefono
            ),

        fechaRegistro:
            limpiarTexto(
                datosEgresado.fechaRegistro
            ),

        lugarTrabajo:
            limpiarTexto(
                datosEgresado.lugarTrabajo
            ),

        estado:
            limpiarTexto(
                datosEgresado.estado
            ),

        puestoActual:
            limpiarTexto(
                datosEgresado.puestoActual
            ),

        areaProfesional:
            limpiarTexto(
                datosEgresado.areaProfesional
            ),

        linkedin:
            limpiarTexto(
                datosEgresado.linkedin
            ),

        portafolio:
            limpiarTexto(
                datosEgresado.portafolio
            )
    };

    egresados.push(nuevoEgresado);

    return nuevoEgresado;
}


/*
    ACTUALIZAR UN EGRESADO
*/

function actualizarEgresado(
    id,
    datosEgresado
) {
    const egresadoEncontrado =
        buscarEgresadoPorId(id);

    if (!egresadoEncontrado) {
        return null;
    }

    if (
        existeIdentificacion(
            datosEgresado.identificacion,
            id
        )
    ) {
        throw new Error(
            "Ya existe otro egresado con esa identificación"
        );
    }

    if (
        existeCorreo(
            datosEgresado.correo,
            id
        )
    ) {
        throw new Error(
            "Ya existe otro egresado con ese correo"
        );
    }

    egresadoEncontrado.identificacion =
        limpiarTexto(
            datosEgresado.identificacion
        );

    egresadoEncontrado.nombreCompleto =
        limpiarTexto(
            datosEgresado.nombreCompleto
        );

    egresadoEncontrado.correo =
        normalizarCorreo(
            datosEgresado.correo
        );

    egresadoEncontrado.telefono =
        limpiarTexto(
            datosEgresado.telefono
        );

    egresadoEncontrado.fechaRegistro =
        limpiarTexto(
            datosEgresado.fechaRegistro
        );

    egresadoEncontrado.lugarTrabajo =
        limpiarTexto(
            datosEgresado.lugarTrabajo
        );

    egresadoEncontrado.estado =
        limpiarTexto(
            datosEgresado.estado
        );

    egresadoEncontrado.puestoActual =
        limpiarTexto(
            datosEgresado.puestoActual
        );

    egresadoEncontrado.areaProfesional =
        limpiarTexto(
            datosEgresado.areaProfesional
        );

    egresadoEncontrado.linkedin =
        limpiarTexto(
            datosEgresado.linkedin
        );

    egresadoEncontrado.portafolio =
        limpiarTexto(
            datosEgresado.portafolio
        );

    return egresadoEncontrado;
}


/*
    ELIMINAR UN EGRESADO
*/

function eliminarEgresado(id) {
    const indiceEgresado =
        egresados.findIndex(
            (egresado) =>
                egresado.id === id
        );

    if (indiceEgresado === -1) {
        return null;
    }

    const egresadosEliminados =
        egresados.splice(
            indiceEgresado,
            1
        );

    return egresadosEliminados[0];
}


module.exports = {
    obtenerEgresados,
    buscarEgresadoPorId,
    crearEgresado,
    actualizarEgresado,
    eliminarEgresado
};