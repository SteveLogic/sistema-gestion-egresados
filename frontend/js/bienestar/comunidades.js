const URL_COMUNIDADES = "http://localhost:3000/api/comunidades";

let listaComunidades = [];

const cuerpoTabla = document.querySelector("#cuerpo-tabla-comunidades");
const mensaje = document.querySelector("#mensaje-comunidades");

const formularioFiltros = document.querySelector(
    "#formulario-filtros-comunidades"
);
const filtroNombre = document.querySelector("#filtro-nombre-comunidad");
const filtroArea = document.querySelector("#filtro-area-comunidad");
const filtroModalidad = document.querySelector(
    "#filtro-modalidad-comunidad"
);
const filtroEstado = document.querySelector("#filtro-estado-comunidad");

const resumenTotal = document.querySelector("#resumen-total-comunidades");
const resumenActivas = document.querySelector("#resumen-activas-comunidades");
const resumenRevision = document.querySelector(
    "#resumen-revision-comunidades"
);
const resumenIntegrantes = document.querySelector(
    "#resumen-integrantes-comunidades"
);

const seccionDetalle = document.querySelector("#detalle-comunidad");
const detalleNombre = document.querySelector("#detalle-nombre-comunidad");
const detalleResponsable = document.querySelector(
    "#detalle-responsable-comunidad"
);
const detalleEstado = document.querySelector("#detalle-estado-comunidad");
const detalleArea = document.querySelector("#detalle-area-comunidad");
const detalleCorreo = document.querySelector("#detalle-correo-comunidad");
const detalleModalidad = document.querySelector(
    "#detalle-modalidad-comunidad"
);
const detalleAcceso = document.querySelector("#detalle-acceso-comunidad");
const detalleCupo = document.querySelector("#detalle-cupo-comunidad");
const detalleIntegrantes = document.querySelector(
    "#detalle-integrantes-comunidad"
);
const detalleFecha = document.querySelector("#detalle-fecha-comunidad");
const detalleEnlace = document.querySelector("#detalle-enlace-comunidad");
const detalleDescripcion = document.querySelector(
    "#detalle-descripcion-comunidad"
);

const formulario = document.querySelector("#formulario-comunidad");
const idComunidad = document.querySelector("#id-comunidad");
const nombreComunidad = document.querySelector("#nombre-comunidad");
const areaComunidad = document.querySelector("#area-comunidad");
const responsableComunidad = document.querySelector(
    "#responsable-comunidad"
);
const correoComunidad = document.querySelector("#correo-comunidad");
const modalidadComunidad = document.querySelector("#modalidad-comunidad");
const accesoComunidad = document.querySelector("#tipo-acceso-comunidad");
const cupoComunidad = document.querySelector("#cupo-comunidad");
const cantidadComunidad = document.querySelector(
    "#cantidad-integrantes-comunidad"
);
const fechaComunidad = document.querySelector(
    "#fecha-creacion-comunidad"
);
const estadoComunidad = document.querySelector("#estado-comunidad");
const descripcionComunidad = document.querySelector(
    "#descripcion-comunidad"
);
const enlaceComunidad = document.querySelector("#enlace-comunidad");
const tituloFormulario = document.querySelector(
    "#titulo-formulario-comunidad"
);
const descripcionFormulario = document.querySelector(
    "#descripcion-formulario-comunidad"
);
const botonLimpiar = document.querySelector("#boton-limpiar-comunidad");
const botonGuardar = document.querySelector("#boton-guardar-comunidad");

const seccionIntegrantes = document.querySelector("#integrantes-comunidad");
const tituloIntegrantes = document.querySelector(
    "#titulo-integrantes-comunidad"
);
const descripcionIntegrantes = document.querySelector(
    "#descripcion-integrantes-comunidad"
);
const cantidadIntegrantesDetalle = document.querySelector(
    "#cantidad-integrantes-detalle"
);
const cuerpoTablaIntegrantes = document.querySelector(
    "#cuerpo-tabla-integrantes"
);

window.addEventListener("DOMContentLoaded", iniciarModulo);

function iniciarModulo() {
    cuerpoTabla.addEventListener("click", manejarClickTabla);
    formularioFiltros.addEventListener("submit", aplicarFiltros);
    formularioFiltros.addEventListener("reset", limpiarFiltros);
    formulario.addEventListener("submit", guardarComunidad);
    botonLimpiar.addEventListener("click", limpiarFormulario);
    cargarComunidades();
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
            errores ||
            resultado.mensaje ||
            "No fue posible completar la operación"
        );
    }

    return resultado;
}

