(function configurarAnimaciones() {
    const reduceMovimiento = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    document.documentElement.classList.add("animaciones-activas");

    document.addEventListener("DOMContentLoaded", () => {
        const elementos = seleccionarElementosAnimables();

        elementos.forEach((elemento, indice) => {
            elemento.classList.add("revelar");
            elemento.style.setProperty(
                "--retraso-animacion",
                `${Math.min(indice % 4, 3) * 70}ms`
            );
        });

        if (reduceMovimiento || !("IntersectionObserver" in window)) {
            elementos.forEach(mostrarElemento);
        } else {
            observarElementos(elementos);
        }

        prepararEfectoBotones();
    });

    function seleccionarElementosAnimables() {
        const selectores = [
            "main > .seccion:not(.hero-publico)",
            ".contenido-sistema > .seccion",
            ".seccion-bienvenida",
            ".encabezado-seccion",
            ".cuadricula > .tarjeta",
            ".cuadricula-resumen > .tarjeta",
            ".contenedor-tabla"
        ];

        return Array.from(document.querySelectorAll(selectores.join(",")))
            .filter((elemento, indice, lista) => lista.indexOf(elemento) === indice);
    }

    function observarElementos(elementos) {
        const observador = new IntersectionObserver(
            (entradas) => {
                entradas.forEach((entrada) => {
                    if (!entrada.isIntersecting) return;

                    mostrarElemento(entrada.target);
                    observador.unobserve(entrada.target);
                });
            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -40px 0px"
            }
        );

        elementos.forEach((elemento) => observador.observe(elemento));
    }

    function mostrarElemento(elemento) {
        elemento.classList.add("es-visible");
    }

    function prepararEfectoBotones() {
        document.addEventListener("click", (evento) => {
            const boton = evento.target.closest(".boton, .boton-tabla");
            if (!boton || boton.disabled) return;

            boton.classList.remove("efecto-pulso");
            void boton.offsetWidth;
            boton.classList.add("efecto-pulso");

            window.setTimeout(() => {
                boton.classList.remove("efecto-pulso");
            }, 380);
        });
    }
})();
