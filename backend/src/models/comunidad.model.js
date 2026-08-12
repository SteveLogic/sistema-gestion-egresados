const mongoose = require("mongoose");

const integranteSchema = new mongoose.Schema(
    {
        id: { type: String, required: true, trim: true },
        nombre: { type: String, required: true, trim: true },
        carrera: { type: String, default: "", trim: true },
        empresa: { type: String, default: "", trim: true },
        fechaIngreso: { type: String, default: "", trim: true },
        participacion: { type: String, default: "Activa", trim: true }
    },
    {
        _id: false,
        id: false
    }
);

const comunidadSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        nombre: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            maxlength: 150
        },
        areaProfesional: {
            type: String,
            required: true,
            enum: [
                "Desarrollo de software",
                "Ciberseguridad",
                "Ciencia de datos",
                "Redes y telecomunicaciones",
                "Gestión tecnológica",
                "Otra área"
            ]
        },
        responsable: {
            type: String,
            required: true,
            trim: true
        },
        correo: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        modalidad: {
            type: String,
            required: true,
            enum: ["Virtual", "Presencial", "Híbrida"]
        },
        tipoAcceso: {
            type: String,
            required: true,
            enum: [
                "Abierto para egresados",
                "Requiere solicitud",
                "Solo mediante invitación"
            ]
        },
        cupoMaximo: {
            type: Number,
            required: true,
            min: 1,
            max: 5000
        },
        cantidadIntegrantes: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },
        fechaCreacion: {
            type: String,
            required: true,
            trim: true
        },
        estado: {
            type: String,
            required: true,
            enum: ["Activa", "Inactiva", "En revisión"]
        },
        descripcion: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000
        },
        enlace: {
            type: String,
            default: "",
            trim: true
        },
        integrantes: {
            type: [integranteSchema],
            default: []
        }
    },
    {
        timestamps: true,
        versionKey: false,
        id: false,
        collection: "comunidades"
    }
);

module.exports = mongoose.model("Comunidad", comunidadSchema);
