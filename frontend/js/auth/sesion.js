(function protegerPagina() {
    const CLAVE_SESION = "sesionEgresadosCenfotec";
    const CLAVE_MENSAJE = "mensajeAccesoEgresados";
    const paginaActual = window.location.pathname.split("/").pop();

    if (!paginaActual || paginaActual === "login.html") {
        return;
    }

    const sesion = obtenerJsonSeguro(sessionStorage.getItem(CLAVE_SESION));

    if (!sesion?.rol || !sesion?.dashboard || !sesion?.token) {
        limpiarSesion();
        window.location.replace("login.html");
        return;
    }

    const dashboardsPorRol = {
        registro: "dashboard-registro.html",
        bienestar: "dashboard-bienestar.html",
        egresado: "dashboard-egresado.html"
    };

    const paginasPermitidas = {
        registro: new Set([
            "dashboard-registro.html",
            "egresados.html",
            "titulos.html",
            "carreras.html",
            "escuelas.html"
        ]),
        bienestar: new Set([
            "dashboard-bienestar.html",
            "egresados.html",
            "actividades.html",
            "comunidades.html",
            "mentorias.html",
            "oportunidades.html",
            "comunicados.html"
        ]),
        egresado: new Set([
            "dashboard-egresado.html",
            "perfil.html",
            "actividades.html",
            "comunidades.html",
            "mentorias.html",
            "oportunidades.html",
            "comunicados.html"
        ])
    };

    const permitidasDelRol = paginasPermitidas[sesion.rol];

    if (!permitidasDelRol || !permitidasDelRol.has(paginaActual)) {
        sessionStorage.setItem(
            CLAVE_MENSAJE,
            "Tu rol no tiene permiso para acceder a esa página."
        );
        window.location.replace(
            dashboardsPorRol[sesion.rol] || "login.html"
        );
        return;
    }

    if (sesion.egresadoId) {
        sessionStorage.setItem("egresadoId", sesion.egresadoId);
    }

    configurarFetchAutenticado(sesion);

    window.SesionEgresados = {
        obtener() {
            return { ...sesion };
        },
        cerrar: cerrarSesion,
        paginaActual,
        esRol(rol) {
            return sesion.rol === rol;
        }
    };

    document.addEventListener("DOMContentLoaded", () => {
        document.body.dataset.rolSesion = sesion.rol;
        actualizarEncabezado(sesion);
        actualizarBienvenida(sesion);
        prepararEnlacesPerfil(sesion);
        prepararCierreSesion();
        mostrarMensajeAcceso();
        aplicarPermisosVisuales(sesion, paginaActual);
    });

    function configurarFetchAutenticado(usuario) {
        const fetchOriginal = window.fetch.bind(window);

        window.fetch = async function fetchConSesion(recurso, opciones = {}) {
            const url = typeof recurso === "string"
                ? recurso
                : recurso?.url || "";

            const esApiBackend = /^https?:\/\/(localhost|127\.0\.0\.1):3000\/api(?:\/|$)/i
                .test(url);

            if (!esApiBackend) {
                return fetchOriginal(recurso, opciones);
            }

            const headers = new Headers(
                opciones.headers ||
                (recurso instanceof Request ? recurso.headers : undefined)
            );

            headers.set(
                "Authorization",
                `Bearer ${usuario.token}`
            );

            const respuesta = await fetchOriginal(recurso, {
                ...opciones,
                headers
            });

            if (respuesta.status === 401) {
                limpiarSesion();
                window.location.replace("login.html");
            }

            return respuesta;
        };
    }

    function actualizarEncabezado(usuario) {
        const nombre = usuario.nombre || "Usuario del sistema";
        const nombreRol = usuario.nombreRol || obtenerNombreRol(usuario.rol);

        document.querySelectorAll(".informacion-usuario strong")
            .forEach((elemento) => {
                elemento.textContent = nombre;
            });

        document.querySelectorAll(".informacion-usuario p")
            .forEach((elemento) => {
                elemento.textContent = nombreRol;
            });

        document.querySelectorAll(".informacion-usuario .avatar")
            .forEach((elemento) => {
                elemento.textContent = obtenerIniciales(nombre);
            });
    }

    function actualizarBienvenida(usuario) {
        const elemento = document.querySelector("#bienvenida-panel");
        if (!elemento) return;

        const primerNombre = String(usuario.nombre || "Usuario")
            .trim()
            .split(/\s+/)[0];

        elemento.textContent = `Bienvenida, ${primerNombre}`;
    }

    function prepararEnlacesPerfil(usuario) {
        if (usuario.rol !== "egresado" || !usuario.egresadoId) return;

        document.querySelectorAll('a[href^="perfil.html"]')
            .forEach((enlace) => {
                const url = new URL(enlace.href, window.location.href);
                url.searchParams.set("egresadoId", usuario.egresadoId);
                enlace.href = `${url.pathname.split("/").pop()}${url.search}${url.hash}`;
            });
    }

    function prepararCierreSesion() {
        document.querySelectorAll("a").forEach((enlace) => {
            const texto = enlace.textContent.trim().toLowerCase();
            if (texto === "cerrar sesión" || texto === "cerrar sesion") {
                enlace.addEventListener("click", (evento) => {
                    evento.preventDefault();
                    cerrarSesion();
                });
            }
        });
    }

    function mostrarMensajeAcceso() {
        const mensaje = sessionStorage.getItem(CLAVE_MENSAJE);
        if (!mensaje) return;

        sessionStorage.removeItem(CLAVE_MENSAJE);
        const main = document.querySelector("main");
        if (!main) return;

        const aviso = document.createElement("div");
        aviso.className = "mensaje-informativo alert alert-info";
        aviso.setAttribute("role", "status");
        aviso.textContent = mensaje;
        main.prepend(aviso);
    }

    function aplicarPermisosVisuales(usuario, pagina) {
        if (usuario.rol === "bienestar" && pagina === "egresados.html") {
            activarModoConsulta({
                secciones: ["#registrar-egresado", "#importar-csv"],
                anclas: ['a[href*="#registrar-egresado"]', 'a[href*="#importar-csv"]'],
                acciones: ["editar", "eliminar"]
            });
        }

        if (usuario.rol !== "egresado") return;

        const configuraciones = {
            "actividades.html": {
                secciones: ["#registrar-actividad"],
                anclas: ['a[href*="#registrar-actividad"]'],
                acciones: ["editar", "eliminar"],
                estadosOcultos: ["borrador"]
            },
            "comunidades.html": {
                secciones: ["#registrar-comunidad"],
                anclas: ['a[href*="#registrar-comunidad"]'],
                acciones: ["editar", "eliminar"],
                estadosOcultos: ["en revisión", "inactiva"]
            },
            "oportunidades.html": {
                secciones: ["#registrar-oportunidad"],
                anclas: ['a[href*="#registrar-oportunidad"]'],
                acciones: ["editar", "eliminar"],
                estadosOcultos: ["vencida", "cerrada", "borrador"]
            },
            "comunicados.html": {
                secciones: ["#registrar-comunicado"],
                anclas: ['a[href*="#registrar-comunicado"]'],
                acciones: ["editar", "eliminar"],
                estadosOcultos: ["borrador", "archivado"]
            }
        };

        if (configuraciones[pagina]) {
            activarModoConsulta(configuraciones[pagina]);
        }

        if (pagina === "mentorias.html") {
            configurarMentoriasEgresado(usuario);
        }
    }

    function activarModoConsulta(configuracion) {
        document.body.classList.add("modo-consulta");

        (configuracion.secciones || []).forEach(ocultarSelector);
        (configuracion.anclas || []).forEach(ocultarSelector);

        const aplicar = () => {
            (configuracion.acciones || []).forEach((accion) => {
                document.querySelectorAll(`[data-accion="${accion}"]`)
                    .forEach((elemento) => {
                        elemento.hidden = true;
                    });
            });

            if (configuracion.estadosOcultos?.length) {
                document.querySelectorAll("tbody tr").forEach((fila) => {
                    const textoFila = normalizarTexto(fila.textContent);
                    fila.hidden = configuracion.estadosOcultos.some(
                        (estado) => textoFila.includes(normalizarTexto(estado))
                    );
                });
            }
        };

        aplicar();
        observarCambios(aplicar);
    }

    function configurarMentoriasEgresado(usuario) {
        [
            "#registrar-mentoria",
            "#asignar-mentor-solicitud"
        ].forEach(ocultarSelector);

        document
            .querySelectorAll('a[href*="#registrar-mentoria"]')
            .forEach((enlace) => {
                enlace.href = "#solicitar-mentoria";
                enlace.textContent = "Solicitar mentoría";
            });

        const aplicar = () => {
            document.querySelectorAll(
                '[data-accion="editar"], [data-accion="asignar"], [data-accion="eliminar"]'
            ).forEach((elemento) => {
                elemento.hidden = true;
            });

            seleccionarEgresadoActual("#egresado-solicitud", usuario.egresadoId);
            seleccionarEgresadoActual("#egresado-mentor", usuario.egresadoId);

            const estadoSolicitud = document.querySelector("#estado-solicitud");
            if (estadoSolicitud) {
                estadoSolicitud.value = "Pendiente";
                ocultarCampo(estadoSolicitud);
            }

            const estadoMentor = document.querySelector("#estado-mentor");
            if (estadoMentor) {
                estadoMentor.value = "Disponible";
                ocultarCampo(estadoMentor);
            }

            filtrarTablaPorNombre("#cuerpo-tabla-mentorias", usuario.nombre);
            filtrarTablaPorNombre("#cuerpo-tabla-solicitudes", usuario.nombre);
        };

        aplicar();
        observarCambios(aplicar);
    }

    function seleccionarEgresadoActual(selector, egresadoId) {
        const select = document.querySelector(selector);
        if (!select || !egresadoId) return;

        const opcion = Array.from(select.options).find(
            (item) => item.value === egresadoId
        );

        if (opcion) {
            select.value = egresadoId;
            select.dataset.bloqueadoPorRol = "true";

            if (select.dataset.listenerRol !== "true") {
                select.dataset.listenerRol = "true";
                select.addEventListener("change", () => {
                    if (select.dataset.bloqueadoPorRol === "true") {
                        select.value = egresadoId;
                    }
                });
            }

            ocultarCampo(select);
        }
    }

    function filtrarTablaPorNombre(selector, nombre) {
        const cuerpo = document.querySelector(selector);
        if (!cuerpo || !nombre) return;

        const nombreNormalizado = normalizarTexto(nombre);
        cuerpo.querySelectorAll("tr").forEach((fila) => {
            fila.hidden = !normalizarTexto(fila.textContent)
                .includes(nombreNormalizado);
        });
    }

    function ocultarCampo(elemento) {
        const campo = elemento.closest(".campo");
        if (campo) campo.hidden = true;
    }

    function ocultarSelector(selector) {
        document.querySelectorAll(selector).forEach((elemento) => {
            elemento.hidden = true;
        });
    }

    function observarCambios(funcion) {
        const observador = new MutationObserver(() => funcion());
        observador.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function cerrarSesion() {
        limpiarSesion();
        window.location.replace("login.html");
    }

    function limpiarSesion() {
        sessionStorage.removeItem(CLAVE_SESION);
        sessionStorage.removeItem("egresadoId");
    }

    function obtenerNombreRol(rol) {
        return {
            registro: "Personal de Registro",
            bienestar: "Bienestar Estudiantil",
            egresado: "Persona egresada"
        }[rol] || "Usuario del sistema";
    }

    function obtenerIniciales(nombre) {
        return String(nombre)
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((parte) => parte.charAt(0).toUpperCase())
            .join("");
    }

    function normalizarTexto(valor) {
        return String(valor || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    }

    function obtenerJsonSeguro(valor) {
        if (!valor) return null;
        try {
            return JSON.parse(valor);
        } catch (error) {
            return null;
        }
    }
})();
