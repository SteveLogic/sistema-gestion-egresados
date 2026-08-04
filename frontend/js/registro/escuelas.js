const URL_ESCUELAS =
    "http://localhost:3000/api/escuelas";

const URL_CARRERAS =
    "http://localhost:3000/api/carreras";

let listaEscuelas = [];
let listaCarreras = [];


/*
    ELEMENTOS DEL HTML
*/

const cuerpoTablaEscuelas =
    document.querySelector(
        "#cuerpo-tabla-escuelas"
    );

const mensajeEscuelas =
    document.querySelector(
        "#mensaje-escuelas"
    );

const detalleCodigoEscuela =
    document.querySelector(
        "#detalle-codigo-escuela"
    );

const detalleNombreEscuela =
    document.querySelector(
        "#detalle-nombre-escuela"
    );

const detalleResponsableEscuela =
    document.querySelector(
        "#detalle-responsable-escuela"
    );

const detalleCorreoEscuela =
    document.querySelector(
        "#detalle-correo-escuela"
    );

const detalleTelefonoEscuela =
    document.querySelector(
        "#detalle-telefono-escuela"
    );

const detalleEstadoEscuela =
    document.querySelector(
        "#detalle-estado-escuela"
    );

const detalleDescripcionEscuela =
    document.querySelector(
        "#detalle-descripcion-escuela"
    );

const cuerpoTablaCarrerasEscuela =
    document.querySelector(
        "#cuerpo-tabla-carreras-escuela"
    );

const seccionDetalleEscuela =
    document.querySelector(
        "#detalle-escuela"
    );
    const formularioFiltrosEscuelas =
    document.querySelector(
        "#formulario-filtros-escuelas"
    );

const filtroNombreEscuela =
    document.querySelector(
        "#filtro-nombre-escuela"
    );

const filtroCodigoEscuela =
    document.querySelector(
        "#filtro-codigo-escuela"
    );

const filtroResponsableEscuela =
    document.querySelector(
        "#filtro-responsable-escuela"
    );

const filtroEstadoEscuela =
    document.querySelector(
        "#filtro-estado-escuela"
    );
    const formularioEscuela =
    document.querySelector(
        "#formulario-escuela"
    );

const idEscuela =
    document.querySelector(
        "#id-escuela"
    );

const codigoEscuela =
    document.querySelector(
        "#codigo-escuela"
    );

const nombreEscuela =
    document.querySelector(
        "#nombre-escuela"
    );

const responsableEscuela =
    document.querySelector(
        "#responsable-escuela"
    );

const correoEscuela =
    document.querySelector(
        "#correo-escuela"
    );

const telefonoEscuela =
    document.querySelector(
        "#telefono-escuela"
    );

const descripcionEscuela =
    document.querySelector(
        "#descripcion-escuela"
    );

const estadoEscuela =
    document.querySelector(
        "#estado-escuela"
    );

const tituloFormularioEscuela =
    document.querySelector(
        "#titulo-formulario-escuela"
    );

const descripcionFormularioEscuela =
    document.querySelector(
        "#descripcion-formulario-escuela"
    );

const botonGuardarEscuela =
    document.querySelector(
        "#boton-guardar-escuela"
    );

const botonLimpiarEscuela =
    document.querySelector(
        "#boton-limpiar-escuela"
    );


/*
    INICIO DEL MÓDULO
*/

document.addEventListener(
    "DOMContentLoaded",
    iniciarModuloEscuelas
);

function iniciarModuloEscuelas() {
    cuerpoTablaEscuelas.addEventListener(
        "click",
        manejarClickTablaEscuelas
    );

    formularioFiltrosEscuelas.addEventListener(
        "submit",
        aplicarFiltrosEscuelas
    );

    formularioFiltrosEscuelas.addEventListener(
        "reset",
        limpiarFiltrosEscuelas
    );

    formularioEscuela.addEventListener(
        "submit",
        manejarEnvioFormularioEscuela
    );

    botonLimpiarEscuela.addEventListener(
        "click",
        limpiarFormularioEscuela
    );

    cargarDatosIniciales();
}

/*
    CONSULTAR ESCUELAS Y CARRERAS
*/

async function cargarDatosIniciales() {
    mostrarMensajeEscuelas(
        "Cargando escuelas...",
        "informativo"
    );

    try {
        const [
            respuestaEscuelas,
            respuestaCarreras
        ] = await Promise.all([
            fetch(URL_ESCUELAS),
            fetch(URL_CARRERAS)
        ]);

        const resultadoEscuelas =
            await respuestaEscuelas.json();

        const resultadoCarreras =
            await respuestaCarreras.json();

        if (
            !respuestaEscuelas.ok ||
            !resultadoEscuelas.exito
        ) {
            throw new Error(
                resultadoEscuelas.mensaje ||
                "No fue posible obtener las escuelas."
            );
        }

        if (
            !respuestaCarreras.ok ||
            !resultadoCarreras.exito
        ) {
            throw new Error(
                resultadoCarreras.mensaje ||
                "No fue posible obtener las carreras."
            );
        }

        listaEscuelas =
            resultadoEscuelas.datos;

        listaCarreras =
            resultadoCarreras.datos;

        mostrarEscuelasEnTabla(
            listaEscuelas
        );

        ocultarMensajeEscuelas();
    } catch (error) {
        cuerpoTablaEscuelas.innerHTML = "";

        mostrarMensajeEscuelas(
            error.message,
            "error"
        );

        console.error(
            "Error al cargar las escuelas:",
            error
        );
    }
}


