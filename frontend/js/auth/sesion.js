(function protegerPagina() {
    const CLAVE_SESION = "sesionEgresadosCenfotec";
    const paginaActual = window.location.pathname.split("/").pop();

    if (!paginaActual || paginaActual === "login.html") {
        return;
    }

    const sesion = obtenerJsonSeguro(
        sessionStorage.getItem(CLAVE_SESION)
    );

    if (!sesion?.rol || !sesion?.dashboard) {
        limpiarSesion();
        window.location.replace("login.html");
        return;
    }

    const dashboardsPorRol = {
        registro: "dashboard-registro.html",
        bienestar: "dashboard-bienestar.html",
        egresado: "dashboard-egresado.html"
    };

    const dashboardsProtegidos = Object.values(dashboardsPorRol);

    if (
        dashboardsProtegidos.includes(paginaActual) &&
        dashboardsPorRol[sesion.rol] !== paginaActual
    ) {
        window.location.replace(dashboardsPorRol[sesion.rol]);
        return;
    }

    if (sesion.egresadoId) {
        sessionStorage.setItem("egresadoId", sesion.egresadoId);
    }

    window.SesionEgresados = {
        obtener() {
            return { ...sesion };
        },
        cerrar: cerrarSesion
    };

    document.addEventListener("DOMContentLoaded", () => {
        actualizarEncabezado(sesion);
        prepararEnlacesPerfil(sesion);
        prepararCierreSesion();
    });

    function actualizarEncabezado(usuario) {
        const nombre = usuario.nombre || "Usuario del sistema";
        const nombreRol = usuario.nombreRol || obtenerNombreRol(usuario.rol);

        document
            .querySelectorAll(".informacion-usuario strong")
            .forEach((elemento) => {
                elemento.textContent = nombre;
            });

        document
            .querySelectorAll(".informacion-usuario p")
            .forEach((elemento) => {
                elemento.textContent = nombreRol;
            });

        document
            .querySelectorAll(".informacion-usuario .avatar")
            .forEach((elemento) => {
                elemento.textContent = obtenerIniciales(nombre);
            });
    }

    function prepararEnlacesPerfil(usuario) {
        if (usuario.rol !== "egresado" || !usuario.egresadoId) {
            return;
        }

        document
            .querySelectorAll('a[href^="perfil.html"]')
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

    function cerrarSesion() {
        limpiarSesion();
        window.location.replace("login.html");
    }

    function limpiarSesion() {
        sessionStorage.removeItem(CLAVE_SESION);
        sessionStorage.removeItem("egresadoId");
    }

    function obtenerNombreRol(rol) {
        const nombres = {
            registro: "Personal de Registro",
            bienestar: "Bienestar Estudiantil",
            egresado: "Persona egresada"
        };

        return nombres[rol] || "Usuario del sistema";
    }

    function obtenerIniciales(nombre) {
        return String(nombre)
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((parte) => parte.charAt(0).toUpperCase())
            .join("");
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
})();
