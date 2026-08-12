require("dotenv").config();

const mongoose = require("mongoose");

const { conectarBaseDatos } = require("../config/database");

const Egresado = require("../models/egresado.model");
const Mentor = require("../models/mentor.model");
const SolicitudMentoria = require(
    "../models/solicitud-mentoria.model"
);
const Mentoria = require("../models/mentoria.model");

const mentoresIniciales = require("../data/mentores.data");
const solicitudesIniciales = require(
    "../data/solicitudes-mentoria.data"
);
const mentoriasIniciales = require("../data/mentorias.data");

async function ejecutarSeed() {
    try {
        console.log("Iniciando seed del módulo de mentorías...");
        await conectarBaseDatos();

        const egresadosDisponibles = await Egresado.countDocuments({
            id: { $in: ["egr-001", "egr-002", "egr-003", "egr-004"] }
        });

        if (egresadosDisponibles < 4) {
            throw new Error(
                "Primero debe ejecutarse el seed de egresados y títulos"
            );
        }

        const [cantidadMentores, cantidadSolicitudes, cantidadMentorias] =
            await Promise.all([
                Mentor.countDocuments(),
                SolicitudMentoria.countDocuments(),
                Mentoria.countDocuments()
            ]);

        if (cantidadMentores === 0) {
            await Mentor.insertMany(mentoresIniciales);
            console.log("3 mentores iniciales registrados");
        } else {
            console.log("La colección de mentores ya contiene datos");
        }

        if (cantidadSolicitudes === 0) {
            await SolicitudMentoria.insertMany(solicitudesIniciales);
            console.log("3 solicitudes iniciales registradas");
        } else {
            console.log(
                "La colección de solicitudes de mentoría ya contiene datos"
            );
        }

        if (cantidadMentorias === 0) {
            await Mentoria.insertMany(mentoriasIniciales);
            console.log("2 mentorías iniciales registradas");
        } else {
            console.log("La colección de mentorías ya contiene datos");
        }

        console.log("Seed del módulo de mentorías completado correctamente");
    } catch (error) {
        console.error(
            "Error al ejecutar el seed de mentorías:",
            error.message
        );
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

ejecutarSeed();
