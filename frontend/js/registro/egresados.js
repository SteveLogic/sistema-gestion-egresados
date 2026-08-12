const URL_EGRESADOS =
    "http://localhost:3000/api/egresados";

let listaEgresados = [];


/*
    ELEMENTOS DE LA TABLA
*/

const cuerpoTablaEgresados =
    document.querySelector(
        "#cuerpo-tabla-egresados"
    );

const mensajeEgresados =
    document.querySelector(
        "#mensaje-egresados"
    );

    /*
    ELEMENTOS DE LOS FILTROS
*/

const formularioFiltrosEgresados =
    document.querySelector(
        "#formulario-filtros-egresados"
    );

const filtroNombreEgresado =
    document.querySelector(
        "#filtro-nombre"
    );

const filtroEstadoEgresado =
    document.querySelector(
        "#filtro-estado"
    );

    /*
    ELEMENTOS DEL FORMULARIO
*/

const formularioEgresado =
    document.querySelector(
        "#formulario-egresado"
    );

const idEgresadoFormulario =
    document.querySelector(
        "#id-egresado"
    );

const identificacionEgresado =
    document.querySelector(
        "#identificacion-egresado"
    );

const nombreCompletoEgresado =
    document.querySelector(
        "#nombre-completo-egresado"
    );

const correoEgresado =
    document.querySelector(
        "#correo-egresado"
    );

const telefonoEgresado =
    document.querySelector(
        "#telefono-egresado"
    );

const fechaRegistroEgresado =
    document.querySelector(
        "#fecha-registro-egresado"
    );

const lugarTrabajoEgresado =
    document.querySelector(
        "#lugar-trabajo-egresado"
    );

const estadoEgresado =
    document.querySelector(
        "#estado-egresado"
    );

const puestoEgresado =
    document.querySelector(
        "#puesto-egresado"
    );

const areaProfesionalEgresado =
    document.querySelector(
        "#area-profesional-egresado"
    );

const linkedinEgresado =
    document.querySelector(
        "#linkedin-egresado"
    );

const portafolioEgresado =
    document.querySelector(
        "#portafolio-egresado"
    );

const tituloFormularioEgresado =
    document.querySelector(
        "#titulo-formulario-egresado"
    );

const descripcionFormularioEgresado =
    document.querySelector(
        "#descripcion-formulario-egresado"
    );

const botonGuardarEgresado =
    document.querySelector(
        "#boton-guardar-egresado"
    );

const botonLimpiarEgresado =
    document.querySelector(
        "#boton-limpiar-egresado"
    );


/*
    ELEMENTOS DEL DETALLE
*/

const seccionDetalleEgresado =
    document.querySelector(
        "#detalle-egresado"
    );

const detalleIdentificacionEgresado =
    document.querySelector(
        "#detalle-identificacion-egresado"
    );

const detalleNombreEgresado =
    document.querySelector(
        "#detalle-nombre-egresado"
    );

const detalleCorreoEgresado =
    document.querySelector(
        "#detalle-correo-egresado"
    );

const detalleTelefonoEgresado =
    document.querySelector(
        "#detalle-telefono-egresado"
    );

const detalleTrabajoEgresado =
    document.querySelector(
        "#detalle-trabajo-egresado"
    );

const detalleFechaEgresado =
    document.querySelector(
        "#detalle-fecha-egresado"
    );

const detalleEstadoEgresado =
    document.querySelector(
        "#detalle-estado-egresado"
    );

const detallePuestoEgresado =
    document.querySelector(
        "#detalle-puesto-egresado"
    );

const detalleAreaEgresado =
    document.querySelector(
        "#detalle-area-egresado"
    );

const detalleLinkedinEgresado =
    document.querySelector(
        "#detalle-linkedin-egresado"
    );

const detallePortafolioEgresado =
    document.querySelector(
        "#detalle-portafolio-egresado"
    );


/*
    INICIO DEL MÓDULO
*/

document.addEventListener(
    "DOMContentLoaded",
    iniciarModuloEgresados
);

