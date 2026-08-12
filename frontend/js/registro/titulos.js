const URL_TITULOS =
    "http://localhost:3000/api/titulos";

const URL_EGRESADOS =
    "http://localhost:3000/api/egresados";

const URL_CARRERAS =
    "http://localhost:3000/api/carreras";

const URL_ESCUELAS =
    "http://localhost:3000/api/escuelas";


let listaTitulos = [];
let listaEgresados = [];
let listaCarreras = [];
let listaEscuelas = [];


/*
    ELEMENTOS DE LA TABLA
*/

const cuerpoTablaTitulos =
    document.querySelector(
        "#cuerpo-tabla-titulos"
    );

const mensajeTitulos =
    document.querySelector(
        "#mensaje-titulos"
    );


/*
    ELEMENTOS DEL FORMULARIO
*/

const formularioTitulo =
    document.querySelector(
        "#formulario-titulo"
    );

const idTituloFormulario =
    document.querySelector(
        "#id-titulo"
    );

const egresadoTitulo =
    document.querySelector(
        "#egresado-titulo"
    );

const tipoProgramaTitulo =
    document.querySelector(
        "#tipo-programa-titulo"
    );

const escuelaTitulo =
    document.querySelector(
        "#escuela-titulo"
    );

const carreraTitulo =
    document.querySelector(
        "#carrera-titulo"
    );

const anioGraduacionTitulo =
    document.querySelector(
        "#anio-graduacion-titulo"
    );

const estadoTitulo =
    document.querySelector(
        "#estado-titulo"
    );

const observacionesTitulo =
    document.querySelector(
        "#observaciones-titulo"
    );

const tituloFormularioTitulo =
    document.querySelector(
        "#titulo-formulario-titulo"
    );

const descripcionFormularioTitulo =
    document.querySelector(
        "#descripcion-formulario-titulo"
    );

const botonGuardarTitulo =
    document.querySelector(
        "#boton-guardar-titulo"
    );

const botonLimpiarTitulo =
    document.querySelector(
        "#boton-limpiar-titulo"
    );


/*
    ELEMENTOS DE LOS FILTROS
*/

const formularioFiltrosTitulos =
    document.querySelector(
        "#formulario-filtros-titulos"
    );

const filtroEgresadoTitulo =
    document.querySelector(
        "#filtro-egresado-titulo"
    );

const filtroTipoPrograma =
    document.querySelector(
        "#filtro-tipo-programa"
    );

const filtroCarreraTitulo =
    document.querySelector(
        "#filtro-carrera-titulo"
    );

const filtroEscuelaTitulo =
    document.querySelector(
        "#filtro-escuela-titulo"
    );

const filtroAnioTitulo =
    document.querySelector(
        "#filtro-anio-titulo"
    );

const filtroEstadoTitulo =
    document.querySelector(
        "#filtro-estado-titulo"
    );


/*
    ELEMENTOS DEL DETALLE
*/

const seccionDetalleTitulo =
    document.querySelector(
        "#detalle-titulo"
    );

const detalleEgresadoTitulo =
    document.querySelector(
        "#detalle-egresado-titulo"
    );

const detalleIdentificacionTitulo =
    document.querySelector(
        "#detalle-identificacion-titulo"
    );

const detalleTipoProgramaTitulo =
    document.querySelector(
        "#detalle-tipo-programa-titulo"
    );

const detalleCarreraTitulo =
    document.querySelector(
        "#detalle-carrera-titulo"
    );

const detalleEscuelaTitulo =
    document.querySelector(
        "#detalle-escuela-titulo"
    );

const detalleAnioTitulo =
    document.querySelector(
        "#detalle-anio-titulo"
    );

const detalleEstadoTitulo =
    document.querySelector(
        "#detalle-estado-titulo"
    );

const detalleObservacionesTitulo =
    document.querySelector(
        "#detalle-observaciones-titulo"
    );


/*
    INICIAR EL MÓDULO
*/

document.addEventListener(
    "DOMContentLoaded",
    iniciarModuloTitulos
);


