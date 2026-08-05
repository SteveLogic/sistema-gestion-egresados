(function configurarParallax() {
    const portada = document.querySelector(".hero-publico");
    if (!portada) return;

    const reduceMovimiento = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMovimiento) return;

    let actualizacionPendiente = false;

    actualizarParallax();

    window.addEventListener(
        "scroll",
        () => {
            if (actualizacionPendiente) return;

            actualizacionPendiente = true;
            window.requestAnimationFrame(() => {
                actualizarParallax();
                actualizacionPendiente = false;
            });
        },
        { passive: true }
    );

    function actualizarParallax() {
        const rectangulo = portada.getBoundingClientRect();
        const altoVentana = window.innerHeight;
        const visible = rectangulo.bottom > 0 && rectangulo.top < altoVentana;

        if (!visible) return;

        const desplazamiento = Math.max(
            -180,
            Math.min(180, window.scrollY * 0.45)
        );

        portada.style.setProperty(
            "--parallax-figura-principal",
            `${desplazamiento * 0.18}px`
        );
        portada.style.setProperty(
            "--parallax-figura-secundaria",
            `${desplazamiento * -0.12}px`
        );
        portada.style.setProperty(
            "--parallax-contenido",
            `${desplazamiento * 0.06}px`
        );
    }
})();
