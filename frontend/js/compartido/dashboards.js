const API_BASE_DASHBOARD = "http://localhost:3000/api";

document.addEventListener("DOMContentLoaded", iniciarDashboard);

async function iniciarDashboard() {
    const pagina = window.location.pathname.split("/").pop();
    const sesion = window.SesionEgresados?.obtener();

    if (!sesion) return;

    try {
        if (pagina === "dashboard-registro.html") {
            await cargarDashboardRegistro();
        } else if (pagina === "dashboard-bienestar.html") {
            await cargarDashboardBienestar();
        } else if (pagina === "dashboard-egresado.html") {
            await cargarDashboardEgresado(sesion);
        }
    } catch (error) {
        mostrarErrorDashboard(error.message);
        console.error("Error al cargar el dashboard:", error);
    }
}

async function cargarDashboardRegistro() {
    const [egresados, titulos, carreras, escuelas] = await Promise.all([
        consultar("/egresados"),
        consultar("/titulos"),
        consultar("/carreras"),
        consultar("/escuelas")
    ]);

    ponerTexto("resumen-egresados-registro", egresados.length);
    ponerTexto("resumen-titulos-registro", titulos.length);
    ponerTexto(
        "resumen-carreras-registro",
        carreras.filter((item) => normalizar(item.estado) === "activa").length
    );
    ponerTexto("resumen-escuelas-registro", escuelas.length);

    const recientes = [...egresados]
        .sort((a, b) => String(b.fechaRegistro).localeCompare(String(a.fechaRegistro)))
        .slice(0, 3);

    const cuerpo = document.querySelector("#tabla-egresados-recientes");
    if (!cuerpo) return;

    cuerpo.innerHTML = recientes.length
        ? recientes.map((item) => `
            <tr>
                <td>${escapar(item.identificacion)}</td>
                <td>${escapar(item.nombreCompleto)}</td>
                <td>${escapar(item.correo)}</td>
                <td>${formatearFecha(item.fechaRegistro)}</td>
                <td>${crearEstado(item.estado)}</td>
            </tr>
        `).join("")
        : filaVacia(5, "No hay personas egresadas registradas.");
}

async function cargarDashboardBienestar() {
    const [actividades, comunidades, solicitudes, oportunidades, comunicados] = await Promise.all([
        consultar("/actividades"),
        consultar("/comunidades"),
        consultar("/mentorias/solicitudes"),
        consultar("/oportunidades"),
        consultar("/comunicados")
    ]);

    const hoy = fechaHoy();
    const actividadesProximas = actividades
        .filter((item) => normalizar(item.estado) === "publicada" && item.fecha >= hoy)
        .sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)));

    const oportunidadesActivas = oportunidades.filter(
        (item) => normalizar(item.estado) === "publicada" && item.fechaVencimiento >= hoy
    );

    const solicitudesPendientes = solicitudes
        .filter((item) => normalizar(item.estado) === "pendiente")
        .sort((a, b) => String(b.fechaSolicitud).localeCompare(String(a.fechaSolicitud)));

    ponerTexto("resumen-actividades-bienestar", actividadesProximas.length);
    ponerTexto(
        "resumen-comunidades-bienestar",
        comunidades.filter((item) => normalizar(item.estado) === "activa").length
    );
    ponerTexto("resumen-solicitudes-bienestar", solicitudesPendientes.length);
    ponerTexto("resumen-oportunidades-bienestar", oportunidadesActivas.length);

    renderizarSolicitudesBienestar(solicitudesPendientes.slice(0, 3));
    renderizarActividades("actividades-proximas-bienestar", actividadesProximas.slice(0, 3));
    renderizarComunicadosTabla(
        "comunicados-recientes-bienestar",
        [...comunicados]
            .sort((a, b) => String(b.fechaPublicacion).localeCompare(String(a.fechaPublicacion)))
            .slice(0, 3)
    );
}