/*
    TABLA PRINCIPAL DE ESCUELAS
*/

function mostrarEscuelasEnTabla(escuelas) {
    cuerpoTablaEscuelas.innerHTML = "";

    if (escuelas.length === 0) {
        const fila =
            document.createElement("tr");

        fila.innerHTML = `
            <td colspan="7">
                No se encontraron escuelas.
            </td>
        `;

        cuerpoTablaEscuelas.appendChild(
            fila
        );

        return;
    }

    escuelas.forEach((escuela) => {
        const fila =
            crearFilaEscuela(escuela);

        cuerpoTablaEscuelas.appendChild(
            fila
        );
    });
}

function crearFilaEscuela(escuela) {
    const fila =
        document.createElement("tr");

    const carrerasAsociadas =
        obtenerCarrerasDeEscuela(
            escuela.nombre
        );

    const cantidadCarreras =
        carrerasAsociadas.length;

    const claseEstado =
        escuela.estado === "Activa"
            ? "estado-activo"
            : "estado-inactivo";

    fila.innerHTML = `
        <td>
            ${escuela.codigo}
        </td>

        <td>
            ${escuela.nombre}
        </td>

        <td>
            ${escuela.responsable}
        </td>

        <td>
            ${escuela.correo}
        </td>

        <td>
            ${cantidadCarreras}
        </td>

        <td>
            <span class="estado ${claseEstado}">
                ${escuela.estado}
            </span>
        </td>

        <td>
            <div class="acciones-tabla">

                <button
                    type="button"
                    class="boton boton-secundario"
                    data-accion="consultar"
                    data-id="${escuela.id}"
                >
                    Consultar
                </button>

            </div>
        </td>
    `;

    return fila;
}


/*
    RELACIÓN ENTRE ESCUELAS Y CARRERAS
*/

function obtenerCarrerasDeEscuela(
    nombreEscuela
) {
    return listaCarreras.filter(
        (carrera) =>
            carrera.escuela ===
            nombreEscuela
    );
}


/*
    BOTÓN CONSULTAR
*/

function manejarClickTablaEscuelas(
    evento
) {
    const boton = evento.target.closest(
        "button[data-accion]"
    );

    if (!boton) {
        return;
    }

    const idEscuela =
        boton.dataset.id;

    const accion =
        boton.dataset.accion;

    const escuelaSeleccionada =
        listaEscuelas.find(
            (escuela) =>
                escuela.id === idEscuela
        );

    if (!escuelaSeleccionada) {
        mostrarMensajeEscuelas(
            "No se encontró la escuela seleccionada.",
            "error"
        );

        return;
    }

    if (accion === "consultar") {
        mostrarDetalleEscuela(
            escuelaSeleccionada
        );

        seccionDetalleEscuela.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}


/*
    DETALLE DE LA ESCUELA
*/

function mostrarDetalleEscuela(
    escuela
) {
    detalleCodigoEscuela.textContent =
        escuela.codigo;

    detalleNombreEscuela.textContent =
        escuela.nombre;

    detalleResponsableEscuela.textContent =
        escuela.responsable;

    detalleCorreoEscuela.textContent =
        escuela.correo;

    detalleTelefonoEscuela.textContent =
        escuela.telefono;

    detalleDescripcionEscuela.textContent =
        escuela.descripcion;

    detalleEstadoEscuela.textContent =
        escuela.estado;

    detalleEstadoEscuela.className =
        escuela.estado === "Activa"
            ? "estado estado-activo"
            : "estado estado-inactivo";

    const carrerasAsociadas =
        obtenerCarrerasDeEscuela(
            escuela.nombre
        );

    mostrarCarrerasDeEscuela(
        carrerasAsociadas
    );
}


/*
    TABLA DE CARRERAS ASOCIADAS
*/

function mostrarCarrerasDeEscuela(
    carreras
) {
    cuerpoTablaCarrerasEscuela.innerHTML =
        "";

    if (carreras.length === 0) {
        const fila =
            document.createElement("tr");

        fila.innerHTML = `
            <td colspan="4">
                Esta escuela no tiene
                carreras asociadas.
            </td>
        `;

        cuerpoTablaCarrerasEscuela
            .appendChild(fila);

        return;
    }

    carreras.forEach((carrera) => {
        const fila =
            document.createElement("tr");

        const claseEstado =
            carrera.estado === "Activa"
                ? "estado-activo"
                : "estado-inactivo";

        fila.innerHTML = `
            <td>
                ${carrera.codigo}
            </td>

            <td>
                ${carrera.nombre}
            </td>

            <td>
                Programa académico
            </td>

            <td>
                <span class="estado ${claseEstado}">
                    ${carrera.estado}
                </span>
            </td>
        `;

        cuerpoTablaCarrerasEscuela
            .appendChild(fila);
    });
}

/*
    REGISTRO DE ESCUELAS
*/

async function manejarEnvioFormularioEscuela(
    evento
) {
    evento.preventDefault();

    if (!formularioEscuela.checkValidity()) {
        formularioEscuela.reportValidity();
        return;
    }

    const datosEscuela = {
        codigo: codigoEscuela.value.trim(),
        nombre: nombreEscuela.value.trim(),
        responsable:
            responsableEscuela.value.trim(),
        correo: correoEscuela.value.trim(),
        telefono: telefonoEscuela.value.trim(),
        descripcion:
            descripcionEscuela.value.trim(),
        estado: estadoEscuela.value
    };

    botonGuardarEscuela.disabled = true;
    botonGuardarEscuela.textContent =
        "Guardando...";

    try {
        const respuesta = await fetch(
            URL_ESCUELAS,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify(
                    datosEscuela
                )
            }
        );

        const resultado =
            await respuesta.json();

        if (
            !respuesta.ok ||
            !resultado.exito
        ) {
            const mensajeErrores =
                obtenerMensajeErrores(
                    resultado.errores
                );

            throw new Error(
                resultado.mensaje ||
                mensajeErrores ||
                "No fue posible registrar la escuela."
            );
        }

        limpiarFormularioEscuela();

        await cargarDatosIniciales();

        mostrarMensajeEscuelas(
            resultado.mensaje ||
            "Escuela registrada correctamente.",
            "exito"
        );

        cuerpoTablaEscuelas
            .closest("section")
            ?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
    } catch (error) {
        mostrarMensajeEscuelas(
            error.message,
            "error"
        );

        console.error(
            "Error al registrar la escuela:",
            error
        );
    } finally {
        botonGuardarEscuela.disabled = false;
        botonGuardarEscuela.textContent =
            "Guardar escuela";
    }
}

