const Egresado = require("../models/egresado.model");
const { generarId } = require("../utils/generar-id");

function limpiarTexto(valor) {
    return typeof valor === "string"
        ? valor.trim()
        : "";
}

function normalizarCorreo(valor) {
    return limpiarTexto(valor).toLowerCase();
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

async function obtenerEgresados() {
    return Egresado.find()
        .select("-_id -createdAt -updatedAt")
        .sort({ nombreCompleto: 1 })
        .lean();
}

async function buscarEgresadoPorId(id) {
    return Egresado.findOne({ id })
        .select("-_id -createdAt -updatedAt")
        .lean();
}

async function existeIdentificacion(
    identificacion,
    idExcluir = null
) {
    const filtro = {
        identificacion:
            limpiarTexto(identificacion)
    };

    if (idExcluir) {
        filtro.id = { $ne: idExcluir };
    }

    return Boolean(
        await Egresado.exists(filtro)
    );
}

async function existeCorreo(
    correo,
    idExcluir = null
) {
    const filtro = {
        correo: normalizarCorreo(correo)
    };

    if (idExcluir) {
        filtro.id = { $ne: idExcluir };
    }

    return Boolean(
        await Egresado.exists(filtro)
    );
}

function traducirErrorDuplicado(error) {
    if (error && error.code === 11000) {
        const campo = Object.keys(
            error.keyPattern ||
            error.keyValue ||
            {}
        )[0];

        if (campo === "identificacion") {
            throw new Error(
                "Ya existe un egresado con esa identificación"
            );
        }

        if (campo === "correo") {
            throw new Error(
                "Ya existe un egresado con ese correo"
            );
        }

        if (campo === "id") {
            throw new Error(
                "Ya existe un egresado con ese identificador"
            );
        }
    }

    throw error;
}

async function crearEgresado(datosEgresado) {
    if (
        await existeIdentificacion(
            datosEgresado.identificacion
        )
    ) {
        throw new Error(
            "Ya existe un egresado con esa identificación"
        );
    }

    if (
        await existeCorreo(
            datosEgresado.correo
        )
    ) {
        throw new Error(
            "Ya existe un egresado con ese correo"
        );
    }

    try {
        const nuevoEgresado =
            await Egresado.create({
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
            });

        return limpiarDocumento(
            nuevoEgresado
        );
    } catch (error) {
        traducirErrorDuplicado(error);
    }
}

async function actualizarEgresado(
    id,
    datosEgresado
) {
    const egresado =
        await Egresado.findOne({ id });

    if (!egresado) {
        return null;
    }

    if (
        await existeIdentificacion(
            datosEgresado.identificacion,
            id
        )
    ) {
        throw new Error(
            "Ya existe otro egresado con esa identificación"
        );
    }

    if (
        await existeCorreo(
            datosEgresado.correo,
            id
        )
    ) {
        throw new Error(
            "Ya existe otro egresado con ese correo"
        );
    }

    egresado.identificacion =
        limpiarTexto(
            datosEgresado.identificacion
        );

    egresado.nombreCompleto =
        limpiarTexto(
            datosEgresado.nombreCompleto
        );

    egresado.correo =
        normalizarCorreo(
            datosEgresado.correo
        );

    egresado.telefono =
        limpiarTexto(
            datosEgresado.telefono
        );

    egresado.fechaRegistro =
        limpiarTexto(
            datosEgresado.fechaRegistro
        );

    egresado.lugarTrabajo =
        limpiarTexto(
            datosEgresado.lugarTrabajo
        );

    egresado.estado =
        limpiarTexto(
            datosEgresado.estado
        );

    egresado.puestoActual =
        limpiarTexto(
            datosEgresado.puestoActual
        );

    egresado.areaProfesional =
        limpiarTexto(
            datosEgresado.areaProfesional
        );

    egresado.linkedin =
        limpiarTexto(
            datosEgresado.linkedin
        );

    egresado.portafolio =
        limpiarTexto(
            datosEgresado.portafolio
        );

    try {
        await egresado.save();

        return limpiarDocumento(egresado);
    } catch (error) {
        traducirErrorDuplicado(error);
    }
}

async function eliminarEgresado(id) {
    const egresadoEliminado =
        await Egresado.findOneAndDelete({ id });

    return limpiarDocumento(
        egresadoEliminado
    );
}

module.exports = {
    obtenerEgresados,
    buscarEgresadoPorId,
    crearEgresado,
    actualizarEgresado,
    eliminarEgresado
};
