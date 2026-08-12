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

const formularioCarrera = document.querySelector(
    "#formulario-carrera"
);

const campoIdCarrera = document.querySelector(
    "#id-carrera"
);

const campoCodigoCarrera = document.querySelector(
    "#codigo-carrera"
);

const campoNombreCarrera = document.querySelector(
    "#nombre-carrera"
);

const campoEscuelaCarrera = document.querySelector(
    "#escuela-carrera"
);

const campoDescripcionCarrera = document.querySelector(
    "#descripcion-carrera"
);

const campoEstadoCarrera = document.querySelector(
    "#estado-carrera"
);

const botonGuardarCarrera = document.querySelector(
    "#boton-guardar-carrera"
);

const botonLimpiarCarrera = document.querySelector(
    "#boton-limpiar-carrera"
);

const tituloFormularioCarrera = document.querySelector(
    "#titulo-formulario-carrera"
);

const descripcionFormularioCarrera = document.querySelector(
    "#descripcion-formulario-carrera"
);
const formularioFiltrosCarreras = document.querySelector(
    "#formulario-filtros-carreras"
);

const filtroNombreCarrera = document.querySelector(
    "#filtro-nombre-carrera"
);

const filtroCodigoCarrera = document.querySelector(
    "#filtro-codigo-carrera"
);

const filtroEscuelaCarrera = document.querySelector(
    "#filtro-escuela-carrera"
);

