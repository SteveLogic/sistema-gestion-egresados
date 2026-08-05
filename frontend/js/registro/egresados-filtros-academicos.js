(() => {
    "use strict";

    const API = {
        egresados: "http://localhost:3000/api/egresados",
        titulos: "http://localhost:3000/api/titulos",
        carreras: "http://localhost:3000/api/carreras",
        escuelas: "http://localhost:3000/api/escuelas"
    };

    let egresados = [];
    let titulos = [];
    let carreras = [];
    let escuelas = [];

    document.addEventListener("DOMContentLoaded", iniciarFiltrosAcademicos);

    async function iniciarFiltrosAcademicos() {
        const elementos = obtenerElementos();

        if (!elementos.formulario || !elementos.cuerpoTabla) {
            console.warn(
                "No se encontró el formulario o la tabla de egresados."
            );
            return;
        }

        prepararMensaje(elementos);
        conectarEventos(elementos);

        try {
            const resultados = await Promise.all([
                consultarApi(API.egresados),
                consultarApi(API.titulos),
                consultarApi(API.carreras),
                consultarApi(API.escuelas)
            ]);

            egresados = obtenerLista(resultados[0]);
            titulos = obtenerLista(resultados[1]);
            carreras = obtenerLista(resultados[2]);
            escuelas = obtenerLista(resultados[3]);

            cargarFiltroCarreras(elementos.filtroCarrera);
            cargarFiltroEscuelas(elementos.filtroEscuela);
            cargarFiltroProgramas(elementos.filtroPrograma);
        } catch (error) {
            mostrarMensaje(
                elementos.mensaje,
                error.message ||
                    "No fue posible cargar los filtros académicos."
            );

            console.error(
                "Error al inicializar filtros académicos:",
                error
            );
        }
    }

    function obtenerElementos() {
        const seccionConsulta = document.querySelector(
            "#consultar-egresados"
        );

        return {
            formulario:
                document.querySelector(
                    "#formulario-filtros-egresados"
                ) ||
                seccionConsulta?.querySelector("form") ||
                null,

            cuerpoTabla:
                document.querySelector(
                    "#cuerpo-tabla-egresados"
                ) ||
                document.querySelector(
                    "#consultar-egresados"
                )?.nextElementSibling?.querySelector("tbody") ||
                document.querySelector("table.tabla tbody"),

            mensaje:
                document.querySelector("#mensaje-egresados"),

            filtroNombre:
                document.querySelector("#filtro-nombre"),

            filtroCarrera:
                document.querySelector("#filtro-carrera"),

            filtroEscuela:
                document.querySelector("#filtro-escuela"),

            filtroPrograma:
                document.querySelector("#filtro-programa"),

            filtroAnio:
                document.querySelector("#filtro-anio"),

            filtroEstado:
                document.querySelector("#filtro-estado")
        };
    }

    function prepararMensaje(elementos) {
        if (elementos.mensaje) {
            return;
        }

        const contenedorTabla =
            elementos.cuerpoTabla.closest(".contenedor-tabla");

        if (!contenedorTabla) {
            return;
        }

        const mensaje = document.createElement("div");
        mensaje.id = "mensaje-egresados";
        mensaje.className = "mensaje-informativo";
        mensaje.setAttribute("aria-live", "polite");
        mensaje.hidden = true;

        contenedorTabla.insertAdjacentElement(
            "afterend",
            mensaje
        );

        elementos.mensaje = mensaje;
    }

    function conectarEventos(elementos) {
        elementos.formulario.addEventListener(
            "submit",
            (evento) => {
                evento.preventDefault();
                evento.stopImmediatePropagation();
                aplicarFiltros(elementos);
            },
            true
        );

        elementos.formulario.addEventListener(
            "reset",
            (evento) => {
                evento.stopImmediatePropagation();

                setTimeout(() => {
                    mostrarEgresados(
                        elementos.cuerpoTabla,
                        egresados
                    );
                    ocultarMensaje(elementos.mensaje);
                }, 0);
            },
            true
        );
    }

    async function consultarApi(url) {
        const respuesta = await fetch(url);
        const resultado = await respuesta.json();

        if (!respuesta.ok || !resultado.exito) {
            throw new Error(
                resultado.mensaje ||
                    "No fue posible consultar la información."
            );
        }

        return resultado;
    }

    function obtenerLista(resultado) {
        return Array.isArray(resultado?.datos)
            ? resultado.datos
            : [];
    }

    function cargarFiltroCarreras(select) {
        if (!select) {
            return;
        }

        select.innerHTML = `
            <option value="">
                Todas las carreras
            </option>
        `;

        carreras.forEach((carrera) => {
            const opcion = document.createElement("option");
            opcion.value = carrera.id;
            opcion.textContent = carrera.nombre;
            select.appendChild(opcion);
        });
    }

    function cargarFiltroEscuelas(select) {
        if (!select) {
            return;
        }

        select.innerHTML = `
            <option value="">
                Todas las escuelas
            </option>
        `;

        escuelas.forEach((escuela) => {
            const opcion = document.createElement("option");
            opcion.value = escuela.id;
            opcion.textContent = escuela.nombre;
            select.appendChild(opcion);
        });
    }

    function cargarFiltroProgramas(select) {
        if (!select) {
            return;
        }

        select.innerHTML = `
            <option value="">
                Todos los programas
            </option>
            <option value="Técnico">Técnico</option>
            <option value="Bachillerato">Bachillerato</option>
            <option value="Maestría">Maestría</option>
        `;
    }

    function aplicarFiltros(elementos) {
        const filtros = {
            nombre: normalizarTexto(
                elementos.filtroNombre?.value
            ),
            carreraId:
                elementos.filtroCarrera?.value || "",
            escuelaId:
                elementos.filtroEscuela?.value || "",
            programa: normalizarTexto(
                elementos.filtroPrograma?.value
            ),
            anio: String(
                elementos.filtroAnio?.value || ""
            ).trim(),
            estado: normalizarTexto(
                elementos.filtroEstado?.value
            )
        };

        const hayFiltroAcademico = Boolean(
            filtros.carreraId ||
                filtros.escuelaId ||
                filtros.programa ||
                filtros.anio
        );

        const resultados = egresados.filter((egresado) => {
            const coincideNombre =
                !filtros.nombre ||
                normalizarTexto(
                    egresado.nombreCompleto
                ).includes(filtros.nombre) ||
                normalizarTexto(
                    egresado.identificacion
                ).includes(filtros.nombre);

            const coincideEstado =
                !filtros.estado ||
                normalizarTexto(egresado.estado) ===
                    filtros.estado;

            if (!coincideNombre || !coincideEstado) {
                return false;
            }

            if (!hayFiltroAcademico) {
                return true;
            }

            const titulosDelEgresado = titulos.filter(
                (titulo) =>
                    titulo.egresadoId === egresado.id
            );

            return titulosDelEgresado.some((titulo) => {
                const coincideCarrera =
                    !filtros.carreraId ||
                    titulo.carreraId === filtros.carreraId;

                const coincideEscuela =
                    !filtros.escuelaId ||
                    titulo.escuelaId === filtros.escuelaId;

                const coincidePrograma =
                    !filtros.programa ||
                    normalizarTexto(
                        titulo.tipoPrograma
                    ) === filtros.programa;

                const coincideAnio =
                    !filtros.anio ||
                    String(titulo.anioGraduacion) ===
                        filtros.anio;

                return (
                    coincideCarrera &&
                    coincideEscuela &&
                    coincidePrograma &&
                    coincideAnio
                );
            });
        });

        mostrarEgresados(
            elementos.cuerpoTabla,
            resultados
        );

        if (resultados.length === 0) {
            mostrarMensaje(
                elementos.mensaje,
                "No se encontraron egresados con los filtros seleccionados."
            );
            return;
        }

        mostrarMensaje(
            elementos.mensaje,
            `Se encontraron ${resultados.length} egresado(s).`
        );
    }

    function mostrarEgresados(cuerpoTabla, lista) {
        cuerpoTabla.innerHTML = "";

        if (lista.length === 0) {
            const fila = document.createElement("tr");
            const celda = document.createElement("td");

            celda.colSpan = 8;
            celda.textContent =
                "No se encontraron personas egresadas.";

            fila.appendChild(celda);
            cuerpoTabla.appendChild(fila);
            return;
        }

        lista.forEach((egresado) => {
            cuerpoTabla.appendChild(
                crearFilaEgresado(egresado)
            );
        });
    }

    function crearFilaEgresado(egresado) {
        const fila = document.createElement("tr");

        agregarCelda(fila, egresado.identificacion);
        agregarCelda(fila, egresado.nombreCompleto);
        agregarCelda(fila, egresado.correo);
        agregarCelda(fila, egresado.telefono);
        agregarCelda(fila, egresado.lugarTrabajo);
        agregarCelda(
            fila,
            formatearFecha(egresado.fechaRegistro)
        );

        const celdaEstado = document.createElement("td");
        const estado = document.createElement("span");

        estado.className =
            `estado ${obtenerClaseEstado(egresado.estado)}`;
        estado.textContent = egresado.estado;

        celdaEstado.appendChild(estado);
        fila.appendChild(celdaEstado);

        const celdaAcciones = document.createElement("td");
        const acciones = document.createElement("div");
        acciones.className = "acciones-tabla";

        acciones.appendChild(
            crearBotonAccion(
                "Consultar",
                "consultar",
                egresado.id
            )
        );

        acciones.appendChild(
            crearBotonAccion(
                "Editar",
                "editar",
                egresado.id
            )
        );

        acciones.appendChild(
            crearBotonAccion(
                "Eliminar",
                "eliminar",
                egresado.id,
                true
            )
        );

        celdaAcciones.appendChild(acciones);
        fila.appendChild(celdaAcciones);

        return fila;
    }

    function crearBotonAccion(
        texto,
        accion,
        id,
        peligro = false
    ) {
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

    function agregarCelda(fila, valor) {
        const celda = document.createElement("td");
        celda.textContent = valor || "No registrado";
        fila.appendChild(celda);
    }

    function formatearFecha(fecha) {
        if (!fecha) {
            return "No registrada";
        }

        const partes = String(fecha).split("-");

        if (partes.length !== 3) {
            return fecha;
        }

        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    function obtenerClaseEstado(estado) {
        const valor = normalizarTexto(estado);

        if (valor === "activo") {
            return "estado-activo";
        }

        if (valor === "pendiente") {
            return "estado-pendiente";
        }

        return "estado-inactivo";
    }

    function normalizarTexto(valor) {
        return String(valor || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    }

    function mostrarMensaje(elemento, texto) {
        if (!elemento) {
            return;
        }

        elemento.textContent = texto;
        elemento.hidden = false;
    }

    function ocultarMensaje(elemento) {
        if (!elemento) {
            return;
        }

        elemento.textContent = "";
        elemento.hidden = true;
    }
})();
