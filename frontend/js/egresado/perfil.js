const URL_EGRESADOS = "http://localhost:3000/api/egresados";
const URL_TITULOS = "http://localhost:3000/api/titulos";

let egresadoActual = null;
let titulosActuales = [];

const parametrosPerfil = new URLSearchParams(window.location.search);
const egresadoIdActual =
    parametrosPerfil.get("egresadoId") ||
    sessionStorage.getItem("egresadoId") ||
    localStorage.getItem("egresadoId") ||
    "egr-001";

const formularioPerfil = document.querySelector("#formulario-perfil");
const botonRestablecerPerfil = document.querySelector(
    "#boton-restablecer-perfil"
);
const botonGuardarPerfil = document.querySelector("#boton-guardar-perfil");
const mensajePerfil = document.querySelector("#mensaje-perfil");
const cuerpoTitulosPerfil = document.querySelector("#cuerpo-titulos-perfil");

const camposFormulario = {
    correo: document.querySelector("#correo-personal"),
    telefono: document.querySelector("#telefono-personal"),
    empresa: document.querySelector("#empresa-actual"),
    puesto: document.querySelector("#puesto-actual"),
    area: document.querySelector("#area-profesional"),
    linkedin: document.querySelector("#linkedin-perfil"),
    portafolio: document.querySelector("#portafolio-perfil")
};

document.addEventListener("DOMContentLoaded", iniciarPerfil);

function iniciarPerfil() {
    formularioPerfil.addEventListener("submit", guardarCambiosPerfil);
    botonRestablecerPerfil.addEventListener("click", restablecerFormularioPerfil);
    cargarPerfilCompleto();
}

async function cargarPerfilCompleto() {
    mostrarMensajePerfil("Cargando información del perfil...");

    try {
        const [respuestaEgresado, respuestaTitulos] = await Promise.all([
            consultarApi(`${URL_EGRESADOS}/${egresadoIdActual}`),
            consultarApi(`${URL_TITULOS}/egresado/${egresadoIdActual}`)
        ]);

        egresadoActual = respuestaEgresado.datos;
        titulosActuales = Array.isArray(respuestaTitulos.datos)
            ? respuestaTitulos.datos
            : [];

        mostrarInformacionPerfil();
        mostrarTitulosPerfil();
        cargarFormularioPerfil();
        ocultarMensajePerfil();
    } catch (error) {
        mostrarMensajePerfil(error.message);
        cuerpoTitulosPerfil.innerHTML = `
            <tr>
                <td colspan="5">
                    No fue posible cargar los títulos académicos.
                </td>
            </tr>
        `;
        console.error("Error al cargar el perfil:", error);
    }
}

async function consultarApi(url, opciones = {}) {
    const respuesta = await fetch(url, opciones);
    const resultado = await respuesta.json();

    if (!respuesta.ok || !resultado.exito) {
        const errores = obtenerMensajeErrores(resultado.errores);
        throw new Error(
            errores ||
            resultado.mensaje ||
            "No fue posible completar la solicitud."
        );
    }

    return resultado;
}

