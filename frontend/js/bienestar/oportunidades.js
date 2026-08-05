const URL_OPORTUNIDADES = "http://localhost:3000/api/oportunidades";

let listaOportunidades = [];

const resumenTotal = document.querySelector("#resumen-total-oportunidades");
const resumenPublicadas = document.querySelector("#resumen-publicadas-oportunidades");
const resumenRemotas = document.querySelector("#resumen-remotas-oportunidades");
const resumenProximas = document.querySelector("#resumen-proximas-oportunidades");

const formularioFiltros = document.querySelector("#formulario-filtros-oportunidades");
const filtroEmpresa = document.querySelector("#filtro-empresa-oportunidad");
const filtroPuesto = document.querySelector("#filtro-puesto-oportunidad");
const filtroArea = document.querySelector("#filtro-area-oportunidad");
const filtroModalidad = document.querySelector("#filtro-modalidad-oportunidad");
const filtroUbicacion = document.querySelector("#filtro-ubicacion-oportunidad");
const filtroEstado = document.querySelector("#filtro-estado-oportunidad");

const cuerpoTabla = document.querySelector("#cuerpo-tabla-oportunidades");
const mensaje = document.querySelector("#mensaje-oportunidades");

const seccionDetalle = document.querySelector("#detalle-oportunidad");
const detalleEmpresa = document.querySelector("#detalle-empresa-oportunidad");
const detallePuesto = document.querySelector("#detalle-puesto-oportunidad");
const detalleEstado = document.querySelector("#detalle-estado-oportunidad");
const detalleArea = document.querySelector("#detalle-area-oportunidad");
const detalleModalidad = document.querySelector("#detalle-modalidad-oportunidad");
const detalleUbicacion = document.querySelector("#detalle-ubicacion-oportunidad");
const detallePublicacion = document.querySelector("#detalle-publicacion-oportunidad");
const detalleVencimiento = document.querySelector("#detalle-vencimiento-oportunidad");
const detalleContacto = document.querySelector("#detalle-contacto-oportunidad");
const detalleDescripcion = document.querySelector("#detalle-descripcion-oportunidad");

const formulario = document.querySelector("#formulario-oportunidad");
const idOportunidad = document.querySelector("#id-oportunidad");
const campoEmpresa = document.querySelector("#empresa-oportunidad");
const campoPuesto = document.querySelector("#puesto-oportunidad");
const campoDescripcion = document.querySelector("#descripcion-oportunidad");
const campoArea = document.querySelector("#area-oportunidad");
const campoModalidad = document.querySelector("#modalidad-oportunidad");
const campoUbicacion = document.querySelector("#ubicacion-oportunidad");
const campoEstado = document.querySelector("#estado-oportunidad");
const campoFechaPublicacion = document.querySelector("#fecha-publicacion-oportunidad");
const campoFechaVencimiento = document.querySelector("#fecha-vencimiento-oportunidad");
const campoCorreo = document.querySelector("#correo-contacto-oportunidad");
const campoEnlace = document.querySelector("#enlace-contacto-oportunidad");
const botonLimpiar = document.querySelector("#boton-limpiar-oportunidad");
const botonGuardar = document.querySelector("#boton-guardar-oportunidad");
const tituloFormulario = document.querySelector("#titulo-formulario-oportunidad");
const descripcionFormulario = document.querySelector("#descripcion-formulario-oportunidad");

document.addEventListener("DOMContentLoaded", iniciarModulo);

function iniciarModulo() {
    cuerpoTabla.addEventListener("click", manejarAccionesTabla);
    formularioFiltros.addEventListener("submit", aplicarFiltros);
    formularioFiltros.addEventListener("reset", limpiarFiltros);
    formulario.addEventListener("submit", guardarOportunidad);
    botonLimpiar.addEventListener("click", limpiarFormulario);
    campoFechaPublicacion.addEventListener("change", ajustarFechaVencimiento);
    cargarOportunidades();
}

async function cargarOportunidades() {
    mostrarMensaje("Cargando oportunidades laborales...");

    try {
        const resultado = await consultarApi(URL_OPORTUNIDADES);
        listaOportunidades = Array.isArray(resultado.datos) ? resultado.datos : [];
        renderizarResumen();
        renderizarTabla(listaOportunidades);
        ocultarMensaje();
    } catch (error) {
        renderizarTabla([]);
        mostrarMensaje(error.message);
        console.error("Error al cargar oportunidades:", error);
    }
}