async function cargarComunidades() {
    mostrarMensaje("Cargando comunidades...");

    try {
        const resultado = await consultarApi(URL_COMUNIDADES);
        listaComunidades = Array.isArray(resultado.datos)
            ? resultado.datos
            : [];

        renderizarTabla(listaComunidades);
        actualizarResumen();
        ocultarMensaje();
    } catch (error) {
        cuerpoTabla.innerHTML = "";
        mostrarMensaje(error.message);
        console.error("Error al cargar comunidades:", error);
    }
}

function renderizarTabla(comunidades) {
    cuerpoTabla.innerHTML = "";

    if (comunidades.length === 0) {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td colspan="7">
                No se encontraron comunidades profesionales.
            </td>
        `;
        cuerpoTabla.appendChild(fila);
        return;
    }

    comunidades.forEach((comunidad) => {
        const fila = document.createElement("tr");
        agregarCelda(fila, comunidad.nombre);
        agregarCelda(fila, comunidad.areaProfesional);
        agregarCelda(fila, comunidad.responsable);
        agregarCelda(fila, comunidad.modalidad);
        agregarCelda(
            fila,
            `${comunidad.cantidadIntegrantes}/${comunidad.cupoMaximo}`
        );

        const celdaEstado = document.createElement("td");
        const estado = document.createElement("span");
        estado.className = `estado badge rounded-pill ${obtenerClaseEstado(comunidad.estado)}`;
        estado.textContent = comunidad.estado;
        celdaEstado.appendChild(estado);
        fila.appendChild(celdaEstado);

        const celdaAcciones = document.createElement("td");
        const acciones = document.createElement("div");
        acciones.className = "acciones-tabla";
        acciones.appendChild(
            crearBotonAccion("Consultar", "consultar", comunidad.id)
        );
        acciones.appendChild(
            crearBotonAccion("Editar", "editar", comunidad.id)
        );
        acciones.appendChild(
            crearBotonAccion("Integrantes", "integrantes", comunidad.id)
        );
        acciones.appendChild(
            crearBotonAccion("Eliminar", "eliminar", comunidad.id, true)
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
        ? "boton-tabla boton-tabla-peligro btn btn-sm btn-outline-danger"
        : "boton-tabla btn btn-sm btn-outline-primary";
    boton.dataset.accion = accion;
    boton.dataset.id = id;
    boton.textContent = texto;
    return boton;
}

function manejarClickTabla(evento) {
    const boton = evento.target.closest("button[data-accion]");
    if (!boton) return;

    const comunidad = listaComunidades.find(
        (item) => item.id === boton.dataset.id
    );

    if (!comunidad) {
        mostrarMensaje("La comunidad seleccionada no fue encontrada");
        return;
    }

    if (boton.dataset.accion === "consultar") {
        mostrarDetalle(comunidad);
        seccionDetalle.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (boton.dataset.accion === "editar") {
        cargarFormularioEdicion(comunidad);
    }

    if (boton.dataset.accion === "integrantes") {
        cargarIntegrantes(comunidad);
    }

    if (boton.dataset.accion === "eliminar") {
        eliminarComunidad(comunidad);
    }
}

function mostrarDetalle(comunidad) {
    detalleNombre.textContent = comunidad.nombre;
    detalleResponsable.textContent = `Responsable: ${comunidad.responsable}`;
    detalleEstado.textContent = comunidad.estado;
    detalleEstado.className = `estado badge rounded-pill ${obtenerClaseEstado(comunidad.estado)}`;
    detalleArea.textContent = comunidad.areaProfesional;
    detalleCorreo.textContent = comunidad.correo;
    detalleModalidad.textContent = comunidad.modalidad;
    detalleAcceso.textContent = comunidad.tipoAcceso;
    detalleCupo.textContent = `${comunidad.cupoMaximo} integrantes`;
    detalleIntegrantes.textContent = `${comunidad.cantidadIntegrantes} integrantes`;
    detalleFecha.textContent = formatearFecha(comunidad.fechaCreacion);
    detalleDescripcion.textContent = comunidad.descripcion;
    mostrarEnlace(comunidad.enlace);
}

function mostrarEnlace(enlace) {
    detalleEnlace.innerHTML = "";

    if (!enlace) {
        detalleEnlace.textContent = "Sin enlace registrado";
        return;
    }

    const ancla = document.createElement("a");
    ancla.href = enlace;
    ancla.target = "_blank";
    ancla.rel = "noopener noreferrer";
    ancla.textContent = "Abrir enlace de la comunidad";
    detalleEnlace.appendChild(ancla);
}

function cargarFormularioEdicion(comunidad) {
    idComunidad.value = comunidad.id;
    nombreComunidad.value = comunidad.nombre;
    areaComunidad.value = comunidad.areaProfesional;
    responsableComunidad.value = comunidad.responsable;
    correoComunidad.value = comunidad.correo;
    modalidadComunidad.value = comunidad.modalidad;
    accesoComunidad.value = comunidad.tipoAcceso;
    cupoComunidad.value = comunidad.cupoMaximo;
    cantidadComunidad.value = comunidad.cantidadIntegrantes;
    fechaComunidad.value = comunidad.fechaCreacion;
    estadoComunidad.value = comunidad.estado;
    descripcionComunidad.value = comunidad.descripcion;
    enlaceComunidad.value = comunidad.enlace || "";

    tituloFormulario.textContent = "Editar comunidad profesional";
    descripcionFormulario.textContent =
        "Modifique la información de la comunidad seleccionada.";
    botonGuardar.textContent = "Actualizar comunidad";

    formulario.closest("section")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

async function guardarComunidad(evento) {
    evento.preventDefault();

    if (!formulario.checkValidity()) {
        formulario.reportValidity();
        return;
    }

    const id = idComunidad.value.trim();
    const estaEditando = id !== "";
    const datos = {
        nombre: nombreComunidad.value.trim(),
        areaProfesional: areaComunidad.value,
        responsable: responsableComunidad.value.trim(),
        correo: correoComunidad.value.trim(),
        modalidad: modalidadComunidad.value,
        tipoAcceso: accesoComunidad.value,
        cupoMaximo: Number(cupoComunidad.value),
        cantidadIntegrantes: Number(cantidadComunidad.value),
        fechaCreacion: fechaComunidad.value,
        estado: estadoComunidad.value,
        descripcion: descripcionComunidad.value.trim(),
        enlace: enlaceComunidad.value.trim()
    };

    botonGuardar.disabled = true;
    botonGuardar.textContent = estaEditando
        ? "Actualizando..."
        : "Guardando...";

    try {
        const resultado = await consultarApi(
            estaEditando ? `${URL_COMUNIDADES}/${id}` : URL_COMUNIDADES,
            {
                method: estaEditando ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            }
        );

        limpiarFormulario();
        await cargarComunidades();
        mostrarMensaje(resultado.mensaje);
        cuerpoTabla.closest("section")?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    } catch (error) {
        mostrarMensaje(error.message);
        console.error("Error al guardar comunidad:", error);
    } finally {
        botonGuardar.disabled = false;
        botonGuardar.textContent = idComunidad.value
            ? "Actualizar comunidad"
            : "Guardar comunidad";
    }
}

async function eliminarComunidad(comunidad) {
    const confirmacion = window.confirm(
        `¿Está seguro de eliminar la comunidad?\n\n${comunidad.nombre}`
    );

    if (!confirmacion) return;

    mostrarMensaje("Eliminando comunidad...");

    try {
        const resultado = await consultarApi(
            `${URL_COMUNIDADES}/${comunidad.id}`,
            { method: "DELETE" }
        );

        if (idComunidad.value === comunidad.id) {
            limpiarFormulario();
        }

        await cargarComunidades();
        mostrarMensaje(resultado.mensaje);
    } catch (error) {
        mostrarMensaje(error.message);
        console.error("Error al eliminar comunidad:", error);
    }
}

async function cargarIntegrantes(comunidad) {
    mostrarMensaje("Cargando integrantes...");

    try {
        const resultado = await consultarApi(
            `${URL_COMUNIDADES}/${comunidad.id}/integrantes`
        );
        renderizarIntegrantes(resultado.datos);
        ocultarMensaje();
        seccionIntegrantes.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    } catch (error) {
        mostrarMensaje(error.message);
        console.error("Error al consultar integrantes:", error);
    }
}

function renderizarIntegrantes(datos) {
    tituloIntegrantes.textContent = `Integrantes de ${datos.comunidadNombre}`;
    descripcionIntegrantes.textContent =
        "Muestra de personas que participan en la comunidad seleccionada.";
    cantidadIntegrantesDetalle.textContent =
        `${datos.cantidadIntegrantes} integrantes`;
    cantidadIntegrantesDetalle.className = "estado badge rounded-pill estado-activo";
    cuerpoTablaIntegrantes.innerHTML = "";

    if (datos.integrantes.length === 0) {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td colspan="5">
                No hay integrantes de muestra registrados.
            </td>
        `;
        cuerpoTablaIntegrantes.appendChild(fila);
        return;
    }

    datos.integrantes.forEach((integrante) => {
        const fila = document.createElement("tr");
        agregarCelda(fila, integrante.nombre);
        agregarCelda(fila, integrante.carrera);
        agregarCelda(fila, integrante.empresa);
        agregarCelda(fila, formatearFecha(integrante.fechaIngreso));

        const celdaEstado = document.createElement("td");
        const estado = document.createElement("span");
        estado.className = integrante.participacion === "Activa"
            ? "estado badge rounded-pill estado-activo"
            : "estado badge rounded-pill estado-pendiente";
        estado.textContent = integrante.participacion;
        celdaEstado.appendChild(estado);
        fila.appendChild(celdaEstado);
        cuerpoTablaIntegrantes.appendChild(fila);
    });
}

