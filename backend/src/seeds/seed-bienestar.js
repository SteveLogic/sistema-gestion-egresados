require("dotenv").config();

const mongoose = require("mongoose");
const {
    conectarBaseDatos
} = require("../config/database");

const Actividad = require("../models/actividad.model");
const Comunidad = require("../models/comunidad.model");
const Comunicado = require("../models/comunicado.model");
const Oportunidad = require("../models/oportunidad.model");

const actividadesIniciales = require("../data/actividades.data");
const comunidadesIniciales = require("../data/comunidades.data");
const comunicadosIniciales = require("../data/comunicados.data");
const oportunidadesIniciales = require("../data/oportunidades.data");

async function insertarSiVacio(Modelo, datos, nombre) {
    const cantidad = await Modelo.countDocuments();

    if (cantidad === 0) {
        await Modelo.insertMany(datos);
        console.log(`${datos.length} ${nombre} iniciales registrados`);
        return;
    }

    console.log(`La colección de ${nombre} ya contiene datos`);
}

async function ejecutarSeed() {
    try {
        console.log("Iniciando seed de módulos de Bienestar...");

        await conectarBaseDatos();

        await insertarSiVacio(
            Actividad,
            actividadesIniciales,
            "actividades"
        );

        await insertarSiVacio(
            Comunidad,
            comunidadesIniciales,
            "comunidades"
        );

        await insertarSiVacio(
            Comunicado,
            comunicadosIniciales,
            "comunicados"
        );

        await insertarSiVacio(
            Oportunidad,
            oportunidadesIniciales,
            "oportunidades"
        );

        console.log(
            "Seed de módulos de Bienestar completado correctamente"
        );
    } catch (error) {
        console.error(
            "Error al ejecutar el seed de Bienestar:",
            error.message
        );
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

ejecutarSeed();
