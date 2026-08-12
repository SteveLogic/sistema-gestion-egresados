const URL_IMPORTACION_EGRESADOS =
    "http://localhost:3000/api/egresados/importar";

const CAMPOS_CSV = [
    "identificacion",
    "nombreCompleto",
    "correo",
    "telefono",
    "fechaRegistro",
    "lugarTrabajo",
    "estado",
    "puestoActual",
    "areaProfesional",
    "linkedin",
    "portafolio"
];

const CAMPOS_OBLIGATORIOS_CSV = [
    "identificacion",
    "nombreCompleto",
    "correo",
    "telefono",
    "fechaRegistro",
    "lugarTrabajo",
    "estado"
];

const ALIAS_CABECERAS_CSV = {
    identificacion: "identificacion",
    cedula: "identificacion",
    nombre: "nombreCompleto",
    nombrecompleto: "nombreCompleto",
    correo: "correo",
    correoelectronico: "correo",
    email: "correo",
    telefono: "telefono",
    fecharegistro: "fechaRegistro",
    lugardetrabajo: "lugarTrabajo",
    lugartrabajo: "lugarTrabajo",
    empresa: "lugarTrabajo",
    estado: "estado",
    puestoactual: "puestoActual",
    puesto: "puestoActual",
    areaprofesional: "areaProfesional",
    area: "areaProfesional",
    linkedin: "linkedin",
    portafolio: "portafolio"
};

let filasCsvAnalizadas = [];

const formularioImportacionCsv =
    document.querySelector(
        "#formulario-importacion-csv"
    );

const archivoCsv =
    document.querySelector(
        "#archivo-csv"
    );

const botonConfirmarImportacion =
    document.querySelector(
        "#boton-confirmar-importacion"
    );

const mensajeImportacionCsv =
    document.querySelector(
        "#mensaje-importacion-csv"
    );

const resumenImportacionCsv =
    document.querySelector(
        "#resumen-importacion-csv"
    );

const vistaPreviaImportacionCsv =
    document.querySelector(
        "#vista-previa-importacion-csv"
    );

const cuerpoVistaPreviaCsv =
    document.querySelector(
        "#cuerpo-vista-previa-csv"
    );

const csvProcesadas =
    document.querySelector(
        "#csv-procesadas"
    );

const csvValidas =
    document.querySelector(
        "#csv-validas"
    );

const csvInvalidas =
    document.querySelector(
        "#csv-invalidas"
    );

const csvImportadas =
    document.querySelector(
        "#csv-importadas"
    );

if (formularioImportacionCsv) {
    formularioImportacionCsv.addEventListener(
        "submit",
        analizarArchivoCsv
    );

    formularioImportacionCsv.addEventListener(
        "reset",
        limpiarImportacionCsv
    );

    botonConfirmarImportacion.addEventListener(
        "click",
        confirmarImportacionCsv
    );
}

async function analizarArchivoCsv(evento) {
    evento.preventDefault();

    limpiarResultadosCsv(false);

    const archivo = archivoCsv.files[0];

    if (!archivo) {
        mostrarMensajeCsv(
            "Selecciona un archivo CSV antes de analizarlo."
        );
        return;
    }

    if (!archivo.name.toLowerCase().endsWith(".csv")) {
        mostrarMensajeCsv(
            "El archivo seleccionado debe tener extensión .csv."
        );
        return;
    }

    try {
        const texto = await archivo.text();
        const filas = convertirCsvEnMatriz(texto);

        if (filas.length < 2) {
            throw new Error(
                "El archivo debe contener una cabecera y al menos una fila de datos."
            );
        }

        const cabeceras = obtenerCabecerasCanonicas(
            filas[0]
        );

        validarCabecerasObligatorias(cabeceras);

        const registros = filas
            .slice(1)
            .filter((fila) =>
                fila.some((valor) => valor.trim() !== "")
            )
            .map((fila, indice) =>
                construirRegistroCsv(
                    fila,
                    cabeceras,
                    indice + 2
                )
            );

        if (registros.length === 0) {
            throw new Error(
                "El archivo no contiene registros para importar."
            );
        }

        if (registros.length > 200) {
            throw new Error(
                "El archivo no puede contener más de 200 registros."
            );
        }

        validarRegistrosCsv(registros);
        filasCsvAnalizadas = registros;
        mostrarVistaPreviaCsv(registros);
        actualizarResumenCsv(registros);

        const validas = registros.filter(
            (registro) => registro.errores.length === 0
        ).length;

        botonConfirmarImportacion.hidden = validas === 0;
        botonConfirmarImportacion.disabled = validas === 0;

        mostrarMensajeCsv(
            `Archivo analizado: ${validas} fila(s) válida(s) y ${registros.length - validas} fila(s) con errores.`
        );
    } catch (error) {
        mostrarMensajeCsv(
            error.message || "No fue posible analizar el archivo CSV."
        );
    }
}

