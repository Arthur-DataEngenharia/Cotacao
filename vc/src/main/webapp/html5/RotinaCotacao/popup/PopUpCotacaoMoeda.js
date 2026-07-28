angular.module('RotinaCotacaoApp')
    .controller('PopUpCotacaoMoedaController', ['$scope', '$popupInstance', 'data', 'ObjectUtils', 'NumberUtils', 'SkApplicationInstance',
        function ($scope, $popupInstance, data, ObjectUtils, NumberUtils, SkApplicationInstance) {
            var self = this;

            self.onDynaformLoad = onDynaformLoad;
            self.refreshDataSet = refreshDataSet;

            self.value = data.value;
            self._dsCotacaoMoeda;
            self.pesqMoeda = {};
            self.resourceId = 'br.com.sankhya.com.cotacaomoedapopup.' + SkApplicationInstance.getUserID();

            ObjectUtils.implements(self, IDynaformInterceptor);
            ObjectUtils.implements(self, IFormInterceptor);
            ObjectUtils.implements(self, IDatagridInterceptor);

            $scope.$success = function () {
                $popupInstance.success({
                    CODMOEDA: self._dsCotacaoMoeda.getFieldValueAsNumber('CODMOEDA'),
                    COTACAO: self._dsCotacaoMoeda.getFieldValueAsNumberOrZero('COTACAO')
                });
            };

            if (String(data.codMoeda) != 0) {
                self.pesqMoeda.enabled = false;
                self.pesqMoeda.value = String(data.codMoeda);
            } else {
                self.pesqMoeda.enabled = true;
                self.pesqMoeda.value = null;
            }

            function getCriteria() {
                if (NumberUtils.stringToNumber(self.pesqMoeda.value) != 0) {
                    return new Criteria('this.CODMOEDA = ?', [
                        new CriteriaParameter(CriteriaParameter.TYPE_NUMBER, self.pesqMoeda.value)
                    ]);
                } else {
                    return new Criteria('this.CODMOEDA = -1');
                }
            }

            function onDynaformLoad(dynaform, dataset) {

                if (dynaform.getEntityName() == 'CotacaoMoeda') {
                    self._dsCotacaoMoeda = dataset;
                    self._dsCotacaoMoeda.setOrderByExpression(' DTMOV DESC ');
                    self._dsCotacaoMoeda.addCriteriaProvider(getCriteria);

                    var observer = new IDataSetObserver();
                    observer.insertionModeActivated = function () {
                        self._dsCotacaoMoeda.setFieldValue(
                            'CODMOEDA',
                            Number(self.pesqMoeda.value) != 0 ? Number(self.pesqMoeda.value) : null
                        );
                    };

                    self._dsCotacaoMoeda.addObserver(observer);

                    self._dsCotacaoMoeda.refresh();
                }
            };

            function refreshDataSet() {
                self._dsCotacaoMoeda.refresh();
            }
        }
    ]);
