const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema(
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
            trim: true
        },
        correo: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        contrasenaHash: {
            type: String,
            required: true
        },
        contrasenaSalt: {
            type: String,
            required: true
        },
        rol: {
            type: String,
            required: true,
            enum: ["registro", "bienestar", "egresado"],
            index: true
        },
        nombreRol: {
            type: String,
            required: true,
            trim: true
        },
        dashboard: {
            type: String,
            required: true,
            trim: true
        },
        egresadoId: {
            type: String,
            default: null,
            trim: true
        },
        activo: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        versionKey: false,
        id: false
    }
);

module.exports = mongoose.model("Usuario", usuarioSchema);
