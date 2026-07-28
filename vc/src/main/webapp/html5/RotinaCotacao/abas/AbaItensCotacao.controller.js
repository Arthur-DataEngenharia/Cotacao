/**
 * Created by Handz (Eduardo,Charles)
 */

angular
    .module('RotinaCotacaoApp')
    .controller('AbaItensCotacaoController', ['BlockProperties','$timeout','$scope',
        function (BlockProperties, $timeout, $scope) {
            var self = this;

            self.gridCabecalho =  BlockProperties.dataGrid;
            self.dsCabecalho = BlockProperties.dataSet;
            self.containerModoItens;

            self.onContentCreated = onContentCreated;

            function onContentCreated($instance) {
                self.containerModoItens = $instance;
                $timeout(() => {
                    self.dsCabecalho.refreshCurrentRow();
                }, 2000)
            }


        }
    ]);