function iniciarModuloTitulos() {
    cuerpoTablaTitulos.addEventListener(
        "click",
        manejarClickTablaTitulos
    );

    escuelaTitulo.addEventListener(
        "change",
        actualizarCarrerasFormulario
    );

    formularioFiltrosTitulos.addEventListener(
        "submit",
        aplicarFiltrosTitulos
    );

    formularioFiltrosTitulos.addEventListener(
        "reset",
        limpiarFiltrosTitulos
    );

    formularioTitulo.addEventListener(
        "submit",
        manejarEnvioFormularioTitulo
    );

    botonLimpiarTitulo.addEventListener(
        "click",
        limpiarFormularioTitulo
    );

    cargarDatosIniciales();
}

/*
    CARGAR DATOS DEL BACKEND
*/

async function cargarDatosIniciales() {
    mostrarMensajeTitulos(
        "Cargando títulos académicos..."
    );

    try {
        const [
            resultadoTitulos,
            resultadoEgresados,
            resultadoCarreras,
            resultadoEscuelas
        ] = await Promise.all([
            consultarApi(URL_TITULOS),
            consultarApi(URL_EGRESADOS),
            consultarApi(URL_CARRERAS),
            consultarApi(URL_ESCUELAS)
        ]);

        listaTitulos =
            Array.isArray(
                resultadoTitulos.datos
            )
                ? resultadoTitulos.datos
                : [];

        listaEgresados =
            Array.isArray(
                resultadoEgresados.datos
            )
                ? resultadoEgresados.datos
                : [];

        listaCarreras =
            Array.isArray(
                resultadoCarreras.datos
            )
                ? resultadoCarreras.datos
                : [];

        listaEscuelas =
            Array.isArray(
                resultadoEscuelas.datos
            )
                ? resultadoEscuelas.datos
                : [];

        cargarSelectEgresados();
        cargarSelectEscuelas();
        cargarFiltrosAcademicos();

        mostrarTitulosEnTabla(
            listaTitulos
        );

        ocultarMensajeTitulos();
    } catch (error) {
        cuerpoTablaTitulos.innerHTML = "";

        mostrarMensajeTitulos(
            error.message
        );

        console.error(
            "Error al cargar los datos de títulos:",
            error
        );
    }
}


async function consultarApi(url) {
    const respuesta =
        await fetch(url);

    const resultado =
        await respuesta.json();

    if (
        !respuesta.ok ||
        !resultado.exito
    ) {
        throw new Error(
            resultado.mensaje ||
            "No fue posible consultar la información."
        );
    }

    return resultado;
}


/*
    CARGAR SELECT DE EGRESADOS
*/

function cargarSelectEgresados() {
    egresadoTitulo.innerHTML = `
        <option value="">
            Seleccione una persona egresada
        </option>
    `;

    listaEgresados.forEach(
        (egresado) => {
            const opcion =
                document.createElement(
                    "option"
                );

            opcion.value =
                egresado.id;

            opcion.textContent =
                `${egresado.identificacion} - ${egresado.nombreCompleto}`;

            egresadoTitulo.appendChild(
                opcion
            );
        }
    );
}


/*
    CARGAR SELECT DE ESCUELAS
*/

function cargarSelectEscuelas() {
    escuelaTitulo.innerHTML = `
        <option value="">
            Seleccione una escuela
        </option>
    `;

    listaEscuelas.forEach(
        (escuela) => {
            const opcion =
                document.createElement(
                    "option"
                );

            opcion.value =
                escuela.id;

            opcion.textContent =
                `${escuela.codigo} - ${escuela.nombre}`;

            escuelaTitulo.appendChild(
                opcion
            );
        }
    );
}


/*
    CARGAR CARRERAS SEGÚN LA ESCUELA
*/

