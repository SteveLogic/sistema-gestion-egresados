const Escuela = require("../models/escuela.model");
const { generarId } = require("../utils/generar-id");

function escaparRegex(texto) {
    return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function patronExacto(texto) {
    return new RegExp(
        `^${escaparRegex(texto.trim())}$`,
        "i"
    );
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

async function obtenerEscuelas() {
    return Escuela.find()
        .select("-_id -createdAt -updatedAt")
        .sort({ codigo: 1 })
        .lean();
}

async function buscarEscuelaPorId(id) {
    return Escuela.findOne({ id })
        .select("-_id -createdAt -updatedAt")
        .lean();
}

async function existeEscuelaConCodigo(
    codigo,
    idExcluir = null
) {
    const filtro = {
        codigo: codigo.trim().toUpperCase()
    };

    if (idExcluir) {
        filtro.id = { $ne: idExcluir };
    }

    return Boolean(
        await Escuela.exists(filtro)
    );
}

async function existeEscuelaConNombre(
    nombre,
    idExcluir = null
) {
    const filtro = {
        nombre: patronExacto(nombre)
    };

    if (idExcluir) {
        filtro.id = { $ne: idExcluir };
    }

    return Boolean(
        await Escuela.exists(filtro)
    );
}

async function existeEscuelaConCorreo(
    correo,
    idExcluir = null
) {
    const filtro = {
        correo: correo.trim().toLowerCase()
    };

    if (idExcluir) {
        filtro.id = { $ne: idExcluir };
    }

    return Boolean(
        await Escuela.exists(filtro)
    );
}

function traducirErrorDuplicado(error) {
    if (error && error.code === 11000) {
        const campo = Object.keys(
            error.keyPattern ||
            error.keyValue ||
            {}
        )[0];

        const mensajes = {
            codigo:
                "Ya existe una escuela con ese código",
            nombre:
                "Ya existe una escuela con ese nombre",
            correo:
                "Ya existe una escuela con ese correo",
            id:
                "Ya existe una escuela con ese identificador"
        };

        if (mensajes[campo]) {
            throw new Error(
                mensajes[campo]
            );
        }
    }

    throw error;
}

async function crearEscuela(datosEscuela) {
    if (
        await existeEscuelaConCodigo(
            datosEscuela.codigo
        )
    ) {
        throw new Error(
            "Ya existe una escuela con ese código"
        );
    }

    if (
        await existeEscuelaConNombre(
            datosEscuela.nombre
        )
    ) {
        throw new Error(
            "Ya existe una escuela con ese nombre"
        );
    }

    if (
        await existeEscuelaConCorreo(
            datosEscuela.correo
        )
    ) {
        throw new Error(
            "Ya existe una escuela con ese correo"
        );
    }

    try {
        const nuevaEscuela =
            await Escuela.create({
                id: generarId("esc"),
                codigo:
                    datosEscuela.codigo
                        .trim()
                        .toUpperCase(),
                nombre:
                    datosEscuela.nombre.trim(),
                responsable:
                    datosEscuela.responsable.trim(),
                correo:
                    datosEscuela.correo
                        .trim()
                        .toLowerCase(),
                telefono:
                    datosEscuela.telefono.trim(),
                descripcion:
                    datosEscuela.descripcion.trim(),
                estado:
                    datosEscuela.estado
            });

        return limpiarDocumento(
            nuevaEscuela
        );
    } catch (error) {
        traducirErrorDuplicado(error);
    }
}

async function actualizarEscuela(
    id,
    datosEscuela
) {
    const escuela =
        await Escuela.findOne({ id });

    if (!escuela) {
        return null;
    }

    if (
        await existeEscuelaConCodigo(
            datosEscuela.codigo,
            id
        )
    ) {
        throw new Error(
            "Ya existe otra escuela con ese código"
        );
    }

    if (
        await existeEscuelaConNombre(
            datosEscuela.nombre,
            id
        )
    ) {
        throw new Error(
            "Ya existe otra escuela con ese nombre"
        );
    }

    if (
        await existeEscuelaConCorreo(
            datosEscuela.correo,
            id
        )
    ) {
        throw new Error(
            "Ya existe otra escuela con ese correo"
        );
    }

    escuela.codigo =
        datosEscuela.codigo
            .trim()
            .toUpperCase();

    escuela.nombre =
        datosEscuela.nombre.trim();

    escuela.responsable =
        datosEscuela.responsable.trim();

    escuela.correo =
        datosEscuela.correo
            .trim()
            .toLowerCase();

    escuela.telefono =
        datosEscuela.telefono.trim();

    escuela.descripcion =
        datosEscuela.descripcion.trim();

    escuela.estado =
        datosEscuela.estado;

    try {
        await escuela.save();

        return limpiarDocumento(
            escuela
        );
    } catch (error) {
        traducirErrorDuplicado(error);
    }
}

async function eliminarEscuela(id) {
    const escuelaEliminada =
        await Escuela.findOneAndDelete({ id });

    return limpiarDocumento(
        escuelaEliminada
    );
}

module.exports = {
    obtenerEscuelas,
    buscarEscuelaPorId,
    crearEscuela,
    actualizarEscuela,
    eliminarEscuela
};
