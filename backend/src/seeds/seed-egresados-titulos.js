require("dotenv").config();

const mongoose = require("mongoose");
const {
    conectarBaseDatos
} = require("../config/database");

const Egresado = require(
    "../models/egresado.model"
);
const Titulo = require(
    "../models/titulo.model"
);

const egresadosIniciales = [
    {
        id: "egr-001",
        identificacion: "1-1111-1111",
        nombreCompleto: "Ana Martínez López",
        correo: "ana.martinez@correo.com",
        telefono: "8888-1111",
        fechaRegistro: "2026-01-15",
        lugarTrabajo: "Empresa Tecnológica CR",
        estado: "Activo",
        puestoActual: "Desarrolladora de software",
        areaProfesional:
            "Desarrollo de aplicaciones web",
        linkedin:
            "https://linkedin.com/in/ana-martinez",
        portafolio:
            "https://ana-martinez.dev"
    },
    {
        id: "egr-002",
        identificacion: "2-2222-2222",
        nombreCompleto: "Carlos Rodríguez Vargas",
        correo: "carlos.rodriguez@correo.com",
        telefono: "8777-2222",
        fechaRegistro: "2026-02-10",
        lugarTrabajo: "Servicios Financieros CR",
        estado: "Activo",
        puestoActual: "Analista de ciberseguridad",
        areaProfesional:
            "Seguridad informática",
        linkedin:
            "https://linkedin.com/in/carlos-rodriguez",
        portafolio: ""
    },
    {
        id: "egr-003",
        identificacion: "3-3333-3333",
        nombreCompleto: "María Fernández Solano",
        correo: "maria.fernandez@correo.com",
        telefono: "8666-3333",
        fechaRegistro: "2026-03-05",
        lugarTrabajo: "Consultora de Datos",
        estado: "Pendiente",
        puestoActual: "Analista de datos",
        areaProfesional:
            "Ciencia de datos",
        linkedin:
            "https://linkedin.com/in/maria-fernandez",
        portafolio:
            "https://maria-datos.dev"
    },
    {
        id: "egr-004",
        identificacion: "4-4444-4444",
        nombreCompleto: "Daniel Herrera Mora",
        correo: "daniel.herrera@correo.com",
        telefono: "8555-4444",
        fechaRegistro: "2026-04-20",
        lugarTrabajo: "Independiente",
        estado: "Inactivo",
        puestoActual: "Consultor tecnológico",
        areaProfesional:
            "Gestión de tecnologías de información",
        linkedin: "",
        portafolio: ""
    }
];

const titulosIniciales = [
    {
        id: "tit-001",
        egresadoId: "egr-001",
        tipoPrograma: "Bachillerato",
        carreraId: "car-001",
        escuelaId: "esc-001",
        anioGraduacion: 2024,
        estado: "Registrado",
        observaciones:
            "Título académico verificado por el Departamento de Registro."
    },
    {
        id: "tit-002",
        egresadoId: "egr-001",
        tipoPrograma: "Técnico",
        carreraId: "car-003",
        escuelaId: "esc-001",
        anioGraduacion: 2021,
        estado: "Registrado",
        observaciones:
            "Título técnico registrado antes del bachillerato."
    },
    {
        id: "tit-003",
        egresadoId: "egr-002",
        tipoPrograma: "Maestría",
        carreraId: "car-002",
        escuelaId: "esc-002",
        anioGraduacion: 2025,
        estado: "En revisión",
        observaciones:
            "Pendiente de validación documental."
    }
];

async function ejecutarSeed() {
    try {
        console.log(
            "Iniciando seed de egresados y títulos..."
        );

        await conectarBaseDatos();

        const cantidadEgresados =
            await Egresado.countDocuments();
        const cantidadTitulos =
            await Titulo.countDocuments();

        if (cantidadEgresados === 0) {
            await Egresado.insertMany(
                egresadosIniciales
            );
            console.log(
                "4 egresados iniciales registrados"
            );
        } else {
            console.log(
                "La colección de egresados ya contiene datos"
            );
        }

        if (cantidadTitulos === 0) {
            await Titulo.insertMany(
                titulosIniciales
            );
            console.log(
                "3 títulos iniciales registrados"
            );
        } else {
            console.log(
                "La colección de títulos ya contiene datos"
            );
        }

        console.log(
            "Seed de egresados y títulos completado correctamente"
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
