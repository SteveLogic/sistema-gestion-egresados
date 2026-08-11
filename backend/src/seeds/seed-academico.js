require("dotenv").config();

const mongoose = require("mongoose");

const {
    conectarBaseDatos
} = require("../config/database");

const Carrera = require(
    "../models/carrera.model"
);

const Escuela = require(
    "../models/escuela.model"
);

const escuelasIniciales = [
    {
        id: "esc-001",
        codigo: "ESC-COMP",
        nombre: "Escuela de Computación",
        responsable: "Laura Jiménez",
        correo: "computacion@ucenfotec.ac.cr",
        telefono: "4000-5000",
        descripcion:
            "Escuela académica encargada de programas relacionados con programación, desarrollo de software y tecnologías de información.",
        estado: "Activa"
    },
    {
        id: "esc-002",
        codigo: "ESC-CIBER",
        nombre: "Escuela de Ciberseguridad",
        responsable: "Andrés Solano",
        correo: "ciberseguridad@ucenfotec.ac.cr",
        telefono: "4000-5001",
        descripcion:
            "Escuela académica enfocada en seguridad informática, redes, infraestructura y protección de datos.",
        estado: "Activa"
    },
    {
        id: "esc-003",
        codigo: "ESC-DATOS",
        nombre: "Escuela de Ciencia de Datos",
        responsable: "Sofía Hernández",
        correo: "datos@ucenfotec.ac.cr",
        telefono: "4000-5002",
        descripcion:
            "Escuela académica relacionada con análisis de datos, inteligencia artificial y aprendizaje automático.",
        estado: "Activa"
    },
    {
        id: "esc-004",
        codigo: "ESC-GEST",
        nombre: "Escuela de Gestión Tecnológica",
        responsable: "Daniel Mora",
        correo: "gestion@ucenfotec.ac.cr",
        telefono: "4000-5003",
        descripcion:
            "Escuela académica orientada a la gestión de proyectos, innovación y administración tecnológica.",
        estado: "Inactiva"
    }
];

const carrerasIniciales = [
    {
        id: "car-001",
        codigo: "BISOFT",
        nombre: "Ingeniería de Software",
        escuela: "Escuela de Computación",
        descripcion:
            "Programa académico orientado al desarrollo de software.",
        estado: "Activa"
    },
    {
        id: "car-002",
        codigo: "BICIBER",
        nombre: "Ciberseguridad",
        escuela: "Escuela de Ciberseguridad",
        descripcion:
            "Programa académico enfocado en seguridad informática.",
        estado: "Activa"
    },
    {
        id: "car-003",
        codigo: "BITI",
        nombre: "Tecnologías de Información",
        escuela: "Escuela de Computación",
        descripcion:
            "Programa académico relacionado con infraestructura y servicios tecnológicos.",
        estado: "Inactiva"
    }
];

async function ejecutarSeed() {
    try {
        await conectarBaseDatos();

        const cantidadEscuelas =
            await Escuela.countDocuments();

        const cantidadCarreras =
            await Carrera.countDocuments();

        if (cantidadEscuelas === 0) {
            await Escuela.insertMany(
                escuelasIniciales
            );

            console.log(
                "4 escuelas iniciales registradas"
            );
        } else {
            console.log(
                "La colección de escuelas ya contiene datos"
            );
        }

        if (cantidadCarreras === 0) {
            await Carrera.insertMany(
                carrerasIniciales
            );

            console.log(
                "3 carreras iniciales registradas"
            );
        } else {
            console.log(
                "La colección de carreras ya contiene datos"
            );
        }

        console.log(
            "Seed académico completado correctamente"
        );
    } catch (error) {
        console.error(
            "Error al ejecutar el seed:",
            error.message
        );

        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

ejecutarSeed();