function actualizarCarrerasFormulario() {
    const escuelaIdSeleccionada =
        escuelaTitulo.value;

    carreraTitulo.innerHTML = "";

    if (!escuelaIdSeleccionada) {
        carreraTitulo.innerHTML = `
            <option value="">
                Seleccione primero una escuela
            </option>
        `;

        carreraTitulo.disabled = true;

        return;
    }

    const escuelaSeleccionada =
        listaEscuelas.find(
            (escuela) =>
                escuela.id ===
                escuelaIdSeleccionada
        );

    if (!escuelaSeleccionada) {
        carreraTitulo.innerHTML = `
            <option value="">
                Escuela no encontrada
            </option>
        `;

        carreraTitulo.disabled = true;

        return;
    }

    const carrerasDeLaEscuela =
        listaCarreras.filter(
            (carrera) =>
                carrera.escuela ===
                escuelaSeleccionada.nombre
        );

    carreraTitulo.innerHTML = `
        <option value="">
            Seleccione una carrera
        </option>
    `;

    carrerasDeLaEscuela.forEach(
        (carrera) => {
            const opcion =
                document.createElement(
                    "option"
                );

            opcion.value =
                carrera.id;

            opcion.textContent =
                `${carrera.codigo} - ${carrera.nombre}`;

            carreraTitulo.appendChild(
                opcion
            );
        }
    );

    carreraTitulo.disabled =
        carrerasDeLaEscuela.length === 0;

    if (
        carrerasDeLaEscuela.length === 0
    ) {
        carreraTitulo.innerHTML = `
            <option value="">
                No hay carreras para esta escuela
            </option>
        `;
    }
}


/*
    CARGAR FILTROS ACADÉMICOS
*/

function cargarFiltrosAcademicos() {
    filtroCarreraTitulo.innerHTML = `
        <option value="">
            Todas las carreras
        </option>
    `;

    listaCarreras.forEach(
        (carrera) => {
            const opcion =
                document.createElement(
                    "option"
                );

            opcion.value =
                carrera.id;

            opcion.textContent =
                carrera.nombre;

            filtroCarreraTitulo
                .appendChild(opcion);
        }
    );

    filtroEscuelaTitulo.innerHTML = `
        <option value="">
            Todas las escuelas
        </option>
    `;

    listaEscuelas.forEach(
        (escuela) => {
            const opcion =
                document.createElement(
                    "option"
                );

            opcion.value =
                escuela.id;

            opcion.textContent =
                escuela.nombre;

            filtroEscuelaTitulo
                .appendChild(opcion);
        }
    );
}


/*
    MOSTRAR TÍTULOS EN LA TABLA
*/

function mostrarTitulosEnTabla(
    titulos
) {
    cuerpoTablaTitulos.innerHTML = "";

    if (titulos.length === 0) {
        const fila =
            document.createElement("tr");

        fila.innerHTML = `
            <td colspan="8">
                No se encontraron títulos académicos.
            </td>
        `;

        cuerpoTablaTitulos.appendChild(
            fila
        );

        return;
    }

    titulos.forEach((titulo) => {
        const fila =
            crearFilaTitulo(titulo);

        cuerpoTablaTitulos.appendChild(
            fila
        );
    });
}


function crearFilaTitulo(
    titulo
) {
    const fila =
        document.createElement("tr");

    agregarCeldaTexto(
        fila,
        titulo.egresadoNombre
    );

    agregarCeldaTexto(
        fila,
        titulo.egresadoIdentificacion
    );

    agregarCeldaTexto(
        fila,
        titulo.tipoPrograma
    );

    agregarCeldaTexto(
        fila,
        titulo.carreraNombre
    );

    agregarCeldaTexto(
        fila,
        titulo.escuelaNombre
    );

    agregarCeldaTexto(
        fila,
        titulo.anioGraduacion
    );

    const celdaEstado =
        document.createElement("td");

    const estado =
        document.createElement("span");

    estado.className =
        `estado badge rounded-pill ${obtenerClaseEstadoTitulo(
            titulo.estado
        )}`;

    estado.textContent =
        titulo.estado;

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

    botonConsultar.type =
        "button";

    botonConsultar.className =
        "boton-tabla btn btn-sm btn-outline-primary";

    botonConsultar.dataset.accion =
        "consultar";

    botonConsultar.dataset.id =
        titulo.id;

    botonConsultar.textContent =
        "Consultar";

    contenedorAcciones.appendChild(
        botonConsultar
        );

        const botonEditar =
        document.createElement("button");

    botonEditar.type =
        "button";

    botonEditar.className =
        "boton-tabla btn btn-sm btn-outline-primary";

    botonEditar.dataset.accion =
        "editar";

    botonEditar.dataset.id =
        titulo.id;

    botonEditar.textContent =
        "Editar";

    contenedorAcciones.appendChild(
        botonEditar
    );

    const botonEliminar =
    document.createElement("button");

    botonEliminar.type =
        "button";

    botonEliminar.className =
        "boton-tabla btn btn-sm btn-outline-primary";

    botonEliminar.dataset.accion =
        "eliminar";

    botonEliminar.dataset.id =
        titulo.id;

    botonEliminar.textContent =
        "Eliminar";

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
        contenido ||
        "No registrado";

    fila.appendChild(celda);
}