async function cargarDashboardEgresado(sesion) {
    const egresadoId = sesion.egresadoId;
    if (!egresadoId) {
        throw new Error("La sesión no tiene una persona egresada asociada.");
    }

    const [egresado, titulos, actividades, comunidades, mentorias, oportunidades, comunicados] = await Promise.all([
        consultar(`/egresados/${egresadoId}`),
        consultar(`/titulos/egresado/${egresadoId}`),
        consultar("/actividades"),
        consultar("/comunidades"),
        consultar("/mentorias"),
        consultar("/oportunidades"),
        consultar("/comunicados")
    ]);

    const hoy = fechaHoy();
    const actividadesProximas = actividades
        .filter((item) => normalizar(item.estado) === "publicada" && item.fecha >= hoy)
        .sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)));

    const comunidadesAsociadas = comunidades.filter((comunidad) =>
        Array.isArray(comunidad.integrantes) &&
        comunidad.integrantes.some(
            (integrante) => normalizar(integrante.nombre) === normalizar(egresado.nombreCompleto)
        )
    );

    const mentoriasActivas = mentorias.filter(
        (item) => item.egresadoId === egresadoId &&
            ["activa", "pendiente"].includes(normalizar(item.estado))
    );

    const oportunidadesActivas = oportunidades
        .filter((item) => normalizar(item.estado) === "publicada" && item.fechaVencimiento >= hoy)
        .sort((a, b) => String(a.fechaVencimiento).localeCompare(String(b.fechaVencimiento)));

    const comunicadosPublicados = comunicados
        .filter((item) => normalizar(item.estado) === "publicado")
        .sort((a, b) => String(b.fechaPublicacion).localeCompare(String(a.fechaPublicacion)));

    ponerTexto("resumen-titulos-egresado", titulos.length);
    ponerTexto("resumen-comunidades-egresado", comunidadesAsociadas.length);
    ponerTexto("resumen-mentorias-egresado", mentoriasActivas.length);
    ponerTexto("resumen-actividades-egresado", actividadesProximas.length);

    ponerTexto("perfil-empresa-dashboard", egresado.lugarTrabajo || "No registrado");
    ponerTexto("perfil-puesto-dashboard", egresado.puestoActual || "No registrado");
    ponerTexto("perfil-area-dashboard", egresado.areaProfesional || "No registrada");
    ponerTexto("perfil-correo-dashboard", egresado.correo || "No registrado");
    ponerTexto("perfil-telefono-dashboard", egresado.telefono || "No registrado");
    ponerEnlace("perfil-linkedin-dashboard", egresado.linkedin);

    renderizarActividades("actividades-proximas-egresado", actividadesProximas.slice(0, 3));
    renderizarOportunidadesEgresado(oportunidadesActivas.slice(0, 3));
    renderizarMentoriaEgresado(mentoriasActivas[0]);
    renderizarComunicadosTarjetas("comunicados-recientes-egresado", comunicadosPublicados.slice(0, 3));
}

function renderizarSolicitudesBienestar(solicitudes) {
    const cuerpo = document.querySelector("#solicitudes-recientes-bienestar");
    if (!cuerpo) return;

    cuerpo.innerHTML = solicitudes.length
        ? solicitudes.map((item) => `
            <tr>
                <td>${escapar(item.egresadoNombre)}</td>
                <td>${escapar(item.oportunidad)}</td>
                <td>${escapar(item.objetivo)}</td>
                <td>${formatearFecha(item.fechaSolicitud)}</td>
                <td>${crearEstado(item.estado)}</td>
            </tr>
        `).join("")
        : filaVacia(5, "No hay solicitudes pendientes.");
}

function renderizarActividades(idContenedor, actividades) {
    const contenedor = document.querySelector(`#${idContenedor}`);
    if (!contenedor) return;

    contenedor.innerHTML = actividades.length
        ? actividades.map((item) => `
            <article class="tarjeta">
                <p class="texto-secundario">${formatearFechaLarga(item.fecha)}</p>
                <h3>${escapar(item.titulo)}</h3>
                <p>${escapar(item.descripcion)}</p>
                <br>
                ${crearEstado(item.estado)}
            </article>
        `).join("")
        : '<article class="tarjeta"><h3>Sin actividades próximas</h3><p>No hay actividades publicadas pendientes.</p></article>';
}

function renderizarComunicadosTabla(idCuerpo, comunicados) {
    const cuerpo = document.querySelector(`#${idCuerpo}`);
    if (!cuerpo) return;

    cuerpo.innerHTML = comunicados.length
        ? comunicados.map((item) => `
            <tr>
                <td>${escapar(item.titulo)}</td>
                <td>${escapar(item.publicoObjetivo)}</td>
                <td>${item.fechaPublicacion ? formatearFecha(item.fechaPublicacion) : "Sin publicar"}</td>
                <td>${crearEstado(item.estado)}</td>
            </tr>
        `).join("")
        : filaVacia(4, "No hay comunicados registrados.");
}

function renderizarOportunidadesEgresado(oportunidades) {
    const cuerpo = document.querySelector("#oportunidades-recientes-egresado");
    if (!cuerpo) return;

    cuerpo.innerHTML = oportunidades.length
        ? oportunidades.map((item) => `
            <tr>
                <td>${escapar(item.empresa)}</td>
                <td>${escapar(item.puesto)}</td>
                <td>${escapar(item.areaProfesional)}</td>
                <td>${escapar(item.modalidad)}</td>
                <td>${escapar(item.ubicacion)}</td>
                <td>${formatearFecha(item.fechaVencimiento)}</td>
            </tr>
        `).join("")
        : filaVacia(6, "No hay oportunidades laborales activas.");
}

