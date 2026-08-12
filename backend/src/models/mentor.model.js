const mongoose = require("mongoose");

const mentorSchema = new mongoose.Schema(
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
            unique: true,
            trim: true
        },
        areaExperiencia: {
            type: String,
            required: true,
            trim: true
        },
        especialidades: {
            type: String,
            required: true,
            trim: true
        },
        aniosExperiencia: {
            type: Number,
            required: true,
            min: 1,
            max: 60
        },
        disponibilidad: {
            type: String,
            required: true,
            trim: true
        },
        modalidad: {
            type: String,
            required: true,
            enum: ["Virtual", "Presencial", "Híbrida"]
        },
        estado: {
            type: String,
            required: true,
            enum: ["Disponible", "Asignado", "Inactivo"]
        }
    },
    {
        timestamps: true,
        versionKey: false,
        id: false,
        collection: "mentores"
    }
);

module.exports = mongoose.model("Mentor", mentorSchema);
