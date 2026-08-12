const API = "http://localhost:3000/api";
const URL_MENTORIAS = `${API}/mentorias`;
const URL_MENTORES = `${URL_MENTORIAS}/mentores`;
const URL_SOLICITUDES = `${URL_MENTORIAS}/solicitudes`;
const URL_EGRESADOS = `${API}/egresados`;

let mentorias = [];
let mentores = [];
let solicitudes = [];
let egresados = [];

const $ = (selector) => document.querySelector(selector);
const tablaMentorias = $("#cuerpo-tabla-mentorias");
const tablaMentores = $("#cuerpo-tabla-mentores");
const tablaSolicitudes = $("#cuerpo-tabla-solicitudes");
const mensaje = $("#mensaje-mentorias");

const formularioFiltros = $("#formulario-filtros-mentorias");
const formularioMentoria = $("#formulario-mentoria");
const formularioMentor = $("#formulario-mentor");
const formularioSolicitud = $("#formulario-solicitud");
const formularioAsignacion = $("#formulario-asignacion");

window.addEventListener("DOMContentLoaded", iniciar);

function iniciar() {
    tablaMentorias.addEventListener("click", manejarAccionMentoria);
    tablaMentores.addEventListener("click", manejarAccionMentor);
    tablaSolicitudes.addEventListener("click", manejarAccionSolicitud);
    formularioFiltros.addEventListener("submit", filtrarMentorias);
    formularioFiltros.addEventListener("reset", () => setTimeout(() => renderMentorias(mentorias), 0));
    formularioMentoria.addEventListener("submit", guardarMentoria);
    formularioMentor.addEventListener("submit", guardarMentor);
    formularioSolicitud.addEventListener("submit", guardarSolicitud);
    formularioAsignacion.addEventListener("submit", asignarMentor);
    $("#boton-limpiar-mentoria").addEventListener("click", limpiarFormularioMentoria);
    $("#boton-limpiar-mentor").addEventListener("click", limpiarFormularioMentor);
    $("#boton-limpiar-solicitud").addEventListener("click", limpiarFormularioSolicitud);
    $("#boton-cancelar-asignacion").addEventListener("click", cerrarAsignacion);
    $("#solicitud-mentoria").addEventListener("change", completarDesdeSolicitud);
    cargarTodo();
}

async function cargarTodo() {
    try {
        const sesion = window.SesionEgresados?.obtener();
        const esEgresado =
            sesion?.rol === "egresado" && sesion?.egresadoId;

        const urlEgresados = esEgresado
            ? `${URL_EGRESADOS}/${sesion.egresadoId}`
            : URL_EGRESADOS;

        const [rMentorias, rMentores, rSolicitudes, rEgresados] = await Promise.all([
            solicitar(URL_MENTORIAS),
            solicitar(URL_MENTORES),
            solicitar(URL_SOLICITUDES),
            solicitar(urlEgresados)
        ]);

        mentorias = rMentorias.datos || [];
        mentores = rMentores.datos || [];
        solicitudes = rSolicitudes.datos || [];
        egresados = esEgresado
            ? [rEgresados.datos].filter(Boolean)
            : (rEgresados.datos || []);

        cargarSelects();
        renderTodo();
    } catch (error) {
        mostrarMensaje(error.message);
        console.error(error);
    }
}

async function solicitar(url, opciones = {}) {
    const respuesta = await fetch(url, opciones);
    let resultado;
    try { resultado = await respuesta.json(); }
    catch { throw new Error("El servidor devolvió una respuesta inválida"); }
    if (!respuesta.ok || !resultado.exito) {
        const errores = Array.isArray(resultado.errores) ? resultado.errores.join(" ") : "";
        throw new Error(errores || resultado.mensaje || "No fue posible completar la operación");
    }
    return resultado;
}

function renderTodo() {
    renderMentorias(mentorias);
    renderMentores();
    renderSolicitudes();
    $("#resumen-mentores-disponibles").textContent = mentores.filter(m => m.estado === "Disponible").length;
    $("#resumen-solicitudes-pendientes").textContent = solicitudes.filter(s => s.estado === "Pendiente").length;
    $("#resumen-mentorias-activas").textContent = mentorias.filter(m => m.estado === "Activa").length;
}