function aplicarFiltros(evento) {
    evento.preventDefault();

    const nombre = normalizarTexto(filtroNombre.value);
    const area = normalizarTexto(filtroArea.value);
    const modalidad = normalizarTexto(filtroModalidad.value);
    const estado = normalizarTexto(filtroEstado.value);

    const filtradas = listaComunidades.filter((comunidad) => {
        const coincideNombre =
            nombre === "" ||
            normalizarTexto(comunidad.nombre).includes(nombre) ||
            normalizarTexto(comunidad.responsable).includes(nombre);
        const coincideArea =
            area === "" ||
            normalizarTexto(comunidad.areaProfesional) === area;
        const coincideModalidad =
            modalidad === "" ||
            normalizarTexto(comunidad.modalidad) === modalidad;
        const coincideEstado =
            estado === "" ||
            normalizarTexto(comunidad.estado) === estado;

        return (
            coincideNombre &&
            coincideArea &&
            coincideModalidad &&
            coincideEstado
        );
    });

    renderizarTabla(filtradas);
    mostrarMensaje(`Se encontraron ${filtradas.length} comunidad(es).`);
}

function limpiarFiltros() {
    setTimeout(() => {
        renderizarTabla(listaComunidades);
        ocultarMensaje();
    }, 0);
}

function limpiarFormulario() {
    formulario.reset();
    idComunidad.value = "";
    cantidadComunidad.value = "0";
    tituloFormulario.textContent = "Registrar comunidad profesional";
    descripcionFormulario.textContent =
        "Completa la información necesaria para crear una comunidad.";
    botonGuardar.textContent = "Guardar comunidad";
}

