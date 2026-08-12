const mongoose = require("mongoose");

const solicitudMentoriaSchema = new mongoose.Schema(
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
        objetivo: {
            type: String,
            required: true,
            trim: true,
            maxlength: 600
        },
        oportunidad: {
            type: String,
            required: true,
            trim: true
        },
        comentarios: {
            type: String,
            default: "",
            trim: true,
            maxlength: 500
        },
        fechaSolicitud: {
            type: String,
            required: true,
            trim: true
        },
        estado: {
            type: String,
            required: true,
            enum: ["Pendiente", "Asignada", "Rechazada", "Cancelada"]
        },
        mentorId: {
            type: String,
            default: "",
            trim: true,
            index: true
        },
        observacionesAsignacion: {
            type: String,
            default: "",
            trim: true,
            maxlength: 500
        }
    },
    {
        timestamps: true,
        versionKey: false,
        id: false,
        collection: "solicitudes_mentoria"
    }
);

module.exports = mongoose.model(
    "SolicitudMentoria",
    solicitudMentoriaSchema
);