/*
    CONTROLAR BOTÓN CONSULTAR
*/

function manejarClickTablaTitulos(
    evento
) {
    const boton = evento.target.closest(
        "button[data-accion]"
    );

    if (!boton) {
        return;
    }

    const idTitulo =
        boton.dataset.id;

    const accion =
        boton.dataset.accion;

    const tituloSeleccionado =
        listaTitulos.find(
            (titulo) =>
                titulo.id === idTitulo
        );

    if (!tituloSeleccionado) {
        mostrarMensajeTitulos(
            "No se encontró el título seleccionado."
        );

        return;
    }

    if (accion === "consultar") {
        mostrarDetalleTitulo(
            tituloSeleccionado
        );

        seccionDetalleTitulo
            .scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
    }
    if (accion === "editar") {
        cargarFormularioEdicionTitulo(
            tituloSeleccionado
        );
    }

    if (accion === "eliminar") {
        eliminarTitulo(
            tituloSeleccionado
        );

    }
}


/*
    MOSTRAR DETALLE DEL TÍTULO
*/

function mostrarDetalleTitulo(
    titulo
) {
    detalleEgresadoTitulo.textContent =
        titulo.egresadoNombre;

    detalleIdentificacionTitulo
        .textContent =
            titulo.egresadoIdentificacion;

    detalleTipoProgramaTitulo
        .textContent =
            titulo.tipoPrograma;

    detalleCarreraTitulo.textContent =
        `${titulo.carreraCodigo} - ${titulo.carreraNombre}`;

    detalleEscuelaTitulo.textContent =
        `${titulo.escuelaCodigo} - ${titulo.escuelaNombre}`;

    detalleAnioTitulo.textContent =
        titulo.anioGraduacion;

    detalleEstadoTitulo.textContent =
        titulo.estado;

    detalleEstadoTitulo.className =
        `estado badge rounded-pill ${obtenerClaseEstadoTitulo(
            titulo.estado
        )}`;

    detalleObservacionesTitulo
        .textContent =
            titulo.observaciones ||
            "Sin observaciones registradas.";
}

/*
    ELIMINACIÓN DE TÍTULOS
*/

async function eliminarTitulo(
    titulo
) {
    const confirmacion =
        window.confirm(
            `¿Está seguro de eliminar el título de ${titulo.egresadoNombre}?\n\n` +
            `${titulo.tipoPrograma} - ${titulo.carreraNombre} (${titulo.anioGraduacion})`
        );

    if (!confirmacion) {
        return;
    }

    mostrarMensajeTitulos(
        "Eliminando título académico..."
    );

    try {
        const respuesta = await fetch(
            `${URL_TITULOS}/${titulo.id}`,
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
                "No fue posible eliminar el título."
            );
        }

        if (
            idTituloFormulario.value ===
            titulo.id
        ) {
            limpiarFormularioTitulo();
        }

        await cargarDatosIniciales();

        mostrarMensajeTitulos(
            resultado.mensaje ||
            "Título eliminado correctamente."
        );
    } catch (error) {
        mostrarMensajeTitulos(
            error.message
        );

        console.error(
            "Error al eliminar el título:",
            error
        );
    }
}

