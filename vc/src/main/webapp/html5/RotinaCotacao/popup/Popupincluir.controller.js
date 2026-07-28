/**
 * Created by Handz (Eduardo,Charles) on 13/12/2019.
 */

angular
    .module('RotinaCotacaoApp')
    .controller('PopupIncluirController', ['$scope', 'data','$popupInstance',
        function ($scope, data, $popupInstance) {
            var self = this;
            
            self.dsMultiplasDatas = data.dsMultiplasDatas;
            self.dataGridEnabled = data.dataGridEnabled;

            $scope.$success = salvarDs;
            $scope.$dismiss = fecharPopUp;

            function salvarDs(){
                self.dsMultiplasDatas.save().then(() => {
                    $popupInstance.success();
                });
            }

            function init(){
                self.dataGridEnabled = false;

                if(!self.dsMultiplasDatas.isInsertionMode()){
					self.dsMultiplasDatas.goToInsertionMode();
				}
            }

            function fecharPopUp(){
                self.dsMultiplasDatas.cancelEdition();
                self.dataGridEnabled = true;
                $popupInstance.dismiss();
            }

            init();
            
        }
    ]);