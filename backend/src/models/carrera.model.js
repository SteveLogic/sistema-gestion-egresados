const mongoose = require("mongoose");

const carreraSchema = new mongoose.Schema(
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

        escuela: {
            type: String,
            required: true,
            trim: true
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
    "Carrera",
    carreraSchema
);