async function confirmarImportacionCsv() {
    const registrosValidos = filasCsvAnalizadas
        .filter((registro) => registro.errores.length === 0)
        .map((registro) => {
            const copia = { ...registro.datos };
            copia.__filaCsv = registro.fila;
            return copia;
        });

    if (registrosValidos.length === 0) {
        mostrarMensajeCsv(
            "No hay filas válidas para importar."
        );
        return;
    }

    botonConfirmarImportacion.disabled = true;
    mostrarMensajeCsv(
        "Importando registros, espera un momento..."
    );

    try {
        const respuesta = await fetch(
            URL_IMPORTACION_EGRESADOS,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    registros: registrosValidos
                })
            }
        );

        const resultado = await respuesta.json();

        if (!respuesta.ok || !resultado.exito) {
            throw new Error(
                resultado.mensaje ||
                "No fue posible importar los egresados."
            );
        }

        const importados =
            resultado.datos.importados ??
            resultado.datos.importadas ??
            0;

        const rechazados =
            resultado.datos.rechazados ??
            resultado.datos.rechazadas ??
            0;

        aplicarResultadosBackend(
            resultado.datos.detalles || []
        );

        csvImportadas.textContent =
            importados;

        mostrarMensajeCsv(
            `Importación terminada: ${importados} registro(s) importado(s) y ${rechazados} rechazado(s) por el backend.`
        );
        botonConfirmarImportacion.hidden = true;

        if (typeof cargarEgresados === "function") {
            await cargarEgresados();
        }
    } catch (error) {
        botonConfirmarImportacion.disabled = false;
        mostrarMensajeCsv(
            error.message ||
            "Ocurrió un error durante la importación."
        );
    }
}

function convertirCsvEnMatriz(textoOriginal) {
    const texto = String(textoOriginal || "")
        .replace(/^\uFEFF/, "")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n");

    const separador = detectarSeparadorCsv(texto);
    const filas = [];
    let fila = [];
    let campo = "";
    let entreComillas = false;

    for (let indice = 0; indice < texto.length; indice += 1) {
        const caracter = texto[indice];
        const siguiente = texto[indice + 1];

        if (caracter === '"') {
            if (entreComillas && siguiente === '"') {
                campo += '"';
                indice += 1;
            } else {
                entreComillas = !entreComillas;
            }
            continue;
        }

        if (caracter === separador && !entreComillas) {
            fila.push(campo.trim());
            campo = "";
            continue;
        }

        if (caracter === "\n" && !entreComillas) {
            fila.push(campo.trim());
            filas.push(fila);
            fila = [];
            campo = "";
            continue;
        }

        campo += caracter;
    }

    if (entreComillas) {
        throw new Error(
            "El archivo contiene comillas sin cerrar."
        );
    }

    if (campo !== "" || fila.length > 0) {
        fila.push(campo.trim());
        filas.push(fila);
    }

    return filas.filter(
        (item) => item.some((valor) => valor !== "")
    );
}

function detectarSeparadorCsv(texto) {
    const primeraLinea = texto
        .split("\n")
        .find((linea) => linea.trim() !== "") || "";

    const comas = contarFueraDeComillas(
        primeraLinea,
        ","
    );
    const puntosYComas = contarFueraDeComillas(
        primeraLinea,
        ";"
    );

    return puntosYComas > comas ? ";" : ",";
}

function contarFueraDeComillas(texto, caracterBuscado) {
    let cantidad = 0;
    let entreComillas = false;

    for (let indice = 0; indice < texto.length; indice += 1) {
        const caracter = texto[indice];

        if (caracter === '"') {
            entreComillas = !entreComillas;
        } else if (
            caracter === caracterBuscado &&
            !entreComillas
        ) {
            cantidad += 1;
        }
    }

    return cantidad;
}

