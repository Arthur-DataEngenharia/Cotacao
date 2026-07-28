/**
 * Created by Handz (Eduardo,Charles)
 */

angular
    .module('RotinaCotacaoApp')
    .controller('AbaFornecedoresController', ['BlockProperties', 'ObjectUtils', 'ServiceProxy', 'MessageUtils', 'i18n', 'RotinaCotacaoUtil', 'StringUtils',
        function (BlockProperties, ObjectUtils, ServiceProxy, MessageUtils, i18n, RotinaCotacaoUtil, StringUtils) {
            var self = this;

            self.dsCabCotacao = BlockProperties.dataSet;
            self.dsFornecedores;

            self.onDatasetCreated = onDatasetCreated;
            self.save = save;
            self.remove = remove;
            self.pesquisaContatoCriteria = pesquisaContatoCriteria;
            self.afterPopulateContato = afterPopulateContato;
            self.afterPopulateParc = afterPopulateParc;
            self.skOnChangeFace = skOnChangeFace;
            self.skDoubleFacePanelCreated = skDoubleFacePanelCreated;


            function pesquisaContatoCriteria() {
                var criteria = Criteria();

                criteria.append("this.CODPARC = ? AND this.ATIVO = 'S'", self.dsFornecedores.getFieldValueAsNumberOrZero("CODPARC"));

                return criteria;

            }

            function afterPopulateParc(obj) {
                if (obj != null && !StringUtils.isEmpty(obj.data)) {
                    self.dsFornecedores.setFieldValue("NOMEPARC", obj.label);
                }
            }

            function afterPopulateContato(obj) {                
                if (obj != null && !StringUtils.isEmpty(obj.data)) {
                    self.dsFornecedores.setFieldValue("NOMECONTATO", obj.label);
                }
            }

            function save() {
                if (self.dsCabCotacao.isInsertionMode() || self.dsCabCotacao.isRecordDirty()) {
                    MessageUtils.showAlert(MessageUtils.TITLE_WARNING, i18n("SanDB.DataSet.messageSalvarAntesDeIncluir"));
                    return;
                }

                var params = { params: { numCotacao: self.dsCabCotacao.getFieldValueAsString("NUMCOTACAO"), codParc: self.dsFornecedores.getFieldValueAsString("CODPARC"), codContato: self.dsFornecedores.getFieldValueAsString("CODCONTATO") } };

                ServiceProxy.callService('mgecot@CotacaoSP.salvarFornecedor', params)
                    .then(function (result) {
                        loadFornecedores(self.dsFornecedores.getFieldValueAsString("CODPARC"));
                    })
                    .catch(function() {
                        self.dsFornecedores.refresh();
                    });
            }
            
            function remove() {
				if(!self.dsFornecedores.canRemove()){
					MessageUtils.showAlert(MessageUtils.TITLE_WARNING, i18n("SanDB.DataSet.messageNaoPermitidoRemover"));
					return;
				}
				
				var registros = self.dsFornecedores.getSelectedRecordsAsObjects();
				for (var i = 0; i < registros.length; i++) {
				    var item = registros[i];

					var params = { 
									params: { 
										numCotacao: self.dsCabCotacao.getFieldValueAsString("NUMCOTACAO"), 
										codParc: item.CODPARC
									} 
								};
							
					ServiceProxy.callService('mgecot@CotacaoSP.removerFornecedor', params)
			       		.then(function (_) {
			             	self.dsFornecedores.refresh();
			    		}); 
				
				}
			}

            function skOnChangeFace() {
                if(self.doubleFacePanel && !self.dsFornecedores.getCurrentRow() && self.doubleFacePanel.getSelectedIndex() == 0) {
                    self.dsFornecedores.goToInsertionMode();
                }
            }

            function skDoubleFacePanelCreated(doubleFacePanel) {
                self.doubleFacePanel = doubleFacePanel;
            }

            function onDatasetCreated(dataset) {
                self.dsFornecedores = dataset;                

                var obsForn = {};

                ObjectUtils.implements(obsForn, IDataSetObserver);

                obsForn.insertionModeActivated(function () {
                    
                });

                if (self.dsCabCotacao) {
                    self.dsCabCotacao.addRefreshedListener(function () {
                        if (self.dsFornecedores) {
                            self.dsFornecedores.refresh();
                        }
                    });
                    
                    self.dsCabCotacao.addInsertionModeListener(function() {
                    	self.dsFornecedores.clearDataSet();
                    });
                    
                    self.dsCabCotacao.addLineChangeListener(function(newIndex) {
                    	loadFornecedores();
                    });
                }

                self.dsFornecedores.setEntityDescription("Fornecedores");

                self.dsFornecedores.setRefreshHandler(loadFornecedores);

                self.dsFornecedores.whenMetadataLoaded().then(function () {
                    loadFornecedores();
                });

                self.dsFornecedores.init();
            }
            
            function loadFornecedores(codParc) {
                self.dsFornecedores.clearDataSet();

                var params = { params: { numCotacao: self.dsCabCotacao.getFieldValueAsString("NUMCOTACAO") } };

                ServiceProxy.callService('mgecot@CotacaoSP.getFornecedoresCotacao', params)
                    .then(function (result) {
                        var responseBody = ObjectUtils.getProperty(result, 'responseBody');

                        var fornecedores = responseBody.fornecedores.fornecedor;

                        if (fornecedores) {
                            if (!angular.isArray(fornecedores)) {
                                fornecedores = [fornecedores];
                            }

                            let rowTarget;

							self.dsFornecedores.clearDataSet();
                            fornecedores.forEach(function (item, index) {
                                let row = RotinaCotacaoUtil.buildRowObject(item);

                                if(row.CODPARC == codParc) {
                                    rowTarget = index;
                                }

                                self.dsFornecedores.addRecordsAsObjects(row);
                            });

                            self.dsFornecedores.gotoRow(rowTarget ? rowTarget : self.dsFornecedores.size()-1);
                        }

                    });
            }

        }
    ]);