function limpiarFormularioEscuela() {
    formularioEscuela.reset();

    idEscuela.value = "";

    tituloFormularioEscuela.textContent =
        "Registrar escuela académica";

    descripcionFormularioEscuela.textContent =
        "Completa los datos necesarios para registrar una nueva escuela académica.";

    botonGuardarEscuela.textContent =
        "Guardar escuela";
}

function obtenerMensajeErrores(errores) {
    if (Array.isArray(errores)) {
        return errores.join(" ");
    }

    if (
        errores &&
        typeof errores === "object"
    ) {
        return Object.values(errores)
            .flat()
            .join(" ");
    }

    return "";
}

/*
    FILTROS DE ESCUELAS
*/

function aplicarFiltrosEscuelas(evento) {
    evento.preventDefault();

    const nombreBuscado =
        normalizarTexto(
            filtroNombreEscuela.value
        );

    const codigoBuscado =
        normalizarTexto(
            filtroCodigoEscuela.value
        );

    const responsableBuscado =
        normalizarTexto(
            filtroResponsableEscuela.value
        );

const estadoBuscado =
    normalizarTexto(
        filtroEstadoEscuela.value
    );

    const escuelasFiltradas =
        listaEscuelas.filter((escuela) => {
            const coincideNombre =
                normalizarTexto(
                    escuela.nombre
                ).includes(nombreBuscado);

            const coincideCodigo =
                normalizarTexto(
                    escuela.codigo
                ).includes(codigoBuscado);

            const coincideResponsable =
                normalizarTexto(
                    escuela.responsable
                ).includes(
                    responsableBuscado
                );

            const coincideEstado =
                estadoBuscado === "" ||
                normalizarTexto(
                    escuela.estado
                ) === estadoBuscado;

            return (
                coincideNombre &&
                coincideCodigo &&
                coincideResponsable &&
                coincideEstado
            );
        });

    mostrarEscuelasEnTabla(
        escuelasFiltradas
    );

    if (escuelasFiltradas.length === 0) {
        mostrarMensajeEscuelas(
            "No se encontraron escuelas con los filtros seleccionados.",
            "informativo"
        );

        return;
    }

    mostrarMensajeEscuelas(
        `Se encontraron ${escuelasFiltradas.length} escuela(s).`,
        "exito"
    );
}

function limpiarFiltrosEscuelas() {
    setTimeout(() => {
        mostrarEscuelasEnTabla(
            listaEscuelas
        );

        ocultarMensajeEscuelas();
    }, 0);
}

function normalizarTexto(texto) {
    return String(texto)
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .trim();
}
/*
    MENSAJES PARA EL USUARIO
*/

function mostrarMensajeEscuelas(
    mensaje,
    tipo
) {
    mensajeEscuelas.textContent =
        mensaje;

    mensajeEscuelas.hidden = false;

    mensajeEscuelas.className =
        `mensaje-informativo mensaje-${tipo}`;
}

function ocultarMensajeEscuelas() {
    mensajeEscuelas.hidden = true;
    mensajeEscuelas.textContent = "";
}