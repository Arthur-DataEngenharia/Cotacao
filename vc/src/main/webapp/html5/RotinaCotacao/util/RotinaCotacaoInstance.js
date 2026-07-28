class RotinaCotacaoInstance {

    _configPreferencias;

    constructor(scope) {
        this._scope = scope;
    }

    setConfigPreferencias(configPreferencias) {
        this._configPreferencias = configPreferencias;
    }

    get configPreferencias() {
        return this._configPreferencias;
    }

    

}