function mostrarInformacionPerfil() {
    const nombre = egresadoActual.nombreCompleto || "Persona egresada";
    const iniciales = obtenerIniciales(nombre);
    const tituloPrincipal = obtenerTituloPrincipal();

    asignarTexto("#nombre-usuario-encabezado", nombre);
    asignarTexto("#avatar-usuario-encabezado", iniciales);
    asignarTexto("#avatar-perfil", iniciales);
    asignarTexto("#nombre-principal-perfil", nombre);

    asignarTexto(
        "#carrera-principal-perfil",
        tituloPrincipal
            ? `${tituloPrincipal.tipoPrograma} en ${tituloPrincipal.carreraNombre}`
            : "Sin títulos académicos registrados"
    );

    asignarTexto(
        "#graduacion-principal-perfil",
        tituloPrincipal
            ? `Graduación registrada en ${tituloPrincipal.anioGraduacion}`
            : "Sin año de graduación registrado"
    );

    asignarTexto(
        "#perfil-identificacion",
        egresadoActual.identificacion || "No registrado"
    );
    asignarTexto("#perfil-nombre-completo", nombre);
    asignarTexto(
        "#perfil-correo",
        egresadoActual.correo || "No registrado"
    );
    asignarTexto(
        "#perfil-telefono",
        egresadoActual.telefono || "No registrado"
    );
    asignarTexto(
        "#perfil-fecha-registro",
        formatearFecha(egresadoActual.fechaRegistro)
    );

    actualizarEstado("#perfil-estado", egresadoActual.estado);
    actualizarEstado("#resumen-estado-perfil", egresadoActual.estado);

    asignarTexto(
        "#perfil-empresa",
        egresadoActual.lugarTrabajo || "No registrado"
    );
    asignarTexto(
        "#perfil-puesto",
        egresadoActual.puestoActual || "No registrado"
    );
    asignarTexto(
        "#perfil-area",
        egresadoActual.areaProfesional || "No registrada"
    );

    mostrarEnlacePerfil(
        "#perfil-linkedin",
        egresadoActual.linkedin,
        "LinkedIn no registrado"
    );
    mostrarEnlacePerfil(
        "#perfil-portafolio",
        egresadoActual.portafolio,
        "Portafolio no registrado"
    );

    const carreras = obtenerValoresUnicos(
        titulosActuales.map((titulo) => titulo.carreraNombre)
    );
    const escuelas = obtenerValoresUnicos(
        titulosActuales.map((titulo) => titulo.escuelaNombre)
    );

    asignarTexto("#resumen-titulos-perfil", titulosActuales.length);
    asignarTexto("#resumen-carreras-perfil", carreras.length);
    asignarTexto("#resumen-escuelas-perfil", escuelas.length);
    asignarTexto(
        "#caption-titulos-perfil",
        `Títulos académicos de ${nombre}`
    );

    mostrarListaAcademica("#lista-carreras-perfil", carreras);
    mostrarListaAcademica("#lista-escuelas-perfil", escuelas);
}

function mostrarTitulosPerfil() {
    cuerpoTitulosPerfil.innerHTML = "";

    if (titulosActuales.length === 0) {
        cuerpoTitulosPerfil.innerHTML = `
            <tr>
                <td colspan="5">
                    No hay títulos académicos registrados para este perfil.
                </td>
            </tr>
        `;
        return;
    }

    const titulosOrdenados = [...titulosActuales].sort(
        (tituloA, tituloB) =>
            Number(tituloB.anioGraduacion) - Number(tituloA.anioGraduacion)
    );

    titulosOrdenados.forEach((titulo) => {
        const fila = document.createElement("tr");

        agregarCelda(fila, titulo.tipoPrograma);
        agregarCelda(fila, titulo.carreraNombre);
        agregarCelda(fila, titulo.escuelaNombre);
        agregarCelda(fila, titulo.anioGraduacion);

        const celdaEstado = document.createElement("td");
        const estado = document.createElement("span");
        estado.className = `estado badge rounded-pill ${obtenerClaseEstado(titulo.estado)}`;
        estado.textContent = titulo.estado || "Sin estado";
        celdaEstado.appendChild(estado);
        fila.appendChild(celdaEstado);

        cuerpoTitulosPerfil.appendChild(fila);
    });
}

function cargarFormularioPerfil() {
    camposFormulario.correo.value = egresadoActual.correo || "";
    camposFormulario.telefono.value = egresadoActual.telefono || "";
    camposFormulario.empresa.value = egresadoActual.lugarTrabajo || "";
    camposFormulario.puesto.value = egresadoActual.puestoActual || "";
    camposFormulario.area.value = egresadoActual.areaProfesional || "";
    camposFormulario.linkedin.value = egresadoActual.linkedin || "";
    camposFormulario.portafolio.value = egresadoActual.portafolio || "";
}

