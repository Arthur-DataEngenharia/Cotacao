/**
 * Created by Handz (Eduardo,Charles) on 13/12/2019.
 */

angular
    .module('RotinaCotacaoApp')
    .controller('PopupAprovarFornecedorController', ['$scope', 'data', '$popupInstance', 'NumberUtils', 'MessageUtils', 'ServiceProxy', 'ObjectUtils', 'SkApplicationInstance', 'Criteria',
        function ($scope, data, $popupInstance, NumberUtils, MessageUtils, ServiceProxy, ObjectUtils, SkApplicationInstance, Criteria) {
            var self = this;

            ObjectUtils.implements(self, IDatagridInterceptor);

            self.resourceIDGrade = SkApplicationInstance.getResourceID() + ".popupaprovarfornecedor";

            self.createDataSet = createDataSet;

            self.dsSelecaoFornecedor;

            self.codProduto = data.codProduto;
            self.numCotacao = data.numCotacao;
            self.callBack = data.callBack;

            $scope.$success = aprovarFornecedor;

            function aprovarFornecedor() {
                $popupInstance.success({ fornecedor: getFornecedor() })
            }

            function getFornecedor() {
                return self.dsSelecaoFornecedor.getCurrentRowAsObject();
            }

            function getCriteria() {
                var criteria = Criteria();

                criteria.append("(this.SITUACAO = 'G' OR this.SITUACAO = 'R') AND this.CODPROD = ? AND this.PRECO > 0 ", Criteria.buildNumberParameter(self.codProduto));
                criteria.append(" AND (this.DTLIMPRECO IS NULL OR this.DTLIMPRECO > onlydate(dbDate()) ) AND this.NUMCOTACAO = ?", Criteria.buildNumberParameter(self.numCotacao));

                return criteria;
            }

            function createDataSet(dataset) {
                self.dsSelecaoFornecedor = dataset;

                var criteriaProvider = new CriteriaProvider();
                criteriaProvider.getCriteria = getCriteria;

                self.dsSelecaoFornecedor.addCriteriaProvider(criteriaProvider);

                self.dsSelecaoFornecedor.addRefreshedListener(function (reason) {
                    if (self.callBack) {
                        self.callBack(self.dsSelecaoFornecedor.isEmpty(),$popupInstance);
                    }
                });

                self.dsSelecaoFornecedor.initAndRefresh();
            }
        }
    ]);