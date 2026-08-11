const mongoose = require("mongoose");

const escuelaSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        codigo: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true
        },

        nombre: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        responsable: {
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
            trim: true,
            match: /^\d{4}-?\d{4}$/
        },

        descripcion: {
            type: String,
            required: true,
            trim: true
        },

        estado: {
            type: String,
            required: true,
            enum: ["Activa", "Inactiva"],
            default: "Activa"
        }
    },
    {
        timestamps: true,
        versionKey: false,
        id: false
    }
);

module.exports = mongoose.model(
    "Escuela",
    escuelaSchema
);