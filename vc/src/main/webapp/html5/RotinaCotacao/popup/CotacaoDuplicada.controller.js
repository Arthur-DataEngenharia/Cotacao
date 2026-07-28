angular
    .module('RotinaCotacaoApp')
    .controller('CotacaoDuplicadaController', [
        'payload',
        '$scope',
        '$popupInstance',
        'i18n',
        'SkApplicationInstance',
        CotacaoDuplicadaController
    ]);

function CotacaoDuplicadaController(payload, $scope, $popupInstance,i18n,SkApplicationInstance) {
    var self = this;
    self.onDblClickGridPendentes = onDblClickGridPendentes;
    var data;

    if(angular.isUndefined(self.colDestino)){
        self.colDestino = i18n("Cotacao.RotinaCotacao.lblCotacaoDestino");
    }

    $scope.$dismiss = function (event) {
        $popupInstance.dismiss(event);
    };

    $scope.$success = function () {
        $popupInstance.success();
    };

    function onDatasetCreated(dataset) {
        self.ds = dataset;
        data = payload;
        self.ds.initAndRefresh();
    }

    function openDocumento() {
    	onDblClickGridPendentes();
    }

    function refreshHandler() {
        return [data];
    }
    
    function onDblClickGridPendentes() {
        SkApplicationInstance.openApp('br.com.sankhya.swb.cotacao.rotinas.cotacao', { NUMCOTACAO: data.cotacaoDest });
        $popupInstance.dismiss(event);
    }

    exports = { openDocumento, onDatasetCreated, refreshHandler };

    for (var key in exports) {
        self[key] = exports[key];
    }
}
