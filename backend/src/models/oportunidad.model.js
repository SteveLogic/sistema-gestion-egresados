const mongoose = require("mongoose");

const oportunidadSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        empresa: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120
        },
        puesto: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150
        },
        descripcion: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1500
        },
        areaProfesional: {
            type: String,
            required: true,
            enum: [
                "Desarrollo de software",
                "Ciberseguridad",
                "Ciencia de datos",
                "Redes y telecomunicaciones",
                "Soporte técnico",
                "Gestión tecnológica",
                "Otra área"
            ]
        },
        modalidad: {
            type: String,
            required: true,
            enum: ["Presencial", "Remota", "Híbrida"]
        },
        ubicacion: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150
        },
        fechaPublicacion: {
            type: String,
            required: true,
            trim: true
        },
        fechaVencimiento: {
            type: String,
            required: true,
            trim: true
        },
        correoContacto: {
            type: String,
            default: "",
            trim: true,
            lowercase: true
        },
        enlaceContacto: {
            type: String,
            default: "",
            trim: true
        },
        estado: {
            type: String,
            required: true,
            enum: ["Borrador", "Publicada", "Vencida", "Cerrada"]
        }
    },
    {
        timestamps: true,
        versionKey: false,
        id: false,
        collection: "oportunidades"
    }
);

oportunidadSchema.index(
    { empresa: 1, puesto: 1, fechaPublicacion: 1 },
    { name: "oportunidad_empresa_puesto_fecha" }
);

module.exports = mongoose.model("Oportunidad", oportunidadSchema);
