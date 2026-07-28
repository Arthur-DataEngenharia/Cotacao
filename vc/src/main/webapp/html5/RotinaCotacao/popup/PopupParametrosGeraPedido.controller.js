/**
 * Popup de parametros para gerar o pedido de compra via servico geraPedidoSP.
 * Coleta o Tipo de Negociacao (CODTIPVENDA) e devolve { psqCodTipVenda } ao caller.
 */
angular
    .module('RotinaCotacaoApp')
    .controller('PopupParametrosGeraPedidoController', ['$scope', '$popupInstance', 'MessageUtils', 'StringUtils', 'i18n',
        function ($scope, $popupInstance, MessageUtils, StringUtils, i18n) {
            var self = this;

            self.psqCodTipVenda = null;

            // Disparado pelo botao de confirmacao (okBtnLabel) do SanPopup.
            $scope.$success = confirmar;

            function confirmar() {
                if (("0" == self.psqCodTipVenda) || (StringUtils.emptyAsNull(self.psqCodTipVenda) == null)) {
                    MessageUtils.showAlert(MessageUtils.TITLE_ERROR,
                        i18n("SanDB.DataSet.messagePreenchaCampos", [i18n("cot_labelTipoNeg")]));
                    return false; // mantem o popup aberto
                }

                // Resolve a promise .result do popup com os parametros coletados.
                $popupInstance.success({ psqCodTipVenda: self.psqCodTipVenda });
            }
        }
    ]);