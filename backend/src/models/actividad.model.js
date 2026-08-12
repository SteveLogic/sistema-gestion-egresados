const mongoose = require("mongoose");

const actividadSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        titulo: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120
        },
        descripcion: {
            type: String,
            required: true,
            trim: true
        },
        fecha: {
            type: String,
            required: true,
            trim: true
        },
        hora: {
            type: String,
            required: true,
            trim: true
        },
        modalidad: {
            type: String,
            required: true,
            enum: ["Presencial", "Virtual", "Híbrida"]
        },
        ubicacion: {
            type: String,
            required: true,
            trim: true
        },
        publicoObjetivo: {
            type: String,
            required: true,
            enum: [
                "Todos los egresados",
                "Área de software",
                "Área de ciberseguridad",
                "Área de ciencia de datos",
                "Personas mentoras"
            ]
        },
        cupoMaximo: {
            type: Number,
            required: true,
            min: 1,
            max: 10000
        },
        personasInscritas: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },
        estado: {
            type: String,
            required: true,
            enum: ["Borrador", "Publicada", "Finalizada", "Cancelada"]
        },
        responsable: {
            type: String,
            required: true,
            trim: true
        },
        enlace: {
            type: String,
            default: "",
            trim: true
        },
        fechaCreacion: {
            type: String,
            default: () => new Date().toISOString()
        }
    },
    {
        timestamps: true,
        versionKey: false,
        id: false,
        collection: "actividades"
    }
);

module.exports = mongoose.model("Actividad", actividadSchema);