function actualizarResumen() {
    resumenTotal.textContent = listaComunidades.length;
    resumenActivas.textContent = listaComunidades.filter(
        (comunidad) => normalizarTexto(comunidad.estado) === "activa"
    ).length;
    resumenRevision.textContent = listaComunidades.filter(
        (comunidad) => normalizarTexto(comunidad.estado) === "en revision"
    ).length;
    resumenIntegrantes.textContent = listaComunidades.reduce(
        (total, comunidad) => total + Number(comunidad.cantidadIntegrantes || 0),
        0
    );
}

function normalizarTexto(valor) {
    return String(valor ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function obtenerClaseEstado(estado) {
    const normalizado = normalizarTexto(estado);

    if (normalizado === "activa") {
        return "estado-activo";
    }

    if (normalizado === "en revision") {
        return "estado-pendiente";
    }

    return "estado-inactivo";
}

function formatearFecha(fecha) {
    if (!fecha) return "No registrada";

    const [anio, mes, dia] = fecha.split("-");
    if (!anio || !mes || !dia) return fecha;
    return `${dia}/${mes}/${anio}`;
}

function mostrarMensaje(texto) {
    mensaje.textContent = texto;
    mensaje.hidden = false;
}

function ocultarMensaje() {
    mensaje.textContent = "";
    mensaje.hidden = true;
}
