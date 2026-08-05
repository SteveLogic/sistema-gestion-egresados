const usuarios = [
    {
        id: "usr-reg-001",
        nombre: "Laura Jiménez",
        correo: "registro@cenfotec.ac.cr",
        contrasena: "Registro2026",
        rol: "registro",
        nombreRol: "Personal de Registro",
        dashboard: "dashboard-registro.html",
        egresadoId: null
    },
    {
        id: "usr-bie-001",
        nombre: "Daniela Vargas",
        correo: "bienestar@cenfotec.ac.cr",
        contrasena: "Bienestar2026",
        rol: "bienestar",
        nombreRol: "Bienestar Estudiantil",
        dashboard: "dashboard-bienestar.html",
        egresadoId: null
    },
    {
        id: "usr-egr-001",
        nombre: "Ana Martínez López",
        correo: "ana.martinez@correo.com",
        contrasena: "Egresado2026",
        rol: "egresado",
        nombreRol: "Persona egresada",
        dashboard: "dashboard-egresado.html",
        egresadoId: "egr-001"
    }
];

module.exports = usuarios;