async function consultarApi(url, opciones = {}) {
    const respuesta = await fetch(url, opciones);
    let resultado;

    try {
        resultado = await respuesta.json();
    } catch {
        throw new Error("El servidor devolvió una respuesta inválida");
    }

    if (!respuesta.ok || !resultado.exito) {
        const errores = obtenerMensajeErrores(resultado.errores);
        throw new Error(
            errores || resultado.mensaje || "No fue posible completar la operación"
        );
    }

    return resultado;
}

function renderizarResumen() {
    resumenTotal.textContent = listaOportunidades.length;
    resumenPublicadas.textContent = listaOportunidades.filter(
        (oportunidad) => normalizarTexto(oportunidad.estado) === "publicada"
    ).length;
    resumenRemotas.textContent = listaOportunidades.filter(
        (oportunidad) => normalizarTexto(oportunidad.modalidad) === "remota"
    ).length;
    resumenProximas.textContent = listaOportunidades.filter(
        (oportunidad) => estaProximaAVencer(oportunidad)
    ).length;
}

function estaProximaAVencer(oportunidad) {
    if (normalizarTexto(oportunidad.estado) !== "publicada") {
        return false;
    }

    const fechaVencimiento = crearFechaLocal(oportunidad.fechaVencimiento);
    if (!fechaVencimiento) {
        return false;
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const diferencia = Math.ceil(
        (fechaVencimiento.getTime() - hoy.getTime()) / 86400000
    );

    return diferencia >= 0 && diferencia <= 14;
}

function renderizarTabla(oportunidades) {
    cuerpoTabla.innerHTML = "";

    if (oportunidades.length === 0) {
        const fila = document.createElement("tr");
        fila.innerHTML = '<td colspan="9">No se encontraron oportunidades laborales.</td>';
        cuerpoTabla.appendChild(fila);
        return;
    }

    oportunidades.forEach((oportunidad) => {
        const fila = document.createElement("tr");
        fila.appendChild(crearCelda(oportunidad.empresa));
        fila.appendChild(crearCelda(oportunidad.puesto));
        fila.appendChild(crearCelda(oportunidad.areaProfesional));
        fila.appendChild(crearCelda(oportunidad.modalidad));
        fila.appendChild(crearCelda(oportunidad.ubicacion));
        fila.appendChild(crearCelda(formatearFecha(oportunidad.fechaPublicacion)));
        fila.appendChild(crearCelda(formatearFecha(oportunidad.fechaVencimiento)));

        const celdaEstado = document.createElement("td");
        const estado = document.createElement("span");
        estado.className = `estado ${obtenerClaseEstado(oportunidad.estado)}`;
        estado.textContent = oportunidad.estado;
        celdaEstado.appendChild(estado);
        fila.appendChild(celdaEstado);

        const celdaAcciones = document.createElement("td");
        const acciones = document.createElement("div");
        acciones.className = "acciones-tabla";
        acciones.appendChild(crearBotonAccion("Consultar", "consultar", oportunidad.id));
        acciones.appendChild(crearBotonAccion("Editar", "editar", oportunidad.id));
        acciones.appendChild(
            crearBotonAccion("Eliminar", "eliminar", oportunidad.id, true)
        );
        celdaAcciones.appendChild(acciones);
        fila.appendChild(celdaAcciones);

        cuerpoTabla.appendChild(fila);
    });
}

function crearCelda(contenido) {
    const celda = document.createElement("td");
    celda.textContent = contenido || "No registrado";
    return celda;
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

function manejarAccionesTabla(evento) {
    const boton = evento.target.closest("button[data-accion]");
    if (!boton) {
        return;
    }

    const oportunidad = listaOportunidades.find(
        (item) => item.id === boton.dataset.id
    );

    if (!oportunidad) {
        mostrarMensaje("No se encontró la oportunidad seleccionada");
        return;
    }

    if (boton.dataset.accion === "consultar") {
        mostrarDetalle(oportunidad);
    } else if (boton.dataset.accion === "editar") {
        cargarEdicion(oportunidad);
    } else if (boton.dataset.accion === "eliminar") {
        eliminarOportunidad(oportunidad);
    }
}

function mostrarDetalle(oportunidad) {
    detalleEmpresa.textContent = oportunidad.empresa;
    detallePuesto.textContent = oportunidad.puesto;
    detalleEstado.textContent = oportunidad.estado;
    detalleEstado.className = `estado ${obtenerClaseEstado(oportunidad.estado)}`;
    detalleArea.textContent = oportunidad.areaProfesional;
    detalleModalidad.textContent = oportunidad.modalidad;
    detalleUbicacion.textContent = oportunidad.ubicacion;
    detallePublicacion.textContent = formatearFecha(oportunidad.fechaPublicacion);
    detalleVencimiento.textContent = formatearFecha(oportunidad.fechaVencimiento);
    detalleDescripcion.textContent = oportunidad.descripcion;

    detalleContacto.innerHTML = "";

    if (oportunidad.correoContacto) {
        const correo = document.createElement("a");
        correo.href = `mailto:${oportunidad.correoContacto}`;
        correo.textContent = oportunidad.correoContacto;
        detalleContacto.appendChild(correo);
    }

    if (oportunidad.correoContacto && oportunidad.enlaceContacto) {
        detalleContacto.appendChild(document.createTextNode(" · "));
    }

    if (oportunidad.enlaceContacto) {
        const enlace = document.createElement("a");
        enlace.href = oportunidad.enlaceContacto;
        enlace.target = "_blank";
        enlace.rel = "noopener noreferrer";
        enlace.textContent = "Abrir enlace de contacto";
        detalleContacto.appendChild(enlace);
    }

    if (!oportunidad.correoContacto && !oportunidad.enlaceContacto) {
        detalleContacto.textContent = "Sin medio de contacto registrado";
    }

    seccionDetalle.scrollIntoView({ behavior: "smooth", block: "start" });
}

function cargarEdicion(oportunidad) {
    idOportunidad.value = oportunidad.id;
    campoEmpresa.value = oportunidad.empresa;
    campoPuesto.value = oportunidad.puesto;
    campoDescripcion.value = oportunidad.descripcion;
    campoArea.value = oportunidad.areaProfesional;
    campoModalidad.value = oportunidad.modalidad;
    campoUbicacion.value = oportunidad.ubicacion;
    campoEstado.value = oportunidad.estado;
    campoFechaPublicacion.value = oportunidad.fechaPublicacion;
    campoFechaVencimiento.value = oportunidad.fechaVencimiento;
    campoCorreo.value = oportunidad.correoContacto || "";
    campoEnlace.value = oportunidad.enlaceContacto || "";

    tituloFormulario.textContent = "Editar oportunidad laboral";
    descripcionFormulario.textContent =
        "Modifique la información de la oportunidad seleccionada.";
    botonGuardar.textContent = "Actualizar oportunidad";
    ajustarFechaVencimiento();
    formulario.closest("section")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

async function guardarOportunidad(evento) {
    evento.preventDefault();

    if (!formulario.checkValidity()) {
        formulario.reportValidity();
        return;
    }

    if (campoFechaVencimiento.value < campoFechaPublicacion.value) {
        mostrarMensaje(
            "La fecha de vencimiento no puede ser anterior a la fecha de publicación"
        );
        campoFechaVencimiento.focus();
        return;
    }

    if (!campoCorreo.value.trim() && !campoEnlace.value.trim()) {
        mostrarMensaje("Registre al menos un correo o un enlace de contacto");
        campoCorreo.focus();
        return;
    }

    const identificador = idOportunidad.value.trim();
    const estaEditando = Boolean(identificador);
    const url = estaEditando
        ? `${URL_OPORTUNIDADES}/${identificador}`
        : URL_OPORTUNIDADES;
    const metodo = estaEditando ? "PUT" : "POST";

    const datos = {
        empresa: campoEmpresa.value.trim(),
        puesto: campoPuesto.value.trim(),
        descripcion: campoDescripcion.value.trim(),
        areaProfesional: campoArea.value,
        modalidad: campoModalidad.value,
        ubicacion: campoUbicacion.value.trim(),
        estado: campoEstado.value,
        fechaPublicacion: campoFechaPublicacion.value,
        fechaVencimiento: campoFechaVencimiento.value,
        correoContacto: campoCorreo.value.trim(),
        enlaceContacto: campoEnlace.value.trim()
    };

    botonGuardar.disabled = true;
    botonGuardar.textContent = estaEditando ? "Actualizando..." : "Guardando...";

    try {
        const resultado = await consultarApi(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });

        limpiarFormulario();
        await cargarOportunidades();
        mostrarMensaje(resultado.mensaje);
        cuerpoTabla.closest("section")?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    } catch (error) {
        mostrarMensaje(error.message);
        console.error("Error al guardar la oportunidad:", error);
    } finally {
        botonGuardar.disabled = false;
        botonGuardar.textContent = idOportunidad.value
            ? "Actualizar oportunidad"
            : "Guardar oportunidad";
    }
}

async function eliminarOportunidad(oportunidad) {
    const confirmacion = window.confirm(
        `¿Está seguro de eliminar la oportunidad?\n\n${oportunidad.empresa} - ${oportunidad.puesto}`
    );

    if (!confirmacion) {
        return;
    }

    mostrarMensaje("Eliminando oportunidad laboral...");

    try {
        const resultado = await consultarApi(
            `${URL_OPORTUNIDADES}/${oportunidad.id}`,
            { method: "DELETE" }
        );

        if (idOportunidad.value === oportunidad.id) {
            limpiarFormulario();
        }

        await cargarOportunidades();
        mostrarMensaje(resultado.mensaje);
    } catch (error) {
        mostrarMensaje(error.message);
        console.error("Error al eliminar la oportunidad:", error);
    }
}

function aplicarFiltros(evento) {
    evento.preventDefault();

    const empresa = normalizarTexto(filtroEmpresa.value);
    const puesto = normalizarTexto(filtroPuesto.value);
    const area = normalizarTexto(filtroArea.value);
    const modalidad = normalizarTexto(filtroModalidad.value);
    const ubicacion = normalizarTexto(filtroUbicacion.value);
    const estado = normalizarTexto(filtroEstado.value);

    const filtradas = listaOportunidades.filter((oportunidad) => {
        return (
            (!empresa || normalizarTexto(oportunidad.empresa).includes(empresa)) &&
            (!puesto || normalizarTexto(oportunidad.puesto).includes(puesto)) &&
            (!area || normalizarTexto(oportunidad.areaProfesional) === area) &&
            (!modalidad || normalizarTexto(oportunidad.modalidad) === modalidad) &&
            (!ubicacion || normalizarTexto(oportunidad.ubicacion).includes(ubicacion)) &&
            (!estado || normalizarTexto(oportunidad.estado) === estado)
        );
    });

    renderizarTabla(filtradas);

    if (filtradas.length === 0) {
        mostrarMensaje("No se encontraron oportunidades con los filtros seleccionados");
    } else {
        mostrarMensaje(`Se encontraron ${filtradas.length} oportunidad(es).`);
    }
}

function limpiarFiltros() {
    setTimeout(() => {
        renderizarTabla(listaOportunidades);
        ocultarMensaje();
    }, 0);
}

function limpiarFormulario() {
    formulario.reset();
    idOportunidad.value = "";
    tituloFormulario.textContent = "Registrar oportunidad laboral";
    descripcionFormulario.textContent =
        "Complete la información necesaria para divulgar una oportunidad.";
    botonGuardar.textContent = "Guardar oportunidad";
    campoFechaVencimiento.min = "";
}

function ajustarFechaVencimiento() {
    campoFechaVencimiento.min = campoFechaPublicacion.value || "";
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

    if (normalizado === "publicada") {
        return "estado-activo";
    }

    if (normalizado === "borrador") {
        return "estado-pendiente";
    }

    return "estado-inactivo";
}

function crearFechaLocal(valor) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(valor || ""))) {
        return null;
    }

    const [anio, mes, dia] = valor.split("-").map(Number);
    const fecha = new Date(anio, mes - 1, dia);
    return Number.isNaN(fecha.getTime()) ? null : fecha;
}

function formatearFecha(valor) {
    const fecha = crearFechaLocal(valor);

    if (!fecha) {
        return "No registrada";
    }

    return new Intl.DateTimeFormat("es-CR").format(fecha);
}

function obtenerMensajeErrores(errores) {
    if (Array.isArray(errores)) {
        return errores.join(" ");
    }

    if (errores && typeof errores === "object") {
        return Object.values(errores).flat().join(" ");
    }

    return "";
}

function mostrarMensaje(texto) {
    mensaje.textContent = texto;
    mensaje.hidden = false;
}

function ocultarMensaje() {
    mensaje.textContent = "";
    mensaje.hidden = true;
}
