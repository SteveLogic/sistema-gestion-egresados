const URL_COMUNICADOS = "http://localhost:3000/api/comunicados";

let listaComunicados = [];

const cuerpoTabla = document.querySelector("#cuerpo-tabla-comunicados");
const mensaje = document.querySelector("#mensaje-comunicados");

const resumenTotal = document.querySelector("#resumen-total-comunicados");
const resumenPublicados = document.querySelector("#resumen-publicados-comunicados");
const resumenBorradores = document.querySelector("#resumen-borradores-comunicados");
const resumenArchivados = document.querySelector("#resumen-archivados-comunicados");

const formularioFiltros = document.querySelector("#formulario-filtros-comunicados");
const filtroTitulo = document.querySelector("#filtro-titulo-comunicado");
const filtroPublico = document.querySelector("#filtro-publico-comunicado");
const filtroFecha = document.querySelector("#filtro-fecha-comunicado");
const filtroEstado = document.querySelector("#filtro-estado-comunicado");

const seccionDetalle = document.querySelector("#detalle-comunicado");
const detalleTitulo = document.querySelector("#detalle-titulo-comunicado");
const detalleEstado = document.querySelector("#detalle-estado-comunicado");
const detalleAutor = document.querySelector("#detalle-autor-comunicado");
const detalleFecha = document.querySelector("#detalle-fecha-comunicado");
const detallePublico = document.querySelector("#detalle-publico-comunicado");
const detalleDestacado = document.querySelector("#detalle-destacado-comunicado");
const detallePaginaPublica = document.querySelector("#detalle-pagina-publica-comunicado");
const detalleEnlace = document.querySelector("#detalle-enlace-comunicado");
const detalleResumen = document.querySelector("#detalle-resumen-comunicado");
const detalleContenido = document.querySelector("#detalle-contenido-comunicado");

const formulario = document.querySelector("#formulario-comunicado");
const idComunicado = document.querySelector("#id-comunicado");
const campoTitulo = document.querySelector("#titulo-comunicado");
const campoResumen = document.querySelector("#resumen-comunicado");
const campoContenido = document.querySelector("#contenido-comunicado");
const campoPublico = document.querySelector("#publico-comunicado");
const campoAutor = document.querySelector("#autor-comunicado");
const campoFecha = document.querySelector("#fecha-comunicado");
const campoEstado = document.querySelector("#estado-comunicado");
const campoDestacado = document.querySelector("#destacado-comunicado");
const campoPaginaPublica = document.querySelector("#pagina-publica-comunicado");
const campoEnlace = document.querySelector("#enlace-comunicado");
const botonLimpiar = document.querySelector("#boton-limpiar-comunicado");
const botonGuardar = document.querySelector("#boton-guardar-comunicado");
const tituloFormulario = document.querySelector("#titulo-formulario-comunicado");
const descripcionFormulario = document.querySelector("#descripcion-formulario-comunicado");

const vistaPreviaFecha = document.querySelector("#vista-previa-fecha-comunicado");
const vistaPreviaTitulo = document.querySelector("#vista-previa-titulo-comunicado");
const vistaPreviaResumen = document.querySelector("#vista-previa-resumen-comunicado");

document.addEventListener("DOMContentLoaded", iniciarModulo);

function iniciarModulo() {
    cuerpoTabla.addEventListener("click", manejarAccionesTabla);
    formularioFiltros.addEventListener("submit", aplicarFiltros);
    formularioFiltros.addEventListener("reset", limpiarFiltros);
    formulario.addEventListener("submit", guardarComunicado);
    botonLimpiar.addEventListener("click", limpiarFormulario);

    [campoTitulo, campoResumen, campoFecha].forEach((campo) => {
        campo.addEventListener("input", actualizarVistaPrevia);
        campo.addEventListener("change", actualizarVistaPrevia);
    });

    campoEstado.addEventListener("change", ajustarFechaSegunEstado);
    cargarComunicados();
}

async function cargarComunicados() {
    mostrarMensaje("Cargando comunicados institucionales...");

    try {
        const resultado = await consultarApi(URL_COMUNICADOS);
        listaComunicados = Array.isArray(resultado.datos) ? resultado.datos : [];
        renderizarResumen();
        renderizarTabla(listaComunicados);
        ocultarMensaje();
    } catch (error) {
        renderizarTabla([]);
        mostrarMensaje(error.message);
        console.error("Error al cargar comunicados:", error);
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
        throw new Error(errores || resultado.mensaje || "No fue posible completar la operación");
    }

    return resultado;
}

function renderizarResumen() {
    resumenTotal.textContent = listaComunicados.length;
    resumenPublicados.textContent = listaComunicados.filter(
        (comunicado) => normalizarTexto(comunicado.estado) === "publicado"
    ).length;
    resumenBorradores.textContent = listaComunicados.filter(
        (comunicado) => normalizarTexto(comunicado.estado) === "borrador"
    ).length;
    resumenArchivados.textContent = listaComunicados.filter(
        (comunicado) => normalizarTexto(comunicado.estado) === "archivado"
    ).length;
}

