const titulos = require(
    "../data/titulos.data"
);

const egresados = require(
    "../data/egresados.data"
);

const carreras = require(
    "../data/carreras.data"
);

const escuelas = require(
    "../data/escuelas.data"
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


function buscarTituloInternoPorId(id) {
    return (
        titulos.find(
            (titulo) =>
                titulo.id === id
        ) || null
    );
}


function buscarEgresadoPorId(id) {
    return (
        egresados.find(
            (egresado) =>
                egresado.id === id
        ) || null
    );
}


function buscarCarreraPorId(id) {
    return (
        carreras.find(
            (carrera) =>
                carrera.id === id
        ) || null
    );
}


function buscarEscuelaPorId(id) {
    return (
        escuelas.find(
            (escuela) =>
                escuela.id === id
        ) || null
    );
}


/*
    AGREGAR INFORMACIÓN DE LAS RELACIONES
*/

function construirTituloDetallado(
    titulo
) {
    const egresado =
        buscarEgresadoPorId(
            titulo.egresadoId
        );

    const carrera =
        buscarCarreraPorId(
            titulo.carreraId
        );

    const escuela =
        buscarEscuelaPorId(
            titulo.escuelaId
        );

    return {
        ...titulo,

        egresadoNombre:
            egresado
                ? egresado.nombreCompleto
                : "No disponible",

        egresadoIdentificacion:
            egresado
                ? egresado.identificacion
                : "No disponible",

        carreraNombre:
            carrera
                ? carrera.nombre
                : "No disponible",

        carreraCodigo:
            carrera
                ? carrera.codigo
                : "No disponible",

        escuelaNombre:
            escuela
                ? escuela.nombre
                : "No disponible",

        escuelaCodigo:
            escuela
                ? escuela.codigo
                : "No disponible"
    };
}


/*
    CONSULTAR TODOS LOS TÍTULOS
*/

function obtenerTitulos() {
    return titulos.map(
        construirTituloDetallado
    );
}


/*
    CONSULTAR UN TÍTULO POR ID
*/

function buscarTituloPorId(id) {
    const titulo =
        buscarTituloInternoPorId(id);

    if (!titulo) {
        return null;
    }

    return construirTituloDetallado(
        titulo
    );
}


/*
    CONSULTAR TÍTULOS DE UN EGRESADO
*/

function buscarTitulosPorEgresado(
    egresadoId
) {
    return titulos
        .filter(
            (titulo) =>
                titulo.egresadoId ===
                egresadoId
        )
        .map(
            construirTituloDetallado
        );
}


/*
    VALIDAR RELACIONES
*/

function validarRelaciones(
    datosTitulo
) {
    const egresado =
        buscarEgresadoPorId(
            datosTitulo.egresadoId
        );

    if (!egresado) {
        throw new Error(
            "El egresado seleccionado no existe"
        );
    }

    const carrera =
        buscarCarreraPorId(
            datosTitulo.carreraId
        );

    if (!carrera) {
        throw new Error(
            "La carrera seleccionada no existe"
        );
    }

    const escuela =
        buscarEscuelaPorId(
            datosTitulo.escuelaId
        );

    if (!escuela) {
        throw new Error(
            "La escuela seleccionada no existe"
        );
    }

    if (
        carrera.escuela !==
        escuela.nombre
    ) {
        throw new Error(
            "La carrera seleccionada no pertenece a la escuela indicada"
        );
    }
}


/*
    VALIDAR TÍTULO DUPLICADO
*/

function existeTituloDuplicado(
    datosTitulo,
    idExcluir = null
) {
    return titulos.some(
        (titulo) => {
            const mismoEgresado =
                titulo.egresadoId ===
                datosTitulo.egresadoId;

            const mismoTipo =
                limpiarTexto(
                    titulo.tipoPrograma
                ).toLowerCase() ===
                limpiarTexto(
                    datosTitulo.tipoPrograma
                ).toLowerCase();

            const mismaCarrera =
                titulo.carreraId ===
                datosTitulo.carreraId;

            const mismoAnio =
                Number(
                    titulo.anioGraduacion
                ) ===
                Number(
                    datosTitulo.anioGraduacion
                );

            const diferenteId =
                titulo.id !== idExcluir;

            return (
                mismoEgresado &&
                mismoTipo &&
                mismaCarrera &&
                mismoAnio &&
                diferenteId
            );
        }
    );
}


/*
    CREAR UN TÍTULO
*/

function crearTitulo(
    datosTitulo
) {
    validarRelaciones(
        datosTitulo
    );

    if (
        existeTituloDuplicado(
            datosTitulo
        )
    ) {
        throw new Error(
            "El egresado ya tiene registrado ese título para el mismo año"
        );
    }

    const nuevoTitulo = {
        id: generarId("tit"),

        egresadoId:
            limpiarTexto(
                datosTitulo.egresadoId
            ),

        tipoPrograma:
            limpiarTexto(
                datosTitulo.tipoPrograma
            ),

        carreraId:
            limpiarTexto(
                datosTitulo.carreraId
            ),

        escuelaId:
            limpiarTexto(
                datosTitulo.escuelaId
            ),

        anioGraduacion:
            Number(
                datosTitulo.anioGraduacion
            ),

        estado:
            limpiarTexto(
                datosTitulo.estado
            ),

        observaciones:
            limpiarTexto(
                datosTitulo.observaciones
            )
    };

    titulos.push(
        nuevoTitulo
    );

    return construirTituloDetallado(
        nuevoTitulo
    );
}


/*
    ACTUALIZAR UN TÍTULO
*/

function actualizarTitulo(
    id,
    datosTitulo
) {
    const titulo =
        buscarTituloInternoPorId(id);

    if (!titulo) {
        return null;
    }

    validarRelaciones(
        datosTitulo
    );

    if (
        existeTituloDuplicado(
            datosTitulo,
            id
        )
    ) {
        throw new Error(
            "El egresado ya tiene otro registro de ese título para el mismo año"
        );
    }

    titulo.egresadoId =
        limpiarTexto(
            datosTitulo.egresadoId
        );

    titulo.tipoPrograma =
        limpiarTexto(
            datosTitulo.tipoPrograma
        );

    titulo.carreraId =
        limpiarTexto(
            datosTitulo.carreraId
        );

    titulo.escuelaId =
        limpiarTexto(
            datosTitulo.escuelaId
        );

    titulo.anioGraduacion =
        Number(
            datosTitulo.anioGraduacion
        );

    titulo.estado =
        limpiarTexto(
            datosTitulo.estado
        );

    titulo.observaciones =
        limpiarTexto(
            datosTitulo.observaciones
        );

    return construirTituloDetallado(
        titulo
    );
}


/*
    ELIMINAR UN TÍTULO
*/

function eliminarTitulo(id) {
    const indiceTitulo =
        titulos.findIndex(
            (titulo) =>
                titulo.id === id
        );

    if (indiceTitulo === -1) {
        return null;
    }

    const tituloEliminado =
        titulos.splice(
            indiceTitulo,
            1
        )[0];

    return construirTituloDetallado(
        tituloEliminado
    );
}


module.exports = {
    obtenerTitulos,
    buscarTituloPorId,
    buscarTitulosPorEgresado,
    crearTitulo,
    actualizarTitulo,
    eliminarTitulo
};