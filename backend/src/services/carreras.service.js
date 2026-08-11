const Carrera = require("../models/carrera.model");
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

async function obtenerCarreras() {
    return Carrera.find()
        .select("-_id -createdAt -updatedAt")
        .sort({ codigo: 1 })
        .lean();
}

async function buscarCarreraPorId(id) {
    return Carrera.findOne({ id })
        .select("-_id -createdAt -updatedAt")
        .lean();
}

async function existeCarreraConNombre(
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
        await Carrera.exists(filtro)
    );
}

async function existeCarreraConCodigo(
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
        await Carrera.exists(filtro)
    );
}

function traducirErrorDuplicado(error) {
    if (error && error.code === 11000) {
        const campo = Object.keys(
            error.keyPattern ||
            error.keyValue ||
            {}
        )[0];

        if (campo === "codigo") {
            throw new Error(
                "Ya existe una carrera con ese código"
            );
        }

        if (campo === "nombre") {
            throw new Error(
                "Ya existe una carrera con ese nombre"
            );
        }

        if (campo === "id") {
            throw new Error(
                "Ya existe una carrera con ese identificador"
            );
        }
    }

    throw error;
}

async function crearCarrera(datosCarrera) {
    if (
        await existeCarreraConNombre(
            datosCarrera.nombre
        )
    ) {
        throw new Error(
            "Ya existe una carrera con ese nombre"
        );
    }

    if (
        await existeCarreraConCodigo(
            datosCarrera.codigo
        )
    ) {
        throw new Error(
            "Ya existe una carrera con ese código"
        );
    }

    try {
        const nuevaCarrera = await Carrera.create({
            id: generarId("car"),
            codigo:
                datosCarrera.codigo
                    .trim()
                    .toUpperCase(),
            nombre:
                datosCarrera.nombre.trim(),
            escuela:
                datosCarrera.escuela.trim(),
            descripcion:
                datosCarrera.descripcion.trim(),
            estado: datosCarrera.estado
        });

        return limpiarDocumento(nuevaCarrera);
    } catch (error) {
        traducirErrorDuplicado(error);
    }
}

async function actualizarCarrera(
    id,
    datosCarrera
) {
    const carrera = await Carrera.findOne({ id });

    if (!carrera) {
        return null;
    }

    if (
        await existeCarreraConNombre(
            datosCarrera.nombre,
            id
        )
    ) {
        throw new Error(
            "Ya existe otra carrera con ese nombre"
        );
    }

    if (
        await existeCarreraConCodigo(
            datosCarrera.codigo,
            id
        )
    ) {
        throw new Error(
            "Ya existe otra carrera con ese código"
        );
    }

    carrera.codigo =
        datosCarrera.codigo
            .trim()
            .toUpperCase();

    carrera.nombre =
        datosCarrera.nombre.trim();

    carrera.escuela =
        datosCarrera.escuela.trim();

    carrera.descripcion =
        datosCarrera.descripcion.trim();

    carrera.estado =
        datosCarrera.estado;

    try {
        await carrera.save();

        return limpiarDocumento(carrera);
    } catch (error) {
        traducirErrorDuplicado(error);
    }
}

async function eliminarCarrera(id) {
    const carreraEliminada =
        await Carrera.findOneAndDelete({ id });

    return limpiarDocumento(
        carreraEliminada
    );
}

module.exports = {
    obtenerCarreras,
    buscarCarreraPorId,
    crearCarrera,
    actualizarCarrera,
    eliminarCarrera
};