async function guardarCambiosPerfil(evento) {
    evento.preventDefault();

    if (!formularioPerfil.checkValidity()) {
        formularioPerfil.reportValidity();
        return;
    }

    botonGuardarPerfil.disabled = true;
    botonGuardarPerfil.textContent = "Guardando...";

    const datosActualizados = {
        identificacion: egresadoActual.identificacion,
        nombreCompleto: egresadoActual.nombreCompleto,
        correo: camposFormulario.correo.value.trim(),
        telefono: camposFormulario.telefono.value.trim(),
        fechaRegistro: egresadoActual.fechaRegistro,
        lugarTrabajo: camposFormulario.empresa.value.trim(),
        estado: egresadoActual.estado,
        puestoActual: camposFormulario.puesto.value.trim(),
        areaProfesional: camposFormulario.area.value.trim(),
        linkedin: camposFormulario.linkedin.value.trim(),
        portafolio: camposFormulario.portafolio.value.trim()
    };

    try {
        const resultado = await consultarApi(
            `${URL_EGRESADOS}/${egresadoActual.id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datosActualizados)
            }
        );

        egresadoActual = resultado.datos;
        mostrarInformacionPerfil();
        cargarFormularioPerfil();
        mostrarMensajePerfil(
            resultado.mensaje || "Perfil actualizado correctamente."
        );

        document
            .querySelector("#informacion-profesional")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
        mostrarMensajePerfil(error.message);
        console.error("Error al actualizar el perfil:", error);
    } finally {
        botonGuardarPerfil.disabled = false;
        botonGuardarPerfil.textContent = "Guardar cambios";
    }
}

function restablecerFormularioPerfil() {
    if (!egresadoActual) {
        return;
    }

    cargarFormularioPerfil();
    ocultarMensajePerfil();
}

function obtenerTituloPrincipal() {
    if (titulosActuales.length === 0) {
        return null;
    }

    return [...titulosActuales].sort(
        (tituloA, tituloB) =>
            Number(tituloB.anioGraduacion) - Number(tituloA.anioGraduacion)
    )[0];
}

function mostrarListaAcademica(selector, valores) {
    const contenedor = document.querySelector(selector);
    contenedor.innerHTML = "";

    if (valores.length === 0) {
        const mensaje = document.createElement("p");
        mensaje.textContent = "No hay información académica registrada.";
        contenedor.appendChild(mensaje);
        return;
    }

    const lista = document.createElement("ul");
    valores.forEach((valor) => {
        const elemento = document.createElement("li");
        elemento.textContent = valor;
        lista.appendChild(elemento);
    });
    contenedor.appendChild(lista);
}

function mostrarEnlacePerfil(selector, url, textoVacio) {
    const contenedor = document.querySelector(selector);
    contenedor.innerHTML = "";

    if (!url) {
        contenedor.textContent = textoVacio;
        return;
    }

    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.target = "_blank";
    enlace.rel = "noopener noreferrer";
    enlace.className = "enlace-destacado";
    enlace.textContent = url;
    contenedor.appendChild(enlace);
}

function actualizarEstado(selector, estado) {
    const elemento = document.querySelector(selector);
    elemento.textContent = estado || "Sin estado";
    elemento.className = `estado badge rounded-pill ${obtenerClaseEstado(estado)}`;
}

function obtenerClaseEstado(estado) {
    const valor = normalizarTexto(estado);

    if (["activo", "registrado", "publicada", "activa"].includes(valor)) {
        return "estado-activo";
    }

    if (["pendiente", "en revision", "borrador"].includes(valor)) {
        return "estado-pendiente";
    }

    return "estado-inactivo";
}

function agregarCelda(fila, contenido) {
    const celda = document.createElement("td");
    celda.textContent = contenido || "No registrado";
    fila.appendChild(celda);
}

function asignarTexto(selector, valor) {
    const elemento = document.querySelector(selector);
    if (elemento) {
        elemento.textContent = valor ?? "";
    }
}

function obtenerIniciales(nombre) {
    return String(nombre || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte.charAt(0).toUpperCase())
        .join("") || "--";
}

function formatearFecha(fecha) {
    if (!fecha) {
        return "No registrada";
    }

    const partes = String(fecha).split("-").map(Number);
    if (partes.length !== 3 || partes.some(Number.isNaN)) {
        return fecha;
    }

    const [anio, mes, dia] = partes;
    return new Intl.DateTimeFormat("es-CR", {
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(new Date(anio, mes - 1, dia));
}

function obtenerValoresUnicos(valores) {
    return [...new Set(valores.filter(Boolean))].sort((a, b) =>
        a.localeCompare(b, "es")
    );
}

function normalizarTexto(texto) {
    return String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
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

function mostrarMensajePerfil(mensaje) {
    mensajePerfil.textContent = mensaje;
    mensajePerfil.hidden = false;
}

function ocultarMensajePerfil() {
    mensajePerfil.textContent = "";
    mensajePerfil.hidden = true;
}
