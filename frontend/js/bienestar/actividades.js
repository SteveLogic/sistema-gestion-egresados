const URL_ACTIVIDADES = "http://localhost:3000/api/actividades";

let listaActividades = [];
let actividadSeleccionadaId = "";

const cuerpoTabla = document.querySelector("#cuerpo-tabla-actividades");
const mensaje = document.querySelector("#mensaje-actividades");

const formularioFiltros = document.querySelector(
    "#formulario-filtros-actividades"
);
const filtroTitulo = document.querySelector("#filtro-titulo-actividad");
const filtroModalidad = document.querySelector(
    "#filtro-modalidad-actividad"
);
const filtroFecha = document.querySelector("#filtro-fecha-actividad");
const filtroPublico = document.querySelector("#filtro-publico-actividad");
const filtroEstado = document.querySelector("#filtro-estado-actividad");

const resumenTotal = document.querySelector("#resumen-total-actividades");
const resumenPublicadas = document.querySelector(
    "#resumen-publicadas-actividades"
);
const resumenProximas = document.querySelector(
    "#resumen-proximas-actividades"
);
const resumenInscritas = document.querySelector(
    "#resumen-inscritas-actividades"
);

const seccionDetalle = document.querySelector("#detalle-actividad");
const detalleTitulo = document.querySelector("#detalle-titulo-actividad");
const detalleResponsable = document.querySelector(
    "#detalle-responsable-actividad"
);
const detalleEstado = document.querySelector("#detalle-estado-actividad");
const detalleFecha = document.querySelector("#detalle-fecha-actividad");
const detalleHora = document.querySelector("#detalle-hora-actividad");
const detalleModalidad = document.querySelector(
    "#detalle-modalidad-actividad"
);
const detalleUbicacion = document.querySelector(
    "#detalle-ubicacion-actividad"
);
const detallePublico = document.querySelector("#detalle-publico-actividad");
const detalleCupo = document.querySelector("#detalle-cupo-actividad");
const detalleInscritas = document.querySelector(
    "#detalle-inscritas-actividad"
);
const detalleEnlace = document.querySelector("#detalle-enlace-actividad");
const detalleDescripcion = document.querySelector(
    "#detalle-descripcion-actividad"
);

const formulario = document.querySelector("#formulario-actividad");
const idActividad = document.querySelector("#id-actividad");
const tituloActividad = document.querySelector("#titulo-actividad");
const descripcionActividad = document.querySelector(
    "#descripcion-actividad"
);
const fechaActividad = document.querySelector("#fecha-actividad");
const horaActividad = document.querySelector("#hora-actividad");
const modalidadActividad = document.querySelector("#modalidad-actividad");
const ubicacionActividad = document.querySelector("#ubicacion-actividad");
const publicoActividad = document.querySelector("#publico-actividad");
const cupoActividad = document.querySelector("#cupo-actividad");
const inscritasActividad = document.querySelector("#inscritas-actividad");
const estadoActividad = document.querySelector("#estado-actividad");
const responsableActividad = document.querySelector(
    "#responsable-actividad"
);
const enlaceActividad = document.querySelector("#enlace-actividad");
const tituloFormulario = document.querySelector(
    "#titulo-formulario-actividad"
);
const descripcionFormulario = document.querySelector(
    "#descripcion-formulario-actividad"
);
const botonLimpiar = document.querySelector("#boton-limpiar-actividad");
const botonGuardar = document.querySelector("#boton-guardar-actividad");

window.addEventListener("DOMContentLoaded", iniciarModulo);

function iniciarModulo() {
    cuerpoTabla.addEventListener("click", manejarClickTabla);
    formularioFiltros.addEventListener("submit", aplicarFiltros);
    formularioFiltros.addEventListener("reset", limpiarFiltros);
    formulario.addEventListener("submit", guardarActividad);
    botonLimpiar.addEventListener("click", limpiarFormulario);
    cargarActividades();
}

async function consultarApi(url, opciones = {}) {
    const respuesta = await fetch(url, opciones);
    let resultado;

    try {
        resultado = await respuesta.json();
    } catch {
        throw new Error("El servidor devolvió una respuesta no válida");
    }

    if (!respuesta.ok || !resultado.exito) {
        const errores = Array.isArray(resultado.errores)
            ? resultado.errores.join(" ")
            : "";

        throw new Error(
            errores || resultado.mensaje || "No fue posible completar la operación"
        );
    }

    return resultado;
}