function obtenerCabecerasCanonicas(cabecerasOriginales) {
    return cabecerasOriginales.map((cabecera) => {
        const normalizada = normalizarCabeceraCsv(cabecera);
        return ALIAS_CABECERAS_CSV[normalizada] || null;
    });
}

function validarCabecerasObligatorias(cabeceras) {
    const faltantes = CAMPOS_OBLIGATORIOS_CSV.filter(
        (campo) => !cabeceras.includes(campo)
    );

    if (faltantes.length > 0) {
        throw new Error(
            `Faltan columnas obligatorias: ${faltantes.join(", ")}.`
        );
    }
}

function construirRegistroCsv(fila, cabeceras, numeroFila) {
    const datos = Object.fromEntries(
        CAMPOS_CSV.map((campo) => [campo, ""])
    );

    cabeceras.forEach((cabecera, indice) => {
        if (cabecera) {
            datos[cabecera] = String(
                fila[indice] || ""
            ).trim();
        }
    });

    datos.estado = obtenerEstadoCanonico(
        datos.estado
    );

    return {
        fila: numeroFila,
        datos,
        errores: [],
        resultadoBackend: null
    };
}

function validarRegistrosCsv(registros) {
    const identificacionesArchivo = new Map();
    const correosArchivo = new Map();
    const identificacionesExistentes = new Set();
    const correosExistentes = new Set();

    if (typeof listaEgresados !== "undefined") {
        listaEgresados.forEach((egresado) => {
            identificacionesExistentes.add(
                normalizarValorCsv(egresado.identificacion)
            );
            correosExistentes.add(
                normalizarValorCsv(egresado.correo)
            );
        });
    }

    registros.forEach((registro) => {
        const datos = registro.datos;
        const errores = validarDatosFilaCsv(datos);
        const identificacion = normalizarValorCsv(
            datos.identificacion
        );
        const correo = normalizarValorCsv(
            datos.correo
        );

        if (identificacion) {
            if (identificacionesArchivo.has(identificacion)) {
                errores.push(
                    `Identificación repetida en el archivo; primera aparición en la fila ${identificacionesArchivo.get(identificacion)}.`
                );
            } else {
                identificacionesArchivo.set(
                    identificacion,
                    registro.fila
                );
            }

            if (identificacionesExistentes.has(identificacion)) {
                errores.push(
                    "La identificación ya existe en el sistema."
                );
            }
        }

        if (correo) {
            if (correosArchivo.has(correo)) {
                errores.push(
                    `Correo repetido en el archivo; primera aparición en la fila ${correosArchivo.get(correo)}.`
                );
            } else {
                correosArchivo.set(
                    correo,
                    registro.fila
                );
            }

            if (correosExistentes.has(correo)) {
                errores.push(
                    "El correo ya existe en el sistema."
                );
            }
        }

        registro.errores = errores;
    });
}

function validarDatosFilaCsv(datos) {
    const errores = [];

    CAMPOS_OBLIGATORIOS_CSV.forEach((campo) => {
        if (!String(datos[campo] || "").trim()) {
            errores.push(
                `El campo ${campo} es obligatorio.`
            );
        }
    });

    if (
        datos.identificacion &&
        !/^[A-Za-z0-9-]{5,25}$/.test(datos.identificacion)
    ) {
        errores.push(
            "La identificación tiene un formato inválido."
        );
    }

    if (
        datos.nombreCompleto &&
        datos.nombreCompleto.length < 3
    ) {
        errores.push(
            "El nombre completo debe tener al menos 3 caracteres."
        );
    }

    if (
        datos.correo &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo)
    ) {
        errores.push(
            "El correo electrónico no tiene un formato válido."
        );
    }

    if (
        datos.telefono &&
        !/^\d{4}-?\d{4}$/.test(datos.telefono)
    ) {
        errores.push(
            "El teléfono debe contener ocho números."
        );
    }

    if (
        datos.fechaRegistro &&
        !/^\d{4}-\d{2}-\d{2}$/.test(datos.fechaRegistro)
    ) {
        errores.push(
            "La fecha debe utilizar el formato AAAA-MM-DD."
        );
    }

    if (
        datos.estado &&
        !["Activo", "Pendiente", "Inactivo"].includes(datos.estado)
    ) {
        errores.push(
            "El estado debe ser Activo, Pendiente o Inactivo."
        );
    }

    validarUrlOpcionalCsv(
        datos.linkedin,
        "LinkedIn",
        errores
    );

    validarUrlOpcionalCsv(
        datos.portafolio,
        "portafolio",
        errores
    );

    return errores;
}

