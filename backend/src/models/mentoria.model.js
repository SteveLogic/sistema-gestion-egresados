const mongoose = require("mongoose");

const mentoriaSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        solicitudId: {
            type: String,
            default: "",
            trim: true,
            index: true
        },
        egresadoId: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        mentorId: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        areaProfesional: {
            type: String,
            required: true,
            trim: true
        },
        modalidad: {
            type: String,
            required: true,
            enum: ["Virtual", "Presencial", "Híbrida"]
        },
        fechaInicio: {
            type: String,
            required: true,
            trim: true
        },
        fechaFinalizacion: {
            type: String,
            required: true,
            trim: true
        },
        estado: {
            type: String,
            required: true,
            enum: ["Pendiente", "Activa", "Finalizada", "Cancelada"]
        },
        objetivo: {
            type: String,
            required: true,
            trim: true,
            maxlength: 700
        },
        observaciones: {
            type: String,
            default: "",
            trim: true,
            maxlength: 700
        }
    },
    {
        timestamps: true,
        versionKey: false,
        id: false,
        collection: "mentorias"
    }
);

module.exports = mongoose.model("Mentoria", mentoriaSchema);
