const Titulo = require("../models/titulo.model");
const Egresado = require("../models/egresado.model");
const Carrera = require("../models/carrera.model");
const Escuela = require("../models/escuela.model");

const { generarId } = require("../utils/generar-id");

function limpiarTexto(valor) {
    return typeof valor === "string"
        ? valor.trim()
        : "";
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

async function construirTituloDetallado(
    titulo
) {
    if (!titulo) {
        return null;
    }

    const tituloPlano =
        limpiarDocumento(titulo);

    const [
        egresado,
        carrera,
        escuela
    ] = await Promise.all([
        Egresado.findOne({
            id: tituloPlano.egresadoId
        })
            .select("-_id nombreCompleto identificacion")
            .lean(),
        Carrera.findOne({
            id: tituloPlano.carreraId
        })
            .select("-_id nombre codigo")
            .lean(),
        Escuela.findOne({
            id: tituloPlano.escuelaId
        })
            .select("-_id nombre codigo")
            .lean()
    ]);

    return {
        ...tituloPlano,
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

async function obtenerTitulos() {
    const titulos = await Titulo.find()
        .select("-_id -createdAt -updatedAt")
        .sort({ anioGraduacion: -1 })
        .lean();

    return Promise.all(
        titulos.map(
            construirTituloDetallado
        )
    );
}

async function buscarTituloPorId(id) {
    const titulo = await Titulo.findOne({ id })
        .select("-_id -createdAt -updatedAt")
        .lean();

    return construirTituloDetallado(
        titulo
    );
}

async function buscarTitulosPorEgresado(
    egresadoId
) {
    const titulos = await Titulo.find({
        egresadoId
    })
        .select("-_id -createdAt -updatedAt")
        .sort({ anioGraduacion: -1 })
        .lean();

    return Promise.all(
        titulos.map(
            construirTituloDetallado
        )
    );
}

async function validarRelaciones(
    datosTitulo
) {
    const [
        egresado,
        carrera,
        escuela
    ] = await Promise.all([
        Egresado.findOne({
            id: limpiarTexto(
                datosTitulo.egresadoId
            )
        }).lean(),
        Carrera.findOne({
            id: limpiarTexto(
                datosTitulo.carreraId
            )
        }).lean(),
        Escuela.findOne({
            id: limpiarTexto(
                datosTitulo.escuelaId
            )
        }).lean()
    ]);

    if (!egresado) {
        throw new Error(
            "El egresado seleccionado no existe"
        );
    }

    if (!carrera) {
        throw new Error(
            "La carrera seleccionada no existe"
        );
    }

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

async function existeTituloDuplicado(
    datosTitulo,
    idExcluir = null
) {
    const filtro = {
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
        anioGraduacion:
            Number(
                datosTitulo.anioGraduacion
            )
    };

    if (idExcluir) {
        filtro.id = { $ne: idExcluir };
    }

    return Boolean(
        await Titulo.exists(filtro)
    );
}

function traducirErrorDuplicado(error) {
    if (error && error.code === 11000) {
        throw new Error(
            "El egresado ya tiene registrado ese título para el mismo año"
        );
    }

    throw error;
}

async function crearTitulo(datosTitulo) {
    await validarRelaciones(
        datosTitulo
    );

    if (
        await existeTituloDuplicado(
            datosTitulo
        )
    ) {
        throw new Error(
            "El egresado ya tiene registrado ese título para el mismo año"
        );
    }

    try {
        const nuevoTitulo =
            await Titulo.create({
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
            });

        return construirTituloDetallado(
            nuevoTitulo
        );
    } catch (error) {
        traducirErrorDuplicado(error);
    }
}

async function actualizarTitulo(
    id,
    datosTitulo
) {
    const titulo =
        await Titulo.findOne({ id });

    if (!titulo) {
        return null;
    }

    await validarRelaciones(
        datosTitulo
    );

    if (
        await existeTituloDuplicado(
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

    try {
        await titulo.save();

        return construirTituloDetallado(
            titulo
        );
    } catch (error) {
        traducirErrorDuplicado(error);
    }
}

async function eliminarTitulo(id) {
    const tituloEliminado =
        await Titulo.findOneAndDelete({ id });

    if (!tituloEliminado) {
        return null;
    }

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