function cargarSelects() {
    cargarEgresados("#egresado-mentoria", "Seleccione una persona");
    cargarEgresados("#egresado-mentor", "Seleccione una persona");
    cargarEgresados("#egresado-solicitud", "Seleccione una persona");
    cargarMentores("#mentor-mentoria", "Seleccione una persona mentora", true);
    cargarMentores("#mentor-asignacion", "Seleccione una persona mentora", true);

    const selectSolicitud = $("#solicitud-mentoria");
    selectSolicitud.innerHTML = '<option value="">Sin solicitud relacionada</option>';
    solicitudes.filter(s => !["Rechazada", "Cancelada"].includes(s.estado)).forEach(s => {
        selectSolicitud.add(new Option(`${s.egresadoNombre} - ${s.oportunidad} (${s.estado})`, s.id));
    });
}

function cargarEgresados(selector, textoInicial) {
    const select = $(selector);
    const valor = select.value;
    select.innerHTML = `<option value="">${textoInicial}</option>`;
    egresados.forEach(e => select.add(new Option(`${e.identificacion} - ${e.nombreCompleto}`, e.id)));
    select.value = valor;
}

function cargarMentores(selector, textoInicial, excluirInactivos = false) {
    const select = $(selector);
    const valor = select.value;
    select.innerHTML = `<option value="">${textoInicial}</option>`;
    mentores.filter(m => !excluirInactivos || m.estado !== "Inactivo").forEach(m => {
        select.add(new Option(`${m.egresadoNombre} - ${m.areaExperiencia} (${m.estado})`, m.id));
    });
    select.value = valor;
}

function renderMentorias(lista) {
    tablaMentorias.innerHTML = "";
    if (!lista.length) return filaVacia(tablaMentorias, 7, "No se encontraron mentorías");
    lista.forEach(m => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${escapar(m.egresadoNombre)}</td><td>${escapar(m.mentorNombre)}</td>
            <td>${escapar(m.areaProfesional)}</td><td>${formatearFecha(m.fechaInicio)}</td>
            <td>${formatearFecha(m.fechaFinalizacion)}</td>
            <td><span class="estado badge rounded-pill ${claseEstado(m.estado)}">${escapar(m.estado)}</span></td>
            <td><div class="acciones-tabla">
                ${boton("consultar", m.id, "Consultar")}${boton("editar", m.id, "Editar")}
                ${boton("eliminar", m.id, "Eliminar", true)}
            </div></td>`;
        tablaMentorias.appendChild(fila);
    });
}

function renderMentores() {
    tablaMentores.innerHTML = "";
    if (!mentores.length) return filaVacia(tablaMentores, 7, "No hay personas mentoras registradas");
    mentores.forEach(m => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${escapar(m.egresadoNombre)}</td><td>${escapar(m.areaExperiencia)}</td>
            <td>${escapar(m.especialidades)}</td><td>${m.aniosExperiencia} año(s)</td>
            <td>${escapar(m.modalidad)}</td><td><span class="estado badge rounded-pill ${claseEstado(m.estado)}">${escapar(m.estado)}</span></td>
            <td><div class="acciones-tabla">${boton("editar", m.id, "Editar")}${boton("eliminar", m.id, "Eliminar", true)}</div></td>`;
        tablaMentores.appendChild(fila);
    });
}