function renderizarMentoriaEgresado(mentoria) {
    const contenedor = document.querySelector("#mentoria-activa-egresado");
    if (!contenedor) return;

    if (!mentoria) {
        contenedor.innerHTML = `
            <div class="encabezado-perfil-academico">
                <div>
                    <h3>No hay una mentoría activa</h3>
                    <p class="texto-secundario">Puedes registrar una solicitud desde el módulo de mentorías.</p>
                </div>
                <span class="estado estado-pendiente">Sin asignar</span>
            </div>
        `;
        return;
    }

    contenedor.innerHTML = `
        <div class="encabezado-perfil-academico">
            <div>
                <h3>Mentoría en ${escapar(mentoria.areaProfesional)}</h3>
                <p class="texto-secundario">${escapar(mentoria.objetivo)}</p>
            </div>
            ${crearEstado(mentoria.estado)}
        </div>
        <div class="cuadricula-detalle">
            <div><span class="etiqueta-detalle">Persona mentora</span><p>${escapar(mentoria.mentorNombre)}</p></div>
            <div><span class="etiqueta-detalle">Fecha de inicio</span><p>${formatearFecha(mentoria.fechaInicio)}</p></div>
            <div><span class="etiqueta-detalle">Fecha de finalización</span><p>${formatearFecha(mentoria.fechaFinalizacion)}</p></div>
            <div><span class="etiqueta-detalle">Modalidad</span><p>${escapar(mentoria.modalidad)}</p></div>
        </div>
    `;
}

function renderizarComunicadosTarjetas(idContenedor, comunicados) {
    const contenedor = document.querySelector(`#${idContenedor}`);
    if (!contenedor) return;

    contenedor.innerHTML = comunicados.length
        ? comunicados.map((item, indice) => `
            <article class="tarjeta${indice === 0 && item.destacado ? " comunicado-destacado" : ""}">
                <p class="texto-secundario">${formatearFechaLarga(item.fechaPublicacion)}</p>
                <h3>${escapar(item.titulo)}</h3>
                <p>${escapar(item.resumen)}</p>
            </article>
        `).join("")
        : '<article class="tarjeta"><h3>Sin comunicados</h3><p>No hay comunicados publicados.</p></article>';
}

async function consultar(ruta) {
    const respuesta = await fetch(`${API_BASE_DASHBOARD}${ruta}`);
    const resultado = await respuesta.json();

    if (!respuesta.ok || !resultado.exito) {
        throw new Error(resultado.mensaje || `No fue posible consultar ${ruta}`);
    }

    return resultado.datos;
}

function mostrarErrorDashboard(mensaje) {
    const main = document.querySelector("main");
    if (!main) return;

    const aviso = document.createElement("div");
    aviso.className = "mensaje-informativo";
    aviso.setAttribute("role", "alert");
    aviso.textContent = `No fue posible actualizar el panel: ${mensaje}`;
    main.prepend(aviso);
}

function ponerTexto(id, valor) {
    const elemento = document.querySelector(`#${id}`);
    if (elemento) elemento.textContent = valor;
}

function ponerEnlace(id, url) {
    const elemento = document.querySelector(`#${id}`);
    if (!elemento) return;

    if (!url) {
        elemento.textContent = "No registrado";
        return;
    }

    elemento.innerHTML = `<a href="${escaparAtributo(url)}" target="_blank" rel="noopener noreferrer">Abrir perfil</a>`;
}

function crearEstado(estado) {
    const normalizado = normalizar(estado);
    const clase = ["activa", "activo", "publicada", "publicado", "registrado", "asignada"]
        .includes(normalizado)
        ? "estado-activo"
        : ["pendiente", "borrador", "en revision", "en revisión"]
            .includes(normalizado)
            ? "estado-pendiente"
            : "estado-inactivo";

    return `<span class="estado ${clase}">${escapar(estado || "Sin estado")}</span>`;
}

function filaVacia(columnas, mensaje) {
    return `<tr><td colspan="${columnas}">${escapar(mensaje)}</td></tr>`;
}

function fechaHoy() {
    const fecha = new Date();
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    return `${anio}-${mes}-${dia}`;
}

function formatearFecha(valor) {
    if (!valor) return "No disponible";
    const [anio, mes, dia] = String(valor).split("-");
    return anio && mes && dia ? `${dia}/${mes}/${anio}` : escapar(valor);
}

function formatearFechaLarga(valor) {
    if (!valor) return "Sin fecha";
    const fecha = new Date(`${valor}T00:00:00`);
    return Number.isNaN(fecha.getTime())
        ? escapar(valor)
        : new Intl.DateTimeFormat("es-CR", {
            day: "numeric",
            month: "long",
            year: "numeric"
        }).format(fecha);
}

function normalizar(valor) {
    return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function escapar(valor) {
    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escaparAtributo(valor) {
    return escapar(valor);
}