function renderizarTabla(comunicados) {
    cuerpoTabla.innerHTML = "";

    if (comunicados.length === 0) {
        const fila = document.createElement("tr");
        fila.innerHTML = '<td colspan="7">No se encontraron comunicados institucionales.</td>';
        cuerpoTabla.appendChild(fila);
        return;
    }

    comunicados.forEach((comunicado) => {
        const fila = document.createElement("tr");
        fila.appendChild(crearCelda(comunicado.titulo));
        fila.appendChild(crearCelda(comunicado.publicoObjetivo));
        fila.appendChild(crearCelda(comunicado.autor));
        fila.appendChild(crearCelda(formatearFecha(comunicado.fechaPublicacion)));
        fila.appendChild(crearCelda(comunicado.destacado ? "Sí" : "No"));

        const celdaEstado = document.createElement("td");
        const estado = document.createElement("span");
        estado.className = `estado badge rounded-pill ${obtenerClaseEstado(comunicado.estado)}`;
        estado.textContent = comunicado.estado;
        celdaEstado.appendChild(estado);
        fila.appendChild(celdaEstado);

        const celdaAcciones = document.createElement("td");
        const acciones = document.createElement("div");
        acciones.className = "acciones-tabla";
        acciones.appendChild(crearBotonAccion("Consultar", "consultar", comunicado.id));
        acciones.appendChild(crearBotonAccion("Editar", "editar", comunicado.id));
        acciones.appendChild(crearBotonAccion("Eliminar", "eliminar", comunicado.id, true));
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
    boton.className = peligro ? "boton-tabla boton-tabla-peligro btn btn-sm btn-outline-danger" : "boton-tabla btn btn-sm btn-outline-primary";
    boton.dataset.accion = accion;
    boton.dataset.id = id;
    boton.textContent = texto;
    return boton;
}

function manejarAccionesTabla(evento) {
    const boton = evento.target.closest("button[data-accion]");
    if (!boton) return;

    const comunicado = listaComunicados.find((item) => item.id === boton.dataset.id);
    if (!comunicado) {
        mostrarMensaje("No se encontró el comunicado seleccionado");
        return;
    }

    if (boton.dataset.accion === "consultar") {
        mostrarDetalle(comunicado);
    } else if (boton.dataset.accion === "editar") {
        cargarEdicion(comunicado);
    } else if (boton.dataset.accion === "eliminar") {
        eliminarComunicado(comunicado);
    }
}

function mostrarDetalle(comunicado) {
    detalleTitulo.textContent = comunicado.titulo;
    detalleEstado.textContent = comunicado.estado;
    detalleEstado.className = `estado badge rounded-pill ${obtenerClaseEstado(comunicado.estado)}`;
    detalleAutor.textContent = comunicado.autor;
    detalleFecha.textContent = formatearFecha(comunicado.fechaPublicacion);
    detallePublico.textContent = comunicado.publicoObjetivo;
    detalleDestacado.textContent = comunicado.destacado ? "Sí" : "No";
    detallePaginaPublica.textContent = comunicado.paginaPublica ? "Sí" : "No";
    detalleResumen.textContent = comunicado.resumen;
    detalleContenido.textContent = comunicado.contenido;

    detalleEnlace.innerHTML = "";
    if (comunicado.enlace) {
        const enlace = document.createElement("a");
        enlace.href = comunicado.enlace;
        enlace.target = "_blank";
        enlace.rel = "noopener noreferrer";
        enlace.textContent = "Abrir información adicional";
        detalleEnlace.appendChild(enlace);
    } else {
        detalleEnlace.textContent = "Sin enlace registrado";
    }

    seccionDetalle.scrollIntoView({ behavior: "smooth", block: "start" });
}

function cargarEdicion(comunicado) {
    idComunicado.value = comunicado.id;
    campoTitulo.value = comunicado.titulo;
    campoResumen.value = comunicado.resumen;
    campoContenido.value = comunicado.contenido;
    campoPublico.value = comunicado.publicoObjetivo;
    campoAutor.value = comunicado.autor;
    campoFecha.value = comunicado.fechaPublicacion || "";
    campoEstado.value = comunicado.estado;
    campoDestacado.checked = Boolean(comunicado.destacado);
    campoPaginaPublica.checked = Boolean(comunicado.paginaPublica);
    campoEnlace.value = comunicado.enlace || "";

    tituloFormulario.textContent = "Editar comunicado";
    descripcionFormulario.textContent = "Modifique la información de la publicación seleccionada.";
    botonGuardar.textContent = "Actualizar comunicado";
    actualizarVistaPrevia();
    formulario.closest("section")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function guardarComunicado(evento) {
    evento.preventDefault();

    if (!formulario.checkValidity()) {
        formulario.reportValidity();
        return;
    }

    if (normalizarTexto(campoEstado.value) === "publicado" && !campoFecha.value) {
        mostrarMensaje("Los comunicados publicados requieren fecha de publicación");
        campoFecha.focus();
        return;
    }

    const datos = {
        titulo: campoTitulo.value.trim(),
        resumen: campoResumen.value.trim(),
        contenido: campoContenido.value.trim(),
        publicoObjetivo: campoPublico.value,
        autor: campoAutor.value.trim(),
        fechaPublicacion: campoFecha.value,
        estado: campoEstado.value,
        destacado: campoDestacado.checked,
        paginaPublica: campoPaginaPublica.checked,
        enlace: campoEnlace.value.trim()
    };

    const id = idComunicado.value.trim();
    const editando = id !== "";
    const url = editando ? `${URL_COMUNICADOS}/${id}` : URL_COMUNICADOS;
    const metodo = editando ? "PUT" : "POST";

    botonGuardar.disabled = true;
    botonGuardar.textContent = editando ? "Actualizando..." : "Guardando...";

    try {
        const resultado = await consultarApi(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });

        limpiarFormulario();
        await cargarComunicados();
        mostrarMensaje(resultado.mensaje);
        document.querySelector("#consultar-comunicados")?.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
        mostrarMensaje(error.message);
        console.error("Error al guardar comunicado:", error);
    } finally {
        botonGuardar.disabled = false;
        botonGuardar.textContent = idComunicado.value ? "Actualizar comunicado" : "Guardar comunicado";
    }
}

async function eliminarComunicado(comunicado) {
    const confirmar = window.confirm(
        `¿Está seguro de eliminar el comunicado?\n\n${comunicado.titulo}`
    );

    if (!confirmar) return;

    mostrarMensaje("Eliminando comunicado...");

    try {
        const resultado = await consultarApi(`${URL_COMUNICADOS}/${comunicado.id}`, {
            method: "DELETE"
        });

        if (idComunicado.value === comunicado.id) {
            limpiarFormulario();
        }

        await cargarComunicados();
        mostrarMensaje(resultado.mensaje);
    } catch (error) {
        mostrarMensaje(error.message);
        console.error("Error al eliminar comunicado:", error);
    }
}

function aplicarFiltros(evento) {
    evento.preventDefault();

    const texto = normalizarTexto(filtroTitulo.value);
    const publico = normalizarTexto(filtroPublico.value);
    const fecha = filtroFecha.value;
    const estado = normalizarTexto(filtroEstado.value);

    const filtrados = listaComunicados.filter((comunicado) => {
        const coincideTexto =
            !texto ||
            normalizarTexto(comunicado.titulo).includes(texto) ||
            normalizarTexto(comunicado.autor).includes(texto);
        const coincidePublico = !publico || normalizarTexto(comunicado.publicoObjetivo) === publico;
        const coincideFecha = !fecha || comunicado.fechaPublicacion === fecha;
        const coincideEstado = !estado || normalizarTexto(comunicado.estado) === estado;

        return coincideTexto && coincidePublico && coincideFecha && coincideEstado;
    });

    renderizarTabla(filtrados);
    mostrarMensaje(
        filtrados.length === 0
            ? "No se encontraron comunicados con los filtros seleccionados"
            : `Se encontraron ${filtrados.length} comunicado(s)`
    );
}

function limpiarFiltros() {
    setTimeout(() => {
        renderizarTabla(listaComunicados);
        ocultarMensaje();
    }, 0);
}

function limpiarFormulario() {
    formulario.reset();
    idComunicado.value = "";
    tituloFormulario.textContent = "Registrar comunicado";
    descripcionFormulario.textContent = "Complete la información de la publicación institucional.";
    botonGuardar.textContent = "Guardar comunicado";
    actualizarVistaPrevia();
}

function ajustarFechaSegunEstado() {
    if (normalizarTexto(campoEstado.value) === "publicado" && !campoFecha.value) {
        const hoy = new Date();
        const anio = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, "0");
        const dia = String(hoy.getDate()).padStart(2, "0");
        campoFecha.value = `${anio}-${mes}-${dia}`;
    }
    actualizarVistaPrevia();
}

function actualizarVistaPrevia() {
    vistaPreviaTitulo.textContent = campoTitulo.value.trim() || "Título del comunicado";
    vistaPreviaResumen.textContent = campoResumen.value.trim() || "El resumen aparecerá en esta sección.";
    vistaPreviaFecha.textContent = formatearFecha(campoFecha.value);
}

function formatearFecha(fecha) {
    if (!fecha) return "Sin publicar";
    const [anio, mes, dia] = fecha.split("-");
    if (!anio || !mes || !dia) return fecha;
    return `${dia}/${mes}/${anio}`;
}

function obtenerClaseEstado(estado) {
    const normalizado = normalizarTexto(estado);
    if (normalizado === "publicado") return "estado-activo";
    if (normalizado === "borrador") return "estado-pendiente";
    return "estado-inactivo";
}

function normalizarTexto(texto) {
    return String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function obtenerMensajeErrores(errores) {
    if (Array.isArray(errores)) return errores.join(" ");
    if (errores && typeof errores === "object") return Object.values(errores).flat().join(" ");
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
