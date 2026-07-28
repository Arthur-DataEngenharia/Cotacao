angular
    .module('MotivoCancelamentoCotacaoApp', ['snk'])
    .controller('MotivoCancelamentoCotacaoController', ['ObjectUtils',
        function (ObjectUtils) {
            var self = this;
            self.onDynaformLoaded = onDynaformLoaded;
            ObjectUtils.implements(self, IDynaformInterceptor);
            ObjectUtils.implements(self, IFormInterceptor);
            
            function onDynaformLoaded(dynaform, dataset) {
                dataset.initAndRefresh();
            }
        }]);