function renderSolicitudes() {
    tablaSolicitudes.innerHTML = "";
    if (!solicitudes.length) return filaVacia(tablaSolicitudes, 6, "No hay solicitudes registradas");
    solicitudes.forEach(s => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${escapar(s.egresadoNombre)}</td><td>${escapar(s.oportunidad)}</td>
            <td>${formatearFecha(s.fechaSolicitud)}</td><td>${escapar(s.mentorNombre)}</td>
            <td><span class="estado badge rounded-pill ${claseEstado(s.estado)}">${escapar(s.estado)}</span></td>
            <td><div class="acciones-tabla">
                ${boton("editar", s.id, "Editar")}${boton("asignar", s.id, "Asignar")}${boton("eliminar", s.id, "Eliminar", true)}
            </div></td>`;
        tablaSolicitudes.appendChild(fila);
    });
}

function boton(accion, id, texto, peligro = false) {
    return `<button type="button" class="boton-tabla btn btn-sm ${peligro ? "boton-tabla-peligro btn-outline-danger" : "btn-outline-primary"}" data-accion="${accion}" data-id="${id}">${texto}</button>`;
}

function filaVacia(tbody, columnas, texto) {
    tbody.innerHTML = `<tr><td colspan="${columnas}">${texto}</td></tr>`;
}

async function manejarAccionMentoria(evento) {
    const btn = evento.target.closest("button[data-accion]");
    if (!btn) return;
    const item = mentorias.find(m => m.id === btn.dataset.id);
    if (!item) return;
    if (btn.dataset.accion === "consultar") mostrarDetalleMentoria(item);
    if (btn.dataset.accion === "editar") editarMentoria(item);
    if (btn.dataset.accion === "eliminar") await eliminarRecurso(`${URL_MENTORIAS}/${item.id}`, `¿Eliminar la mentoría de ${item.egresadoNombre}?`);
}

async function manejarAccionMentor(evento) {
    const btn = evento.target.closest("button[data-accion]");
    if (!btn) return;
    const item = mentores.find(m => m.id === btn.dataset.id);
    if (!item) return;
    if (btn.dataset.accion === "editar") editarMentor(item);
    if (btn.dataset.accion === "eliminar") await eliminarRecurso(`${URL_MENTORES}/${item.id}`, `¿Eliminar a ${item.egresadoNombre} como persona mentora?`);
}

async function manejarAccionSolicitud(evento) {
    const btn = evento.target.closest("button[data-accion]");
    if (!btn) return;
    const item = solicitudes.find(s => s.id === btn.dataset.id);
    if (!item) return;
    if (btn.dataset.accion === "editar") editarSolicitud(item);
    if (btn.dataset.accion === "asignar") abrirAsignacion(item);
    if (btn.dataset.accion === "eliminar") await eliminarRecurso(`${URL_SOLICITUDES}/${item.id}`, `¿Eliminar la solicitud de ${item.egresadoNombre}?`);
}

async function eliminarRecurso(url, pregunta) {
    if (!window.confirm(pregunta)) return;
    try {
        const r = await solicitar(url, { method: "DELETE" });
        await cargarTodo();
        mostrarMensaje(r.mensaje);
    } catch (error) { mostrarMensaje(error.message); }
}

function mostrarDetalleMentoria(m) {
    $("#detalle-egresado-mentoria").textContent = `${m.egresadoIdentificacion} - ${m.egresadoNombre}`;
    $("#detalle-mentor-mentoria").textContent = m.mentorNombre;
    $("#detalle-area-mentoria").textContent = m.areaProfesional;
    $("#detalle-modalidad-mentoria").textContent = m.modalidad;
    $("#detalle-inicio-mentoria").textContent = formatearFecha(m.fechaInicio);
    $("#detalle-finalizacion-mentoria").textContent = formatearFecha(m.fechaFinalizacion);
    const estado = $("#detalle-estado-mentoria"); estado.textContent = m.estado; estado.className = `estado badge rounded-pill ${claseEstado(m.estado)}`;
    $("#detalle-objetivo-mentoria").textContent = m.objetivo;
    $("#detalle-observaciones-mentoria").textContent = m.observaciones || "Sin observaciones";
    $("#detalle-mentoria").scrollIntoView({ behavior: "smooth", block: "start" });
}

function editarMentoria(m) {
    $("#id-mentoria").value = m.id; $("#solicitud-mentoria").value = m.solicitudId || "";
    $("#egresado-mentoria").value = m.egresadoId; $("#mentor-mentoria").value = m.mentorId;
    $("#area-profesional-mentoria").value = m.areaProfesional; $("#modalidad-mentoria").value = m.modalidad;
    $("#fecha-inicio-mentoria").value = m.fechaInicio; $("#fecha-finalizacion-mentoria").value = m.fechaFinalizacion;
    $("#estado-mentoria").value = m.estado; $("#objetivo-mentoria").value = m.objetivo;
    $("#observaciones-mentoria").value = m.observaciones || "";
    $("#titulo-formulario-mentoria").textContent = "Editar mentoría";
    $("#boton-guardar-mentoria").textContent = "Actualizar mentoría";
    $("#registrar-mentoria").scrollIntoView({ behavior: "smooth" });
}

async function guardarMentoria(evento) {
    evento.preventDefault();
    if (!formularioMentoria.reportValidity()) return;
    const id = $("#id-mentoria").value;
    const datos = {
        solicitudId: $("#solicitud-mentoria").value, egresadoId: $("#egresado-mentoria").value,
        mentorId: $("#mentor-mentoria").value, areaProfesional: $("#area-profesional-mentoria").value.trim(),
        modalidad: $("#modalidad-mentoria").value, fechaInicio: $("#fecha-inicio-mentoria").value,
        fechaFinalizacion: $("#fecha-finalizacion-mentoria").value, estado: $("#estado-mentoria").value,
        objetivo: $("#objetivo-mentoria").value.trim(), observaciones: $("#observaciones-mentoria").value.trim()
    };
    try {
        const r = await enviar(id ? `${URL_MENTORIAS}/${id}` : URL_MENTORIAS, id ? "PUT" : "POST", datos);
        limpiarFormularioMentoria(); await cargarTodo(); mostrarMensaje(r.mensaje);
    } catch (error) { mostrarMensaje(error.message); }
}

function limpiarFormularioMentoria() {
    formularioMentoria.reset(); $("#id-mentoria").value = "";
    $("#titulo-formulario-mentoria").textContent = "Registrar mentoría";
    $("#boton-guardar-mentoria").textContent = "Guardar mentoría";
}

function completarDesdeSolicitud() {
    const s = solicitudes.find(item => item.id === $("#solicitud-mentoria").value);
    if (!s) return;
    $("#egresado-mentoria").value = s.egresadoId; $("#area-profesional-mentoria").value = s.oportunidad;
    $("#objetivo-mentoria").value = s.objetivo; if (s.mentorId) $("#mentor-mentoria").value = s.mentorId;
}

function editarMentor(m) {
    $("#id-mentor").value = m.id; $("#egresado-mentor").value = m.egresadoId;
    $("#area-experiencia-mentor").value = m.areaExperiencia; $("#especialidades-mentor").value = m.especialidades;
    $("#anios-experiencia-mentor").value = m.aniosExperiencia; $("#disponibilidad-mentor").value = m.disponibilidad;
    $("#modalidad-mentor").value = m.modalidad; $("#estado-mentor").value = m.estado;
    $("#titulo-formulario-mentor").textContent = "Editar persona mentora";
    $("#boton-guardar-mentor").textContent = "Actualizar mentor";
    $("#registrar-mentor").scrollIntoView({ behavior: "smooth" });
}

async function guardarMentor(evento) {
    evento.preventDefault(); if (!formularioMentor.reportValidity()) return;
    const id = $("#id-mentor").value;
    const datos = {
        egresadoId: $("#egresado-mentor").value, areaExperiencia: $("#area-experiencia-mentor").value.trim(),
        especialidades: $("#especialidades-mentor").value.trim(), aniosExperiencia: Number($("#anios-experiencia-mentor").value),
        disponibilidad: $("#disponibilidad-mentor").value.trim(), modalidad: $("#modalidad-mentor").value,
        estado: $("#estado-mentor").value
    };
    try {
        const r = await enviar(id ? `${URL_MENTORES}/${id}` : URL_MENTORES, id ? "PUT" : "POST", datos);
        limpiarFormularioMentor(); await cargarTodo(); mostrarMensaje(r.mensaje);
    } catch (error) { mostrarMensaje(error.message); }
}

function limpiarFormularioMentor() {
    formularioMentor.reset(); $("#id-mentor").value = "";
    $("#titulo-formulario-mentor").textContent = "Registrar persona mentora";
    $("#boton-guardar-mentor").textContent = "Guardar mentor";
}

function editarSolicitud(s) {
    $("#id-solicitud").value = s.id; $("#egresado-solicitud").value = s.egresadoId;
    $("#oportunidad-solicitud").value = s.oportunidad; $("#fecha-solicitud").value = s.fechaSolicitud;
    $("#estado-solicitud").value = s.estado; $("#objetivo-solicitud").value = s.objetivo;
    $("#comentarios-solicitud").value = s.comentarios || "";
    $("#titulo-formulario-solicitud").textContent = "Editar solicitud de mentoría";
    $("#boton-guardar-solicitud").textContent = "Actualizar solicitud";
    $("#solicitar-mentoria").scrollIntoView({ behavior: "smooth" });
}

async function guardarSolicitud(evento) {
    evento.preventDefault(); if (!formularioSolicitud.reportValidity()) return;
    const id = $("#id-solicitud").value;
    const existente = solicitudes.find(s => s.id === id);
    const datos = {
        egresadoId: $("#egresado-solicitud").value, objetivo: $("#objetivo-solicitud").value.trim(),
        oportunidad: $("#oportunidad-solicitud").value.trim(), comentarios: $("#comentarios-solicitud").value.trim(),
        fechaSolicitud: $("#fecha-solicitud").value, estado: $("#estado-solicitud").value,
        mentorId: existente?.mentorId || "", observacionesAsignacion: existente?.observacionesAsignacion || ""
    };
    try {
        const r = await enviar(id ? `${URL_SOLICITUDES}/${id}` : URL_SOLICITUDES, id ? "PUT" : "POST", datos);
        limpiarFormularioSolicitud(); await cargarTodo(); mostrarMensaje(r.mensaje);
    } catch (error) { mostrarMensaje(error.message); }
}

function limpiarFormularioSolicitud() {
    formularioSolicitud.reset(); $("#id-solicitud").value = ""; $("#fecha-solicitud").value = fechaHoy();
    $("#titulo-formulario-solicitud").textContent = "Registrar solicitud de mentoría";
    $("#boton-guardar-solicitud").textContent = "Guardar solicitud";
}

function abrirAsignacion(s) {
    $("#id-solicitud-asignacion").value = s.id; $("#mentor-asignacion").value = s.mentorId || "";
    $("#observaciones-asignacion").value = s.observacionesAsignacion || "";
    $("#descripcion-asignacion-solicitud").textContent = `${s.egresadoNombre}: ${s.oportunidad}`;
    $("#asignar-mentor-solicitud").hidden = false;
    $("#asignar-mentor-solicitud").scrollIntoView({ behavior: "smooth" });
}

function cerrarAsignacion() { formularioAsignacion.reset(); $("#id-solicitud-asignacion").value = ""; $("#asignar-mentor-solicitud").hidden = true; }

async function asignarMentor(evento) {
    evento.preventDefault(); if (!formularioAsignacion.reportValidity()) return;
    const id = $("#id-solicitud-asignacion").value;
    try {
        const r = await enviar(`${URL_SOLICITUDES}/${id}/asignar`, "POST", {
            mentorId: $("#mentor-asignacion").value,
            observacionesAsignacion: $("#observaciones-asignacion").value.trim()
        });
        cerrarAsignacion(); await cargarTodo(); mostrarMensaje(r.mensaje);
    } catch (error) { mostrarMensaje(error.message); }
}

function filtrarMentorias(evento) {
    evento.preventDefault();
    const participante = normalizar($("#filtro-participante-mentoria").value);
    const area = normalizar($("#filtro-area-mentoria").value);
    const estado = normalizar($("#filtro-estado-mentoria").value);
    const fecha = $("#filtro-fecha-inicio").value;
    const filtradas = mentorias.filter(m => {
        const participantes = normalizar(`${m.egresadoNombre} ${m.egresadoIdentificacion} ${m.mentorNombre}`);
        return (!participante || participantes.includes(participante)) &&
            (!area || normalizar(m.areaProfesional).includes(area)) &&
            (!estado || normalizar(m.estado) === estado) && (!fecha || m.fechaInicio === fecha);
    });
    renderMentorias(filtradas); mostrarMensaje(`Se encontraron ${filtradas.length} mentoría(s).`);
}

async function enviar(url, method, datos) {
    return solicitar(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) });
}

function mostrarMensaje(texto) { mensaje.textContent = texto; mensaje.hidden = false; }
function normalizar(texto) { return String(texto || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim(); }
function claseEstado(estado) {
    const e = normalizar(estado);
    if (["activa", "disponible", "asignada"].includes(e)) return "estado-activo";
    if (["pendiente", "asignado", "en revision"].includes(e)) return "estado-pendiente";
    return "estado-inactivo";
}
function formatearFecha(fecha) {
    if (!fecha) return "Sin definir";
    const [a, m, d] = fecha.split("-"); return a && m && d ? `${d}/${m}/${a}` : fecha;
}
function fechaHoy() { return new Date().toISOString().slice(0, 10); }
function escapar(valor) {
    return String(valor ?? "").replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
}
