/**
 * Created by Handz (Eduardo,Charles) on 13/12/2019.
 */

angular
    .module('RotinaCotacaoApp')
    .controller('PopUpFieldsController', ['data', '$scope', '$popupInstance',
        function (data, $scope, $popupInstance) {
            var self = this;

            self.txtDescriptionField = data.selectedItem.descricao;
            self.disableCheckBox = disableCheckBox;
            self.cbProtected = data.selectedItem.protegido == "true";
            self.cbRequired = data.selectedItem.obrigatorio == "true";;
            self.cbProtectedEnabled = false;
            self.cbRequiredEnabled = false;
            self.showCheckbox = !data.selectedItem.codTipVenda;
            self.selectedItem = data.selectedItem;

            $scope.$success = dataValue;

            var isProtected = data.selectedItem.protegido == "true" ? true : false;
            var isSystemProtected = data.selectedItem.protegidoSistema == "true" ? true : false;
            var isRequired = data.selectedItem.obrigatorio == "true" ? true : false;


            if (isSystemProtected && isProtected) {
                self.cbRequired = false;

                self.cbRequiredEnabled = false;
                self.cbProtectedEnabled = false;

                self.cbProtected = true;

            } else {

                if (isRequired) {
                    self.cbProtectedEnabled = false;
                } else if (isProtected) {
                    self.cbRequiredEnabled = false;
                } else {
                    self.cbRequiredEnabled = true;
                    self.cbProtectedEnabled = true;
                }
                self.cbRequired = isRequired;
                self.cbProtected = isProtected;
            }


            function dataValue() {
                var editedField = { editedField: {} };

                editedField.description = self.txtDescriptionField;

                if (self.showCheckbox) {
                    editedField.required = self.cbRequired;
                    editedField.protected = self.cbProtected;
                }

                editedField.selectedItem = self.selectedItem;

                $popupInstance.success(editedField);
            }



            function disableCheckBox() {
               
            }




        }
    ]);