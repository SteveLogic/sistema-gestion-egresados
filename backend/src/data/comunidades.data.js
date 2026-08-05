const comunidades = [
    {
        id: "com-001",
        nombre: "Comunidad de Desarrollo de Software",
        areaProfesional: "Desarrollo de software",
        responsable: "Andrea Solano",
        correo: "software.comunidad@ucenfotec.ac.cr",
        modalidad: "Virtual",
        tipoAcceso: "Abierto para egresados",
        cupoMaximo: 200,
        cantidadIntegrantes: 84,
        fechaCreacion: "2025-03-10",
        estado: "Activa",
        descripcion:
            "Comunidad orientada al intercambio de conocimientos sobre programación, arquitectura de software, pruebas, desarrollo web y nuevas tecnologías.",
        enlace: "https://example.com/comunidad-software",
        integrantes: [
            {
                id: "int-001",
                nombre: "Ana Martínez López",
                carrera: "Ingeniería de Software",
                empresa: "Empresa Tecnológica CR",
                fechaIngreso: "2025-03-15",
                participacion: "Activa"
            },
            {
                id: "int-002",
                nombre: "Carlos Ramírez Mora",
                carrera: "Ingeniería de Software",
                empresa: "Soluciones Digitales",
                fechaIngreso: "2025-03-20",
                participacion: "Activa"
            },
            {
                id: "int-003",
                nombre: "Sofía Hernández Vega",
                carrera: "Ciencia de Datos",
                empresa: "Data Analytics CR",
                fechaIngreso: "2025-04-05",
                participacion: "Reciente"
            }
        ]
    },
    {
        id: "com-002",
        nombre: "Red de Profesionales en Ciberseguridad",
        areaProfesional: "Ciberseguridad",
        responsable: "Roberto Vargas",
        correo: "ciberseguridad.comunidad@ucenfotec.ac.cr",
        modalidad: "Híbrida",
        tipoAcceso: "Requiere solicitud",
        cupoMaximo: 150,
        cantidadIntegrantes: 67,
        fechaCreacion: "2025-05-08",
        estado: "Activa",
        descripcion:
            "Red profesional para compartir prácticas, experiencias, certificaciones y tendencias relacionadas con la protección de sistemas e información.",
        enlace: "https://example.com/comunidad-ciberseguridad",
        integrantes: [
            {
                id: "int-004",
                nombre: "Carlos Rodríguez Vargas",
                carrera: "Ciberseguridad",
                empresa: "Servicios Financieros CR",
                fechaIngreso: "2025-05-12",
                participacion: "Activa"
            },
            {
                id: "int-005",
                nombre: "María Fernández Solano",
                carrera: "Ciencia de Datos",
                empresa: "Consultora de Datos",
                fechaIngreso: "2025-06-01",
                participacion: "Activa"
            }
        ]
    },
    {
        id: "com-003",
        nombre: "Comunidad de Ciencia de Datos",
        areaProfesional: "Ciencia de datos",
        responsable: "Laura Méndez",
        correo: "datos.comunidad@ucenfotec.ac.cr",
        modalidad: "Virtual",
        tipoAcceso: "Abierto para egresados",
        cupoMaximo: 120,
        cantidadIntegrantes: 52,
        fechaCreacion: "2025-07-18",
        estado: "Activa",
        descripcion:
            "Espacio para el aprendizaje colaborativo sobre análisis de datos, visualización, inteligencia de negocios y aprendizaje automático.",
        enlace: "https://example.com/comunidad-datos",
        integrantes: [
            {
                id: "int-006",
                nombre: "María Fernández Solano",
                carrera: "Ciencia de Datos",
                empresa: "Consultora de Datos",
                fechaIngreso: "2025-07-20",
                participacion: "Activa"
            }
        ]
    },
    {
        id: "com-004",
        nombre: "Profesionales de Redes y Telecomunicaciones",
        areaProfesional: "Redes y telecomunicaciones",
        responsable: "Daniel Mora",
        correo: "redes.comunidad@ucenfotec.ac.cr",
        modalidad: "Presencial",
        tipoAcceso: "Solo mediante invitación",
        cupoMaximo: 100,
        cantidadIntegrantes: 31,
        fechaCreacion: "2026-02-12",
        estado: "En revisión",
        descripcion:
            "Comunidad enfocada en infraestructura, conectividad, servicios de red y telecomunicaciones empresariales.",
        enlace: "",
        integrantes: [
            {
                id: "int-007",
                nombre: "Daniel Herrera Mora",
                carrera: "Tecnologías de Información",
                empresa: "Independiente",
                fechaIngreso: "2026-02-15",
                participacion: "Reciente"
            }
        ]
    }
];

module.exports = comunidades;
