require("dotenv").config();

const mongoose = require("mongoose");
const {
    conectarBaseDatos
} = require("../config/database");
const Usuario = require("../models/usuario.model");
const {
    prepararContrasena
} = require("../utils/password.util");

const usuariosIniciales = [
    {
        id: "usr-reg-001",
        nombre: "Laura Jiménez",
        correo: "registro@cenfotec.ac.cr",
        contrasena: "Registro2026",
        rol: "registro",
        nombreRol: "Personal de Registro",
        dashboard: "dashboard-registro.html",
        egresadoId: null,
        activo: true
    },
    {
        id: "usr-bie-001",
        nombre: "Daniela Vargas",
        correo: "bienestar@cenfotec.ac.cr",
        contrasena: "Bienestar2026",
        rol: "bienestar",
        nombreRol: "Bienestar Estudiantil",
        dashboard: "dashboard-bienestar.html",
        egresadoId: null,
        activo: true
    },
    {
        id: "usr-egr-001",
        nombre: "Ana Martínez López",
        correo: "ana.martinez@correo.com",
        contrasena: "Egresado2026",
        rol: "egresado",
        nombreRol: "Persona egresada",
        dashboard: "dashboard-egresado.html",
        egresadoId: "egr-001",
        activo: true
    }
];

async function ejecutarSeed() {
    try {
        console.log("Iniciando seed de usuarios...");
        await conectarBaseDatos();

        for (const usuario of usuariosIniciales) {
            const existente = await Usuario.findOne({ id: usuario.id }).lean();

            if (existente) {
                console.log(`Usuario ${usuario.correo} ya existe`);
                continue;
            }

            const contrasena = prepararContrasena(usuario.contrasena);

            await Usuario.create({
                id: usuario.id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                contrasenaHash: contrasena.hash,
                contrasenaSalt: contrasena.salt,
                rol: usuario.rol,
                nombreRol: usuario.nombreRol,
                dashboard: usuario.dashboard,
                egresadoId: usuario.egresadoId,
                activo: usuario.activo
            });

            console.log(`Usuario ${usuario.correo} registrado`);
        }

        console.log("Seed de usuarios completado correctamente");
    } catch (error) {
        console.error("Error al ejecutar el seed de usuarios:", error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

ejecutarSeed();
