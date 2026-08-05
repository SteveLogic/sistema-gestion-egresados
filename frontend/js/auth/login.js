const URL_LOGIN = "http://localhost:3000/api/auth/login";
const CLAVE_SESION = "sesionEgresadosCenfotec";
const CLAVE_RECORDATORIO = "recordatorioEgresadosCenfotec";

const formularioLogin = document.querySelector("#formulario-login");
const correoLogin = document.querySelector("#correo");
const contrasenaLogin = document.querySelector("#contrasena");
const rolLogin = document.querySelector("#rol");
const recordarLogin = document.querySelector("#recordar");
const botonLogin = document.querySelector("#boton-login");
const mensajeLogin = document.querySelector("#mensaje-login");

iniciarPaginaLogin();

function iniciarPaginaLogin() {
    // Abrir la pantalla de login inicia una sesión nueva.
    // Esto evita que una sesión anterior de Ana redirija a otro usuario.
    sessionStorage.removeItem(CLAVE_SESION);
    sessionStorage.removeItem("egresadoId");

    cargarDatosRecordados();
    formularioLogin.addEventListener("submit", manejarInicioSesion);
}

async function manejarInicioSesion(evento) {
    evento.preventDefault();

    if (!formularioLogin.checkValidity()) {
        formularioLogin.reportValidity();
        return;
    }

    botonLogin.disabled = true;
    botonLogin.textContent = "Ingresando...";
    ocultarMensajeLogin();

    try {
        const respuesta = await fetch(URL_LOGIN, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                correo: correoLogin.value.trim(),
                contrasena: contrasenaLogin.value,
                rol: rolLogin.value
            })
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok || !resultado.exito) {
            const errores = Array.isArray(resultado.errores)
                ? resultado.errores.join(" ")
                : "";

            throw new Error(
                errores ||
                resultado.mensaje ||
                "No fue posible iniciar sesión."
            );
        }

        const sesion = {
            ...resultado.datos,
            iniciadaEn: new Date().toISOString()
        };

        sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));

        if (sesion.egresadoId) {
            sessionStorage.setItem("egresadoId", sesion.egresadoId);
        } else {
            sessionStorage.removeItem("egresadoId");
        }

        guardarRecordatorio();
        window.location.href = sesion.dashboard;
    } catch (error) {
        mostrarMensajeLogin(error.message, true);
        contrasenaLogin.value = "";
        contrasenaLogin.focus();
        console.error("Error al iniciar sesión:", error);
    } finally {
        botonLogin.disabled = false;
        botonLogin.textContent = "Iniciar sesión";
    }
}

function guardarRecordatorio() {
    if (recordarLogin.checked) {
        localStorage.setItem(
            CLAVE_RECORDATORIO,
            JSON.stringify({
                correo: correoLogin.value.trim(),
                rol: rolLogin.value
            })
        );
        return;
    }

    localStorage.removeItem(CLAVE_RECORDATORIO);
}

function cargarDatosRecordados() {
    const recordatorio = obtenerJsonSeguro(
        localStorage.getItem(CLAVE_RECORDATORIO)
    );

    if (!recordatorio) {
        return;
    }

    correoLogin.value = recordatorio.correo || "";
    rolLogin.value = recordatorio.rol || "";
    recordarLogin.checked = true;
}

function mostrarMensajeLogin(mensaje, esError = false) {
    mensajeLogin.hidden = false;
    mensajeLogin.textContent = mensaje;
    mensajeLogin.setAttribute("role", esError ? "alert" : "status");
    mensajeLogin.style.borderColor = esError ? "#dc3545" : "";
    mensajeLogin.style.color = esError ? "#9f1d2b" : "";
}

function ocultarMensajeLogin() {
    mensajeLogin.hidden = true;
    mensajeLogin.textContent = "";
}

function obtenerJsonSeguro(valor) {
    if (!valor) {
        return null;
    }

    try {
        return JSON.parse(valor);
    } catch (error) {
        return null;
    }
}
