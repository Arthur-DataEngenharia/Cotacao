/**
* Created by automatic batch Wesley.Souza on 2019-11-29 16:12:08
*/
angular
    .module('RotinaCotacaoApp', ['snk'])
    .controller('RotinaCotacaoController', ['MGEParameters', 'SkApplicationInstance', '$scope','WhenReady','ObjectUtils',
        function (MGEParameters, SkApplicationInstance, $scope, WhenReady, ObjectUtils) {
            var self = this;

            let _whenFormReady = WhenReady();

            self.modoCabecalho = MGEParameters.asBoolean("USAMODCABCOT");
            self.rotinaCotacaoInstance;

            self.resourceID = SkApplicationInstance.getResourceID().replace('-html5', '');

            self.configPreferencias = SkApplicationInstance.getConfiguracaoTela(self.resourceID);


            self.onContentCreated = onContentCreated;
            self.onContentCreatedItem = onContentCreatedItem;

            if (!self.rotinaCotacaoInstance) {
                self.rotinaCotacaoInstance = new RotinaCotacaoInstance($scope);
                self.rotinaCotacaoInstance.setConfigPreferencias(self.configPreferencias);
            }

            $scope.loadByPK = function (objPK) {
                _whenFormReady.whenReady().then(function () {
                    if (!ObjectUtils.isEmpty(objPK)) {
                        if (self.modoCabecalho){
							self.containerModoCabecalho.loadByPK(objPK);
						} 
                        if (self.containerModoItens){
                            self.containerModoItens.loadByPK(objPK);
                        }
                    }
                });
            };

            function onContentCreatedItem(instance) {
                self.containerModoItens = instance;
                self.containerModoItens.setResourceID(self.resourceID);
                self.containerModoItens.setInstance(self.rotinaCotacaoInstance);

                _whenFormReady.ready();
            }

            function onContentCreated(instance) {
                self.containerModoCabecalho = instance;
                self.containerModoCabecalho.setResourceID(self.resourceID);
                self.containerModoCabecalho.setInstance(self.rotinaCotacaoInstance);

                _whenFormReady.ready();
            }
        }]);
