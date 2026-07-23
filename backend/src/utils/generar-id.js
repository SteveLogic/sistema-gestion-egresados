function generarId(prefijo) {
    return `${prefijo}-${Date.now()}`;
}

module.exports = {
    generarId
};
