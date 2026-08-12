const mongoose = require("mongoose");

const comunicadoSchema = new mongoose.Schema(
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
            unique: true,
            trim: true,
            maxlength: 150
        },
        resumen: {
            type: String,
            required: true,
            trim: true,
            maxlength: 300
        },
        contenido: {
            type: String,
            required: true,
            trim: true,
            maxlength: 3000
        },
        publicoObjetivo: {
            type: String,
            required: true,
            enum: [
                "Todos los egresados",
                "Personas mentoras",
                "Área de software",
                "Área de ciberseguridad",
                "Área de ciencia de datos",
                "Área de redes"
            ]
        },
        autor: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },
        fechaPublicacion: {
            type: String,
            default: "",
            trim: true
        },
        estado: {
            type: String,
            required: true,
            enum: ["Borrador", "Publicado", "Archivado"]
        },
        destacado: {
            type: Boolean,
            default: false
        },
        paginaPublica: {
            type: Boolean,
            default: false
        },
        enlace: {
            type: String,
            default: "",
            trim: true
        }
    },
    {
        timestamps: true,
        versionKey: false,
        id: false,
        collection: "comunicados"
    }
);

module.exports = mongoose.model("Comunicado", comunicadoSchema);
