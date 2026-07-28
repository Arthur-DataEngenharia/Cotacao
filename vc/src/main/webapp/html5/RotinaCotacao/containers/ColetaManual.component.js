/**
 * Created by Handz (Eduardo,Charles)
 */
angular
    .module('RotinaCotacaoApp')
    .component('coletaManual', {
        templateUrl: 'html5/RotinaCotacao/containers/ColetaManual.tpl.html',
        controller: 'ColetaManualController',
        controllerAs: 'ctrl',
        bindings: {
            dsItemCotacao: "<?",
            dsCabCotacao: "<?",
            voltarFunction: "&?",
            preferencias: "<",
            onContentCreated: '&',

        }
    })
    .controller('ColetaManualController', ['DatasetObserverEvents', 'i18n', 'SanPopup', 'RotinaCotacaoUtil', 'StringUtils', 'ObjectUtils', 'AngularUtil', 'MessageUtils', 'MGEParameters', 'ServiceProxy', 'NumberUtils',
        function (DatasetObserverEvents, i18n, SanPopup, RotinaCotacaoUtil, StringUtils, ObjectUtils, AngularUtil, MessageUtils, MGEParameters, ServiceProxy, NumberUtils) {
            var self = this;

            var _publicAPI = {};
            _publicAPI.refresh = refresh;

            // Interceptors
            ObjectUtils.implements(self, IFormInterceptor);
            ObjectUtils.implements(self, IDatagridInterceptor);
            ObjectUtils.implements(self, IDynaformInterceptor);


            // Implementações da interface IFormInterceptor
            self.acceptColumnField = acceptColumnField;
            self.acceptField = acceptField;

            self.$onInit = $onInit;
            self.lblColetaManual = "Coleta Manual por Fonecedor (Com filtro)";
            self.onDatagridLoaded = onDatagridLoaded;
            self.onDatagridLoadedColeta = onDatagridLoadedColeta;
            self.onDatasetCreated = onDatasetCreated;
            self.onDynaformLoaded = onDynaformLoaded;
            self.onControleProdChange = onControleProdChange;
            self.onControleProdCreate = onControleProdCreate;
            self.refresh = refresh;
            self.labelControle;

            self.dynaformColetaItemCotacao;
            self.interceptFieldMetadata = interceptFieldMetadata;
            self.interceptBuildField = interceptBuildField;
            self.interceptFieldElement = interceptFieldElement;
            self.interceptItemEditor = interceptItemEditor;
            self.interceptColumnMetadata = interceptColumnMetadata;
            self.buildFieldContainer = buildFieldContainer;
            self.atualizarControleUIColetaManual = atualizarControleUIColetaManual;
            self.atualizaPrecisaoCampoQtdItemCotacao = atualizaPrecisaoCampoQtdItemCotacao;
			self.getNroVlrVenda = getNroVlrVenda;

            self.controleProd;

            self.dsParceiroItemCotacao;
            self.dsItemColetaManualPersistent;

            var _fieldsImpostoColManual = {};
            var _columnsImpostoColManual = {};
            var _preferencias = self.preferencias;
            var _camposNaoEditaveisColetaManual = ["CODPROD", "CODVOL", "Volume_DESCRVOL", "QTDCOTADA", "NUMEROOS", "SITUACAO", "MELHOR", "TOTALPRODUTO", "CONTROLE", "ULTVLRUNITCOMP", "ULTCUSREP", "ULTCUSVAR", "ULTCUSGER", "TipoNegociacao_DESCRTIPVENDA", "CUSMEDICM", "CUSSEMICM", "CUSREP", "CUSGER", "CUSVARIAVEL", "RESULTCOT", "CODPROD", "CODLOCAL", "NUMCOTACAO", "CONTROLE", "Local_"];
            var _camposNaoVisiveisColetaManual = ["TIPOCOLPRECO", "CODPARC", "Parceiro_", "CABECALHO", , "DIFERENCIADOR"];
            var _produtoDECVLRColManual;
            var _produtoDECQTDColManual;
            var _decvlrmoeda = MGEParameters.asInteger("mgefin.decimais.calc.moeda") > 0 ? MGEParameters.asInteger("mgefin.decimais.calc.moeda") : 5;
            var _fieldDescPrecoColetaManual;
            var _fieldPrecoMoeColetaManual;
            var _fieldDescMoedaColetaManual;
            var _fieldVlrMoedaColetaManual;
            var _fieldQtdeColetaManual;
            var _fieldPrecoColetaManual;
            var _fieldControleColetaManual;
            var _ctrProdApi;
            var _abrePopUpCotacaoManual = true;
            var _calculandoCampoValor;
            var _calculandoCampoPorcentagem;


            function interceptItemEditor(configObj, dataset) {

                if (configObj.skName == "PRECO") {
                    configObj.precision = self.dsItemColetaManualPersistent.getFieldValueAsNumberOrZero("PRODDECVLR");
                    configObj.editable = self.dsItemColetaManualPersistent.getFieldValueAsNumberOrZero("CODMOEDA") == MGEParameters.asInteger("civil.moeda.padrao");
                }
                if (configObj.skName == "VLRMOEDA") {
                    configObj.precision = _decvlrmoeda;
                    configObj.editable = self.dsItemColetaManualPersistent.getFieldValueAsNumberOrZero("CODMOEDA") != MGEParameters.asInteger("civil.moeda.padrao");
                }
                if (configObj.skName == "QTDCOTADA") {
                    configObj.precision = self.dsItemColetaManualPersistent.getFieldValueAsNumberOrZero("PRODDECVLR");
                }
                if (configObj.skName == "PRECOMOE") {
                    configObj.precision = _decvlrmoeda;
                    configObj.editable = self.dsItemColetaManualPersistent.getFieldValueAsNumberOrZero("CODMOEDA") != MGEParameters.asInteger("civil.moeda.padrao");
                }
                if (configObj.skName == "VLRDESC") {
                    configObj.editable = self.dsItemColetaManualPersistent.getFieldValueAsNumberOrZero("CODMOEDA") == MGEParameters.asInteger("civil.moeda.padrao");
                }
                if (configObj.skName == "VLRDESCMOE") {
                    configObj.editable = self.dsItemColetaManualPersistent.getFieldValueAsNumberOrZero("CODMOEDA") != MGEParameters.asInteger("civil.moeda.padrao");
                }
                if (configObj.skName == 'DTCOLETAPRECO') {
                    configObj.inputName = 'sk-date-input';
                }
            }

            function interceptColumnMetadata(fieldMetadata, dataset) {
                if (dataset.getEntityName() == 'ColetaItemCotacao') {

                    var fieldName = fieldMetadata.name;

                    if (_camposNaoVisiveisColetaManual.includes(fieldName)) {
                        fieldMetadata.visible = false;
                    }
                    if (_camposNaoEditaveisColetaManual.includes(fieldName) || fieldName.lastIndexOf("LocalEstoque") > -1
                        || fieldName.lastIndexOf("Volume") > -1 || fieldName.lastIndexOf("Produto") > -1) {
                        fieldMetadata.editable = false;
                    } else {
                        fieldMetadata.editable = true;
                    }

                    if (fieldName == "PRECO") {
                        fieldMetadata.customCellFormatter = function (value, column, data) {
                            return buildPrecision(column, data);
                        }

                    }
                    if (fieldName == "VLRMOEDA") {
                        fieldMetadata.customCellFormatter = function (value) {
                            var qtdDigitos = _decvlrmoeda;
                            var resultado = NumberUtils.format(value, qtdDigitos);
							return NumberUtils.stringToNumber(resultado);
                        }
                    }

                    if (fieldName == "QTDCOTADA") {
                        fieldMetadata.customCellFormatter = function (value) {
                            var qtdDigitos = self.dsItemColetaManualPersistent.getFieldValueAsNumber("PRODDECQTD") > 0 ? self.dsItemColetaManualPersistent.getFieldValueAsNumber("PRODDECQTD") : 2;
                            var resultado = NumberUtils.format(value, qtdDigitos);
							return NumberUtils.stringToNumber(resultado);
                        }
                    }

                    if (fieldName == "TOTALPRODUTO") {
                        fieldMetadata.customCellFormatter = function (value, column, data) {
                            var qtdDigitos = 0;
							var totalProduto = 0;
							if (self.dsItemColetaManualPersistent.isEditMode()) {
                                qtdDigitos = self.dsItemColetaManualPersistent.getFieldValueAsNumber("PRODDECVLR") > 0 ? self.dsItemColetaManualPersistent.getFieldValueAsNumber("PRODDECVLR") : 2;
								totalProduto = NumberUtils.format(RotinaCotacaoUtil.calculaTotalItemCotacaoByItem(self.dsItemColetaManualPersistent.getCurrentRowAsObject()), qtdDigitos);;
							} else {
								qtdDigitos = data.PRODDECVLR > 0 ? data.PRODDECVLR : 2;
								totalProduto = NumberUtils.format(RotinaCotacaoUtil.calculaTotalItemCotacaoByItem(data), qtdDigitos);;
							}
                            return NumberUtils.stringToNumber(totalProduto);
                        }
                        fieldMetadata.editable = false;
                    }

                    if (getNomesCamposImpostos().includes(fieldName)) {
                        fieldMetadata.editable = (!_preferencias["CALCULARIMPOSTOS"]);
                        _columnsImpostoColManual[fieldName] = fieldMetadata;
                    }
                }
            }
            
            function buildPrecision(column, data) {
                if (angular.isDefined(data) && angular.isDefined(data.rowID)) {
                    var value = data[column.field];
                    var casasDec = data["PRODDECVLR"] > 0 ? data["PRODDECVLR"] : 2;
                            var qtdDigitos = self.dsItemColetaManualPersistent.getFieldValueAsNumber("PRODDECQTD") > 0 ? self.dsItemColetaManualPersistent.getFieldValueAsNumber("PRODDECQTD") : 2;
                    
                    var formatado = NumberUtils.format(value, casasDec);

                    return NumberUtils.stringToNumber(formatado);
                }
                return;
            }

            function updateVLRMOEDAColetaManual(obj) { //Time de componente analisar ligado a implementação do campo moeda;
                var config = { parametros: {} };
                config.parametros.CODMOEDA = self.dsItemColetaManualPersistent.getFieldValueAsNumberOrZero("CODMOEDA");
                config.parametros.CODPARC = self.dsItemColetaManualPersistent.getFieldValueAsNumberOrZero("CODPARC");

                ServiceProxy.callService('mgecot@CotacaoSP.buscarCotacaoParceiro', config)
                    .then(function (result) {

                        var dadosCotacao = result.responseBody.cotacaoparceiro;

                        var valorMoeda = NumberUtils.stringToNumber(dadosCotacao.COTACAO);

                        if (NumberUtils.getNumberOrZero(valorMoeda) != 0) {
                            self.dsItemColetaManualPersistent.setFieldValue("VLRMOEDA", valorMoeda);
                        } else {
                            if (self.dsItemColetaManualPersistent.getFieldValueAsNumberOrZero("CODMOEDA") != 0 && _abrePopUpCotacaoManual) {
                                self.dsItemColetaManualPersistent.setFieldValue("VLRMOEDA", null);
                                createPopupCotacaoMoedaManual(false);
                            }
                            _abrePopUpCotacaoManual = true;

                        }

                    });
            }


            function acceptColumnField(fieldMD, dataset) {
                var fieldName = fieldMD.name;

                if (dataset.getEntityName() == 'ColetaItemCotacao') {
                    if (_camposNaoVisiveisColetaManual.lastIndexOf(fieldName) > -1 || StringUtils.startsWith(fieldName, "Parceiro_")) {
                        return false;
                    }
                    if (!MGEParameters.asBoolean("TRABMOECOT") && ("@VLRMOEDA@DTMOEDA@CODMOEDA@".indexOf("@" + fieldName + "@") > -1) || StringUtils.startsWith(fieldName, "Moeda_")) {
                        return false;
                    }
                    if (fieldName == "ULTVLRUNITCOMP" && !_preferencias["ULTIMOVALORCOMPRA"]) {
                        return false;
                    }
                    if (fieldName == "Produto_DECVLR" || fieldName == "Produto_DECQTD") {
                        return false;
                    }
                }
                return true;
            }

            function acceptField(fieldMetadata, dataset) {
                var entityName = dataset.getEntityName();
                var field = fieldMetadata.name;

                if (!MGEParameters.asBoolean("USANROOSCOT") && (field == "NUMEROOS")) {
                    return false;
                }
                if (entityName == "ColetaItemCotacao") {
                    if (_camposNaoVisiveisColetaManual.lastIndexOf(field) > -1) {
                        return false;
                    }

                    if ("ULTVLRUNITCOMP" == field && !_preferencias["ULTIMOVALORCOMPRA"]) {
                        return false;
                    }
                    return true;
                }
                return true;
            }


            function interceptFieldMetadata(fieldMetadata, dataset, dynaform) {
                if (dataset.getEntityName() == 'ColetaItemCotacao') {

                    if (fieldMetadata.fieldName == "TOTALPRODUTO") {
                        fieldMetadata.enabled = false;
                    }

                    var fieldID = fieldMetadata.name;

                    var camposDosImpostos = getNomesCamposImpostos();

                    if (camposDosImpostos.includes(fieldID)) {
                        fieldMetadata.enabled = !_preferencias["CALCULARIMPOSTOS"];
                    }

                    if (_camposNaoEditaveisColetaManual.lastIndexOf(fieldID) > -1) {
                        fieldMetadata.enabled = false;
                    } else {
                        fieldMetadata.enabled = true;
                    }

                    if (RotinaCotacaoUtil.CAMPOS_CHAVE_CABECALHO.includes(fieldID)) {
                        fieldMetadata.enabled = false;

                        if (fieldID == "CONTROLE") {
                            fieldMetadata.visible = false;
                        }
                    }
                }
            }

            function interceptFieldElement(fieldName, element, controller) {
                switch (fieldName) {
                    case 'TOTALPRODUTO':
                        _fieldTotProdColetaManual = controller;
                        break;
                    case 'CONTROLE':
                        _fieldControleColetaManual = controller;
                        break;
                    case 'QTDCOTADA':
                        _fieldQtdeColetaManual = controller;
                        break;
                    case 'VLRMOEDA':
                        _fieldVlrMoedaColetaManual = controller;
                        break;
                    case 'PRECO':
                        _fieldPrecoColetaManual = controller;
                        break;
                    case 'CODMOEDA':
                        _campoMoedaColetaManual = controller;
                        break;
                    case 'VLRDESC':
                        _fieldDescPrecoColetaManual = controller;
                        break;
                    case 'PRECOMOE':
                        _fieldPrecoMoeColetaManual = controller;
                        break;
                    case 'VLRDESCMOE':
                        _fieldDescMoedaColetaManual = controller;
                        break;
                }
            }


            function onControleProdCreate(api) {
                _ctrProdApi = api;
            }

            function onControleProdChange(value) {
                self.controleProd = value;
            }


            function buildFieldContainer(fieldName, dataset, fieldElem, scope) {
                if (dataset.getEntityName() == 'ColetaItemCotacao') {
                    if (fieldName == 'CODMOEDA') { //Ver com time de framework

                        var hBoxElem = AngularUtil.createDirective('sk-hbox', {
                        }, scope);

                        scope.getEnviromentCriteriaMoeda = function () {
                            return RotinaCotacaoUtil.getEnvironmentCriteria(self.dsItemColetaManualPersistent.getFieldValueAsNumberOrZero("CODPARC"));
                        }

                        var btnMoedaElem = AngularUtil.createDirective('button', {
                            'class': 'btn btn-default',
                            'tooltip': 'Cotação',
                            'ng-click': 'coletaManual()',
                            'style': 'width: 36px;margin-left: 5px;height: 20px;'
                        }, scope);

                        var skIconMoeda = AngularUtil.createDirective('sk-icon', {
                            'font-icon': 'calculator',
                            'class': 'calculator',
                            'v': '2'
                        }, scope);

                        btnMoedaElem.append(skIconMoeda);

                        hBoxElem.append(fieldElem);
                        hBoxElem.append(btnMoedaElem);
                     
                        scope.coletaManual = function (e) {
                            if (self.dsItemColetaManualPersistent.getFieldValue("CODMOEDA") == null) {
                                MessageUtils.showAlert(MessageUtils.TITLE_WARNING, "Selecione uma moeda para buscar cotação");
                            } else if (self.dsItemColetaManualPersistent.getFieldValueAsNumber("CODMOEDA") != 0) {
                                createPopupCotacaoMoedaManual();
                            }
                        }
                     
                        return hBoxElem;
                    }
                }
            }


            function createPopupCotacaoMoedaManual(mostarColunaCodMoeda) {
                if (self.dsItemColetaManualPersistent.getFieldValueAsNumberOrZero("CODPARC") == 0) {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, "Informe um parceiro antes de pesquisar a moeda");
                    return;
                }

                if (!_popUpCotacaoManual) {

                    SanPopup.open({
                        title: i18n('Comercial.CentralNotas.itemCotacaoMoedas'),
                        templateUrl: 'html5/RotinaCotacao/popup/PopUpCotacaoMoeda.tpl.html',
                        controller: 'PopUpCotacaoMoeda',
                        controllerAs: 'ctrl',
                        size: 'sm',
                        height: '400',
                        okBtnLabel: i18n('Comercial:CentralNotas.buttonUsarCotacao'),
                        windowClass: 'popUpCotacaoMoeda',
                        resolve: {
                            data: {
                                mostarColunaCodMoeda: mostarColunaCodMoeda
                            }
                        }
                    }).result
                        .then(function (result) {

                            if (!isNaN(result.CODMOEDA)) {
                                var codMoeda = result.CODMOEDA;
                                var cotacao = result.COTACAO;

                                if (self.dsItemColetaManualPersistent.getFieldValueAsNumber("CODMOEDA") != codMoeda) {
                                    _abrePopUpCotacaoManual = false;
                                }

                                self.dsItemColetaManualPersistent.setFieldValue("VLRMOEDA", cotacao);
                            }

                        });
                }

                _cotacaoMoedaManual.refreshDataSet();
            }


            function interceptBuildField(fieldName, dataset, fieldProp, scope) {
                if (dataset.getEntityName() == 'ColetaItemCotacao') {

                    if (fieldName == "CODMOEDA") { 
                        fieldProp['sk-entity-name'] = 'Moeda';
                        fieldProp['sk-field-name'] = 'CODMOEDA';
                        fieldProp['sk-enviroment-criteria'] = 'getEnviromentCriteria()';
                        fieldProp['sk-entity-change'] = 'updateVLRMOEDAColetaManual(item)';
                        fieldProp['sk-custom-item-input'] = '';

                        scope.getEnviromentCriteria = getCriteriaColetaManual;
                        scope.updateVLRMOEDAColetaManual = updateVLRMOEDAColetaManual;

                        _campoMoeda = AngularUtil.createDirective('sk-pesquisa-input', fieldProp, scope);

                        scope.openPopupCotacaoMoeda = function () {
                            var codMoeda = self.dsItemCotacao.getFieldValueAsNumber("CODMOEDA");
                            if (isNaN(codMoeda)) {
                                MessageUtils.showAlert(i18n('Cotacao.RotinaCotacao.SelecioneMoedabuscarCotacao'));
                            } else if (codMoeda != 0) {
                                createPopupCotacaoMoedaManual(codMoeda);
                            }
                        };

                        var iconCotacao = AngularUtil.createDirective('sk-icon', {
                            'font-icon': "coins",
                            'v': '2'
                        });

                        var btnCotacao = AngularUtil.createDirective('button', {
                            'tooltip': "Cotação",
                            'ng-click': "openPopupCotacaoMoeda()",
                            'default': '',
                            'small': '',
                            'sk-width': '40px',
                            'sk-height': '20px'
                        }, scope);

                        btnCotacao.append(iconCotacao);

                        var hBoxElem = AngularUtil.createDirective('sk-hbox', {
                            'align': 'start start',
                            'flex': '',
                            'gap':'5'
                        }, scope);

                        hBoxElem.append(_campoMoeda);
                        hBoxElem.append(btnCotacao);

                        return hBoxElem;

                    }

                    if (fieldName == "TOTALPRODUTO") {
                        return AngularUtil.createDirective('sk-number-input', fieldProp, scope);
                    }

                    if (fieldName == "CONTROLE") {
                        return AngularUtil.createDirective('sk-controle-estoque-input', fieldProp, scope);
                    }

                    if (fieldName == "QTDCOTADA") {
                        return AngularUtil.createDirective('sk-number-input', fieldProp, scope);
                    }
                    if (fieldName == "VLRMOEDA") {
                        fieldProp["sk-precision"] = _decvlrmoeda;

                        return AngularUtil.createDirective('sk-number-input', fieldProp, scope);
                    }

                    if (fieldName == "PRECO") {
						fieldProp['sk-precision'] = 'getNroVlrVenda()';
                        scope.getNroVlrVenda = self.getNroVlrVenda;
                        return AngularUtil.createDirective('sk-number-input', fieldProp, scope);
                    }

                    if (fieldName == "VLRDESC") {
                        return AngularUtil.createDirective('sk-number-input', fieldProp, scope);
                    }

                    if (fieldName == "PRECOMOE") {
                        fieldProp["sk-precision"] = _decvlrmoeda;
                        return AngularUtil.createDirective('sk-number-input', fieldProp, scope);
                    }

                    if (fieldName == "VLRDESCMOE") {
                        return AngularUtil.createDirective('sk-number-input', fieldProp, scope);
                    }
                    
                    if(fieldName == "CODCONTATO"){
                    	fieldProp['sk-enviroment-criteria'] = 'getEnviromentCriteria()';
                    	scope.getEnviromentCriteria = getCriteriaColetaManualContato;
                    }

                    if (fieldName == "DTCOLETAPRECO") {
                        return AngularUtil.createDirective('sk-date-input', fieldProp, scope);
                    }

                }
            }
            
            function getNroVlrVenda() {
				return self.dsItemColetaManualPersistent.getFieldValueAsNumber("PRODDECVLR") > 0 ? self.dsItemColetaManualPersistent.getFieldValueAsNumber("PRODDECVLR") : 2;
			}

            function getCriteriaColetaManual(){
				return RotinaCotacaoUtil.getEnvironmentCriteriaMoeda(self.dsItemColetaManualPersistent.getFieldValueAsNumberOrZero('CODPARC'));
			}
            
            function getCriteriaColetaManualContato(){
				return RotinaCotacaoUtil.getEnvironmentCriteriaContato(self.dsItemColetaManualPersistent.getFieldValueAsNumberOrZero('CODPARC'));
			}

            function refresh() {
                habilitaCampoImpostosColetaManual();

                self.dsParceiroItemCotacao.refresh(getCriteriaParceiroColeta());
            }

            function getCriteriaParceiroColeta() {
                var criteria = Criteria();
                criteria.append("this.CODPARC IN (SELECT DISTINCT(ITC.CODPARC) FROM TGFITC ITC WHERE ITC.CODPARC <> 0 AND ITC.CABECALHO = 'N' AND ITC.TIPOCOLPRECO = 'MANUAL' AND ITC.SITUACAO = 'P' AND ");
                criteria.append(getWhereClauseCotacaoManual("ITC", NaN) + ")");

                return criteria;
            }

            function habilitaCampoImpostosColetaManual() {
                var campos = getNomesCamposImpostos();

                campos.forEach(function (campo) {
                    var nomeCampo = campo;

                    if (_fieldsImpostoColManual.hasOwnProperty(nomeCampo)) {
                        var parentColManul = _fieldsImpostoColManual[nomeCampo];

                        if (parentColManul != null) {
                            parentColManul.setEnabled(!_preferencias["CALCULARIMPOSTOS"]);
                        }
                    }

                    if (_columnsImpostoColManual.hasOwnProperty(nomeCampo)) {
                        var coluna = _columnsImpostoColManual[nomeCampo];
                        coluna.editable = (!_preferencias["CALCULARIMPOSTOS"]);
                    }
                });
            }

            function getNomesCamposImpostos() {
                var camposImpostosList = [];

                camposImpostosList.push("ALIQIPI");
                camposImpostosList.push("ALIQICMS");
                camposImpostosList.push("DIFALIQICMS");
                camposImpostosList.push("ICMS");
                camposImpostosList.push("IPI");
                camposImpostosList.push("VLRSUBST");

                return camposImpostosList;
            }

            function $onInit() {

                self.onContentCreated({
                    $instance: _publicAPI
                });

            };

            function onDatasetCreated(dataSet) {

                if (dataSet.getEntityName() == 'Parceiro') {

                    self.dsParceiroItemCotacao = dataSet;

                    var criteriaProvider = new CriteriaProvider();
                    criteriaProvider.getCriteria = getCriteriaParceiroColeta;

                    self.dsParceiroItemCotacao.addCriteriaProvider(criteriaProvider);

                    self.dsParceiroItemCotacao.addLineChangeListener(function(newIndex){
                        if(self.dsItemColetaManualPersistent != null){
                            self.dsItemColetaManualPersistent.refresh();
                        }
                    });

                    dataSet.init();
                }


            }

            function onDatagridLoaded(datagrid) {

            }

            function onDatagridLoadedColeta(datagrid) {
                datagrid.setAwaitSaveToEdit(true);
            }

            function onDynaformLoaded(dynaform, dataset) {
                if (dynaform.getEntityName() == "ColetaItemCotacao") {

                    self.dynaformColetaItemCotacao = dynaform;
                    self.dsItemColetaManualPersistent = dataset;
                    self.dsItemColetaManualPersistent.setCrudListener("br.com.sankhya.cotacao.model.crudlisteners.ItemCotacaoCRUDListener");
                    self.dynaformColetaItemCotacao.getNavigatorAPI().showAddButton(false); 
                    var criteriaProvider = new CriteriaProvider();
                    criteriaProvider.getCriteria = getCriteria;
                    self.dsItemColetaManualPersistent.addCriteriaProvider(criteriaProvider);
                    
                    self.dsItemColetaManualPersistent.addDataSavedListener(function () {
						calculaTotalProdutoColetaManual();					
					});

                    self.dsItemColetaManualPersistent.addAllObserverEventsListener(function (event, parameters) {
                        if (event == DatasetObserverEvents.EVENT_CURRENT_RECORD_CHANGED){
                            var codProd = self.dsItemColetaManualPersistent.getFieldValueAsNumber("CODPROD");
                            _produtoDECVLRColManual = self.dsItemColetaManualPersistent.getFieldValueAsNumber("PRODDECVLR");
                            _produtoDECQTDColManual = self.dsItemColetaManualPersistent.getFieldValueAsNumber("PRODDECQTD");

                            personalizaItemCotacaoColManualPorProduto(codProd, _fieldControleColetaManual, _fieldQtdeColetaManual, _fieldPrecoColetaManual);

                            if (MGEParameters.asBoolean("TRABMOECOT")) {
                                enabledDisabledOperacaoMoedaManual();
                            }
                        } else if (event == DatasetObserverEvents.EVENT_RECORD_EDITED){
                            var modifiedFieldId = parameters.modifiedFieldId;

                            if (modifiedFieldId == "PRECO") {
                                var preco = self.dsItemColetaManualPersistent.getFieldValueAsNumberOrZero("PRECO");
                                if (preco > 0) {
                                    if (!_preferencias["CALCULARIMPOSTOS"]) {
                                        var aliqIcmsCalc2 = self.dsItemColetaManualPersistent.getFieldValueAsNumberOrZero("ALIQICMS");
                                        calculaValorCampo(self.dsItemColetaManualPersistent, aliqIcmsCalc2, "ALIQICMS", "ICMS", "field_tgfitc_aliqicms", true);
                                        calculaValorCampo(self.dsItemColetaManualPersistent, self.dsItemColetaManualPersistent.getFieldValueAsNumberOrZero("ALIQIPI"), "ALIQIPI", "IPI", "field_tgfitc_aliqipi", true);
                                    }
                                    calculaValorCampo(self.dsItemColetaManualPersistent, self.dsItemColetaManualPersistent.getFieldValueAsNumberOrZero("PERCDESC"), "PERCDESC", "VLRDESC", "field_tgfitc_vlrdesc", true);
                                    calculaValorCampo(self.dsItemColetaManualPersistent, self.dsItemColetaManualPersistent.getFieldValueAsNumberOrZero("PERCACRESC"), "PERCACRESC", "VLRACRESC", "field_tgfitc_vlracresc", false);
                                } else {
                                    self.dsItemColetaManualPersistent.setFieldValue("IPI", 0);
                                    self.dsItemColetaManualPersistent.setFieldValue("ICMS", 0);
                                    self.dsItemColetaManualPersistent.setFieldValue("VLRACRESC", 0);
                                    self.dsItemColetaManualPersistent.setFieldValue("VLRDESC", 0);
                                }
                                calculaTotalProdutoColetaManual();
                            }

                            if (modifiedFieldId == "ALIQIPI" && !_preferencias["CALCULARIMPOSTOS"]) {
                                calculaValorCampo(self.dsItemColetaManualPersistent, self.dsItemColetaManualPersistent.getFieldValueAsNumberOrZero("ALIQIPI"), "ALIQIPI", "IPI", "field_tgfitc_aliqipi", true);
                                calculaTotalProdutoColetaManual();
                            }
                            if (modifiedFieldId == "IPI" && !_preferencias["CALCULARIMPOSTOS"]) {
                                calculaPorcentagemCampo(self.dsItemColetaManualPersistent, "IPI", "ALIQIPI", "field_tgfitc_ipi", true);
                                calculaTotalProdutoColetaManual();
                            }
                            if (modifiedFieldId == "ICMS" && !_preferencias["CALCULARIMPOSTOS"]) {
                                calculaPorcentagemCampo(self.dsItemColetaManualPersistent, "ICMS", "ALIQICMS", "field_tgfitc_icms", true);
                                calculaTotalProdutoColetaManual();
                            }

                            if (modifiedFieldId == "FRETE" || modifiedFieldId == "OUTROS" || modifiedFieldId == "VLRSUBST") {
                                calculaTotalProdutoColetaManual();
                            }

                            if (modifiedFieldId == "ALIQICMS" && !_preferencias["CALCULARIMPOSTOS"]) {
                                var aliqCalc = self.dsItemColetaManualPersistent.getFieldValueAsNumberOrZero("ALIQICMS");
                                calculaValorCampo(self.dsItemColetaManualPersistent, aliqCalc, "ALIQICMS", "ICMS", "field_tgfitc_aliqicms", true);
                                calculaTotalProdutoColetaManual();
                            }
                            if (modifiedFieldId == "DIFALIQICMS" && !_preferencias["CALCULARIMPOSTOS"]) {
                                var aliqCalcDif = self.dsItemColetaManualPersistent.getFieldValueAsNumberOrZero("ALIQICMS");
                                calculaValorCampo(self.dsItemColetaManualPersistent, aliqCalcDif, "DIFALIQICMS", "ICMS", "field_tgfitc_aliqicms", true);
                                calculaTotalProdutoColetaManual();
                            }
                            if (modifiedFieldId == "VLRACRESC") {
                                calculaPorcentagemCampo(self.dsItemColetaManualPersistent, "VLRACRESC", "PERCACRESC", "field_tgfitc_vlracresc", false);
                                calculaTotalProdutoColetaManual();
                            }
                            if (modifiedFieldId == "PERCACRESC") {
                                calculaValorCampo(self.dsItemColetaManualPersistent, self.dsItemColetaManualPersistent.getFieldValueAsNumberOrZero("PERCACRESC"), "PERCACRESC", "VLRACRESC", "field_tgfitc_percacresc", false);
                                calculaTotalProdutoColetaManual();
                            }
                            if (modifiedFieldId == "VLRDESC") {
                                calculaPorcentagemCampo(self.dsItemColetaManualPersistent, "VLRDESC", "PERCDESC", "field_tgfitc_vlrdesc", true);
                                calculaTotalProdutoColetaManual();
                            }
                            if (modifiedFieldId == "PERCDESC") {
                                if (MGEParameters.asBoolean("TRABMOECOT")) {
                                    RotinaCotacaoUtil.recalcularValoresMoeda(modifiedFieldId, self.dsItemColetaManualPersistent);
                                } else {
                                    calculaValorCampo(self.dsItemColetaManualPersistent, self.dsItemColetaManualPersistent.getFieldValueAsNumberOrZero("PERCDESC"), "PERCDESC", "VLRDESC", "field_tgfitc_percdesc", true);
                                    calculaTotalProdutoColetaManual();
                                }
                            }

                            if (modifiedFieldId == "CODMOEDA") {
                                //Campos de Reais
                                self.dsItemColetaManualPersistent.setFieldValue("PRECO", 0);
                                self.dsItemColetaManualPersistent.setFieldValue("VLRDESC", 0);
                                self.dsItemColetaManualPersistent.setFieldValue("PERCDESC", 0);

                                //Campos de Moeda estranjeira
                                self.dsItemColetaManualPersistent.setFieldValue("PRECOMOE", 0);
                                self.dsItemColetaManualPersistent.setFieldValue("VLRDESCMOE", 0);
                                self.dsItemColetaManualPersistent.setFieldValue("VLRMOEDA", 0);

                                enabledDisabledOperacaoMoedaManual();
                            } else if (RotinaCotacaoUtil.CAMPOS_MOEDA.includes(modifiedFieldId)) {
                                RotinaCotacaoUtil.recalcularValoresMoeda(modifiedFieldId, self.dsItemColetaManualPersistent);
                            }
                        };
                    });

                    self.dsItemColetaManualPersistent.init();
                    self.dynaformColetaItemCotacao.goToGridView();
                };
            }

            function calculaTotalProdutoColetaManual() {
                var total = NumberUtils.format(RotinaCotacaoUtil.calculaTotalItemCotacaoByItem(self.dsItemColetaManualPersistent.getCurrentRowAsObject()), self.dsItemColetaManualPersistent.getFieldValueAsNumberOrZero("PRODDECVLR"));
                self.dsItemColetaManualPersistent.setFieldValue("TOTALPRODUTO",NumberUtils.stringToNumber(total));
            }

            function calculaPorcentagemCampo(ds, campoOrigem, campoDestino, chaveLabelCampo, validaMax) {
                _calculandoCampoPorcentagem = true;
                var strPrecoDig = ds.getFieldValueAsString("PRECO");
                var strValor = ds.getFieldValueAsString(campoOrigem);
                var precoDig = 0;
                var valor = 0;
                var valorValido = true;
                var labelCampo = i18n(chaveLabelCampo);

                if (!_calculandoCampoValor) {
                    if (StringUtils.emptyAsNull(strPrecoDig) != null) {
                        precoDig = ds.getFieldValueAsNumberOrZero("PRECO");
                    }
                    if (StringUtils.emptyAsNull(strValor) != null) {
                        valor = NumberUtils.stringToNumber(strValor);
                    }

                    if (precoDig > 0) {
                        if (validaMax && valor > precoDig) {
                            valorValido = false;
                            ds.setFieldValue(campoOrigem, 0);
                            _calculandoCampoPorcentagem = false;
                            MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n('cot_msgErrAliqMaiorPreco', [labelCampo]));
                        }

                        if (valorValido) {
                            var result = valor / precoDig * 100;
                            result = RotinaCotacaoUtil.getNumberWit2Digits(result, 2);
                            ds.setFieldValue(campoDestino, result);
                            _calculandoCampoPorcentagem = false;
                        }
                    } else {
                        ds.setFieldValue(campoDestino, 0);
                        _calculandoCampoPorcentagem = false;
                    }
                }
                _calculandoCampoPorcentagem = false;
            }


            function calculaValorCampo(ds, aliq, campoOrigem, campoDestino, chaveLabelCampo, validaMax100) {
                _calculandoCampoValor = true;
                var precoDig = ds.getFieldValueAsNumberOrZero("PRECO");

                if (!_calculandoCampoPorcentagem) {
                    var labelCampo = i18n(chaveLabelCampo);

                    if (aliq > 0) {
                        var aliqValida = true;

                        if (validaMax100 && aliq > 100) {
                            aliqValida = false;
                            ds.setFieldValue(campoOrigem, 0);
                            ds.setFieldValue(campoDestino, 0);
                            _calculandoCampoValor = false;
                            MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n('cot_msgErrAliqMaiorCem', [labelCampo]));
                        }

                        if (aliqValida) {
                            var result = precoDig * aliq / 100;
                            result = RotinaCotacaoUtil.getNumberWit2Digits(result, 2);

                            ds.setFieldValue(campoDestino, NumberUtils.stringToNumber(result));
                            _calculandoCampoValor = false;
                        }
                    } else {
                        ds.setFieldValue(campoOrigem, 0);
                        ds.setFieldValue(campoDestino, 0);
                        _calculandoCampoValor = false;
                    }
                }
                _calculandoCampoValor = false;
            }


            function enabledDisabledOperacaoMoedaManual() {
                var moedaPadrao = MGEParameters.asInteger("civil.moeda.padrao") ? MGEParameters.asInteger("civil.moeda.padrao") : 0;

                var isMoedaPadrao = self.dsItemColetaManualPersistent.getFieldValueAsNumberOrZero("CODMOEDA") == moedaPadrao;
                //Campos de Reais
                if (_fieldPrecoColetaManual != null) {
                    _fieldPrecoColetaManual.setEnabled(isMoedaPadrao);
                }
                if (_fieldDescPrecoColetaManual != null) {
                    _fieldDescPrecoColetaManual.setEnabled(isMoedaPadrao);
                    
                }

                //Campos de Moeda estranjeira
                if (_fieldPrecoMoeColetaManual != null) {
                    _fieldPrecoMoeColetaManual.setEnabled(!isMoedaPadrao);
                }
                if (_fieldDescMoedaColetaManual != null) {
                    _fieldDescMoedaColetaManual.setEnabled(!isMoedaPadrao);
                }
                if (_fieldVlrMoedaColetaManual != null) {
                    _fieldVlrMoedaColetaManual.setEnabled(!isMoedaPadrao);
                }
            }


            function personalizaItemCotacaoColManualPorProduto(codProd, campoControle, campoQuantidade, campoPreco) {
                if (codProd > 0) {
                    var objProduto = {};
                    var parametros = { parametros: { codProd: codProd } };


                    ServiceProxy.callService('mgecot@CotacaoSP.carregaConfigProduto', parametros)
                        .then(function (result) {

                            var produto = ObjectUtils.getProperty(result, 'responseBody.produto');

                            if (produto) {
                                objProduto["TIPCONTEST"] = produto.TIPCONTEST;
                                objProduto["LISCONTEST"] = produto.LISCONTEST;
                                objProduto["TITCONTEST"] = produto.TITCONTEST;
                                objProduto["USALOCAL"] = produto.USALOCAL;
                            }

                        });
                }
            }

            function atualizarControleUIColetaManual(controleUI, tipo, label, opcoes, novoItemCotacao) {
                /*	if(controleUI){
                        controleUI.enabled=false;
                        var formItem:FormItem = controleUI.parent as FormItem;
                        if(formItem){
                            var formLabel:String = null;
                        	
                            if(tipo == "S"){
                                formItem.includeInLayout = true;
                                formItem.visible = true;
                            	
                                formLabel = label;
                            	
                                if(opcoes){
                                    opcoes = StringUtils.replaceAll(opcoes, "${nl}", "\n");
                                    controleUI.populateCombo(opcoes);
                                    controleUI.enabled=false;
                                }
                                controleUI.selectUI(tipo);
                                formItem.label = (formLabel ? formLabel : resourceManager.getString('Producao:ProcessoProdutivo', 'controleProduto')) + ":";
                            }else{
                                formItem.includeInLayout = false;
                                formItem.visible = false;
                            }
                        }
                    }*/
            }

            function atualizaPrecisaoCampoQtdItemCotacao(campoQtd, precisao) {
                if (campoQtd) {
                    if (NumberUtils.getNumberOrZero(precisao) >= 2) {
                        campoQtd.scope.precision = NumberUtils.getNumberOrZero(precisao);
                    } else {
                        campoQtd.scope.precision = 2;
                    }
                }
            }

            function getCriteria() {
                var criteria = Criteria();

                if (_preferencias) {
                    self.dsItemColetaManualPersistent.addTXProperty("usa.ultimo.valor.unitario.compra", _preferencias["ULTIMOVALORCOMPRA"]);
                }

                var whereClauseProdutoString = getWhereClauseCotacaoManual("this", self.dsParceiroItemCotacao.getFieldValueAsNumber("CODPARC"));

                criteria.append(whereClauseProdutoString);

                return criteria;
            }

            function getWhereClauseCotacaoManual(aliasTabela, codParc) {
                var whereClauseProdutoString = ""

                if (!isNaN(codParc)) {
                    whereClauseProdutoString = " #NOMETABELA.CODPARC = " + codParc;
                } else {
                    whereClauseProdutoString = " #NOMETABELA.CODPARC <> 0";
                }

                whereClauseProdutoString += "  AND #NOMETABELA.CABECALHO = 'N' AND #NOMETABELA.TIPOCOLPRECO = 'MANUAL' AND #NOMETABELA.SITUACAO = 'P' "

                if (self.dsItemCotacao) {
                    var itensSelecionados = self.dsItemCotacao.getRecordsAsObjects();

                    var i = 0;

                    var criteriaProdutos = "";

                	for (i = 0; i < itensSelecionados.length; i++) {
                		
                		let diferenciador=angular.isDefined(itensSelecionados[i]["DIFERENCIADOR"]) ? itensSelecionados[i]["DIFERENCIADOR"]:"0";

                		if (i < itensSelecionados.length - 1) {
                			criteriaProdutos += "( #NOMETABELA.NUMCOTACAO = " + itensSelecionados[i]["NUMCOTACAO"] + " AND ";
                			criteriaProdutos += "#NOMETABELA.CODLOCAL = " + itensSelecionados[i]["CODLOCAL"] + " AND ";
                			criteriaProdutos += "#NOMETABELA.CODPROD = " + itensSelecionados[i]["CODPROD"] + " AND ";
                			criteriaProdutos += "#NOMETABELA.CONTROLE = '" + itensSelecionados[i]["CONTROLE"] + "' AND ";
                			criteriaProdutos += "#NOMETABELA.DIFERENCIADOR = " + diferenciador + " ) OR ";
                		} else {
                			criteriaProdutos += "( #NOMETABELA.NUMCOTACAO = " + itensSelecionados[i]["NUMCOTACAO"] + " AND ";
                			criteriaProdutos += "#NOMETABELA.CODLOCAL = " + itensSelecionados[i]["CODLOCAL"] + " AND ";
                			criteriaProdutos += "#NOMETABELA.CODPROD = " + itensSelecionados[i]["CODPROD"] + " AND ";
                			criteriaProdutos += "#NOMETABELA.CONTROLE = '" + itensSelecionados[i]["CONTROLE"] + "' AND ";
                			criteriaProdutos += "#NOMETABELA.DIFERENCIADOR = " + diferenciador + " ) )";
                		}
                    }
                	
                	if(StringUtils.isNotEmpty(criteriaProdutos)){
                	   whereClauseProdutoString += " AND ( "+ criteriaProdutos;
                	}
                } else if (self.dsCabCotacao) {
                    whereClauseProdutoString += " AND ( #NOMETABELA.NUMCOTACAO = " + self.dsCabCotacao.getFieldValueAsNumberOrZero("NUMCOTACAO") + " )";
                }

                whereClauseProdutoString = StringUtils.replaceAll(whereClauseProdutoString, "#NOMETABELA", aliasTabela);
               
                return whereClauseProdutoString;
            }

        }

    ]);