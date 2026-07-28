angular
    .module('RotinaCotacaoApp')
    .controller('MotivoCancCotPopupController', ['ObjectUtils','$scope','$popupInstance', 'MessageUtils', "i18n",
        function (ObjectUtils, $scope, $popupInstance, MessageUtils, i18n) {
        	var self = this;
        	self.data = {motivoCancelamento: self.pesqMotivoCanc, observacao: self.observacaoMotivoCanc};
        	self.notifyChange = notifyChange;
        	self.notifyChangeMotivo = notifyChangeMotivo;
        	        	
        	$scope.$success = onSuccess;
        	
        	function onSuccess(){
        		if(angular.isDefined(self.data.motivoCancelamento)){
        			$popupInstance.success(self.data);	
        		} else {
        			MessageUtils.showInfo(MessageUtils.TITLE_WARNING, i18n("Cotacao.RotinaCotacao.msgObrigatorioCampoCancelamento"));
        		}
        	}
        	
        	function notifyChange(){
            	self.data.observacao = self.observacaoMotivoCanc;
        	}
        	
        	function notifyChangeMotivo(){
        		self.data.motivoCancelamento = self.pesqMotivoCanc;
        	}
        }
    ]);