function iniciarModuloEgresados() {
    cuerpoTablaEgresados.addEventListener(
        "click",
        manejarClickTablaEgresados
    );

    formularioFiltrosEgresados.addEventListener(
        "submit",
        aplicarFiltrosEgresados
    );

    formularioFiltrosEgresados.addEventListener(
        "reset",
        limpiarFiltrosEgresados
    );

    formularioEgresado.addEventListener(
        "submit",
        manejarEnvioFormularioEgresado
    );

    botonLimpiarEgresado.addEventListener(
        "click",
        limpiarFormularioEgresado
    );

    cargarEgresados();
}


/*
    CONSULTAR EL BACKEND
*/

async function cargarEgresados() {
    mostrarMensajeEgresados(
        "Cargando egresados..."
    );

    try {
        const respuesta = await fetch(
            URL_EGRESADOS
        );

        const resultado =
            await respuesta.json();

        if (
            !respuesta.ok ||
            !resultado.exito
        ) {
            throw new Error(
                resultado.mensaje ||
                "No fue posible obtener los egresados."
            );
        }

        listaEgresados =
            Array.isArray(resultado.datos)
                ? resultado.datos
                : [];

        mostrarEgresadosEnTabla(
            listaEgresados
        );

        ocultarMensajeEgresados();
    } catch (error) {
        cuerpoTablaEgresados.innerHTML = "";

        mostrarMensajeEgresados(
            error.message
        );

        console.error(
            "Error al cargar los egresados:",
            error
        );
    }
}


/*
    CONSTRUIR LA TABLA
*/

function mostrarEgresadosEnTabla(
    egresados
) {
    cuerpoTablaEgresados.innerHTML = "";

    if (egresados.length === 0) {
        const fila =
            document.createElement("tr");

        fila.innerHTML = `
            <td colspan="8">
                No se encontraron egresados.
            </td>
        `;

        cuerpoTablaEgresados.appendChild(
            fila
        );

        return;
    }

    egresados.forEach((egresado) => {
        const fila =
            crearFilaEgresado(egresado);

        cuerpoTablaEgresados.appendChild(
            fila
        );
    });
}


function crearFilaEgresado(
    egresado
) {
    const fila =
        document.createElement("tr");

    agregarCeldaTexto(
        fila,
        egresado.identificacion
    );

    agregarCeldaTexto(
        fila,
        egresado.nombreCompleto
    );

    agregarCeldaTexto(
        fila,
        egresado.correo
    );

    agregarCeldaTexto(
        fila,
        egresado.telefono
    );

    agregarCeldaTexto(
        fila,
        egresado.lugarTrabajo
    );

    agregarCeldaTexto(
        fila,
        formatearFecha(
            egresado.fechaRegistro
        )
    );

    const celdaEstado =
        document.createElement("td");

    const estado =
        document.createElement("span");

    estado.className =
        `estado badge rounded-pill ${obtenerClaseEstado(
            egresado.estado
        )}`;

    estado.textContent =
        egresado.estado;

    celdaEstado.appendChild(estado);
    fila.appendChild(celdaEstado);

    const celdaAcciones =
        document.createElement("td");

    const contenedorAcciones =
        document.createElement("div");

    contenedorAcciones.className =
        "acciones-tabla";

    const botonConsultar =
        document.createElement("button");

    botonConsultar.type = "button";
    botonConsultar.className =
        "boton-tabla btn btn-sm btn-outline-primary";

    botonConsultar.dataset.accion =
        "consultar";

    botonConsultar.dataset.id =
        egresado.id;

    botonConsultar.textContent =
        "Consultar";

    const botonEditar =
        document.createElement("button");

    botonEditar.type = "button";
    botonEditar.className =
        "boton-tabla btn btn-sm btn-outline-primary";

    botonEditar.dataset.accion =
        "editar";

    botonEditar.dataset.id =
        egresado.id;

    botonEditar.textContent =
        "Editar";

        
    const botonEliminar =
    document.createElement("button");

    botonEliminar.type = "button";
    botonEliminar.className =
        "boton-tabla btn btn-sm btn-outline-primary";

    botonEliminar.dataset.accion =
        "eliminar";

    botonEliminar.dataset.id =
        egresado.id;

    botonEliminar.textContent =
        "Eliminar";
    
        
    contenedorAcciones.appendChild(
        botonConsultar
    );

    contenedorAcciones.appendChild(
        botonEditar
    );

    contenedorAcciones.appendChild(
    botonEliminar
    );

    celdaAcciones.appendChild(
        contenedorAcciones
    );

    fila.appendChild(
        celdaAcciones
    );

    return fila;
}