function validarUrlOpcionalCsv(valor, nombre, errores) {
    if (!valor) return;

    try {
        const url = new URL(valor);
        if (!["http:", "https:"].includes(url.protocol)) {
            errores.push(
                `${nombre} debe utilizar http o https.`
            );
        }
    } catch {
        errores.push(
            `${nombre} no contiene una URL válida.`
        );
    }
}

function mostrarVistaPreviaCsv(registros) {
    cuerpoVistaPreviaCsv.innerHTML = "";

    registros.slice(0, 50).forEach((registro) => {
        const fila = document.createElement("tr");
        const resultado = obtenerTextoResultadoCsv(registro);

        [
            registro.fila,
            registro.datos.identificacion || "—",
            registro.datos.nombreCompleto || "—",
            registro.datos.correo || "—",
            registro.datos.estado || "—",
            resultado
        ].forEach((valor) => {
            const celda = document.createElement("td");
            celda.textContent = valor;
            fila.appendChild(celda);
        });

        cuerpoVistaPreviaCsv.appendChild(fila);
    });

    vistaPreviaImportacionCsv.hidden = false;
}

function obtenerTextoResultadoCsv(registro) {
    if (registro.resultadoBackend) {
        return registro.resultadoBackend.exito
            ? "Importado correctamente"
            : registro.resultadoBackend.errores.join(" ");
    }

    return registro.errores.length === 0
        ? "Válido para importar"
        : registro.errores.join(" ");
}

function actualizarResumenCsv(registros) {
    const validas = registros.filter(
        (registro) => registro.errores.length === 0
    ).length;

    csvProcesadas.textContent = registros.length;
    csvValidas.textContent = validas;
    csvInvalidas.textContent = registros.length - validas;
    csvImportadas.textContent = "0";
    resumenImportacionCsv.hidden = false;
}

function aplicarResultadosBackend(detalles) {
    const resultadosPorFila = new Map(
        detalles.map((detalle) => [
            Number(detalle.fila),
            detalle
        ])
    );

    filasCsvAnalizadas.forEach((registro) => {
        const resultado = resultadosPorFila.get(
            registro.fila
        );

        if (resultado) {
            registro.resultadoBackend = resultado;
        }
    });

    mostrarVistaPreviaCsv(
        filasCsvAnalizadas
    );
}

function limpiarImportacionCsv() {
    setTimeout(() => {
        filasCsvAnalizadas = [];
        limpiarResultadosCsv(true);
    }, 0);
}

function limpiarResultadosCsv(ocultarMensaje) {
    cuerpoVistaPreviaCsv.innerHTML = "";
    resumenImportacionCsv.hidden = true;
    vistaPreviaImportacionCsv.hidden = true;
    botonConfirmarImportacion.hidden = true;
    botonConfirmarImportacion.disabled = false;
    csvProcesadas.textContent = "0";
    csvValidas.textContent = "0";
    csvInvalidas.textContent = "0";
    csvImportadas.textContent = "0";

    if (ocultarMensaje) {
        mensajeImportacionCsv.hidden = true;
        mensajeImportacionCsv.textContent = "";
    }
}

function mostrarMensajeCsv(mensaje) {
    mensajeImportacionCsv.textContent = mensaje;
    mensajeImportacionCsv.hidden = false;
}

function obtenerEstadoCanonico(valor) {
    const estado = normalizarValorCsv(valor);

    return {
        activo: "Activo",
        pendiente: "Pendiente",
        inactivo: "Inactivo"
    }[estado] || String(valor || "").trim();
}

function normalizarCabeceraCsv(valor) {
    return normalizarValorCsv(valor)
        .replace(/[^a-z0-9]/g, "");
}

function normalizarValorCsv(valor) {
    return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}