async function cargarActividades() {
    mostrarMensaje("Cargando actividades...");

    try {
        const resultado = await consultarApi(URL_ACTIVIDADES);
        listaActividades = Array.isArray(resultado.datos)
            ? resultado.datos
            : [];

        renderizarTabla(listaActividades);
        actualizarResumen();
        ocultarMensaje();
    } catch (error) {
        cuerpoTabla.innerHTML = "";
        mostrarMensaje(error.message);
        console.error("Error al cargar actividades:", error);
    }
}

function renderizarTabla(actividades) {
    cuerpoTabla.innerHTML = "";

    if (actividades.length === 0) {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td colspan="8">
                No se encontraron actividades institucionales.
            </td>
        `;
        cuerpoTabla.appendChild(fila);
        return;
    }

    actividades.forEach((actividad) => {
        const fila = document.createElement("tr");

        agregarCelda(fila, actividad.titulo);
        agregarCelda(fila, formatearFecha(actividad.fecha));
        agregarCelda(fila, formatearHora(actividad.hora));
        agregarCelda(fila, actividad.modalidad);
        agregarCelda(fila, actividad.ubicacion);
        agregarCelda(
            fila,
            `${actividad.personasInscritas}/${actividad.cupoMaximo}`
        );

        const celdaEstado = document.createElement("td");
        const estado = document.createElement("span");
        estado.className = `estado ${obtenerClaseEstado(actividad.estado)}`;
        estado.textContent = actividad.estado;
        celdaEstado.appendChild(estado);
        fila.appendChild(celdaEstado);

        const celdaAcciones = document.createElement("td");
        const acciones = document.createElement("div");
        acciones.className = "acciones-tabla";

        acciones.appendChild(
            crearBotonAccion("Consultar", "consultar", actividad.id)
        );
        acciones.appendChild(
            crearBotonAccion("Editar", "editar", actividad.id)
        );
        acciones.appendChild(
            crearBotonAccion("Eliminar", "eliminar", actividad.id, true)
        );

        celdaAcciones.appendChild(acciones);
        fila.appendChild(celdaAcciones);
        cuerpoTabla.appendChild(fila);
    });
}

function agregarCelda(fila, contenido) {
    const celda = document.createElement("td");
    celda.textContent = contenido ?? "No registrado";
    fila.appendChild(celda);
}

function crearBotonAccion(texto, accion, id, peligro = false) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = peligro
        ? "boton-tabla boton-tabla-peligro"
        : "boton-tabla";
    boton.dataset.accion = accion;
    boton.dataset.id = id;
    boton.textContent = texto;
    return boton;
}

function manejarClickTabla(evento) {
    const boton = evento.target.closest("button[data-accion]");
    if (!boton) return;

    const actividad = listaActividades.find(
        (item) => item.id === boton.dataset.id
    );

    if (!actividad) {
        mostrarMensaje("La actividad seleccionada no fue encontrada");
        return;
    }

    if (boton.dataset.accion === "consultar") {
        mostrarDetalle(actividad);
        seccionDetalle.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (boton.dataset.accion === "editar") {
        cargarFormularioEdicion(actividad);
    }

    if (boton.dataset.accion === "eliminar") {
        eliminarActividad(actividad);
    }
}

function mostrarDetalle(actividad) {
    actividadSeleccionadaId = actividad.id;
    detalleTitulo.textContent = actividad.titulo;
    detalleResponsable.textContent = `Responsable: ${actividad.responsable}`;
    detalleEstado.textContent = actividad.estado;
    detalleEstado.className = `estado ${obtenerClaseEstado(actividad.estado)}`;
    detalleFecha.textContent = formatearFechaLarga(actividad.fecha);
    detalleHora.textContent = formatearHora(actividad.hora);
    detalleModalidad.textContent = actividad.modalidad;
    detalleUbicacion.textContent = actividad.ubicacion;
    detallePublico.textContent = actividad.publicoObjetivo;
    detalleCupo.textContent = `${actividad.cupoMaximo} participantes`;
    detalleInscritas.textContent = `${actividad.personasInscritas} participantes`;
    detalleDescripcion.textContent = actividad.descripcion;
    mostrarEnlaceDetalle(actividad.enlace);
}

function mostrarEnlaceDetalle(enlace) {
    detalleEnlace.innerHTML = "";

    if (!enlace) {
        detalleEnlace.textContent = "Sin enlace registrado";
        return;
    }

    const ancla = document.createElement("a");
    ancla.href = enlace;
    ancla.target = "_blank";
    ancla.rel = "noopener noreferrer";
    ancla.textContent = "Abrir enlace de la actividad";
    detalleEnlace.appendChild(ancla);
}

function limpiarDetalle() {
    actividadSeleccionadaId = "";
    detalleTitulo.textContent = "Seleccione una actividad";
    detalleResponsable.textContent = "Sin persona responsable seleccionada";
    detalleEstado.textContent = "Sin seleccionar";
    detalleEstado.className = "estado";

    [
        detalleFecha,
        detalleHora,
        detalleModalidad,
        detalleUbicacion,
        detallePublico,
        detalleCupo,
        detalleInscritas,
        detalleEnlace
    ].forEach((elemento) => {
        elemento.textContent = "Seleccione una actividad";
    });

    detalleDescripcion.textContent =
        "Seleccione una actividad para consultar su descripción.";
}

function aplicarFiltros(evento) {
    evento.preventDefault();

    const titulo = normalizarTexto(filtroTitulo.value);
    const modalidad = normalizarTexto(filtroModalidad.value);
    const fecha = filtroFecha.value;
    const publico = normalizarTexto(filtroPublico.value);
    const estado = normalizarTexto(filtroEstado.value);

    const filtradas = listaActividades.filter((actividad) => {
        return (
            (!titulo || normalizarTexto(actividad.titulo).includes(titulo)) &&
            (!modalidad || normalizarTexto(actividad.modalidad) === modalidad) &&
            (!fecha || actividad.fecha === fecha) &&
            (!publico || normalizarTexto(actividad.publicoObjetivo) === publico) &&
            (!estado || normalizarTexto(actividad.estado) === estado)
        );
    });

    renderizarTabla(filtradas);
    mostrarMensaje(
        filtradas.length === 0
            ? "No se encontraron actividades con los filtros seleccionados."
            : `Se encontraron ${filtradas.length} actividad(es).`
    );
}

function limpiarFiltros() {
    setTimeout(() => {
        renderizarTabla(listaActividades);
        ocultarMensaje();
    }, 0);
}

function cargarFormularioEdicion(actividad) {
    idActividad.value = actividad.id;
    tituloActividad.value = actividad.titulo;
    descripcionActividad.value = actividad.descripcion;
    fechaActividad.value = actividad.fecha;
    horaActividad.value = actividad.hora;
    modalidadActividad.value = obtenerCanonico(
        actividad.modalidad,
        ["Presencial", "Virtual", "Híbrida"]
    );
    ubicacionActividad.value = actividad.ubicacion;
    publicoActividad.value = obtenerCanonico(
        actividad.publicoObjetivo,
        [
            "Todos los egresados",
            "Área de software",
            "Área de ciberseguridad",
            "Área de ciencia de datos",
            "Personas mentoras"
        ]
    );
    cupoActividad.value = actividad.cupoMaximo;
    inscritasActividad.value = actividad.personasInscritas;
    estadoActividad.value = obtenerCanonico(
        actividad.estado,
        ["Borrador", "Publicada", "Finalizada", "Cancelada"]
    );
    responsableActividad.value = actividad.responsable;
    enlaceActividad.value = actividad.enlace || "";

    tituloFormulario.textContent = "Editar actividad";
    descripcionFormulario.textContent =
        "Modifique la información de la actividad seleccionada.";
    botonGuardar.textContent = "Actualizar actividad";

    formulario.closest("section")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

async function guardarActividad(evento) {
    evento.preventDefault();

    if (!formulario.checkValidity()) {
        formulario.reportValidity();
        return;
    }

    const cupo = Number(cupoActividad.value);
    const inscritas = Number(inscritasActividad.value);

    if (inscritas > cupo) {
        mostrarMensaje(
            "La cantidad de personas inscritas no puede superar el cupo máximo."
        );
        inscritasActividad.focus();
        return;
    }

    const actividadId = idActividad.value.trim();
    const estaEditando = Boolean(actividadId);

    const datos = {
        titulo: tituloActividad.value.trim(),
        descripcion: descripcionActividad.value.trim(),
        fecha: fechaActividad.value,
        hora: horaActividad.value,
        modalidad: modalidadActividad.value,
        ubicacion: ubicacionActividad.value.trim(),
        publicoObjetivo: publicoActividad.value,
        cupoMaximo: cupo,
        personasInscritas: inscritas,
        estado: estadoActividad.value,
        responsable: responsableActividad.value.trim(),
        enlace: enlaceActividad.value.trim()
    };

    botonGuardar.disabled = true;
    botonGuardar.textContent = estaEditando
        ? "Actualizando..."
        : "Guardando...";

    try {
        const resultado = await consultarApi(
            estaEditando
                ? `${URL_ACTIVIDADES}/${actividadId}`
                : URL_ACTIVIDADES,
            {
                method: estaEditando ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            }
        );

        limpiarFormulario();
        await cargarActividades();
        mostrarMensaje(resultado.mensaje);
        document.querySelector("#consultar-actividades")?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    } catch (error) {
        mostrarMensaje(error.message);
        console.error("Error al guardar actividad:", error);
    } finally {
        botonGuardar.disabled = false;
        botonGuardar.textContent = idActividad.value
            ? "Actualizar actividad"
            : "Guardar actividad";
    }
}

async function eliminarActividad(actividad) {
    const confirmacion = window.confirm(
        `¿Está seguro de eliminar la actividad?\n\n${actividad.titulo} - ${formatearFecha(actividad.fecha)}`
    );

    if (!confirmacion) return;

    mostrarMensaje("Eliminando actividad...");

    try {
        const resultado = await consultarApi(
            `${URL_ACTIVIDADES}/${actividad.id}`,
            { method: "DELETE" }
        );

        if (idActividad.value === actividad.id) {
            limpiarFormulario();
        }

        if (actividadSeleccionadaId === actividad.id) {
            limpiarDetalle();
        }

        await cargarActividades();
        mostrarMensaje(resultado.mensaje);
    } catch (error) {
        mostrarMensaje(error.message);
        console.error("Error al eliminar actividad:", error);
    }
}

function limpiarFormulario() {
    formulario.reset();
    idActividad.value = "";
    inscritasActividad.value = "0";
    tituloFormulario.textContent = "Registrar actividad";
    descripcionFormulario.textContent =
        "Complete la información de la actividad institucional.";
    botonGuardar.textContent = "Guardar actividad";
}

function actualizarResumen() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const publicadas = listaActividades.filter(
        (actividad) => normalizarTexto(actividad.estado) === "publicada"
    ).length;

    const proximas = listaActividades.filter((actividad) => {
        const fecha = convertirFechaLocal(actividad.fecha);
        return fecha >= hoy &&
            !["finalizada", "cancelada"].includes(
                normalizarTexto(actividad.estado)
            );
    }).length;

    const inscritas = listaActividades.reduce(
        (total, actividad) => total + Number(actividad.personasInscritas || 0),
        0
    );

    resumenTotal.textContent = listaActividades.length;
    resumenPublicadas.textContent = publicadas;
    resumenProximas.textContent = proximas;
    resumenInscritas.textContent = inscritas;
}

function convertirFechaLocal(fecha) {
    const [anio, mes, dia] = String(fecha).split("-").map(Number);
    return new Date(anio, mes - 1, dia);
}

function formatearFecha(fecha) {
    if (!fecha) return "No registrada";
    return new Intl.DateTimeFormat("es-CR").format(
        convertirFechaLocal(fecha)
    );
}

function formatearFechaLarga(fecha) {
    if (!fecha) return "No registrada";
    return new Intl.DateTimeFormat("es-CR", {
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(convertirFechaLocal(fecha));
}

function formatearHora(hora) {
    if (!hora) return "No registrada";
    const [horas, minutos] = hora.split(":").map(Number);
    const fecha = new Date(2000, 0, 1, horas, minutos);
    return new Intl.DateTimeFormat("es-CR", {
        hour: "numeric",
        minute: "2-digit"
    }).format(fecha);
}

function normalizarTexto(valor) {
    return String(valor ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function obtenerCanonico(valor, opciones) {
    const normalizado = normalizarTexto(valor);
    return opciones.find(
        (opcion) => normalizarTexto(opcion) === normalizado
    ) || "";
}

function obtenerClaseEstado(estado) {
    const normalizado = normalizarTexto(estado);

    if (normalizado === "publicada") return "estado-activo";
    if (normalizado === "borrador") return "estado-pendiente";
    return "estado-inactivo";
}

function mostrarMensaje(texto) {
    mensaje.textContent = texto;
    mensaje.hidden = false;
}

function ocultarMensaje() {
    mensaje.textContent = "";
    mensaje.hidden = true;
}