function agregarCeldaTexto(
    fila,
    contenido
) {
    const celda =
        document.createElement("td");

    celda.textContent =
        contenido || "No registrado";

    fila.appendChild(celda);
}


/*
    CONTROLAR EL BOTÓN CONSULTAR
*/

async function manejarClickTablaEgresados(
    evento
) {
    const boton = evento.target.closest(
        "button[data-accion]"
    );

    if (!boton) {
        return;
    }

    const idEgresado =
        boton.dataset.id;

    const accion =
        boton.dataset.accion;

    const egresadoSeleccionado =
        listaEgresados.find(
            (egresado) =>
                egresado.id === idEgresado
        );

    if (!egresadoSeleccionado) {
        mostrarMensajeEgresados(
            "No se encontró el egresado seleccionado."
        );

        return;
    }

    if (accion === "consultar") {
        mostrarDetalleEgresado(
            egresadoSeleccionado
        );

        seccionDetalleEgresado
            .scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        return;
    }

    if (accion === "editar") {
        cargarEgresadoEnFormulario(
            egresadoSeleccionado
        );

        return;
    }

    if (accion === "eliminar") {
        await eliminarEgresado(
            egresadoSeleccionado
        );
    }
}

/*
    ELIMINACIÓN DE EGRESADOS
*/

async function eliminarEgresado(
    egresado
) {
    const eliminarConfirmado =
        window.confirm(
            `¿Desea eliminar al egresado "${egresado.nombreCompleto}"?`
        );

    if (!eliminarConfirmado) {
        return;
    }

    mostrarMensajeEgresados(
        "Eliminando egresado..."
    );

    try {
        const respuesta = await fetch(
            `${URL_EGRESADOS}/${egresado.id}`,
            {
                method: "DELETE"
            }
        );

        const resultado =
            await respuesta.json();

        if (
            !respuesta.ok ||
            !resultado.exito
        ) {
            throw new Error(
                resultado.mensaje ||
                "No fue posible eliminar el egresado."
            );
        }

        if (
            idEgresadoFormulario.value ===
            egresado.id
        ) {
            limpiarFormularioEgresado();
        }

        await cargarEgresados();

        mostrarMensajeEgresados(
            resultado.mensaje ||
            "Egresado eliminado correctamente."
        );
    } catch (error) {
        mostrarMensajeEgresados(
            error.message
        );

        console.error(
            "Error al eliminar el egresado:",
            error
        );
    }
}

/*
    EDICIÓN DE EGRESADOS
*/

function cargarEgresadoEnFormulario(
    egresado
) {
    idEgresadoFormulario.value =
        egresado.id;

    identificacionEgresado.value =
        egresado.identificacion;

    nombreCompletoEgresado.value =
        egresado.nombreCompleto;

    correoEgresado.value =
        egresado.correo;

    telefonoEgresado.value =
        egresado.telefono;

    fechaRegistroEgresado.value =
        egresado.fechaRegistro;

    lugarTrabajoEgresado.value =
        egresado.lugarTrabajo;

    estadoEgresado.value =
        egresado.estado;

    puestoEgresado.value =
        egresado.puestoActual || "";

    areaProfesionalEgresado.value =
        egresado.areaProfesional || "";

    linkedinEgresado.value =
        egresado.linkedin || "";

    portafolioEgresado.value =
        egresado.portafolio || "";

    tituloFormularioEgresado.textContent =
        "Editar egresado";

    descripcionFormularioEgresado
        .textContent =
            "Modifique los datos personales y profesionales de la persona egresada seleccionada.";

    botonGuardarEgresado.textContent =
        "Actualizar egresado";

    document
        .querySelector("#registrar-egresado")
        .scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
}

