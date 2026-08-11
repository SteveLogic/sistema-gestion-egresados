const mongoose = require("mongoose");

const egresadoSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        identificacion: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        nombreCompleto: {
            type: String,
            required: true,
            trim: true
        },
        correo: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        telefono: {
            type: String,
            required: true,
            trim: true
        },
        fechaRegistro: {
            type: String,
            required: true,
            trim: true
        },
        lugarTrabajo: {
            type: String,
            required: true,
            trim: true
        },
        estado: {
            type: String,
            required: true,
            enum: ["Activo", "Pendiente", "Inactivo"]
        },
        puestoActual: {
            type: String,
            default: "",
            trim: true
        },
        areaProfesional: {
            type: String,
            default: "",
            trim: true
        },
        linkedin: {
            type: String,
            default: "",
            trim: true
        },
        portafolio: {
            type: String,
            default: "",
            trim: true
        }
    },
    {
        timestamps: true,
        versionKey: false,
        id: false
    }
);

module.exports = mongoose.model(
    "Egresado",
    egresadoSchema
);