const filtroEstadoCarrera = document.querySelector(
    "#filtro-estado-carrera"
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
async function manejarEnvioFormularioCarrera(evento) {
    evento.preventDefault();

    if (!formularioCarrera.checkValidity()) {
        formularioCarrera.reportValidity();
        return;
    }

    const idCarrera = campoIdCarrera.value.trim();

    const estaEditando = idCarrera !== "";

    const datosCarrera = {
        codigo: campoCodigoCarrera.value.trim(),
        nombre: campoNombreCarrera.value.trim(),
        escuela: campoEscuelaCarrera.value,
        descripcion:
            campoDescripcionCarrera.value.trim(),
        estado: campoEstadoCarrera.value
    };

    const urlSolicitud = estaEditando
        ? `${URL_CARRERAS}/${idCarrera}`
        : URL_CARRERAS;

    const metodoSolicitud = estaEditando
        ? "PUT"
        : "POST";

    botonGuardarCarrera.disabled = true;

    botonGuardarCarrera.textContent = estaEditando
        ? "Actualizando..."
        : "Guardando...";

    try {
        const respuesta = await fetch(
            urlSolicitud,
            {
                method: metodoSolicitud,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datosCarrera)
            }
        );

        const resultado = await respuesta.json();

        if (!respuesta.ok || !resultado.exito) {
            const detalleErrores =
                Array.isArray(resultado.errores) &&
                resultado.errores.length > 0
                    ? `: ${resultado.errores.join(" ")}`
                    : "";

            throw new Error(
                `${
                    resultado.mensaje ||
                    "No fue posible guardar la carrera"
                }${detalleErrores}`
            );
        }

        if (estaEditando) {
            const indiceCarrera =
                listaCarreras.findIndex(
                    (carrera) =>
                        carrera.id === idCarrera
                );

            if (indiceCarrera !== -1) {
                listaCarreras[indiceCarrera] =
                    resultado.datos;
            }
        } else {
            listaCarreras.push(resultado.datos);
        }

        mostrarCarrerasEnTabla(listaCarreras);

        mostrarDetalleCarrera(resultado.datos);

        restablecerFormularioCarrera();

        mostrarMensaje(
            resultado.mensaje,
            "exito"
        );

        document
            .querySelector("#consultar-carreras")
            ?.scrollIntoView({
                behavior: "smooth"
            });
    } catch (error) {
        mostrarMensaje(
            error.message,
            "error"
        );
    } finally {
        botonGuardarCarrera.disabled = false;

        botonGuardarCarrera.textContent =
            campoIdCarrera.value
                ? "Actualizar carrera"
                : "Guardar carrera";
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
            <span class="estado badge rounded-pill ${claseEstado}">
                ${carrera.estado}
            </span>
        </td>

        <td>
            <div class="acciones-tabla">
                <button
                    type="button"
                    class="boton boton-secundario btn btn-outline-primary"
                    data-accion="consultar"
                    data-id="${carrera.id}"
                >
                    Consultar
                </button>

                <button
                    type="button"
                    class="boton boton-primario btn btn-primary"
                    data-accion="editar"
                    data-id="${carrera.id}"
                >
                    Editar
                    
                </button>
                
                <button
                    type="button"
                    class="boton boton-peligro btn btn-danger"
                    data-accion="eliminar"
                    data-id="${carrera.id}"
                    >
                    Eliminar
                </button>

            </div>
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
            ? "estado badge rounded-pill estado-activo"
            : "estado badge rounded-pill estado-inactivo";
}

function prepararEdicionCarrera(carrera) {
    campoIdCarrera.value = carrera.id;
    campoCodigoCarrera.value = carrera.codigo;
    campoNombreCarrera.value = carrera.nombre;
    campoEscuelaCarrera.value = carrera.escuela;
    campoDescripcionCarrera.value =
        carrera.descripcion;
    campoEstadoCarrera.value = carrera.estado;

    tituloFormularioCarrera.textContent =
        "Editar carrera académica";

    descripcionFormularioCarrera.textContent =
        "Modifica los datos de la carrera seleccionada.";

    botonGuardarCarrera.textContent =
        "Actualizar carrera";

    document
        .querySelector("#registrar-carrera")
        .scrollIntoView({
            behavior: "smooth"
        });
}

function restablecerFormularioCarrera() {
    formularioCarrera.reset();

    campoIdCarrera.value = "";

    tituloFormularioCarrera.textContent =
        "Registrar carrera académica";

    descripcionFormularioCarrera.textContent =
        "Completa los datos necesarios para registrar una nueva carrera.";

    botonGuardarCarrera.textContent =
        "Guardar carrera";
}

async function eliminarCarrera(carrera) {
    const confirmacion = window.confirm(
        `¿Desea eliminar la carrera "${carrera.nombre}"?`
    );

    if (!confirmacion) {
        return;
    }

    try {
        const respuesta = await fetch(
            `${URL_CARRERAS}/${carrera.id}`,
            {
                method: "DELETE"
            }
        );

        const resultado = await respuesta.json();

        if (!respuesta.ok || !resultado.exito) {
            throw new Error(
                resultado.mensaje ||
                "No fue posible eliminar la carrera"
            );
        }

        listaCarreras = listaCarreras.filter(
            (carreraRegistrada) =>
                carreraRegistrada.id !== carrera.id
        );

        mostrarCarrerasEnTabla(listaCarreras);

        if (campoIdCarrera.value === carrera.id) {
            restablecerFormularioCarrera();
        }

        mostrarMensaje(
            resultado.mensaje,
            "exito"
        );
    } catch (error) {
        mostrarMensaje(
            error.message,
            "error"
        );
    }
}
function manejarFiltrosCarreras(evento) {
    evento.preventDefault();

    const nombreBuscado = normalizarTexto(
        filtroNombreCarrera.value
    );

    const codigoBuscado = normalizarTexto(
        filtroCodigoCarrera.value
    );

    const escuelaSeleccionada =
        filtroEscuelaCarrera.value;

    const estadoSeleccionado =
        filtroEstadoCarrera.value;

    const carrerasFiltradas = listaCarreras.filter(
        (carrera) => {
            const coincideNombre =
                nombreBuscado === "" ||
                normalizarTexto(carrera.nombre).includes(
                    nombreBuscado
                );

            const coincideCodigo =
                codigoBuscado === "" ||
                normalizarTexto(carrera.codigo).includes(
                    codigoBuscado
                );

            const coincideEscuela =
                escuelaSeleccionada === "" ||
                carrera.escuela === escuelaSeleccionada;

            const coincideEstado =
                estadoSeleccionado === "" ||
                carrera.estado === estadoSeleccionado;

            return (
                coincideNombre &&
                coincideCodigo &&
                coincideEscuela &&
                coincideEstado
            );
        }
    );

    mostrarCarrerasEnTabla(carrerasFiltradas);

    if (carrerasFiltradas.length === 0) {
        mostrarMensaje(
            "No se encontraron carreras con los filtros seleccionados.",
            "informativo"
        );

        return;
    }

    mostrarMensaje(
        `Se encontraron ${carrerasFiltradas.length} carrera(s).`,
        "informativo"
    );
}

function manejarLimpiezaFiltros() {
    window.setTimeout(() => {
        mostrarCarrerasEnTabla(listaCarreras);
        ocultarMensaje();
    }, 0);
}

function normalizarTexto(texto) {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
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

    if (accion === "editar") {
    prepararEdicionCarrera(
        carreraSeleccionada
    );
}

    if (accion === "eliminar") {
        eliminarCarrera(
            carreraSeleccionada
        );
    }
    
}

function mostrarMensaje(mensaje, tipo) {
    mensajeCarreras.textContent = mensaje;
    mensajeCarreras.hidden = false;

    mensajeCarreras.className =
        `mensaje-informativo alert alert-info mensaje-${tipo}`;
}

function ocultarMensaje() {
    mensajeCarreras.hidden = true;
    mensajeCarreras.textContent = "";
}

cuerpoTablaCarreras.addEventListener(
    "click",
    manejarClickTabla
);

formularioCarrera.addEventListener(
    "submit",
    manejarEnvioFormularioCarrera
);

botonLimpiarCarrera.addEventListener(
    "click",
    restablecerFormularioCarrera
);

formularioFiltrosCarreras.addEventListener(
    "submit",
    manejarFiltrosCarreras
);

formularioFiltrosCarreras.addEventListener(
    "reset",
    manejarLimpiezaFiltros
);