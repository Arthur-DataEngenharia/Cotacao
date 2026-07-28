angular.module('RotinaCotacaoApp')
    .controller('PopupEditDadosCotacaoController', ['StringUtils', '$popupInstance', 'data','$scope',
        function (StringUtils, $popupInstance, data, $scope) {
            var self = this;

            self.cbEnabled = true;

            self.disableCheckBox = disableCheckBox;

            $scope.$success = dataValue;

            init();
            function init() {
                self.txtDescriptionField = data.selectedItem.descricao;

                self.cbRequired = StringUtils.toBoolean(data.selectedItem.obrigatorio);
            }

            function dataValue() {
                $popupInstance.success({
                    editedField: {
                        description: self.txtDescriptionField,
                        required: self.cbRequired
                    }
                });
            }

            function disableCheckBox() {
                if(self.cbEnabled){
                    self.cbEnabled = false;
                }else{
                    self.cbEnabled = true;
                }
            }
        }
    ]);
