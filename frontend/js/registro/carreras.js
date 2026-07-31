const URL_CARRERAS = "http://localhost:3000/api/carreras";

let listaCarreras = [];

const cuerpoTablaCarreras = document.querySelector(
    "#cuerpo-tabla-carreras"
);

const mensajeCarreras = document.querySelector(
    "#mensaje-carreras"
);

const detalleCodigoCarrera = document.querySelector(
    "#detalle-codigo-carrera"
);

const detalleNombreCarrera = document.querySelector(
    "#detalle-nombre-carrera"
);

const detalleEscuelaCarrera = document.querySelector(
    "#detalle-escuela-carrera"
);

const detalleEstadoCarrera = document.querySelector(
    "#detalle-estado-carrera"
);

const detalleDescripcionCarrera = document.querySelector(
    "#detalle-descripcion-carrera"
);

document.addEventListener(
    "DOMContentLoaded",
    cargarCarreras
);

async function cargarCarreras() {
    mostrarMensaje(
        "Cargando carreras...",
        "informativo"
    );

    try {
        const respuesta = await fetch(URL_CARRERAS);
        const resultado = await respuesta.json();

        if (!respuesta.ok || !resultado.exito) {
            throw new Error(
                resultado.mensaje ||
                "No fue posible obtener las carreras"
            );
        }

        listaCarreras = resultado.datos;

        mostrarCarrerasEnTabla(listaCarreras);
        ocultarMensaje();
    } catch (error) {
        mostrarMensaje(
            error.message,
            "error"
        );

        cuerpoTablaCarreras.innerHTML = "";
    }
}

function mostrarCarrerasEnTabla(carreras) {
    cuerpoTablaCarreras.innerHTML = "";

    if (carreras.length === 0) {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td colspan="6">
                No se encontraron carreras.
            </td>
        `;

        cuerpoTablaCarreras.appendChild(fila);
        return;
    }

    carreras.forEach((carrera) => {
        const fila = crearFilaCarrera(carrera);

        cuerpoTablaCarreras.appendChild(fila);
    });
}

function crearFilaCarrera(carrera) {
    const fila = document.createElement("tr");

    const claseEstado =
        carrera.estado === "Activa"
            ? "estado-activo"
            : "estado-inactivo";

    fila.innerHTML = `
        <td>${carrera.codigo}</td>

        <td>${carrera.nombre}</td>

        <td>${carrera.escuela}</td>

        <td>${carrera.descripcion}</td>

        <td>
            <span class="estado ${claseEstado}">
                ${carrera.estado}
            </span>
        </td>

        <td>
            <button
                type="button"
                class="boton boton-secundario"
                data-accion="consultar"
                data-id="${carrera.id}"
            >
                Consultar
            </button>
        </td>
    `;

    return fila;
}

function mostrarDetalleCarrera(carrera) {
    detalleCodigoCarrera.textContent =
        carrera.codigo;

    detalleNombreCarrera.textContent =
        carrera.nombre;

    detalleEscuelaCarrera.textContent =
        carrera.escuela;

    detalleDescripcionCarrera.textContent =
        carrera.descripcion;

    detalleEstadoCarrera.textContent =
        carrera.estado;

    detalleEstadoCarrera.className =
        carrera.estado === "Activa"
            ? "estado estado-activo"
            : "estado estado-inactivo";
}

function manejarClickTabla(evento) {
    const boton = evento.target.closest(
        "button[data-accion]"
    );

    if (!boton) {
        return;
    }

    const idCarrera = boton.dataset.id;
    const accion = boton.dataset.accion;

    const carreraSeleccionada =
        listaCarreras.find(
            (carrera) => carrera.id === idCarrera
        );

    if (!carreraSeleccionada) {
        mostrarMensaje(
            "No se encontró la carrera seleccionada",
            "error"
        );

        return;
    }

    if (accion === "consultar") {
        mostrarDetalleCarrera(
            carreraSeleccionada
        );

        document
            .querySelector("#detalle-carrera")
            .scrollIntoView({
                behavior: "smooth"
            });
    }
}

function mostrarMensaje(mensaje, tipo) {
    mensajeCarreras.textContent = mensaje;
    mensajeCarreras.hidden = false;

    mensajeCarreras.className =
        `mensaje-informativo mensaje-${tipo}`;
}

function ocultarMensaje() {
    mensajeCarreras.hidden = true;
    mensajeCarreras.textContent = "";
}

cuerpoTablaCarreras.addEventListener(
    "click",
    manejarClickTabla
);