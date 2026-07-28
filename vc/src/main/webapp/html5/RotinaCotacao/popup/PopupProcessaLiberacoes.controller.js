/**
 * Created by Handz (Eduardo,Charles) on 13/12/2019.
 */

angular
    .module('RotinaCotacaoApp')
    .controller('PopUpProcessaLiberacoesController', ['$scope', 'data',
        function ($scope, data) {
            $scope.liberacoes = data.liberacoes;
        }
    ]);