/*
    REGISTRO DE TÍTULOS
*/

function cargarFormularioEdicionTitulo(
    titulo
) {
    idTituloFormulario.value =
        titulo.id;

    egresadoTitulo.value =
        titulo.egresadoId;

    tipoProgramaTitulo.value =
        obtenerTipoProgramaCanonico(
            titulo.tipoPrograma
        );

    escuelaTitulo.value =
        titulo.escuelaId;

    actualizarCarrerasFormulario();

    carreraTitulo.value =
        titulo.carreraId;

    anioGraduacionTitulo.value =
        titulo.anioGraduacion;

    estadoTitulo.value =
        obtenerEstadoCanonico(
            titulo.estado
        );

    observacionesTitulo.value =
        titulo.observaciones || "";

    tituloFormularioTitulo.textContent =
        "Editar título académico";

    descripcionFormularioTitulo
        .textContent =
            "Modifique la información académica del título seleccionado.";

    botonGuardarTitulo.textContent =
        "Actualizar título";

    formularioTitulo
        .closest("section")
        ?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
}

async function manejarEnvioFormularioTitulo(
    evento
) {
    evento.preventDefault();

    if (!formularioTitulo.checkValidity()) {
        formularioTitulo.reportValidity();
        return;
    }

    const tituloId =
        idTituloFormulario.value.trim();

    const estaEditando =
        tituloId !== "";

    const urlSolicitud =
        estaEditando
            ? `${URL_TITULOS}/${tituloId}`
            : URL_TITULOS;

    const metodoSolicitud =
        estaEditando
            ? "PUT"
            : "POST";

    const datosTitulo = {
        egresadoId:
            egresadoTitulo.value,

        tipoPrograma:
            tipoProgramaTitulo.value,

        carreraId:
            carreraTitulo.value,

        escuelaId:
            escuelaTitulo.value,

        anioGraduacion:
            Number(
                anioGraduacionTitulo.value
            ),

        estado:
            estadoTitulo.value,

        observaciones:
            observacionesTitulo.value.trim()
    };

    botonGuardarTitulo.disabled = true;

    botonGuardarTitulo.textContent =
        estaEditando
            ? "Actualizando..."
            : "Guardando...";

    try {
        const respuesta = await fetch(
            urlSolicitud,
            {
                method:
                    metodoSolicitud,

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify(
                    datosTitulo
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
                        ? "No fue posible actualizar el título."
                        : "No fue posible registrar el título."
                )
            );
        }

        limpiarFormularioTitulo();

        await cargarDatosIniciales();

        mostrarMensajeTitulos(
            resultado.mensaje ||
            (
                estaEditando
                    ? "Título actualizado correctamente."
                    : "Título registrado correctamente."
            )
        );

        cuerpoTablaTitulos
            .closest("section")
            ?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
    } catch (error) {
        mostrarMensajeTitulos(
            error.message
        );

        console.error(
            estaEditando
                ? "Error al actualizar el título:"
                : "Error al registrar el título:",
            error
        );
    } finally {
        botonGuardarTitulo.disabled =
            false;

        botonGuardarTitulo.textContent =
            idTituloFormulario.value
                ? "Actualizar título"
                : "Guardar título";
    }
}