/*
    MOSTRAR EL DETALLE
*/

function mostrarDetalleEgresado(
    egresado
) {
    detalleIdentificacionEgresado
        .textContent =
            egresado.identificacion;

    detalleNombreEgresado.textContent =
        egresado.nombreCompleto;

    detalleCorreoEgresado.textContent =
        egresado.correo;

    detalleTelefonoEgresado.textContent =
        egresado.telefono;

    detalleTrabajoEgresado.textContent =
        egresado.lugarTrabajo;

    detalleFechaEgresado.textContent =
        formatearFecha(
            egresado.fechaRegistro
        );

    detalleEstadoEgresado.textContent =
        egresado.estado;

    detalleEstadoEgresado.className =
        `estado badge rounded-pill ${obtenerClaseEstado(
            egresado.estado
        )}`;

    detallePuestoEgresado.textContent =
        egresado.puestoActual ||
        "No especificado";

    detalleAreaEgresado.textContent =
        egresado.areaProfesional ||
        "No especificada";

    mostrarEnlace(
        detalleLinkedinEgresado,
        egresado.linkedin,
        "No especificado"
    );

    mostrarEnlace(
        detallePortafolioEgresado,
        egresado.portafolio,
        "No especificado"
    );
}


/*
    MOSTRAR ENLACES PROFESIONALES
*/

function mostrarEnlace(
    elemento,
    direccion,
    textoVacio
) {
    elemento.innerHTML = "";

    if (!direccion) {
        elemento.textContent =
            textoVacio;

        return;
    }

    const enlace =
        document.createElement("a");

    enlace.href = direccion;
    enlace.textContent = direccion;
    enlace.target = "_blank";
    enlace.rel = "noopener noreferrer";

    elemento.appendChild(enlace);
}


/*
    UTILIDADES
*/

function formatearFecha(
    fechaOriginal
) {
    if (!fechaOriginal) {
        return "No registrada";
    }

    const partes =
        fechaOriginal.split("-");

    if (partes.length !== 3) {
        return fechaOriginal;
    }

    const [
        anio,
        mes,
        dia
    ] = partes;

    return `${dia}/${mes}/${anio}`;
}


function obtenerClaseEstado(
    estado
) {
    if (estado === "Activo") {
        return "estado-activo";
    }

    if (estado === "Pendiente") {
        return "estado-pendiente";
    }

    return "estado-inactivo";
}

/*
    REGISTRO DE EGRESADOS
*/

