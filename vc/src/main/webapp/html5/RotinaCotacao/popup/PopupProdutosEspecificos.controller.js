/**
 * Created by Handz (Eduardo,Charles) on 13/12/2019.
 */

angular
    .module('RotinaCotacaoApp')
    .controller('PopupProdutosEspecificosController', ['$scope', 'data', '$popupInstance', 'NumberUtils', 'MessageUtils', 'ServiceProxy', 'ObjectUtils', 'SkApplicationInstance',
        function ($scope, data, $popupInstance, NumberUtils, MessageUtils, ServiceProxy, ObjectUtils, SkApplicationInstance) {
            var self = this;

            ObjectUtils.implements(self, IDatagridInterceptor);

            self.resourceIDGrade = SkApplicationInstance.getResourceID() + ".popuptransf.gradefornecedores";

            self.dsProdutos;
            self.confirmarFunction = data.confirmarFunction;
            self.records = data.records;

            self.createDataSet = createDataSet;
            self.atualizarColetaCotacao = atualizarColetaCotacao;
            self.produtoEspecificoCriteria = produtoEspecificoCriteria;
            self.interceptColumnMetadata = interceptColumnMetadata;

            $scope.$success = definirProdutoEspecifico;

            var fornecedorProdutoEsp = {};

            function produtoEspecificoCriteria() {
                var chave = self.dsProdutos.getFieldValueAsString("CHAVE");
                var parameters = fornecedorProdutoEsp[chave];

                var criteria = Criteria();
                criteria.append(SqlUtils.buildINClauseByValues("this.CODPROD", parameters));

                return criteria;
            }

            function interceptColumnMetadata(fieldMetadata, dataset) {
                if ("CODPRODESP".indexOf(fieldMD.name) > -1) {
                    var fk = {
                        relationShipName: "Produto",
                        entity: "Produto",
                        targetField: "CODPROD",
                        isHierarchyEntity: false,
                        descriptionFieldName: "Produto.DESCRPROD",
                    }

                    fieldMetadata.fk = fk;
                    fieldMetadata.readOnly = false;

                } else {
                    fieldMetadata.readOnly = true;
                }
            }


            /*public function visitItemEditor(dataGridFieldEditor:IDataGridItemEditor, column:DataGridColumn):void {
                if (column.dataField == "CODPRODESP") {
                    (dataGridFieldEditor as DataGridSearchEditor).environmentCriteriaFunction = produtoEspecificoCriteria;
                    (dataGridFieldEditor as DataGridSearchEditor).autoSearch = true;
                }
            }*/

            function atualizarColetaCotacao(params, records) {

                ServiceProxy.callService('mgecot@CotacaoSP.definirProdutoEspecifico', params
                ).then(function (result) {
                    if (self.confirmarFunction != null) {
                        self.confirmarFunction(records);
                    }

                    closeMe();
                });
            }

            function definirProdutoEspecifico() {
                if (records != null) {
                    var params = { params: { item: [] } };

                    records.forEach(function (record) {
                        var produtos = record["PRODUTOS"];

                        produtos.forEach(function (produto) {
                            self.dsProdutos.getRecordsAsObjects().forEach(function (prodEsp) {
                                var ehGenerico = produto["GENERICO"] == "S";
                                var produtoIgual = record["CODPARC"] == prodEsp["CODPARC"] && produto["CODPROD"] == prodEsp["CODPROD"];
                                var definiuProdEsp = NumberUtils.getNumberOrZero(Number(prodEsp["CODPRODESP"])) != 0;

                                if (ehGenerico && produtoIgual && definiuProdEsp) {
                                    produto["CODPRODESP"] = prodEsp["CODPRODESP"];

                                    var item = {};
                                    item.NUMCOTACAO = { $: produto["NUMCOTACAO"] };
                                    item.CODLOCAL = { $: produto["CODLOCAL"] };
                                    item.CODPARC = { $: record["CODPARC"] };
                                    item.CODPROD = { $: produto["CODPROD"] };
                                    item.CONTROLE = { $: produto["CONTROLE"] };
                                    item.DIFERENCIADOR = { $: produto["DIFERENCIADOR"] };
                                    item.CODPRODESP = { $: produto["CODPRODESP"] };

                                    params.params.item.push(item);
                                }
                            });
                        });
                    });
                }

                if (Object.keys(params).length > 0) {
                    atualizarColetaCotacao(params, records);
                } else {
                    MessageUtils.showAlert(MessageUtils.TITLE_WARNING, resourceManager.getString('Cotacao:RotinaCotacao', 'msgInfoProEspParaProdGen'));
                }
            }

            function closeMe() {
                $popupInstance.success();
            }

            function createDataSet(ds) {
                self.dsProdutos = ds;
                self.dsProdutos.init().then(function () {
                    if (self.records != null) {
                        var newRecords = [];

                        fornecedorProdutoEsp = {};

                        records.forEach(function (record) {
                            var produtos = record["PRODUTOS"];

                            produtos.forEach(function (produto) {
                                if (produto["GENERICO"] == "S" && NumberUtils.getNumberOrZero(produto["CODPRODESP"]) == 0) {
                                    var chave = record["CODPARC"] + "-" + produto["CODPROD"];

                                    var newRecord = {};
                                    newRecord["CHAVE"] = chave;
                                    newRecord["NUMCOTACAO"] = produto["NUMCOTACAO"];
                                    newRecord["CODLOCAL"] = produto["CODLOCAL"];
                                    newRecord["CODPARC"] = record["CODPARC"];
                                    newRecord["CODPROD"] = produto["CODPROD"];
                                    newRecord["CONTROLE"] = produto["CONTROLE"];
                                    newRecord["DIFERENCIADOR"] = produto["DIFERENCIADOR"];
                                    newRecord["FORNECEDOR"] = record["CODPARC"] + " - " + record["APRESPARCEIRO"];
                                    newRecord["PRODUTO"] = produto["CODPROD"] + " - " + produto["DESCRPROD"];
                                    newRecord["CODPRODESP"] = null;
                                    newRecords.push(newRecord);

                                    var listaProdEsp = produto["LISTCODPRODESP"];

                                    var ac = [];

                                    listaProdEsp.forEach(function (prodEsp) {
                                        ac.push(prodEsp["CODPROD"]);
                                    });

                                    fornecedorProdutoEsp[chave] = ac;
                                }
                            });
                        });
                        
                        self.dsProdutos.addRecordsAsObjects(newRecords);
                        self.dsProdutos.gotoRow(0);

                    }
                });
            }


        }
    ]);