function limpiarFormularioTitulo() {
    formularioTitulo.reset();

    idTituloFormulario.value = "";

    tituloFormularioTitulo.textContent =
        "Registrar título académico";

    descripcionFormularioTitulo
        .textContent =
            "Complete la información académica del título que desea asociar a una persona egresada.";

    botonGuardarTitulo.textContent =
        "Guardar título";

    actualizarCarrerasFormulario();
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
    FILTROS DE TÍTULOS
*/

function aplicarFiltrosTitulos(
    evento
) {
    evento.preventDefault();

    const egresadoBuscado =
        normalizarTexto(
            filtroEgresadoTitulo.value
        );

    const tipoBuscado =
        normalizarTexto(
            filtroTipoPrograma.value
        );

    const carreraBuscada =
        filtroCarreraTitulo.value;

    const escuelaBuscada =
        filtroEscuelaTitulo.value;

    const anioBuscado =
        String(
            filtroAnioTitulo.value || ""
        ).trim();

    const estadoBuscado =
        normalizarTexto(
            filtroEstadoTitulo.value
        );

    const titulosFiltrados =
        listaTitulos.filter(
            (titulo) => {
                const nombreEgresado =
                    normalizarTexto(
                        titulo.egresadoNombre
                    );

                const identificacion =
                    normalizarTexto(
                        titulo.egresadoIdentificacion
                    );

                const coincideEgresado =
                    egresadoBuscado === "" ||
                    nombreEgresado.includes(
                        egresadoBuscado
                    ) ||
                    identificacion.includes(
                        egresadoBuscado
                    );

                const coincideTipo =
                    tipoBuscado === "" ||
                    normalizarTexto(
                        titulo.tipoPrograma
                    ) === tipoBuscado;

                const coincideCarrera =
                    carreraBuscada === "" ||
                    titulo.carreraId ===
                        carreraBuscada;

                const coincideEscuela =
                    escuelaBuscada === "" ||
                    titulo.escuelaId ===
                        escuelaBuscada;

                const coincideAnio =
                    anioBuscado === "" ||
                    String(
                        titulo.anioGraduacion
                    ) === anioBuscado;

                const coincideEstado =
                    estadoBuscado === "" ||
                    normalizarTexto(
                        titulo.estado
                    ) === estadoBuscado;

                return (
                    coincideEgresado &&
                    coincideTipo &&
                    coincideCarrera &&
                    coincideEscuela &&
                    coincideAnio &&
                    coincideEstado
                );
            }
        );

    mostrarTitulosEnTabla(
        titulosFiltrados
    );

    if (
        titulosFiltrados.length === 0
    ) {
        mostrarMensajeTitulos(
            "No se encontraron títulos con los filtros seleccionados."
        );

        return;
    }

    mostrarMensajeTitulos(
        `Se encontraron ${titulosFiltrados.length} título(s).`
    );
}


function limpiarFiltrosTitulos() {
    setTimeout(() => {
        mostrarTitulosEnTabla(
            listaTitulos
        );

        ocultarMensajeTitulos();
    }, 0);
}


/*
    UTILIDADES
*/

function obtenerTipoProgramaCanonico(
    tipoPrograma
) {
    const tipoNormalizado =
        normalizarTexto(
            tipoPrograma
        );

    if (tipoNormalizado === "tecnico") {
        return "Técnico";
    }

    if (
        tipoNormalizado ===
        "bachillerato"
    ) {
        return "Bachillerato";
    }

    if (tipoNormalizado === "maestria") {
        return "Maestría";
    }

    return "";
}


function obtenerEstadoCanonico(
    estado
) {
    const estadoNormalizado =
        normalizarTexto(
            estado
        );

    if (
        estadoNormalizado ===
        "registrado"
    ) {
        return "Registrado";
    }

    if (
        estadoNormalizado ===
        "en revision"
    ) {
        return "En revisión";
    }

    if (
        estadoNormalizado ===
        "inactivo"
    ) {
        return "Inactivo";
    }

    return "";
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


function obtenerClaseEstadoTitulo(
    estado
) {
    const estadoNormalizado =
        normalizarTexto(estado);

    if (
        estadoNormalizado ===
        "registrado"
    ) {
        return "estado-activo";
    }

    if (
        estadoNormalizado ===
        "en revision"
    ) {
        return "estado-pendiente";
    }

    return "estado-inactivo";
}


/*
    MENSAJES
*/

function mostrarMensajeTitulos(
    mensaje
) {
    mensajeTitulos.textContent =
        mensaje;

    mensajeTitulos.hidden = false;
}


function ocultarMensajeTitulos() {
    mensajeTitulos.textContent = "";
    mensajeTitulos.hidden = true;
}