async function manejarEnvioFormularioEgresado(
    evento
) {
    evento.preventDefault();

    if (!formularioEgresado.checkValidity()) {
        formularioEgresado.reportValidity();
        return;
    }

    const estaEditando =
        idEgresadoFormulario.value !== "";

    const datosEgresado = {
        identificacion:
            identificacionEgresado.value.trim(),

        nombreCompleto:
            nombreCompletoEgresado.value.trim(),

        correo:
            correoEgresado.value.trim(),

        telefono:
            telefonoEgresado.value.trim(),

        fechaRegistro:
            fechaRegistroEgresado.value,

        lugarTrabajo:
            lugarTrabajoEgresado.value.trim(),

        estado:
            estadoEgresado.value,

        puestoActual:
            puestoEgresado.value.trim(),

        areaProfesional:
            areaProfesionalEgresado.value.trim(),

        linkedin:
            linkedinEgresado.value.trim(),

        portafolio:
            portafolioEgresado.value.trim()
    };

    const url =
        estaEditando
            ? `${URL_EGRESADOS}/${idEgresadoFormulario.value}`
            : URL_EGRESADOS;

    const metodo =
        estaEditando
            ? "PUT"
            : "POST";

    const textoOriginalBoton =
        botonGuardarEgresado.textContent;

    botonGuardarEgresado.disabled = true;

    botonGuardarEgresado.textContent =
        estaEditando
            ? "Actualizando..."
            : "Guardando...";

    try {
        const respuesta = await fetch(
            url,
            {
                method: metodo,

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify(
                    datosEgresado
                )
            }
        );

        const resultado =
            await respuesta.json();

        if (
            !respuesta.ok ||
            !resultado.exito
        ) {
            const mensajeErrores =
                obtenerMensajeErrores(
                    resultado.errores
                );

            throw new Error(
                mensajeErrores ||
                resultado.mensaje ||
                (
                    estaEditando
                        ? "No fue posible actualizar el egresado."
                        : "No fue posible registrar el egresado."
                )
            );
        }

        limpiarFormularioEgresado();

        await cargarEgresados();

        mostrarMensajeEgresados(
            resultado.mensaje ||
            (
                estaEditando
                    ? "Egresado actualizado correctamente."
                    : "Egresado registrado correctamente."
            )
        );

        cuerpoTablaEgresados
            .closest("section")
            ?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
    } catch (error) {
        mostrarMensajeEgresados(
            error.message
        );

        console.error(
            estaEditando
                ? "Error al actualizar el egresado:"
                : "Error al registrar el egresado:",
            error
        );
    } finally {
        botonGuardarEgresado.disabled =
            false;

        if (
            idEgresadoFormulario.value === ""
        ) {
            botonGuardarEgresado.textContent =
                "Guardar egresado";
        } else {
            botonGuardarEgresado.textContent =
                textoOriginalBoton;
        }
    }
}


function limpiarFormularioEgresado() {
    formularioEgresado.reset();

    idEgresadoFormulario.value = "";

    tituloFormularioEgresado.textContent =
        "Registrar egresado";

    descripcionFormularioEgresado.textContent =
        "Complete los datos personales y profesionales de la persona egresada.";

    botonGuardarEgresado.textContent =
        "Guardar egresado";
}


function obtenerMensajeErrores(
    errores
) {
    if (Array.isArray(errores)) {
        return errores.join(" ");
    }

    if (
        errores &&
        typeof errores === "object"
    ) {
        return Object.values(errores)
            .flat()
            .join(" ");
    }

    return "";
}

/*
    FILTROS
*/

function aplicarFiltrosEgresados(
    evento
) {
    evento.preventDefault();

    const nombreBuscado =
        normalizarTexto(
            filtroNombreEgresado.value
        );

    const estadoBuscado =
        normalizarTexto(
            filtroEstadoEgresado.value
        );

    const egresadosFiltrados =
        listaEgresados.filter(
            (egresado) => {
                const coincideNombre =
                    normalizarTexto(
                        egresado.nombreCompleto
                    ).includes(
                        nombreBuscado
                    );

                const coincideEstado =
                    estadoBuscado === "" ||
                    normalizarTexto(
                        egresado.estado
                    ) === estadoBuscado;

                return (
                    coincideNombre &&
                    coincideEstado
                );
            }
        );

    mostrarEgresadosEnTabla(
        egresadosFiltrados
    );

    if (
        egresadosFiltrados.length === 0
    ) {
        mostrarMensajeEgresados(
            "No se encontraron egresados con los filtros seleccionados."
        );

        return;
    }

    mostrarMensajeEgresados(
        `Se encontraron ${egresadosFiltrados.length} egresado(s).`
    );
}


function limpiarFiltrosEgresados() {
    setTimeout(() => {
        mostrarEgresadosEnTabla(
            listaEgresados
        );

        ocultarMensajeEgresados();
    }, 0);
}


function normalizarTexto(texto) {
    return String(texto || "")
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .trim();
}


/*
    MENSAJES
*/

function mostrarMensajeEgresados(
    mensaje
) {
    mensajeEgresados.textContent =
        mensaje;

    mensajeEgresados.hidden = false;
}


function ocultarMensajeEgresados() {
    mensajeEgresados.textContent = "";
    mensajeEgresados.hidden = true;
}