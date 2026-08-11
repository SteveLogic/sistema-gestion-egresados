const mongoose = require("mongoose");

const tituloSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        egresadoId: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        tipoPrograma: {
            type: String,
            required: true,
            enum: ["Técnico", "Bachillerato", "Maestría"]
        },
        carreraId: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        escuelaId: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        anioGraduacion: {
            type: Number,
            required: true,
            min: 1950
        },
        estado: {
            type: String,
            required: true,
            enum: ["Registrado", "En revisión", "Inactivo"]
        },
        observaciones: {
            type: String,
            default: "",
            trim: true,
            maxlength: 500
        }
    },
    {
        timestamps: true,
        versionKey: false,
        id: false
    }
);

tituloSchema.index(
    {
        egresadoId: 1,
        tipoPrograma: 1,
        carreraId: 1,
        anioGraduacion: 1
    },
    {
        unique: true,
        name: "titulo_academico_unico"
    }
);

module.exports = mongoose.model(
    "Titulo",
    tituloSchema
);
