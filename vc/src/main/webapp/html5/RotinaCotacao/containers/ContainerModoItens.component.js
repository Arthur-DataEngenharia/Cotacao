/**
 * Created by Handz (Eduardo,Charles) on 10/02/2020.
 */
angular
    .module('RotinaCotacaoApp')
    .component('containerModoItens', {
        templateUrl: 'html5/RotinaCotacao/containers/ContainerModoItens.tpl.html',
        controller: 'ModoItensController',
        controllerAs: 'ctrl',
        bindings: {
            onContentCreated: '&?',
            configRotinaCotacao: '<',
            dsCabecalho: '<',
            showFiltroItens: '=?',
            showBotoesItens:'=?'
        }
    })
    .controller('ModoItensController', ['WhenReady', 'CadastroParceiroSimplificadoService', '$scope', 'MGEAuthorizationConstants', 'ServiceProxy', 'Criteria', 'ObjectUtils', 'MessageUtils', 'RotinaCotacaoUtil', 'SkApplicationInstance', 'SanPopup', 'MGEParameters', 'MGEAuthorizationService', 'NumberUtils', 'i18n', 'DateUtils', 'StringUtils', '$document', 'AngularUtil', 'ArrayUtils', '$rootScope', 'XmlJson', '$timeout','SkI18nService',
        function (WhenReady, CadastroParceiroSimplificadoService, $scope, MGEAuthorizationConstants, ServiceProxy, Criteria, ObjectUtils, MessageUtils, RotinaCotacaoUtil, SkApplicationInstance, SanPopup, MGEParameters, MGEAuthorizationService, NumberUtils, i18n, DateUtils, StringUtils, $document, AngularUtil, ArrayUtils, $rootScope, XmlJson, $timeout, SkI18nService) {
            var self = this;

            let _whenFormReady = WhenReady();
            var _publicAPI = {};
            _publicAPI.loadByPK = loadByPK;
            _publicAPI.setResourceID = setResourceID;
            _publicAPI.setInstance = setInstance;

            ObjectUtils.implements(self, IDynaformInterceptor);
            ObjectUtils.implements(self, IFormInterceptor);
            ObjectUtils.implements(self, IDatagridInterceptor);
            ObjectUtils.implements(self, IFilterPanelInterceptor);


            $scope.formInterceptor = new IFormInterceptor();
            $scope.formInterceptor.interceptBuildField = interceptBuildFieldNovo;
            $scope.formInterceptor.interceptFieldElement = interceptFieldElementColetaItemCotacaoName;
            $scope.formInterceptor.acceptField = acceptFieldNovo;

            $scope.novoDataGridInterceptor = new IDatagridInterceptor();
            $scope.novoDataGridInterceptor.acceptColumnField = visitColumnItemCotacaoNovo;
            

            self.$onInit = $onInit;            
            self.createDataSetCabCot = createDataSetCabCot;
            self.createDataSetItemCot = createDataSetItemCot;
            self.onColetaPreferencias = onColetaPreferencias;
            self.interceptFieldMetadata = interceptFieldMetadata;
            self.interceptColumnMetadata = interceptColumnMetadata;
            self.onFilterCreated = onFilterCreated;
            self.onDynaformLoaded = onDynaformLoaded;
            self.buildDynaOptions = buildDynaOptions;
            self.coletaManual = coletaManual;
            self.btnAprovClicked = btnAprovClicked;
            self.btnUltCompClicked = btnUltCompClicked;
            self.btnDtEntregaClicked = btnDtEntregaClicked;
            self.btnCalCustosClicked = btnCalCustosClicked;
            self.onDataGridLoaded = onDataGridLoaded;
            self.gerarPedidos = gerarPedidos;
            self.geraPedidoNovoServico = geraPedidoNovoServico;
            self.openParametrosGeraPedidoPopup = openParametrosGeraPedidoPopup;
            self.aprovarCotacaoProdutoComPopUpResumo = aprovarCotacaoProdutoComPopUpResumo;
            self.addProdutos = addProdutos;
            self.carregaPreferencias = carregaPreferencias;
            self.filtrarItensCotacao = filtrarItensCotacao;
            self.cancelAddProdutosCotacao = cancelAddProdutosCotacao;
            self.confirmarInclusaoAlteracaoCabecalho = confirmarInclusaoAlteracaoCabecalho;
            self.customTabsLoader = customTabsLoader;
            self.selectTabIndex = selectTabIndex;
            self.interceptItemEditor = interceptItemEditor;
            self.abasCotacaoCreated = abasCotacaoCreated;
            self.fieldFilterFunction = fieldFilterFunction;
            self.acceptColumnField = acceptColumnField;
            self.acceptField = acceptField;
            self.interceptBuildField = buildField;
            self.buildFieldContainer = buildFieldContainer;
            self.interceptFieldElement = interceptFieldElement;
            self.fechaPreferencias = fechaPreferencias;
            self.voltarPreferencias = voltarPreferencias;
            self.salvarPreferencias = salvarPreferencias;
            self.onColetaCreated = onColetaCreated;
            self.voltarColetaManual = voltarColetaManual;
            self.refreshHandlerNovaCotacao = refreshHandlerNovaCotacao;
            self.getCellColors = getCellColors;
            self.clearFilter = clearFilter;
            self.onFormLoaded = onFormLoadedItemCotacaoNovo;
            self.enviarProdutosPortal = enviarProdutosPortal;
            self.onGerarPedidoCreated = onGerarPedidoCreated;
            self.voltarGerarPedido = voltarGerarPedido;
            self.currentIndiceColeta = 0;
            self.salvandoColeta = false;
            self.disabledAprovDesaprov = true;
            
            self.dsCabecalhoCotacaoNovoRecords = [];
            self.dsCabecalhoCotacaoNovo;
            self.dsItemCotacaoNovo;
            self.dsItemCotacao;
            self.preferenciasPanel;
            self.resourceIDItens = SkApplicationInstance.getResourceID();
            self.canEdit;
            self.canInsert;
            self.canRemove;
            self.dsColetaItemCotacao;
            self.labelAprovDesaprov = i18n('cot_labelAprovar');
            self.itemCotacaoSel;
            self.strTitleNovaCotacao;
            self.editProfile = false;
            self.pesqCentCus;
            self.camposFiltro;
            self.rotinaCotacaoInstance;
            self.preferencias = {};
            self.corLegendaColetaMNRespondida = '#ADD8E6';
            self.corLegendaEmpate = '#F0E68C';
            self.corLegendaNegociar = '#FA8072';
            self.resumoItensAprovados;
            self.abaItensCotacao = true;
            self.loadOnInitialize = MGEParameters.asBoolean("global.carregar.registros.iniciar.tela");

            //Vars
            var _salvarFiltro = false;
            var _formApiItemCotacao;
            var _itemCotacaoControle;
            var _fieldQtdProduto;
            var _fieldPrecoColetaItem;
            var _atualizarProdutoParceiros;
            var _fieldTotProdColetaItem;
            var _produtoDECVLR;
            var _decimaisImp = MGEParameters.asInteger("mgecot.decimais.valor.impostos.unitarios.cotacao");
            var _decvlrmoeda = MGEParameters.asInteger("mgefin.decimais.calc.moeda") > 0 ? MGEParameters.asInteger("mgefin.decimais.calc.moeda") : 5;
            var _calculandoCampoValor;
            var _parmPermiteDesaprovar;
            var _isNew = true;
            var _localItemCotacaoNovo;
            var _abrePopUpCotacao;
            var _camposSomenteColeta = { TOTALPRODUTO: null, CONDPAGT: null, QTDPARCPAGT: null, PRAZOPARC: null };
           
            var _agrupMinItemCotacaoNovo;
            var _itemCotacaoControleNovo;
            var _fieldQtdProdutoNovo;
            var _fieldLocalColetaItemNovo;
            var _fieldVolumeColetaItemNovo;

            var _calculandoCampoPorcentagem;
            var _dynaformItemCotacao;
            var _columnsImposto = {};
            var _decimaisCusto = MGEParameters.asInteger("com.decimais.custo");

            var _produto = {}
            var _keymap = {
                F2: 113
            };


            const MAIN_PANEL = 0;
            const NOVA_COTACAO = 1;
            const PREFERENCIAS_PANEL = 2;
            const COLETA_MANUAL_PANEL = 3;
            const GERAR_PEDIDO = 4;


            function $onInit() {
                registerConfigTabPeso();

                self.onContentCreated({
                    $instance: _publicAPI
                });

                MGEAuthorizationService.loadAuthorization(self.resourceIDItens).then(function (authData) {
                    self.canEdit = authData.hasAccess(MGEAuthorizationConstants.ACCESS_CONTROL_UPDATE);
                    self.canInsert = authData.hasAccess(MGEAuthorizationConstants.ACCESS_CONTROL_INSERT);
                    self.canRemove = authData.hasAccess(MGEAuthorizationConstants.ACCESS_CONTROL_REMOVE);
                });

                ServiceProxy.addClientEvent('br.com.sankhya.cotacao.novos.enviar.email', function (clientEvent) {
                    enviarEmail(clientEvent);
                });
            };

            function registerConfigTabPeso() {
                self.configTab = function (oConfig) {
                    $rootScope.$broadcast('configTab', oConfig);
                };

            }
            function possuiItensSelecionados() {
                var itens = getItensSelecionados();
                return null != itens && itens.length > 0
            }

            function setInstance(instance) {
                self.rotinaCotacaoInstance = instance;
                self.rotinaCotacaoInstance.configPreferencias
            }

            function salvarPreferencias() {
                var configPreferencias = self.preferenciasPanel.getConfig(false);
                
                Object.keys(configPreferencias).forEach(function(conf){
					if(angular.isDefined(configPreferencias[conf].$)){
						configPreferencias[conf] = configPreferencias[conf].$;
					}
				});
                
                self.rotinaCotacaoInstance.setConfigPreferencias(configPreferencias);
                SkApplicationInstance.saveMgeConfig(self.resourceID, configPreferencias);
                self.preferencias["CALCULARCUSTOS"] = configPreferencias.calculaCusto.$=="true";
				self.preferencias["CALCULARIMPOSTOS"] = configPreferencias.calculaImpostos.$=="true";
                habilitaCamposImpostos();
                self.indiceViewStack = MAIN_PANEL;
            }
            
            function visitColumnItemCotacaoNovo(fieldMD, dataset) {
                if ("CODPARC,DTLIMITE,DIFERENCIADOR,CABECALHO,CONTROLE,CODLOCAL,LocalEstoque_DESCRLOCAL,SITUACAO,STATUSPRODCOT".indexOf(fieldMD.name) > -1) {
                    return false;
                }
                if (fieldMD.name.indexOf("Parceiro_") > -1) {
                    return false;
                }
                if (("CODLOCAL,LocalEstoque_DESCRLOCAL".indexOf(fieldMD.name) > -1) && !MGEParameters.asBoolean("UTILIZALOCAL")) {
                    return false;
                }
                return true;
            }

            function avaliaCamposMoeda(entityName, fieldName) {
                if (entityName == "ColetaItemCotacao" && RotinaCotacaoUtil.CAMPOS_MOEDA.includes(fieldName)) {
                    return MGEParameters.asBoolean("TRABMOECOT") ? 1 : -1;
                }
                return 0;
            }

            function interceptBuildFieldNovo(fieldName, dataSet, fieldProp, scope) {

                if (dataSet.getEntityName() == "CabecalhoCotacao") {
                    if (fieldName == "NUMCOTACAO") {
                        fieldProp['sk-disabled'] = true;
                        fieldProp['sk-enabled'] = false;
                    }

                }

                if (dataSet.getEntityName() == "ItemCotacao") {
                    if (fieldName == "CONTROLE") {
                        return AngularUtil.createDirective('sk-controle-estoque-input', fieldProp, scope);
                    } else if (fieldName == "OBS") {
                        fieldProp['sk-height'] = '80px';
                        return AngularUtil.createDirective('sk-text-area', fieldProp, scope);
                    }

                    if (fieldName == "CODPROD") {
					    fieldProp['sk-entity-name'] = 'Produto';
					    fieldProp['sk-field-name'] = 'CODPROD';
					    fieldProp['sk-entity-change'] = "alteraProduto('item')";
					    scope.alteraProduto = alteraProduto;
					    return AngularUtil.createDirective('sk-pesquisa-input', fieldProp, scope);
					}

                    if (fieldName == "CODVOL") {
                        fieldProp['sk-entity-name'] = 'Volume';
                        fieldProp['sk-field-name'] = 'CODVOL';
                        fieldProp['sk-enviroment-criteria'] = 'getEnviromentCriteria()';

                        scope.getEnviromentCriteria = getCodVolProdCriteria;


                        return AngularUtil.createDirective('sk-pesquisa-input', fieldProp, scope);
                    }
                }

                return null;
            }
            
            function alteraProduto(){
				var codProd = self.dsItemCotacaoNovo.getFieldValueAsNumberOrZero("CODPROD");
				if(codProd != 0){
					personalizaItemCotacaoNovoPorProduto(codProd);
		            atualizaCriteriaVolumeItemCotacaoNovo();
		            buscaUsaLocalProduto(codProd);
		            self.dsItemCotacaoNovo.setFieldValue("CONTROLE", "");
		            sugereUnidadePadrao();
	                carregaComplementoProduto();	
				}
			}

            function voltarColetaManual() {
                _salvarFiltro = false;
                self.indiceViewStack = MAIN_PANEL;
                refreshDsItemCotacao();
            }

            function buildFieldContainer(fieldName, dataset, fieldElem, scope) {
                if (fieldName == "CODMOEDA") {
                    fieldElem.attr('flex', '');

                    scope.openPopupCotacaoMoeda = function () {
                        var codMoeda = dataset.getFieldValueAsNumber("CODMOEDA");
                        if (isNaN(codMoeda)) {
                            MessageUtils.showAlert(i18n('Cotacao.RotinaCotacao.SelecioneMoedabuscarCotacao'));
                        } else if (codMoeda != 0) {
                            createPopupCotacaoMoeda(codMoeda);
                        }
                    };

                    var iconCotacao = AngularUtil.createDirective('sk-icon', {
                        'font-icon': 'coins',
                        'class': 'icon',
                        'alt':'Moeda'
                    }, scope);


                    var btnCotacao = AngularUtil.createDirective('button', {
                        'tooltip': "Cotação",
                        'ng-click': "openPopupCotacaoMoeda()",
                        'default': '',
                        'small': '',
                        'sk-width': '40px',
                        'sk-height': '20px',
                        'sk-margin-left': '2px',
                        'sk-padding-top': '1px'
                    }, scope);

                    btnCotacao.append(iconCotacao);

                    var hBoxElem = AngularUtil.createDirective('sk-hbox', {
                        'layout-align': 'center center',
                        'sk-column': '1'
                    }, scope);
                    
                    hBoxElem.append(fieldElem);
                    hBoxElem.append(btnCotacao);

                    return hBoxElem;
                }

            }

            function buildField(fieldName, dataset, fieldProp, scope) {

                if (dataset.getEntityName() == self.dsItemCotacaoName) {
                    if (fieldName == "QTDCOTADA") {

                        return AngularUtil.createDirective('sk-number-input', fieldProp, scope);
                    }
                    if (fieldName == "MARCA") {
                        
                        return AngularUtil.createDirective('sk-text-input', fieldProp, scope);
                    }
                    if (fieldName == "CODVOL") {

                        fieldProp['sk-entity-name'] = 'Volume';
                        fieldProp['sk-field-name'] = 'CODVOL';
                        fieldProp['sk-enviroment-criteria'] = 'getEnviromentCriteria()';

                        scope.getEnviromentCriteria = getCodVolProdCriteriaItemCotacao;


                        return AngularUtil.createDirective('sk-pesquisa-input', fieldProp, scope);
                    }
                    if (fieldName == "CONTROLE") {
						fieldProp['sk-disabled'] = true;
                        return AngularUtil.createDirective('sk-controle-estoque-input', fieldProp, scope);
                	}
                } else if (dataset.getEntityName() == self.dsColetaItemCotacaoName) {
	
					if(fieldName == "ALIQIPI" || fieldName == "ALIQICMS" || fieldName == "IPI" || fieldName == "ICMS"){
                        fieldProp['sk-enabled'] = !self.preferencias.CALCULARIMPOSTOS;
                    }

                    if (fieldName == "OBS") {
                        fieldProp['sk-height'] = '80px';

                        return AngularUtil.createDirective('sk-text-area', fieldProp, scope);
                    }
                    if (fieldName == "DTMOEDA") {
                        return AngularUtil.createDirective('sk-date-input', fieldProp, scope);
                    }
                    if (fieldName == "VLRMOEDA") {
                        fieldProp['sk-precision'] = _decvlrmoeda;

                        return AngularUtil.createDirective('sk-number-input', fieldProp, scope);
                    }

                    if (fieldName == "VLRSUBST" || fieldName == "IPI" || fieldName == "ICMS" || fieldName == "FRETE") {
                    	fieldProp['sk-precision'] = _decimaisImp;
                    }
                    
                    if (fieldName == "CODMOEDA") {
                        fieldProp['sk-entity-name'] = 'Moeda';
                        fieldProp['sk-field-name'] = 'CODMOEDA';
                        fieldProp['sk-enviroment-criteria'] = 'getEnviromentCriteria()';
                        fieldProp['sk-entity-change'] = 'updateVLRMOEDAColetaItem(item)';

                        scope.getEnviromentCriteria = getCriteriaColetaItem;
                        scope.updateVLRMOEDAColetaItem = onEntityChangeCodMoeda;

                        var _campoMoedaNew = AngularUtil.createDirective('sk-pesquisa-input', fieldProp, scope);

                        return _campoMoedaNew;
                    }

                    if (fieldName == "PRECO") {
                        fieldProp["sk-precision"] = _decimaisCusto;

                        fieldProp["sk-visible"] = true;
                        //fieldProp["sk-enabled"] = true;

                        return AngularUtil.createDirective('sk-number-input', fieldProp, scope);
                    }

                    if (fieldName == "VLRDESC" || fieldName == "PERCDESC" || fieldName == "PERCACRESC" || fieldName == "VLRACRESC" || fieldName == "OUTROS") {
                        fieldProp["sk-precision"] = _decimaisCusto;
                        return AngularUtil.createDirective('sk-number-input', fieldProp, scope);
                    }

                    if (fieldName == "PRECOMOE") {
                        fieldProp["sk-precision"] = _decvlrmoeda;
                        return AngularUtil.createDirective('sk-number-input', fieldProp, scope);
                    }

                    if (fieldName == "VLRDESCMOE") {
                        return AngularUtil.createDirective('sk-number-input', fieldProp, scope);
                    }

                    if (fieldName == "TOTALPRODUTO") {
                        fieldProp["sk-precision"] = _decimaisCusto;
                        return AngularUtil.createDirective('sk-number-input', fieldProp, scope);
                    }

                    if (fieldName == "CONFIABFORN") {
                        fieldProp['sk-max-value'] = 10;
                        fieldProp['sk-min-value'] = 0;
                        fieldProp['sk-width'] = 100;
                        fieldProp['style'] = "textAlign : right;";

                        return AngularUtil.createDirective('sk-numeric-stepper', fieldProp, scope);
                    }

                    if (fieldName == "QUALATEND") {
                        fieldProp['sk-max-value'] = 10;
                        fieldProp['sk-min-value'] = 0;
                        fieldProp['sk-width'] = 100;
                        fieldProp['style'] = "textAlign : right;";

                        return AngularUtil.createDirective('sk-numeric-stepper', fieldProp, scope);
                    }

                    if (fieldName == "QUALPROD") {
                        fieldProp['sk-max-value'] = 10;
                        fieldProp['sk-min-value'] = 0;
                        fieldProp['sk-width'] = 100;
                        fieldProp['style'] = "textAlign : right;";

                        return AngularUtil.createDirective('sk-numeric-stepper', fieldProp, scope);
                    }
                }

                return null;
            }

            function getCellColors(row, col, rowIndex, colIndex, gridApi, params) {
                if (params.dataset.getEntityName() == "ColetaItemCotacao") {
                    var situacao = self.dsColetaItemCotacao.getFieldIndexByName('SITUACAO');
                    var melhor = self.dsColetaItemCotacao.getFieldIndexByName('MELHOR');
                    var tipColPreco = self.dsColetaItemCotacao.getFieldIndexByName('TIPOCOLPRECO');
                    var obs = self.dsColetaItemCotacao.getFieldIndexByName('OBS');

                    if (angular.isDefined(row.entity)) {
                        var color;
                        if (row.entity[tipColPreco] == "MANUAL" && row.entity[situacao] == "P" && row.entity[melhor] != 'I') {
                            color = "#ADD8E6";
                        } else if (row.entity[situacao] == "G") {
                            var observacao = row.entity[obs];
                            if (!(StringUtils.emptyAsNull(observacao) == null)) {
                                color = "#FA8072";
                            }
                        } else if (row.entity[melhor] == "I" && row.entity[situacao] == "R") {
                            color = "#F0E68C";
                        }

                        return { bgColor: color };
                    }
                }

            }

            function fechaPreferencias() {
                carregaPreferencias(function () {
                    habilitaCamposImpostos();
                    self.indiceViewStack = MAIN_PANEL;
                });
            }

            function habilitaCamposImpostos() {
                habilitaCampoImpostosColeta();
                self.btnCalCustosEnabled = self.preferencias["CALCULARCUSTOS"] || self.preferencias["CALCULARIMPOSTOS"];

            }

            function getCodVolProdCriteriaItemCotacao() {
                var codProd = self.dsItemCotacao.getFieldValueAsString("CODPROD");

                if (StringUtils.emptyAsNull(codProd) != null && "0" != codProd) {
                    return new Criteria("this.CODVOL IN (SELECT DISTINCT(V.CODVOL) FROM TGFVOL V WHERE V.CODVOL IN(SELECT VO.CODVOL FROM TGFVOA VO INNER JOIN TGFPRO P ON P.CODPROD = VO.CODPROD AND P.CODPROD=" + codProd + " UNION  SELECT P.CODVOL FROM TGFPRO P WHERE P.CODPROD=" + codProd + "))");
                }
            }

            function getCodVolProdCriteria() {
                var codProd = self.dsItemCotacaoNovo.getFieldValueAsString("CODPROD");

                if (StringUtils.emptyAsNull(codProd) != null && "0" != codProd) {
                    return new Criteria("this.CODVOL IN (SELECT DISTINCT(V.CODVOL) FROM TGFVOL V WHERE V.CODVOL IN(SELECT VO.CODVOL FROM TGFVOA VO INNER JOIN TGFPRO P ON P.CODPROD = VO.CODPROD AND P.CODPROD=" + codProd + " UNION  SELECT P.CODVOL FROM TGFPRO P WHERE P.CODPROD=" + codProd + "))");
                }
            }

            function acceptField(field, dataset) {
                var entityName = dataset.getEntityName();
                var fieldName = field.name;

                var avaliacaoMoeda = avaliaCamposMoeda(entityName, fieldName);

                if (avaliacaoMoeda != 0) {
                    return avaliacaoMoeda > 0;
                }


                if (!MGEParameters.asBoolean("USANROOSCOT") && (fieldName == "NUMEROOS")) {
                    return false;
                }

                if (entityName == "ColetaItemCotacao") {

                    if ("@MARCA@CODVOL@CODVOL@QTDCOTADA@".indexOf("@" + fieldName + "@") > -1) {
                        return false;
                    }
                    if ("ULTVLRUNITCOMP" == fieldName && !self.preferencias["ULTIMOVALORCOMPRA"]) {
                        return false;
                    }

                    return true;

                } else if (entityName == "ItemCotacao") {
                    if (_camposSomenteColeta.hasOwnProperty(fieldName)) {
                        return false;
                    }
                    if (self.dsCabecalho && fieldName == "NUMCOTACAO") {
                        return false;
                    }
                    return true;
                }

                return true;

            }
            
            function acceptColumnField(fieldMD, dataSet) {
                var fieldName = fieldMD.name;

                var avaliacaoMoeda = avaliaCamposMoeda(dataSet.getEntityName(), fieldName);

                if(fieldMD.id == "CODPRODESP"){
                    fieldMD.visible = true;
                }
                if(fieldMD.id == "PRECOMOE"){
                    fieldMD.visible = true;
                }
                if(fieldMD.id == "VLRDESCMOE"){
                    fieldMD.visible = true;
                }
                if(fieldMD.id == "CODMOEDA"){
                    fieldMD.visible = true;
                }
                if(fieldMD.id == "COMPLDESC"){
                    fieldMD.visible = true;
                }
                if(fieldMD.id == "PRECO"){
                	fieldMD.visible = true;
                }

                if(fieldMD.id == "CODMOTCAN" || fieldMD.id == "MOTIVO" || fieldMD.id == "OBSMOTCANC"){
                	if(MGEParameters.asBoolean("INFMOTCANCOT")){                		
                		fieldMD.visible = true;
                	} else {
                		fieldMD.visible = false;
                	}
                }

                if (avaliacaoMoeda != 0) {
                    return avaliacaoMoeda > 0;
                }

                if (!MGEParameters.asBoolean("USANROOSCOT") && (fieldName == "NUMEROOS")) {
                    return false;
                }
                if (dataSet.getEntityName() == self.dsItemCotacaoName) {

                    if (fieldName.indexOf("Parceiro_") > -1) {
                        return false;
                    } else if ("CODPARC" == fieldName) {
                        return false;
                    } else if ("TOTALPRODUTO" == fieldName) {
                        return false;
                    } else if (_camposSomenteColeta.hasOwnProperty(fieldName)) {
                        return false;
                    } else {
                        return true;
                    }

                } else if (dataSet.getEntityName() == self.dsColetaItemCotacaoName) {
                    if ("CODVOL" == fieldName || fieldName.lastIndexOf("Volume_") > -1) {
                        return false;
                    }
                    else if ("QTDCOTADA" == fieldName) {
                        return false;
                    }
                }

                return true;
            }

            function getValueByEntityChange(item, fieldName) {
                var value;
                if (item) {
                    var value = item.key;
                    if (angular.isUndefined(value) && angular.isDefined(item.data)) {
                        value = item.data[fieldName];

                        if (angular.isUndefined(value)) {
                            value = item.data;
                        }
                    }
                }
                return value;
            }

            function createPopupCotacaoMoeda(codMoeda) {
                if (self.dsColetaItemCotacao.getFieldValueAsNumberOrZero("CODPARC") == 0) {
                    MessageUtils.showError(i18n('Cotacao.RotinaCotacao.textoInfParcAntesPesqMoeda'));
                    return;
                }

                SanPopup.open({
                    title: i18n('Cotacao.RotinaCotacao.itemCotacaoMoedas'),
                    templateUrl: 'html5/RotinaCotacao/popup/PopUpCotacaoMoeda.html',
                    controller: 'PopUpCotacaoMoedaController',
                    controllerAs: 'ctrl',
                    size: 'lg',
                    cancelBtnLabel: i18n("Geral.buttonFechar"),
                    showBtnOk: true,
                    okBtnLabel: i18n('Cotacao.RotinaCotacao.buttonUsarCotacao'),
                    resolve: {
                        data: {
                            codMoeda: codMoeda,
                            mostarColunaCodMoeda: false
                        }
                    }
                }).result.then((response) => {
                    if (!isNaN(response.CODMOEDA != null)) {
                        var codMoeda = response.CODMOEDA;
                        var cotacao = response.COTACAO;

                        if (self.dsColetaItemCotacao.getFieldValueAsNumber("CODMOEDA") != codMoeda) {
                            _abrePopUpCotacao = false;
                            self.dsColetaItemCotacao.setFieldValue("CODMOEDA", codMoeda);
                        }

                        self.dsColetaItemCotacao.setFieldValue("VLRMOEDA", cotacao);
                    }
                });
            }

            function onEntityChangeCodMoeda(item) {
                if (item && !item.programmatically) {
                    var codMoeda = getValueByEntityChange(item, 'CODMOEDA');

                    var parametros = { parametros: { CODMOEDA: codMoeda, CODPARC: self.dsColetaItemCotacao.getFieldValueAsNumberOrZero("CODPARC") } };


                    ServiceProxy.callService(
                        "mgecot@CotacaoSP.buscarCotacaoParceiro", parametros).then(function (result) {
                            var dadosCotacao = ObjectUtils.getProperty(result, 'responseBody.cotacaoparceiro');

                            var valorMoeda = NumberUtils.stringToNumber(dadosCotacao.COTACAO);

                            if (NumberUtils.getNumberOrZero(valorMoeda) != 0) {
                                self.dsColetaItemCotacao.setFieldValue("VLRMOEDA", valorMoeda);
                            } else {
                                if (self.dsColetaItemCotacao.getFieldValueAsNumberOrZero("CODMOEDA") != 0 && _abrePopUpCotacao) {
                                    self.dsColetaItemCotacao.setFieldValue("VLRMOEDA", null);
                                    createPopupCotacaoMoeda();
                                }
                                _abrePopUpCotacao = true;
                            }


                        });
                }
            }


            function fieldFilterFunction(item) {

                if (ArrayUtils.isIn(camposFiltro, item.name)) {
                    return false;
                }

                return true;
            }

            function loadByPK(objPK) {
                _whenFormReady.whenReady().then(function () {
                    if (objPK != null) {
                        if (objPK.hasOwnProperty("NUMCOTACAO")) {
                            self.numCotacaoToLoad = objPK["NUMCOTACAO"];

                            if (self.dsItemCotacao.isLoaded()) {
                                loadByNumCotacao();
                            } else {
                                self.dsItemCotacao.addEventListener(DatasetEvents.ON_METADATA_UPDATED, loadByNumCotacao);
                            }
                        } else {
                            _dynaformItemCotacao.loadByPK(objPK);
                        }
                    }
                });
            }

            function interceptItemEditor(column, dataset) {
                var fieldName = column.skName;

                if (fieldName == "DTMOEDA") {
                    column.editable = false;
                    column.labelFunction = function (item, col) {
                        var dataSimples = DateUtil.format(item[col.name], "DD/MM/YYYY");
                        return dataSimples;
                    }
                }
                if (fieldName == "PRECO") {
                    column.editable = self.dsColetaItemCotacao != null && self.dsColetaItemCotacao.getFieldValueAsNumberOrZero("CODMOEDA") == MGEParameters.asInteger("civil.moeda.padrao");
                    column.editorCachable = false;
                    column.skPrecision = dataset.getFieldValue("PRODDECVLR") ? dataset.getFieldValue("PRODDECVLR") : 2;
                }
                if (fieldName == "ULTVLRUNITCOMP") {
                    column.labelFunction = function (item, col) {
                        var qtdDigitos = item["PRODDECVLR"] > 0 ? item["PRODDECVLR"] : 2;
                        return NumberUtils.stringToNumber(item[col.name], qtdDigitos);
                    }
                }
                if (fieldName == "VLRMOEDA") {
                    column.labelFunction = function (item, col) {
                        var qtdDigitos = _decvlrmoeda;
                        return NumberUtils.stringToNumber(item[col.name], qtdDigitos);
                    }
                }
                if (fieldName == "PRECOMOE") {
                    column.labelFunction = function (item, col) {
                        var qtdDigitos = _decvlrmoeda;
                        return NumberUtils.stringToNumber(item[col.name], qtdDigitos);
                    }
                }
                if (fieldName == "RESULTCOT") {
                    column.labelFunction = function (item, col) {
                        var qtdDigitos = item["PRODDECVLR"] > 0 ? item["PRODDECVLR"] : 2;
                        return NumberUtils.stringToNumber(item[col.name], qtdDigitos);
                    }
                }
                if (fieldName == "QTDCOTADA") {
                    column.labelFunction = function (item, col) {
                        var qtdDigitos = item["PRODDECQTD"] > 0 ? item["PRODDECQTD"] : 2;
                        return NumberUtils.stringToNumber(item[col.name], qtdDigitos);
                    }
                }
                if (fieldName == "TOTALPRODUTO") {
                    column.labelFunction = function (item, col) {
                        let totalProduto = RotinaCotacaoUtil.calculaTotalItemCotacaoByItem(item);
                        return NumberUtils.stringToNumber(Number(totalProduto), _decimaisCusto);
                    }
                    column.editable = false;
                    column.skPrecision = _decimaisCusto;
                }

                if (fieldName == "PERCDESC" || fieldName == "VLRDESC" || fieldName == "PERCACRESC" || fieldName == "VLRACRESC" || fieldName == "OUTROS") {
                    column.labelFunction = function (item, col) {
                        return NumberUtils.stringToNumber(item[col.name], _decimaisCusto);
                    }
                    column.skPrecision = _decimaisCusto;
                }

                if ("ULTVLRUNITCOMP".indexOf(fieldName) > -1 && !self.preferencias["ULTIMOVALORCOMPRA"]) {
                    column.visible = false;
                }

                if (fieldName == "ICMS" || fieldName == "IPI" || fieldName == "ALIQICMS" || fieldName == "ALIQIPI" || fieldName == "RESULTCOT") {
                    column.editable = false;
                    column.addCustomProperty('sk-enabled', !self.preferencias["CALCULARIMPOSTOS"]);
                }

                if (getNomesCamposImpostos().indexOf(fieldName) >= 0) {
                    column.editable = (!self.preferencias["CALCULARIMPOSTOS"]);
                    _columnsImposto[fieldName] = column;
                    
	                if (fieldName == "ICMS" || fieldName == "IPI" || fieldName == "VLRSUBST") {
	                	column.labelFunction = function (item, col) {
	                        var qtdDigitos = _decimaisImp;
	
	                        return NumberUtils.stringToNumber(item[col.name], qtdDigitos);
	                    }
	                }
	
                }

            }

            function setResourceID(resourceID) {
                self.resourceID = resourceID;
            }

            function loadByNumCotacao() {
                if (self.dsItemCotacao != null) {
                    self.dsItemCotacao.refresh(getCriteriaByNumCotacao());
                    self.numCotacaoToLoad = null;
                }
            }


            function onDataGridLoaded(datagrid, dataset) {

            }

            function possuiSomenteItensAprovados(itensFiltrados) {

                var itensFiltrados = self.dsItemCotacao.getRecordsAsObjects();

                var somenteItensAprovados = true;
                itensFiltrados.every(function (item) {
                    if (!(item["STATUSPRODCOT"] == "A")) {
                        somenteItensAprovados = false;
                        return false;
                    }
                    return true;
                });

                return somenteItensAprovados;
            }

            function possuiSomenteItensPrecificados(itensFiltrados) {

                var itensFiltrados = self.dsItemCotacao.getRecordsAsObjects();

                var somenteItensAprovados = true;
                itensFiltrados.every(function (item) {
                    if (!(item["STATUSPRODCOT"] == "P")) {
                        somenteItensAprovados = false;
                        return false;
                    }
                    return true;
                });

                return somenteItensAprovados;
            }


            function createDataSetItemCot(dataset) {
                if (dataset.getEntityName() == "ItemCotacao") {
                    self.dsItemCotacaoNovo = dataset;
                    self.dsItemCotacaoNovo.setRequiredMembroPK(false);

                    self.dsItemCotacaoNovo.whenMetadataLoaded().then(() => {
                        self.dsItemCotacaoNovo.canEdit = self.canEdit;
                        self.dsItemCotacaoNovo.canInsert = self.canInsert;
                        self.dsItemCotacaoNovo.canRemove = self.canRemove;

                    });                 
                    
                    self.dsItemCotacaoNovo.init().then(function(){
                        self.dsItemCotacaoNovo.getFieldsMetadata().forEach(function (field) {

                            if(field.id == "CODMOTCAN" || field.id == "MOTIVO" || field.id == "OBSMOTCANC"){
                            	field.visible = false;
                            }
                        });
                    });

                }
            }

            function createDataSetCabCot(dataset) {
                self.dsCabecalhoCotacaoNovo = dataset;

                self.dsCabecalhoCotacaoNovo.whenMetadataLoaded().then(function () {
                    self.dsCabecalhoCotacaoNovo.canEdit = self.canEdit;
                    self.dsCabecalhoCotacaoNovo.canInsert = self.canInsert;
                    self.dsCabecalhoCotacaoNovo.canRemove = self.canRemove;
                });

                self.dsCabecalhoCotacaoNovo.init();
            }

            function onFilterCreated($instance) {
                self.painelFiltro = $instance;
            }

            function clearFilter() {
                self.painelFiltro.clearFilter();
            }

            function enviarEmail(clientEvent) {
                MessageUtils
                    .simpleConfirm(RotinaCotacaoUtil.getObjectValue(clientEvent.mensagem))
                    .then(function () {
                        carregaPreferencias(enviarProdutosPortal);
                    });
            }

            function reenviarEmail(parametros) {
                parametros.parametros.preferenciasCotacao.reenviarEmail = true;

				ServiceProxy.callService('mgecot@CotacaoSP.enviarProdutosCotacao', parametros)
                    .then(function(result) {
                        var msg = result.responseBody.MSG;
                        if(msg != null && msg != '') {
                            MessageUtils.showInfo(MessageUtils.TITLE_WARNING, msg);
                        } else {
                            MessageUtils.showInfo(MessageUtils.TITLE_WARNING, i18n("cot_msgRespFilaEnvio"));	
                        }
                        _salvarFiltro = false;
                        self.dsItemCotacao.refreshCurrentRow();
                    });		
			}

            function enviarProdutosPortal() {
                var itensSelecionados = getItensSelecionados();

                if (itensSelecionados.length > 0) {

                    if (validateEnviarItem(itensSelecionados)) {

                        var rootElem = { parametros: { preferenciasCotacao: {}, itensCotacao: {}, parceirosNotificados: {} } }

                        var nuNotaModelo = self.preferencias["NUNOTACALCULOCUSTO"] ? self.preferencias["NUNOTACALCULOCUSTO"] : "0";

                        var preferenciaCotacao = { nuNotaModelo: nuNotaModelo, reenviarEmail: false };

                        rootElem.parametros.preferenciasCotacao = preferenciaCotacao;

                        var itens = [];
                        var item = {};

                        itensSelecionados.forEach(function(element){                            
                            item = {
                                CODLOCAL: {$: element.CODLOCAL},
                                CODPROD: {$: element.CODPROD},
                                CONTROLE: {$: element.CONTROLE},
                                DIFERENCIADOR: {$: element.DIFERENCIADOR},
                                NUMCOTACAO: {$: element.NUMCOTACAO},
                                STATUSPRODCOT: {$: element.STATUSPRODCOT},
                                Produto_DESCRPROD: {$: element.Produto_DESCRPROD}
                            }
                            itens.push(item);
                        });

                        rootElem.parametros.itensCotacao.itemCotacao = itens;

                        ServiceProxy.callService('mgecot@CotacaoSP.enviarProdutosCotacao', rootElem)
                            .then(function (result) {
                                if(XmlJson.isNormalized(result)){
                                    XmlJson.denormalize(result);
                                }

                                let msg = ObjectUtils.getProperty(result, 'responseBody.MSG.$');
                                let parcNotif = ObjectUtils.getProperty(result, 'responseBody.parceirosNotificados');

                                if (msg != null && msg != '') {
                                    if(msg.indexOf(i18n("cot_msgRespMSG")) > 0) {
                                        msg += " \n Deseja enviar e-mail novamente? ";

                                        MessageUtils.showAlertWithConfirm(MessageUtils.TITLE_WARNING, msg).then(() => {

                                            if (parcNotif && parcNotif.length > 0) {
                                                rootElem.parametros.parceirosNotificados = parcNotif.source.parceirosNotificados;
                                                rootElem.parametros.parceiro = parcNotif.source.parceiro;
                                            } else {
                                                rootElem.parametros.parceirosNotificados = {};
                                                rootElem.parametros.parceiro = {};
                                            }

                                            reenviarEmail(rootElem);
                                        });
                                    } else {
                                        MessageUtils.showInfo(MessageUtils.TITLE_WARNING,msg);	
                                    }
                                } else {
                                    MessageUtils.showInfo(MessageUtils.TITLE_WARNING, i18n("cot_msgRespFilaEnvio"));		
                                }

                                _salvarFiltro = false;
                                self.dsItemCotacao.refreshCurrentRow();

                            });

                    }
                } else {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgSelecioneUmItem"));
                    return;
                }

            }

            function validateEnviarItem(itensFiltrados) {

                var validado = true;
                itensFiltrados.every(function (item) {
                    var statusProdCotacao = RotinaCotacaoUtil.getObjectValue(item["STATUSPRODCOT"]);

                    if (!(statusProdCotacao == 'O' || statusProdCotacao == 'E' || statusProdCotacao == 'P')) {
                        MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgErroStatusEnvioPortal"));
                        validado = false;
                        return false;
                    }
                });

                return validado;
            }

            function onColetaPreferencias($instance) {
                self.preferenciasPanel = $instance;
            }

            function validateDataLimiteItens() {
                var itensFiltrados = self.dsItemCotacao.getRecordsAsObjects();

                var dataAtual = DateUtils.getToday();

                var strResult = "";

                var cotacao = i18n("cot_labelPesquisaCotacao");

                itensFiltrados.forEach(function (item) {
                    var dataItem = RotinaCotacaoUtil.getObjectValue(item["DTLIMITE"]);
                    var dataLimite;

                    if(dataItem) {
                        dataLimite = DateUtils.stringToDate(dataItem);
                    } else {
                        dataLimite = dataAtual;
                    }

                    var diferencaData = DateUtils.diffDates(DateUtils.clearTime(dataAtual), dataLimite);

                    if (diferencaData > 0) {
                        strResult += RotinaCotacaoUtil.getObjectValue(item["CODPROD"]) + " - " + RotinaCotacaoUtil.getObjectValue(item["Produto_DESCRPROD"]);

                        var controle = RotinaCotacaoUtil.getObjectValue(item["Produto.DESCRPROD"]);

                        if (!(StringUtils.emptyAsNull(controle) == null)) {
                            strResult += controle;
                        }
                        var codLocal = RotinaCotacaoUtil.getObjectValue(item["CODLOCAL"]);

                        if (codLocal > 0) {
                            strResult += " - Local: " + codLocal;
                        }
                        strResult += " - " + cotacao + ": " + RotinaCotacaoUtil.getObjectValue(item["NUMCOTACAO"]) + "\n";
                    }
                });

                return strResult;
            }


            function getCriteriaByNumCotacao() {
                if (self.numCotacaoToLoad != null) {
                    var where = "this.NUMCOTACAO = ? ";
                    where += " AND EXISTS (SELECT 1 FROM TGFITC IT WHERE IT.CODPROD = this.CODPROD AND IT.CODPARC = this.CODPARC AND IT.CODLOCAL = this.CODLOCAL AND IT.CONTROLE = this.CONTROLE AND IT.DIFERENCIADOR = this.DIFERENCIADOR AND (this.CABECALHO='S' or (this.CABECALHO='N' AND this.CODPARC=0)))";

                    var criteria = Criteria();
                    criteria.append(where, Criteria.buildNumberParameter(self.numCotacaoToLoad));

                    return criteria;
                }

                return null;
            }

            function aprovarCotacaoProdutoComPopUpResumo() {
                if (getItensSelecionados().length > 1) {
                    MessageUtils.showError(MessageUtils.TITLE_WARNING, i18n('Cotacao.RotinaCotacao.cot_msgValidateAprovarProduto'));
                    return;
                }
                var item = self.dsItemCotacao.getCurrentRowAsObject();

                if (item == null) {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgSelecioneUmItem"));
                    return;
                }

                if ("A-F-C".indexOf(item["STATUSPRODCOT"]) > -1) {
                    MessageUtils.showAlert("Impossível aprovar", i18n('Cotacao.RotinaCotacao.cot_msgSemFornecedoresApropriados'));
                } else {
                    SanPopup.open({
                        title: i18n('Cotacao.RotinaCotacao.cot_titlePopupAprovarFornecedor'),
                        templateUrl: 'html5/RotinaCotacao/popup/PopupAprovarFornecedor.tpl.html',
                        controller: 'PopupAprovarFornecedorController',
                        controllerAs: 'ctrl',
                        size: 'lg',
                        height: '300',
                        showBtnNo: false,
                        windowClass: 'popUpAprovarFornecedor',
                        okBtnLabel: i18n('Cotacao.RotinaCotacao.cot_btnAprovar'),
                        resolve: {
                            data: {
                                codProduto: item["CODPROD"],
                                numCotacao: item["NUMCOTACAO"],
                                callBack: function (isEmpty, popupInstance) {
                                    self.popupAprovarFornecedor = popupInstance;
                                    if (isEmpty) {
                                        $timeout(() => {
                                            popupInstance.dismiss();
                                        }, 100);
                                        MessageUtils.showAlert("Impossível aprovar", i18n('Cotacao.RotinaCotacao.cot_msgSemFornecedoresApropriados'));
                                    }
                                }
                            }
                        }
                    }).result
                        .then(function (result) {
                            var fornAprovar = result.fornecedor;

                            if (fornAprovar != null) {
                                chamaAprovacaoFornecedorPopUp(fornAprovar);
                            } else {
                                MessageUtils.showAlert("Nenhum fornecedor foi selecionado", "Selecione um fornecedor.", null);
                            }
                        });
                }
            }

            function abasCotacaoCreated() {
                if (self.newCotacao) {
                    self.selectedIndexNova = 0;
                } else {
                    self.selectedIndexNova = 1;
                }
            }

            function chamaAprovacaoFornecedorPopUp(fornAprovar) {

                var itemCotacaoAprovadoElem = {};

                RotinaCotacaoUtil.addElements(itemCotacaoAprovadoElem, fornAprovar);

                var rootElem = { parametros: { itemCotacaoAprovado: itemCotacaoAprovadoElem } };

                ServiceProxy.callService('mgecot@CotacaoSP.aprovarCotacao', rootElem
                ).then(function (result) {
                    self.dsItemCotacao.refreshCurrentRow();
                });

            }

            function chamaPopupSugestaoForn() {
                if (possuiItensSelecionados()) {
                    if (!possuiItensRespondidos()) {
                        var itens = getItensSelecionados();

                        SanPopup.open({
                            title: i18n('cot_lblPopupSugestaoFornecedores'),
                            templateUrl: 'html5/RotinaCotacao/popup/PopupSugestaoFornecedores.tpl.html',
                            controller: 'SugestaoFornecedorController',
                            controllerAs: 'ctrl',
                            size: 'lg',
                            showBtnNo: false,
                            windowClass: 'popUpSugestaoFornecedor',
                            resolve: {
                                data: {
                                    produtos: itens,
                                    dsItemCotacao: self.dsItemCotacao,
                                    openedBy: 'ContainerModoItens',
                                    scopeContainerComponent: $scope
                                }
                            }
                        }).result.then(function (result) { });
                    } else {
                        MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgErroProdRespostasSugestaoForn"));
                    }
                } else {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgSelecioneProdutoSugestaoForn"));
                }
            }

            function validateColetaManualItem(item) {
                if (item["STATUSPRODCOT"] == "A" || item["STATUSPRODCOT"] == "F" || item["STATUSPRODCOT"] == "C") {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgNaoPodeColetaManutalStatus"));
                    return false;
                }

                return true;
            }

            function coletaManual() {
                var recordsItemCotacao = self.dsItemCotacao.getRecordsAsObjects();
                if (recordsItemCotacao.length == 0) {
                    MessageUtils.showError(i18n("cot_msgSelecioneUmItem"));
                } else {
                    var _cotacaoValida = true;
                    ArrayUtils.forEach(recordsItemCotacao, (item) => {
                        if (!validateColetaManualItem(item)) {
                            _cotacaoValida = false;
                            return false;
                        }
                    });

                    if (_cotacaoValida) {
                        self.indiceViewStack = COLETA_MANUAL_PANEL;

                        if (self.coletaManualPanel) {
                            self.coletaManualPanel.refresh();
                        }
                    }
                }
            }

            function getXmlItensCotacao(itensSelecionados) {

                let itemAux = { itemCotacao: [] };

                let registros = (itensSelecionados && itensSelecionados.length)
                    ? itensSelecionados
                    : self.dsItemCotacao.getRecordsAsObjects();

                registros.forEach(function (ob) {
                    let newValue;
                    for (let [key, value] of Object.entries(ob)) {
                        newValue = {};

                        key = key.replace(".","_");

                        if(value) {
                            newValue = { "$" : "" + value };
                        };
                        if ( (key == "CODLOCAL" || key == "DIFERENCIADOR") && !value) {
                            newValue = { "$" : "0" };
                        }

                        ob[key] = newValue;
                    }

                    let item = ob;

                    itemAux.itemCotacao.push(item);
                });


                let itens = { itensCotacao: itemAux };

                return itens;
            }
            

            function onColetaCreated(instance) {
                self.coletaManualPanel = instance;
            }

            function sugereMelhorFornecedor() {
                if (possuiSomenteItensPrecificados()) {
                    var itens = getXmlItensCotacao();

                    var parametros = { parametros: { mantermoeda: self.preferencias["ATUALMOECALCMELHORFORNECEDOR"] } };

                    parametros.parametros = itens;

                    ServiceProxy.callService('mgecot@CotacaoSP.sugerirMelhorFornecedor', parametros
                    ).then(function (result) {
                        _salvarFiltro = false;
                        MessageUtils.showInfo(MessageUtils.TITLE_INFORMATION, i18n("cot_msgCalculoFornecedorSucesso"));
                        self.dsItemCotacao.refreshCurrentRow();
                    });

                } else {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgValidateResumoItensFornPrecificado"));
                }
            }

            function validateCalcularCustosImpostos(item) {
                if (item["SITUACAO"] != "R") {
                    var msg = i18n("cot_msgNaoPodeCalcularItemCustoRespondido");
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, msg);
                    return false;
                }
                return true;
            }

            function calculaCustosImpostos() {
                if (self.preferencias["NUNOTACALCULOCUSTO"]) {
                    var itensSelecionados = getColetaItensSelecionados();
                    if (itensSelecionados.length > 0) {

                        var permiteCalcular = true;
                        itensSelecionados.every(function (item) {
                            if (!validateCalcularCustosImpostos(item)) {
                                permiteCalcular = false;
                                return true;
                            }
                            return false;
                        });

                        if (permiteCalcular) {
                            var parametrosElem = { parametros: { coletaItensCotacao: { coletaItemCotacao: [] } } };
                            parametrosElem.parametros.nuNota = { $: self.preferencias["NUNOTACALCULOCUSTO"] };
                            parametrosElem.parametros.calculaCusto = { $: self.preferencias["CALCULARCUSTOS"] };
                            parametrosElem.parametros.calculaImpostos = { $: self.preferencias["CALCULARIMPOSTOS"] };

                            for (var i = 0; i < itensSelecionados.length; i++) {
                                var coletaItemCotacaoElem = {};

                                RotinaCotacaoUtil.addElements(coletaItemCotacaoElem, itensSelecionados[i]);

                                parametrosElem.parametros.coletaItensCotacao.coletaItemCotacao.push(coletaItemCotacaoElem);
                            }

                            if(ArrayUtils.isNotEmpty(Object.entries(self.preferencias["NUNOTACALCULOCUSTO"]))){
                                ServiceProxy.callService('mgecot@CotacaoSP.calcularCustosImpostos', parametrosElem
                                    ).then(function (result) {
                                        self.dsColetaItemCotacao.refresh();
                                        MessageUtils.showInfo(MessageUtils.TITLE_INFORMATION, i18n("cot_msgSucessoCalculoImpostos"));
                                    });
                            }  


                        }

                    } else {
                        MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgSelecioneUmItem"));
                        return;
                    }
                }
            }

            function validateAprovarMelhorFornecedor(item) {
                if (RotinaCotacaoUtil.getObjectValue(item["STATUSPRODCOT"]) == "A" || RotinaCotacaoUtil.getObjectValue(item["STATUSPRODCOT"]) == "F" || RotinaCotacaoUtil.getObjectValue(item["STATUSPRODCOT"]) == "C") {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgNaoPodeAprCotStatus"));
                    return false;
                }
                return true;
            }

            function calculaCustosImpostosEmLote() {
                if(ObjectUtils.isEmpty(self.preferencias["NUNOTACALCULOCUSTO"])|| (!self.preferencias["CALCULARCUSTOS"] && !self.preferencias["CALCULARIMPOSTOS"])){
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n('Cotacao.RotinaCotacao.msgNaoDefinidoImposto'));
                    return;
				}
                if (self.preferencias["NUNOTACALCULOCUSTO"] && (self.preferencias["CALCULARCUSTOS"] || self.preferencias["CALCULARIMPOSTOS"])) {

                    var itensSelecionados = getItensSelecionados();

                    if (itensSelecionados.length > 0) {
                        var parametrosElem = { parametros: { itensCotacao: { itemCotacao: [] } } };


                        itensSelecionados.forEach(function (item) {
                            var itemCotacaoElem = {};

                            RotinaCotacaoUtil.addElements(itemCotacaoElem, item);
                            parametrosElem.parametros.itensCotacao.itemCotacao.push(itemCotacaoElem);

                        });

                        var nuNotaElem = { nunota: { $: self.preferencias["NUNOTACALCULOCUSTO"] } };
                        var calculaCustoElem = { calculaCusto: { $: self.preferencias["CALCULARCUSTOS"] } };
                        var calculaImpostosElem = { calculaImpostos: { $: self.preferencias["CALCULARIMPOSTOS"] } };

                        parametrosElem.parametros.nuNota = nuNotaElem.nunota;
                        parametrosElem.parametros.calculaCusto = calculaCustoElem.calculaCusto;
                        parametrosElem.parametros.calculaImpostos = calculaImpostosElem.calculaImpostos;

                        ServiceProxy.callService('mgecot@CotacaoSP.calcularCustosImpostosEmLote', parametrosElem
                        ).then(function (result) {

                            var resumoCalculoImposto = ObjectUtils.getProperty(result, 'responseBody.resumoCalculoImpostos');

                            if (resumoCalculoImposto && !angular.isArray(resumoCalculoImposto)) {
                                resumoCalculoImposto = [resumoCalculoImposto];
                            }

                            if (resumoCalculoImposto.length > 0) {
                                SanPopup.open({
                                    title: i18n('Cotacao.RotinaCotacao.lblResumoImpostos'),
                                    templateUrl: 'html5/RotinaCotacao/popup/ResumoCalculoImpostoLote.tpl.html',
                                    controller: 'ResumoCalculoImpostoLoteController',
                                    controllerAs: 'ctrl',
                                    size: 'md',
                                    height: '520',
                                    showBtnNo: false,
                                    windowClass: 'popUpCalculoImposto',
                                    resolve: {
                                        data: {
                                            resumoCalculoImposto: resumoCalculoImposto,
                                        }
                                    }
                                }).result
                                    .then(function (result) { });

                            }
                        });


                    } else {
                        MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgSelecioneUmItem"));
                        return;
                    }
                } else {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n('Cotacao.RotinaCotacao.msgNaoDefinidoImposto'));
                    return;
                }
            }

            function getItensSelecionados() {
                let itens = self.dsItemCotacao.getSelectedRecordsAsObjects();

                if (itens.length == 0 && self.dsItemCotacao.getCurrentRowAsObject()) {
                    itens = [self.dsItemCotacao.getCurrentRowAsObject()];
                }
                
                if (angular.isDefined(itens) && angular.isDefined(itens[0])) {
	                itens.forEach(function (element) {
	                    element['Produto_DESCRPROD'] =  element['Produto.DESCRPROD'];
	                    delete element['Produto.DESCRPROD'];
	                });
                }

                return itens;
            }

            function possuiItensRespondidos() {
                var possui = false;

                getItensSelecionados().forEach(function (ob) {
                    var statusEnvio = RotinaCotacaoUtil.getObjectValue(ob["STATUSPRECIFICACAO"]);
                    var valoresStatus = statusEnvio.split("/");
                    var qtdRespostas = parseInt(valoresStatus[0]);

                    if (qtdRespostas > 0) {
                        possui = true;
                    }
                });

                return possui;
            }

            function aprovarMelhorFornecedorProduto() {
                var itensSelecionados = getItensSelecionados();

                if (itensSelecionados.length > 0) {

                    itensSelecionados.forEach(function (item) {
                        if (!validateAprovarMelhorFornecedor(item)) {
                            return;
                        }
                    });

                    var rootElem = { parametros: { itensCotacao: { itemCotacao: [] } } };


                    for (var i = 0; i < itensSelecionados.length; i++) {
                        var itemCotacaoElem = {};

                        RotinaCotacaoUtil.addElements(itemCotacaoElem, itensSelecionados[i]);

                        rootElem.parametros.itensCotacao.itemCotacao.push(itemCotacaoElem);
                    }

                    ServiceProxy.callService('mgecot@CotacaoSP.aprovarMelhorFornecedor', rootElem
                    ).then(function (result) {
                        _salvarFiltro = false;
                        self.dsItemCotacao.refreshCurrentRow();
                    });

                } else {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgErroSelecioneProdutoParaAprovar"));
                    return;
                }
            }

            function buildDynaOptions(dynaform) {

                if (dynaform.getEntityName() == 'ItemCotacao') {
                    if (self.dsCabecalho == null) {

                        return [
                            {
                                label: i18n('cot_menuItemSugForn'),
                                action: function () {
                                    chamaPopupSugestaoForn();
                                }
                            },
                            {
                                label: i18n('cot_menuItemColetaManual'),
                                action: function () {
                                    coletaManual();
                                }
                            },
                            {
                                label: i18n('cot_menuItemSugMelhorForn'),
                                action: function () {
                                    sugereMelhorFornecedor();
                                }
                            },
                            {
                                label: i18n('cot_labelCalcularCustos'),
                                action: function () {
                                    calculaCustosImpostosEmLote();
                                }
                            },
                            {
                                label: i18n('cot_menuItemAprovForSug'),
                                action: function () {
                                    aprovarMelhorFornecedorProduto();
                                }
                            },
                            {
                                label: i18n('Cotacao.RotinaCotacao.cot_menuItemCancelarCotacao'),
                                action: function () {
                                    aprovarCancelamentoDaCotacaoProduto();
                                }
                            },
                            {
                                label: i18n('Cotacao.RotinaCotacao.cot_menuItemAltCabCot'),
                                action: function () {
                                    alterarCabecalhoCotacao();
                                }
                            },
                            {
                                label: i18n('cot_menuItemPref'),
                                action: function () {
                                    chamaPopupPreferencias();
                                }
                            }

                        ];

                    } else {

                        return [
                            {
                                label: i18n('cot_menuItemCancelarItem'),
                                action: function () {
                                    aprovarCancelamentoDaCotacaoProduto();
                                }
                            }
                        ];
                    }
                }
            }

            function chamaPopupPreferencias() {
                if (self.preferenciasPanel) {
                    self.preferenciasPanel.setConfig(self.rotinaCotacaoInstance.configPreferencias);
                }

                self.indiceViewStack = PREFERENCIAS_PANEL;
            }

            function setEditProfile(insertOnlyProfile) {
                self.editProfile = insertOnlyProfile;
            }

            function chamaNovaCotacao() {

                if(!self.canInsert){
                    MessageUtils.showAlert(SkI18nService.instant('Attach.msgControleAcesso'), SkI18nService.instant('Attach.NaoehPossivelInserirRecord'));
                    return;
                }
                self.newCotacao = true;

                setEditProfile(true);

                self.formCabecalhoCotacaoGeralEnabled = true;
                self.formCabecalhoCotacaoObsEnabled = true;
                self.strTitleNovaCotacao = "";

                if (self.dsCabecalhoCotacaoNovo.isInsertionMode()) {
                    self.dsCabecalhoCotacaoNovo.cancelEdition();
                }

                if (self.dsCabecalhoCotacaoNovo) {

                    self.dsCabecalhoCotacaoNovo.goToInsertionMode().then(function () {
                        self.dsCabecalhoCotacaoNovo.makeFieldRequired("CODUSURESP");
                        self.dsCabecalhoCotacaoNovo.makeFieldNonRequired("NUMCOTACAO");

                        self.dsCabecalhoCotacaoNovo.setFieldValue("PESOPRECO", 1);

                        self.dsItemCotacaoNovo.clearDataSet();

                        self.dsItemCotacaoNovo.goToInsertionMode();

                        configureAbaCotacaoPesos(self.dsCabecalhoCotacaoNovo);

                        self.strTitleNovaCotacao = i18n("cot_titleNovaCotacao");

                        if (StringUtils.emptyAsNull(self.strTitleNovaCotacao) == null) {
                            self.strTitleNovaCotacao = "Nova Cotação";
                        }

                        

                        self.indiceViewStack = NOVA_COTACAO;

                    });
                }
            }


            function configureAbaCotacaoPesos(dataset) {
                var config = {};
                config.editProfile = self.editProfile;
                config.btCriteriosVisible = true;
                config.dsCabCotacao = dataset;

                self.configTab(config);
            }

            function alterarCabecalhoCotacao() {
                var itensSelecionados = getItensSelecionados();

                for (var i = 1; i < itensSelecionados.length; i++) {
                    if (!(itensSelecionados[i - 1]["NUMCOTACAO"] == itensSelecionados[i]["NUMCOTACAO"])) {
                        MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n('Cotacao.RotinaCotacao.cot_msgValidateAltCabCot'));
                        return;
                    }
                }

                self.newCotacao = false;

                setEditProfile(true);

                self.formCabecalhoCotacaoGeralEnabled = true;
                self.formCabecalhoCotacaoObsEnabled = true;

                let NUMCOTACAO = self.dsItemCotacao.getCurrentRowAsObject().NUMCOTACAO;

                ServiceProxy.callService('mge@crud.find', {
                    entity: {
                        name: "CabecalhoCotacao",
                        criterio: {
                            nome: "NUMCOTACAO",
                            valor: NUMCOTACAO
                        }
                    }
                }).then(function (result) {

                    let cabecalhoRecord = result.responseBody.entidades.entidade;

                    XmlJson.normalize(cabecalhoRecord)
                    let records = XmlJson.getRecordsAsObjects([cabecalhoRecord]);

                    self.dsCabecalhoCotacaoNovoRecords = records;

                    self.dsCabecalhoCotacaoNovo.refresh();
                    self.dsCabecalhoCotacaoNovo.makeFieldRequired("CODUSURESP");
                    self.dsCabecalhoCotacaoNovo.makeFieldRequired("CODUSURESP");

                    setTimeout(() => {
                        self.dsCabecalhoCotacaoNovo.refreshCurrentRow();
                    }, 300);
    
                    configureAbaCotacaoPesos(self.dsCabecalhoCotacaoNovo);
    
                    self.strTitleNovaCotacao = i18n('Cotacao.RotinaCotacao.cot_titleEditarCotacao');
                    
                    self.indiceViewStack = NOVA_COTACAO;
                    self.abaItensCotacao = false;
                });

            }

            function aprovarCancelamentoDaCotacaoProduto() {
            	var _permiteCancelarProduto = true;
            	var itensSelecionados = getItensSelecionados();
            	itensSelecionados.forEach(function (item) {
            		
            		if(item.STATUSPRODCOT == 'F'){
            			_permiteCancelarProduto = false;
            			MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgNaoPodeCancelarProdutoFechado"));
            		}
            	});

            	if (self.dsCabecalho == null) {
                	
                	if(_permiteCancelarProduto){
                        MessageUtils.showAlertWithConfirm(MessageUtils.TITLE_CONFIRMATION, i18n('Cotacao.RotinaCotacao.msgConfirmarCancelamento'), null, { okBtnLabel: i18n('Geral.buttonSim') })
                        .then(function () {
                            cancelarCotacaoProduto();
                        }, function () {
                        });
                	}
                	
                } else {
                	if(_permiteCancelarProduto){                	
                		MessageUtils.showAlertWithConfirm(i18n("cot_msgConfirmaCancelarItem"))
                		.then(function () {
                			cancelarCotacaoProduto();
                		}, function () {
                			
                		});
                	}
                }
            }

            function customTabsLoader(entity) {
                if (entity == 'CabecalhoCotacao' && !self.dsCabecalho) {
                    var customTabs = [];

                    customTabs.push({
                        blockId: 'abaPesos',
                        description: i18n('cot_labelPesosCriterios'),
                        controller: 'AbaPesosController',
                        controllerAs: 'ctrl',
                        templateUrl: 'html5/RotinaCotacao/abas/AbaPesos.tpl.html',
                        properties: {
                            dataSet: self.dsCabCotacao,
                            editProfile: self.editProfile,

                        }

                    });

                    return customTabs;
                }
            }

            function cancelarCotacaoProduto() {
            	carregaPreferencias(null);
            	var _permiteCancelarProduto = true;
            	var itensSelecionados = getItensSelecionados();
            	itensSelecionados.forEach(function (item) {

                    if(item.STATUSPRODCOT == 'F'){
                    	_permiteCancelarProduto = false;
                        MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgNaoPodeCancelarProdutoFechado"));
                    }
                });

            	if(MGEParameters.asBoolean("INFMOTCANCOT")){
            		SanPopup.open({
            			title: i18n("Cotacao.RotinaCotacao.titleMotivoCancelamento"),
            			templateUrl: 'html5/RotinaCotacao/popup/MotivoCancCotPopup.tpl.html',
            			controller: 'MotivoCancCotPopupController',
            			controllerAs: 'ctrl',
            			size: 'md',
            			showBtnNo: false
            		}).result.then(function (result) {
            			cancelarCotacaoProdutoItem(result);
            		});     
            	} else {
            		cancelarCotacaoProdutoItem();
            	}
            }
            
            function cancelarCotacaoProdutoItem(result){
    			var parametros = { parametros: {} };
    			if(result != null){
	    			parametros.parametros.motivoCancelamento = result.motivoCancelamento;
	    			parametros.parametros.observacaoCancelamento = result.observacao;
    			}
    			var itensSelecionados = getItensSelecionados();
    			
    			var nuNotaModelo = self.preferencias["NUNOTACALCULOCUSTO"];
    			
    			var preferenciaCotacao = { preferenciasCotacao: { nuNotaModelo: nuNotaModelo } };
    			
    			parametros.parametros.preferenciasCotacao = preferenciaCotacao.preferenciasCotacao;
    			
    			if (itensSelecionados.length > 0) {
   				
    				var itensCotacaoElem = { itensCotacao: { itemCotacao: [] } };
    				
    				for (var i = 0; i < itensSelecionados.length; i += 1) {
    					var itemCotacaoElem = {};
    					
    					if (validateCancelarItem(itensSelecionados[i])) {
        					RotinaCotacaoUtil.addElements(itemCotacaoElem, itensSelecionados[i]);
        					
        					itensCotacaoElem.itensCotacao.itemCotacao.push(itemCotacaoElem);
    					}
    				}
    				
    				parametros.parametros.itensCotacao = itensCotacaoElem.itensCotacao;
    				
    				if(parametros.parametros.itensCotacao.itemCotacao.length > 0){
    					ServiceProxy.callService('mgecot@CotacaoSP.cancelarCotacao', parametros
    					).then(function (result) {
    						
    						var msg = ObjectUtils.getProperty(result, 'responseBody.MSG');
    						
    						if (msg != null && msg != '') {
    							MessageUtils.showAlert(MessageUtils.TITLE_WARNING, msg);
    						} else {
    							MessageUtils.showInfo(MessageUtils.TITLE_WARNING, i18n('Cotacao.RotinaCotacao.msgProdutosCanceladosSucesso'));
    						}
    						
    						_salvarFiltro = false;
    						refreshDsItemCotacao();
    						if(self.dsCabecalho){
                            	self.dsCabecalho.refresh();
                            }
    						
    					});				
    				}
    				
    			} else {
    				
    				MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgSelecioneUmItem"));
    				
    				return;
    			}
            }
            
            function validateCancelarItem(item) {
                if (item["STATUSPRODCOT"] == "F") {
/*                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgNaoPodeCancelarProdutoFechado"));
*/                    return false;
                }
                return true;
            }

            function getCriteria() {
                var criteria = Criteria();

				var exp = " EXISTS (SELECT 1 FROM TGFITC IT WHERE IT.CODPROD = this.CODPROD AND IT.CODPARC = this.CODPARC AND IT.CODLOCAL = this.CODLOCAL AND IT.CONTROLE = this.CONTROLE AND IT.DIFERENCIADOR = this.DIFERENCIADOR AND (this.CABECALHO='S' or (this.CABECALHO='N' AND this.CODPARC=0)))";

                var par = new Array();

                if (self.dsCabecalho) {
                    exp += " AND this.NUMCOTACAO = ?";
                    criteria.append(exp, Criteria.buildNumberParameter(self.dsCabecalho.getFieldValueAsString("NUMCOTACAO")));
                    return criteria;
                } else {
                    criteria.append(exp);
                }


                if (self.numCotacaoToLoad != null) {
                    var dbCriteriaByNumCotacao = getCriteriaByNumCotacao();
                    self.numCotacaoToLoad = null;

                    return dbCriteriaByNumCotacao;
                }

                _salvarFiltro = true;

                return self.painelFiltro.getFiltro(_salvarFiltro, criteria);
            }

            function filtrarItensCotacao() {
                if (self.dsItemCotacao) {
                    _salvarFiltro = true;
                    self.dsItemCotacao.refresh();
                }
            }

            function refreshHandlerNovaCotacao() {
                return self.dsCabecalhoCotacaoNovoRecords;
            }

            function adicionarProdutosCotacao() {
                self.newCotacao = false;
                self.dsItemCotacaoNovo.clearDataSet();

                var itensSel = getItensSelecionados();

				if(itensSel == undefined){
                    itensSel = 0;
                }

                if (itensSel.length == 1 || self.dsCabecalho) {
                    strTitleNovaCotacao = "";

                    if (self.dsCabecalho) {
                        self.dsCabecalhoCotacaoNovoRecords = [self.dsCabecalho.getCurrentRowAsObject()];
                    } else {
                        self.dsCabecalhoCotacaoNovoRecords = [self.itemCotacaoSel];
                    }

                    self.dsCabecalhoCotacaoNovo.refresh();
                    self.dsCabecalhoCotacaoNovo.makeFieldRequired("CODUSURESP");

                    setTimeout(() => {
                        self.dsCabecalhoCotacaoNovo.refreshCurrentRow();
                    }, 300);

                    setEditProfile(false);
                    configureAbaCotacaoPesos(self.dsCabecalhoCotacaoNovo);
                    self.abaItensCotacao = true;

                    self.formCabecalhoCotacaoGeralEnabled = false;
                    self.formCabecalhoCotacaoObsEnabled = false;
                    self.btCriteriosVisible = false;

                    self.strTitleNovaCotacao = i18n("cot_titleAdicionarProdutosCotacao");

                    if (self.abasCotacao != null) {
                        if (StringUtils.emptyAsNull(strTitleNovaCotacao) == null) {
                            self.strTitleNovaCotacao = "Adicionar produtos à Cotação";
                        }

                        self.titleNovaCotacao = strTitleNovaCotacao;
                        self.selectedIndexNova = 1;
                    }
                    if (self.canInsert || self.canEdit) {
                        self.indiceViewStack = NOVA_COTACAO;
                    }

                    self.selectTabIndex(1);
                } else {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgErroAdicProdCot"));
                }
            }

            function cancelAddProdutosCotacao() {
                if (self.dsItemCotacaoNovo.isInsertionMode()) {
                    self.dsItemCotacaoNovo.cancelEdition();
                }

                if (self.dsCabecalhoCotacaoNovo.isInsertionMode()) {
                    self.dsCabecalhoCotacaoNovo.cancelEdition();
                }

                self.indiceViewStack = MAIN_PANEL;

                self.selectedIndexNova = 0;
            }

            function onDynaformLoaded(dynaform, ds) {

                if (dynaform.getEntityName() == "ItemCotacao") {

                    _dynaformItemCotacao = dynaform;

                    _dynaformItemCotacao.setNavigatorAddHandler(function () {

                        if (!self.dsCabecalho) {
                            chamaNovaCotacao();
                        } else {
                            if (self.dsCabecalho.isInsertionMode() || self.dsCabecalho.isRecordDirty() || self.dsCabecalho.getCurrentRow() == null) {
                                MessageUtils.showAlert(MessageUtils.TITLE_WARNING, i18n("SanDB.DataSet.messageSalvarAntesDeIncluir"));
                                return;
                            } else {
                                adicionarProdutosCotacao();
                            }
                        }
                    });

                    _dynaformItemCotacao.goToGridView().then(function () {});

                    dynaformCreated();

                    if (self.dsCabecalho) {

                        self.dsCabecalho.beforePostAction(function (dataSet) {
                            return datasCabCotacaoValidas();
                        });

                        ds.setParentDataSet(self.dsCabecalho);
                    }

                    _dynaformItemCotacao.hideBtnIsFavorite(true);


                    self.dsItemCotacao = ds;
                    self.dsItemCotacaoName = self.dsItemCotacao.getEntityName();
                    self.dsItemCotacao.addCriteriaProvider(getCriteria);
                    self.dsItemCotacao.init().then(function(){
                        if(self.loadOnInitialize) {
                            setTimeout(function () {
                                self.dsItemCotacao.refresh();
                            }, 500);
                        }
                    });
                    
                    self.dsItemCotacao.setCanInsert( self.canInsert);
                    
                    self.dsItemCotacao.getFieldsMetadata().forEach(function (field) {

                            if((field.id == "CODMOTCAN" || field.id == "MOTIVO" || field.id == "OBSMOTCANC") && !MGEParameters.asBoolean("INFMOTCANCOT")){
                            	field.visible = false;
                            }
                        });


                    $scope.dsItemCotacao = ds;

                    self.dsItemCotacao.beforePostAction(function (dataSet) {
                        var qtdItem = dataSet.getFieldValueAsNumberOrZero("QTDCOTADA");
                        var decQtd = dataSet.getFieldValueAsNumberOrZero("PRODDECVL");

                        return validaAgrupMinProd(_agrupMinItemCotacao, qtdItem);
                    });

                    self.dsItemCotacao.addLineChangeListener(function (newIndex) {
                        var codProd = self.dsItemCotacao.getFieldValueAsNumber("CODPROD");

                        personalizaItemCotacaoPorProduto(codProd, _itemCotacaoControle, _fieldQtdProduto, _fieldPrecoColetaItem);

                        self.itemCotacaoSel = self.dsItemCotacao.getCurrentRowAsObject();
                    });

                    self.dsItemCotacao.addInsertionModeListener(function () {
                        atualizarControleUI(_itemCotacaoControle, null, null, null, false);
                    });

                    self.dsItemCotacao.addDataModifiedListener(function (modifiedFieldId) {
                        if(!self.canEdit){
                            MessageUtils.showAlert(SkI18nService.instant('Attach.msgControleAcesso'), SkI18nService.instant('Attach.NaoEhPossivelFazerAlteracoes'));
                            self.dsItemCotacao.cancelEdition();
                            return;
                        }

                        if (modifiedFieldId == "CODPROD") {
                            var codProd = self.dsItemCotacao.getFieldValueAsNumber("CODPROD");
                            personalizaItemCotacaoPorProduto(codProd, _itemCotacaoControle, _fieldQtdProduto, _fieldPrecoColetaItem);
                        }

                        if (modifiedFieldId == "CODVOL" || modifiedFieldId == "QTDCOTADA" || modifiedFieldId == "DTLIMITE") {
                            var situacaoProduto = self.dsItemCotacao.getFieldValueAsString("STATUSPRODCOT");

                            if ("O" == situacaoProduto) {
                                var parametrosElem = { parametros: {} };

                                parametrosElem.parametros.CODPROD = self.dsItemCotacao.getFieldValue("CODPROD");
                                parametrosElem.parametros.CODLOCAL = self.dsItemCotacao.getFieldValue("CODLOCAL");
                                parametrosElem.parametros.DIFERENCIADOR = self.dsItemCotacao.getFieldValue("DIFERENCIADOR");
                                parametrosElem.parametros.CONTROLE = self.dsItemCotacao.getFieldValue("CONTROLE");
                                parametrosElem.parametros.NUMCOTACAO = self.dsItemCotacao.getFieldValue("NUMCOTACAO");
                                parametrosElem.parametros.QTDCOTADA = self.dsItemCotacao.getFieldValue("QTDCOTADA");
                                parametrosElem.parametros.CODVOL = self.dsItemCotacao.getFieldValue("CODVOL");

                                ServiceProxy.callService('mgecot@CotacaoSP.podeAtualizaProdutoParceiros', parametrosElem
                                ).then(function (result) {

                                    _atualizarProdutoParceiros = ObjectUtils.getProperty(result, 'responseBody.possuiFornecNaoPendenete');

                                    if (!_atualizarProdutoParceiros) {
                                        MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgProdComFonecNaoPednente"));

                                        self.dsItemCotacao.cancelEdition();
                                        self.dsItemCotacao.refreshCurrentRow();
                                    }

                                });

                            } else {

                                MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgProdStatusDifAberto"));

                                self.dsItemCotacao.cancelEdition();
                                self.dsItemCotacao.refreshCurrentRow();

                                _atualizarProdutoParceiros = false;

                                return;
                            }
                        }

                    });

                    self.dsItemCotacao.addDataSavedListener(function () {
                        if (_atualizarProdutoParceiros) {

                            var parametrosElem = { parametros: {} };

                            parametrosElem.parametros.CODPROD = self.dsItemCotacao.getFieldValue("CODPROD");
                            parametrosElem.parametros.CODLOCAL = self.dsItemCotacao.getFieldValue("CODLOCAL");
                            parametrosElem.parametros.DIFERENCIADOR = self.dsItemCotacao.getFieldValue("DIFERENCIADOR");
                            parametrosElem.parametros.CONTROLE = self.dsItemCotacao.getFieldValue("CONTROLE");
                            parametrosElem.parametros.NUMCOTACAO = self.dsItemCotacao.getFieldValue("NUMCOTACAO");
                            parametrosElem.parametros.QTDCOTADA = self.dsItemCotacao.getFieldValue("QTDCOTADA");
                            parametrosElem.parametros.CODVOL = self.dsItemCotacao.getFieldValue("CODVOL");


                            ServiceProxy.callService('mgecot@CotacaoSP.atualizaProdutoParceiros', parametrosElem
                            ).then(function (response) {
                                if (self.dsColetaItemCotacao != null) {
                                    self.dsColetaItemCotacao.refresh();
                                }
                            });

                        }
                        _atualizarProdutoParceiros = false;
                    });

                    _whenFormReady.ready();
                } else if (dynaform.getEntityName() == "ColetaItemCotacao") {
                    self.dsColetaItemCotacao = ds;
                    self.dynaColetaItemCotacao = dynaform;
                    self.dsColetaItemCotacao.addTXProperty("usa.ultimo.valor.unitario.compra", self.preferencias["ULTIMOVALORCOMPRA"]);
                    self.dsColetaItemCotacao.setCrudListener("br.com.sankhya.cotacao.model.crudlisteners.ItemCotacaoCRUDListener");
                    self.dsColetaItemCotacaoName = self.dsColetaItemCotacao.getEntityName();

                    self.dsColetaItemCotacao.setRequiredMembroPK(false);

                    self.dsColetaItemCotacao.setCanInsert(self.canInsert);

                    self.dsColetaItemCotacao.beforePostAction(function () {

                        //Existe um problema no dataset que não ta deixando salvar a coleta de item no HTML5, o campo "CODLOCAL" está invisivel via CRUDListener e está causando erro.
                        if (self.dsColetaItemCotacao.isInsertionMode()) {
                            self.dsColetaItemCotacao.setFieldValue("CABECALHO", "N");
                            self.dsColetaItemCotacao.setFieldValue("SITUACAO", "P");
                        }

                        var fieldValue = self.dsColetaItemCotacao.getFieldValue("PRECO");
                        let preco;
                        fieldValue = Number(fieldValue);
                        if (isNaN(fieldValue)) {
                            preco = 0;
                            self.dsColetaItemCotacao.setFieldValue("PRECO", preco);
                        } else {
                            preco = self.dsColetaItemCotacao.getFieldValueAsNumberOrZero("PRECO");
                        }

                        var situacao = self.dsColetaItemCotacao.getFieldValueAsString("SITUACAO");

                        if (("P" == situacao || "E" == situacao || "G" == situacao) && preco > 0) {

                            self.dsColetaItemCotacao.setFieldValue("SITUACAO", "R");
                            self.dsColetaItemCotacao.setFieldValue("DTCOLETAPRECO", new Date());

                            var tipColPreco = self.dsColetaItemCotacao.getFieldValueAsString("TIPOCOLPRECO");
                            var empate = ("G" == situacao);

                            if (!empate) {
                                if ("ONLINE" == tipColPreco) {
                                    self.dsColetaItemCotacao.setFieldValue("TIPOCOLPRECO", "MANUAL");
                                }
                            }

                        } else {

                            if (("R" == situacao || 'G' == situacao) && preco == 0) {
                                self.dsColetaItemCotacao.setFieldValue("SITUACAO", "P");
                                self.dsColetaItemCotacao.setFieldValue("TIPOCOLPRECO", "MANUAL");
                            }
                        }

                    });
                    
                    self.dsColetaItemCotacao.addDataSavedListener(function () {
						self.currentIndiceColeta = self.dsColetaItemCotacao.getCurrentIndex();
						self.salvandoColeta = true;                
                        self.dsItemCotacao.refreshCurrentRow();
                    });
                    
                    self.dsColetaItemCotacao.addRefreshedListener(function () {
                        if(self.currentIndiceColeta == -1 && self.dsColetaItemCotacao.size() > 0){
                             self.currentIndiceColeta = 0;
                        }
						if(angular.isDefined(self.dsColetaItemCotacao) && self.salvandoColeta){
							self.dsColetaItemCotacao.gotoRow(self.currentIndiceColeta);
							self.salvandoColeta = false;
						}
                        self.dsColetaItemCotacao.addTXProperty("usa.ultimo.valor.unitario.compra", self.preferencias["ULTIMOVALORCOMPRA"]);
                    });

                    self.dsColetaItemCotacao.addRecordRemovedListener(function () {
                        refreshDsItemCotacao();
                    });

                    self.dsColetaItemCotacao.addLineChangeListener(function (newIndex) {

                        var fornAprovar = self.dsColetaItemCotacao.getCurrentRowAsObject();

                        if (newIndex >= 0) {
                            habilitaCampoImpostosColeta();

                            atualizaPrecisaoCampoQtdItemCotacao(_fieldTotProdColetaItem, _produtoDECVLR);

                            if (MGEParameters.asBoolean("TRABMOECOT")) {
                                enabledDisabledOperacaoMoeda();
                            }
                        }

                        calculaTotalProdutoParceiro();

                        enabledBtnAprov();

                        if (fornAprovar != null) {
                            if ("A" == fornAprovar["SITUACAO"]) {
                                self.labelAprovDesaprov = i18n('Cotacao.RotinaCotacao.cot_labelDesaprovar');
                            } else {
                                self.labelAprovDesaprov = i18n('cot_labelAprovar');
                            }

                        }

                    });

                    self.dsColetaItemCotacao.addInsertionModeListener(function () {
                        _isNew = true;
                        enabledBtnAprov();

                        if (self.dsColetaItemCotacao.isInsertionMode() && self.dsColetaItemCotacao.isRecordDirty() || !angular.isDefined(self.dsItemCotacao.getCurrentRowAsObject())) {
                            MessageUtils.showAlert(MessageUtils.TITLE_WARNING, i18n("SanDB.DataSet.messageSalvarAntesDeIncluir"));
                            return;
                        }

                        var itemCotacao = self.dsItemCotacao.getCurrentRowAsObject();

                        if(!angular.isUndefined(itemCotacao)){
	                        self.dsColetaItemCotacao.setFieldValue("QTDCOTADA", itemCotacao["QTDCOTADA"]);
	                        self.dsColetaItemCotacao.setFieldValue("CODVOL", itemCotacao["CODVOL"]);
	                        self.dsColetaItemCotacao.setFieldValue("PRECO", 0);
	
	                        calculaTotalProdutoParceiro();
                        }
                    });

                    self.dsColetaItemCotacao.addDataModifiedListener(function (modifiedFieldId) {
                        if(!self.canEdit){
                            MessageUtils.showAlert(SkI18nService.instant('Attach.msgControleAcesso'), SkI18nService.instant('Attach.NaoEhPossivelFazerAlteracoes'));
                            self.dsColetaItemCotacao.cancelEdition();
                            return;
                        }
                        if (_isNew && self.dsColetaItemCotacao.isInsertionMode()) {
                            _isNew = false;
                            return;
                        }


                        var coletaItemCotacao = self.dsColetaItemCotacao.getCurrentRowAsObject();
                        var statusItemCotacao = coletaItemCotacao['SITUACAO'];

                        if ((statusItemCotacao == 'A' || statusItemCotacao == 'N' || statusItemCotacao == 'F' || statusItemCotacao == 'C')) {
                            MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgNaoPodeAlterarColeta"));

                            self.dsColetaItemCotacao.cancelEdition();
                            self.dsColetaItemCotacao.refreshCurrentRow();

                            return;
                        }

                        var itemCotacao = self.dsItemCotacao.getCurrentRowAsObject();
                        
                        if(!angular.isUndefined(itemCotacao)){
                        	var statusProdCotacao = itemCotacao['STATUSPRODCOT'];
	                        if (!(statusProdCotacao == 'O' || statusProdCotacao == 'E' || statusProdCotacao == 'P')) {
	                            MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgNaoPodeAlterarColeta"));
	
	                            self.dsColetaItemCotacao.cancelEdition();
	                            self.dsColetaItemCotacao.refresh();
	
	                            return;
	                        }
                        }

                        if (modifiedFieldId == "PRECO") {
                            var fieldValue = self.dsColetaItemCotacao.getFieldValue("PRECO");
                            let preco;
                            fieldValue = Number(fieldValue);
                            if (isNaN(fieldValue)) {
                                preco = 0;
                                self.dsColetaItemCotacao.setFieldValue("PRECO", preco);
                            } else {
                                preco = self.dsColetaItemCotacao.getFieldValueAsNumber("PRECO");
                            }

                            if (preco && preco > 0) {

                                if (!self.preferencias["CALCULARIMPOSTOS"]) {
                                    var aliqIcmsCalc = self.dsColetaItemCotacao.getFieldValueAsNumberOrZero("ALIQICMS");

                                    calculaValorCampo(self.dsColetaItemCotacao, aliqIcmsCalc, "ALIQICMS", "ICMS", "field_tgfitc_aliqicms", true, _decimaisImp);
                                    calculaValorCampo(self.dsColetaItemCotacao, self.dsColetaItemCotacao.getFieldValueAsNumberOrZero("ALIQIPI"), "ALIQIPI", "IPI", "field_tgfitc_aliqipi", true, _decimaisImp);
                                }

                                calculaValorCampo(self.dsColetaItemCotacao, self.dsColetaItemCotacao.getFieldValueAsNumberOrZero("PERCACRESC"), "PERCACRESC", "VLRACRESC", "field_tgfitc_vlracresc", false);
                                calculaValorCampo(self.dsColetaItemCotacao, self.dsColetaItemCotacao.getFieldValueAsNumberOrZero("PERCDESC"), "PERCDESC", "VLRDESC", "field_tgfitc_vlrdesc", true);

                            } else {
                                self.dsColetaItemCotacao.setFieldValue("IPI", 0);
                                self.dsColetaItemCotacao.setFieldValue("ICMS", 0);
                                self.dsColetaItemCotacao.setFieldValue("VLRACRESC", 0);
                                self.dsColetaItemCotacao.setFieldValue("VLRDESC", 0);
                            }
                            calculaTotalProdutoParceiro();
                        }

                        if (modifiedFieldId == "ALIQIPI" && !self.preferencias["CALCULARIMPOSTOS"]) {
                            calculaValorCampo(self.dsColetaItemCotacao, self.dsColetaItemCotacao.getFieldValueAsNumberOrZero("ALIQIPI"), "ALIQIPI", "IPI", "field_tgfitc_aliqipi", true);
                            calculaTotalProdutoParceiro();
                        }
                        if (modifiedFieldId == "IPI") {
                            calculaPorcentagemCampo(self.dsColetaItemCotacao, "IPI", "ALIQIPI", "field_tgfitc_ipi", false, _decimaisImp);
                            calculaTotalProdutoParceiro();
                        }

                        if (modifiedFieldId == "FRETE" || modifiedFieldId == "OUTROS" || modifiedFieldId == "ICMS" || modifiedFieldId == "IPI" || modifiedFieldId == "VLRSUBST") {
                            calculaTotalProdutoParceiro();
                        }

                        if (modifiedFieldId == "ALIQICMS" && !self.preferencias["CALCULARIMPOSTOS"]) {
                            var aliqIcmsCalc3 = self.dsColetaItemCotacao.getFieldValueAsNumberOrZero("ALIQICMS");
                            calculaValorCampo(self.dsColetaItemCotacao, aliqIcmsCalc3, "ALIQICMS", "ICMS", "field_tgfitc_aliqicms", true, _decimaisImp);
                            calculaTotalProdutoParceiro();
                        }

                        if (modifiedFieldId == "ICMS") {
                            calculaPorcentagemCampo(self.dsColetaItemCotacao, "ICMS", "ALIQICMS", "field_tgfitc_icms", false, _decimaisImp);
                            calculaTotalProdutoParceiro();
                        }

                        if (modifiedFieldId == "DIFALIQICMS" && !self.preferencias["CALCULARIMPOSTOS"]) {
                            var aliqDifIcmsCalc = self.dsColetaItemCotacao.getFieldValueAsNumberOrZero("ALIQICMS");
                            calculaValorCampo(self.dsColetaItemCotacao, aliqDifIcmsCalc, "ALIQICMS", "ICMS", "field_tgfitc_aliqicms", true, _decimaisImp);
                            calculaTotalProdutoParceiro();
                        }

                        if (modifiedFieldId == "VLRACRESC") {
                            calculaPorcentagemCampo(self.dsColetaItemCotacao, "VLRACRESC", "PERCACRESC", "field_tgfitc_percacresc", false);
                            calculaTotalProdutoParceiro();
                        }
                        if (modifiedFieldId == "VLRACRESC") {
                            calculaPorcentagemCampo(self.dsColetaItemCotacao, "VLRACRESC", "PERCACRESC", "field_tgfitc_percacresc", false);
                            calculaTotalProdutoParceiro();
                        }

                        if (modifiedFieldId == "PERCACRESC") {
                            calculaValorCampo(self.dsColetaItemCotacao, self.dsColetaItemCotacao.getFieldValueAsNumberOrZero("PERCACRESC"), "PERCACRESC", "VLRACRESC", "field_tgfitc_vlracresc", false);
                            calculaTotalProdutoParceiro();
                        }

                        if (modifiedFieldId == "VLRDESC") {
                            calculaPorcentagemCampo(self.dsColetaItemCotacao, "VLRDESC", "PERCDESC", "field_tgfitc_vlrdesc", true,  _decimaisCusto);
                            calculaTotalProdutoParceiro();
                        }

                        if (modifiedFieldId == "PERCDESC") {
                            if (MGEParameters.asBoolean("TRABMOECOT")) {
                               calculaValorCampo(self.dsColetaItemCotacao, self.dsColetaItemCotacao.getFieldValueAsNumberOrZero("PERCDESC"), "PERCDESC", "VLRDESC", "field_tgfitc_percdesc", true);
                               RotinaCotacaoUtil.recalcularValoresMoeda(modifiedFieldId, self.dsColetaItemCotacao);
                            } else {
                                calculaValorCampo(self.dsColetaItemCotacao, self.dsColetaItemCotacao.getFieldValueAsNumberOrZero("PERCDESC"), "PERCDESC", "VLRDESC", "field_tgfitc_percdesc", true);
                                calculaTotalProdutoParceiro();
                            }
                        }

                        if ("@VLRMOEDA@PRECOMOE@VLRDESCMOE@".indexOf("@" + modifiedFieldId + "@") > -1) {
                            RotinaCotacaoUtil.recalcularValoresMoeda(modifiedFieldId, self.dsColetaItemCotacao);
                        }

                        if (modifiedFieldId == "CODMOEDA") {
                            //Campos de Reais
                            self.dsColetaItemCotacao.setFieldValue("PRECO", 0);
                            self.dsColetaItemCotacao.setFieldValue("VLRDESC", 0);
                            self.dsColetaItemCotacao.setFieldValue("PERCDESC", 0);

                            //Campos de Moeda estranjeira
                            self.dsColetaItemCotacao.setFieldValue("PRECOMOE", 0);
                            self.dsColetaItemCotacao.setFieldValue("VLRDESCMOE", 0);
                            self.dsColetaItemCotacao.setFieldValue("VLRMOEDA", 0);

                            enabledDisabledOperacaoMoeda();
                        }
                    });


                }
            }

            function btnCalCustosClicked() {
                calculaCustosImpostos();
            }

            function selectTabIndex(index) {
                self.selectedIndexNova = index;
            }

            function btnAprovClicked(e) {

                if (e == i18n('cot_labelAprovar')) {
                    aprovarCotacaoProduto();
                } else if (e == i18n('Cotacao.RotinaCotacao.cot_labelDesaprovar')) {
                    desaprovarCotacaoProduto();
                }
            }

            function getColetaItensSelecionados() {
                return self.dsColetaItemCotacao.getSelectedRecordsAsObjects();
            }

            function desaprovarCotacaoProduto() {
                if (self.dsItemCotacao.getCurrentRow() == null) {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgSelecioneUmItem"));
                    return;
                }
                var rootElem = { parametros: { itemCotacaoAprovado: {} } };

                rootElem.parametros.itemCotacaoAprovado.NUMCOTACAO = { $: self.dsColetaItemCotacao.getFieldValueAsString("NUMCOTACAO") };
                rootElem.parametros.itemCotacaoAprovado.CODPROD = { $: self.dsColetaItemCotacao.getFieldValueAsString("CODPROD") };
                rootElem.parametros.itemCotacaoAprovado.CODPARC = { $: self.dsColetaItemCotacao.getFieldValueAsString("CODPARC") };
                rootElem.parametros.itemCotacaoAprovado.CONTROLE = { $: self.dsColetaItemCotacao.getFieldValueAsString("CONTROLE") };
                rootElem.parametros.itemCotacaoAprovado.CODLOCAL = { $: self.dsColetaItemCotacao.getFieldValueAsString("CODLOCAL") };
                rootElem.parametros.itemCotacaoAprovado.CABECALHO = { $: self.dsColetaItemCotacao.getFieldValueAsString("CABECALHO") };
                rootElem.parametros.itemCotacaoAprovado.DIFERENCIADOR = { $: self.dsColetaItemCotacao.getFieldValueAsString("DIFERENCIADOR") };

                ServiceProxy.callService('mgecot@CotacaoSP.desaprovarCotacao', rootElem
                ).then(function (result) {
                    if(angular.isUndefined(self.dsCabecalho)){
                        self.dsColetaItemCotacao.refresh();
                        self.dsItemCotacao.refreshCurrentRow();
                    }else{
                        self.dsCabecalho.refreshCurrentRow();
                    }
                });
            }


            function aprovarCotacaoProduto() {
                var item = self.dsItemCotacao.getCurrentRowAsObject();

                if (item == null) {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgSelecioneUmItem"));
                    return;
                }
                if ((item["STATUSPRODCOT"] == "A" || item["STATUSPRODCOT"] == "F" || item["STATUSPRODCOT"] == "C")) {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgNaoPodeAprCotStatus"));
                    return;
                }

                var itensSelecionados = getColetaItensSelecionados();

                if (itensSelecionados.length == 1 || self.dsColetaItemCotacao.getCurrentRowAsObject()) {
                    var fornAprovar = self.dsColetaItemCotacao.getCurrentRowAsObject();

                    if (("R" == fornAprovar["SITUACAO"] || "G" == fornAprovar["SITUACAO"]) && fornAprovar["PRECO"] > 0) {
                        var validaDtLimPreco = validaDataLimitePreco(fornAprovar);

                        if (validaDtLimPreco) {
                            chamaAprovacaoFornecedor(fornAprovar);
                        } else {

                            MessageUtils.showAlertWithConfirm(i18n('cot_msgDataLimitePrecoEstourada') + (getItensSelecionados().length == 1 ? "Singular" : ""))
                                .then(function () {
                                    chamaAprovacaoFornecedor(fornAprovar);
                                }, function () {

                                });
                        }
                    } else {
                        MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgSoAprovarForncResp"));
                    }
                } else {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgSelecioneUmFornParaAprovar"));
                }
            }

            function chamaAprovacaoFornecedor(fornAprovar) {
                var rootElem = { parametros: { itemCotacaoAprovado: [] } };

                var itemCotacaoAprovado = {};

                RotinaCotacaoUtil.addElements(itemCotacaoAprovado, fornAprovar);

                rootElem.parametros.itemCotacaoAprovado.push(itemCotacaoAprovado);

                ServiceProxy.callService('mgecot@CotacaoSP.aprovarCotacao', rootElem
                ).then(function (result) {
                    self.dsColetaItemCotacao.refresh();
                    self.dsItemCotacao.refreshCurrentRow();
                });

            }

            function validaDataLimitePreco(item) {
                var dataAtual = DateUtils.getToday();

                var dataLimite = item["DTLIMPRECO"];

                var result = true;

                if (dataLimite != null) {
                    //var difDate = DateUtil.difDates(dataAtual, dataLimite);
                    var dataLimite = DateUtils.stringToDate(RotinaCotacaoUtil.getObjectValue(dataLimite));

                    var diferencaData = DateUtils.diffDates(DateUtils.clearTime(dataAtual), dataLimite);

                    if (dataAtual > dataLimite) {

                        result = false;
                    }
                }
                return result;
            }


            function btnUltCompClicked(e) {
                if (self.dsColetaItemCotacao.getCurrentIndex() >= 0) {

                    SanPopup.open({
                        title: i18n('cot_titlePopupUltCompras'),
                        templateUrl: 'html5/RotinaCotacao/popup/PopupUltimasCompras.tpl.html',
                        controller: 'PopUpUltimasComprasController',
                        controllerAs: 'ctrl',
                        size: 'md',
                        height: '400',
                        windowClass: 'popUpUltimasCompras',
                        okBtnLabel: i18n('cot_txtBtnGerenciaProdutos'),
                        resolve: {
                            data: {
                                coletaPreco: self.dsColetaItemCotacao.getCurrentRowAsObject()
                            }
                        }
                    }).result
                        .then(function (result) {

                        });


                } else {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgSelecioneFornecedorUltimaCompra"));
                }

            }
            function btnDtEntregaClicked(e) {
                if (self.dsColetaItemCotacao.getCurrentIndex() >= 0) {
                    SanPopup.open({
                        title: i18n('Cotacao.RotinaCotacao.cot_titleMultDtEntrega'),
                        templateUrl: 'html5/RotinaCotacao/popup/PopupMultiplasDataEntrega.tpl.html',
                        controller: 'PopUpMultiplasEntregaController',
                        controllerAs: 'ctrl',
                        size: 'md',
                        height: '300',
                        windowClass: 'popUpMultiplasDataEntrega',
                        okBtnLabel: i18n('Cotacao.RotinaCotacao.btnGravarProvisao'),
                        resolve: {
                            data: {
                                dsItemCotacao: self.dsColetaItemCotacao
                            }
                        }
                    })
                } else {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n('Cotacao.RotinaCotacao.cot_msgItemNaoEncontrado'));
                }
            }

            function confirmarInclusaoAlteracaoCabecalho() {
                if (!self.newCotacao && self.editProfile) {
                    var msg = i18n('Cotacao.RotinaCotacao.cot_msgWarnConfirmarAltCabCot');
                    var confirm = i18n("cot_desejaContinuar");

                    var msgToShow = msg + "\n\n" + confirm;

                    MessageUtils
                        .simpleConfirm(msgToShow)
                        .then(function () {
                            confirmCabecalhoCotacao(false);
                        });

                } else {
                    confirmCabecalhoCotacao(true);
                }
            }

            function confirmCabecalhoCotacao(validaItens) {
                if (datasCabCotacaoValidas()) {

                    if (validaItens && !self.dsItemCotacaoNovo.getRecordsAsObjects().length > 0) {

                        var strMessage = "";

                        if (self.newCotacao) {
                            strMessage = i18n("cot_msgErroNovaCotacaoSemItems");
                        } else {
                            strMessage = i18n("cot_msgErroAdicionarProdutosSemItems");
                        }

                        MessageUtils.showAlert(MessageUtils.TITLE_WARNING, strMessage);
                        self.selectedIndexNova = 1;

                        return;
                    }

                    salvarCabecalhoCotacao();

                } else {
                    self.selectedIndexNova = 0;
                }
            }

            function buildItensCotacaoElem(rootElem) {
                var cabecalhoCotacaoElem = {};

                RotinaCotacaoUtil.addElements(cabecalhoCotacaoElem, self.dsCabecalhoCotacaoNovo.getCurrentRowAsObject());

                rootElem.cabecalhoCotacao = cabecalhoCotacaoElem;

                var itensCotacaoElem = { itensCotacao: [] }

                self.dsItemCotacaoNovo.getRecordsAsObjects().forEach(function (item) {
                    var itemCotacaoElem = {};
                    RotinaCotacaoUtil.addElements(itemCotacaoElem, item);
                    itensCotacaoElem.itensCotacao.push(itemCotacaoElem);
                });

                rootElem.itensCotacao = itensCotacaoElem;
            }

            function salvarCabecalhoCotacao() {
                var parametrosElem = { parametros: {} };

                buildItensCotacaoElem(parametrosElem.parametros);

                ServiceProxy.callService('mgecot@CotacaoSP.salvarCotacao', parametrosElem
                ).then(function (result) {
                    var strMsg = ObjectUtils.getProperty(result, 'responseBody.mensagem.itensConflitantes');

                    if (strMsg != null && strMsg != '') {
                        MessageUtils.showAlert("Aviso", strMsg);
                    }

                    self.dsCabecalhoCotacaoNovo.clearDataSet();
                   // self.dsItemCotacaoNovo.clearDataSet();

                    var criteria = getCriteria();

                    var numCotacao = ObjectUtils.getProperty(result, 'responseBody.cotacao.NUMCOTACAO');

                    if (criteria) {
                        criteria.append(" AND this.NUMCOTACAO = ? ", Criteria.buildNumberParameter(numCotacao));
                    } else {
                        criteria = getCriteria(" EXISTS (SELECT 1 FROM TGFITC IT WHERE IT.CODPROD = this.CODPROD AND IT.CODPARC = this.CODPARC AND IT.CODLOCAL = this.CODLOCAL AND IT.CONTROLE = this.CONTROLE AND IT.DIFERENCIADOR = this.DIFERENCIADOR AND (this.CABECALHO='S' or (this.CABECALHO='N' AND this.CODPARC=0))) ");
                        criteria.append(" AND this.NUMCOTACAO = ? ", Criteria.buildNumberParameter(numCotacao));
                    }

                    self.dsItemCotacao.refresh(criteria);                    
                    self.dsItemCotacao.gotoRow(0);

                    self.indiceViewStack = MAIN_PANEL;
                });

            }

            function datasCabCotacaoValidas() {
                var dataInicialCotacao = self.dsCabecalhoCotacaoNovo.getFieldValue("DHINIC");
                var dataFinalCotacao = self.dsCabecalhoCotacaoNovo.getFieldValue("DHFINAL");

                if (self.dsCabecalho != null && dataInicialCotacao == null && dataFinalCotacao == null) {
                    dataInicialCotacao = self.dsCabecalho.getFieldValue("DHINIC");
                    dataFinalCotacao = self.dsCabecalho.getFieldValue("DHFINAL");
                }

                if (dataInicialCotacao != null && dataFinalCotacao != null) {

                    if (DateUtils.compareOnlyDate(dataInicialCotacao, dataFinalCotacao) == 1) {
                        MessageUtils.showAlert(MessageUtils.TITLE_WARNING, i18n("cot_msgCotacaoDHINICMaiorDHFINAL"));
                        return false;
                    } else {
                        return true;
                    }
                } else {
                    return true;
                }
            }

            function calculaPorcentagemCampo(ds, campoOrigem, campoDestino, chaveLabelCampo, validaMax, decimais = 2) {
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

                        if (validaMax) {

                            if (valor > precoDig) {
                                valorValido = false;
                                ds.setFieldValue(campoOrigem, 0);
                                _calculandoCampoPorcentagem = false;
                                MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgErrAliqMaiorPreco", [labelCampo]));
                            }
                        }

                        if (valorValido) {
                            var result = valor / precoDig * 100;
                            result = NumberUtils.stringToNumber(RotinaCotacaoUtil.getNumberWit2Digits(result, decimais));
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

            function interceptFieldMetadata(fieldMetadata, dataset, dynaform) {
                var camposImposto = getNomesCamposImpostos();
                var camposCustos = getCamposCustos();
                var fieldID = fieldMetadata.fieldName;

                if (dataset.getEntityName() == self.dsColetaItemCotacaoName) {
                    if (camposCustos.includes(fieldID)) {
                        fieldMetadata.precision = Math.max(MGEParameters.asInteger("CUSTODEC"), 2);
                    }

                    if (fieldID == "ICMS" || fieldID == "IPI" || fieldID == "RESULTCOT") {
                        fieldMetadata.enabled = false;
                    }
                } else if (dataset.getEntityName() == self.dsItemCotacaoName) {
                    if(RotinaCotacaoUtil.CAMPOS_CHAVE_CABECALHO.indexOf(fieldID) > -1){
						fieldMetadata.enabled = false;
						
						if(fieldID == "CONTROLE"){
							fieldMetadata.visible = false;
						}
					} 
                }
            }

            function interceptColumnMetadata(fieldMetadata, dataset) {
                var fieldName = fieldMetadata.name;
                
                if (fieldName == "VLRSUBST" || fieldName == "IPI" || fieldName == "ICMS" || fieldName == "FRETE") {
                    fieldMetadata.precision = _decimaisImp;
                    fieldMetadata.customCellFormatter = function (value, column, data) {
						return formatNumber(value, _decimaisImp);
    				};
                }
                if (fieldName == "ULTVLRUNITCOMP") {
                    fieldMetadata.customCellFormatter = function (value, column, data) {
						return formatNumber(value, _produtoDECVLR);
    				};
                }
                if (fieldName == "PRECO" || fieldName == "PERCDESC" || fieldName == "VLRDESC" || fieldName == "PERCACRESC" || fieldName == "VLRACRESC" || fieldName == "OUTROS" || fieldName == "TOTALPRODUTO") {
                    fieldMetadata.customCellFormatter = function (value, column, data) {
						return formatNumber(value, _decimaisCusto);
    				};
                }
            }
            
            function formatNumber(value, precision, prettyPrecision) {
            	if (precision) {
            		return NumberUtils.format(value, precision, prettyPrecision);
            	}
            	return value;
            }
            
           function interceptFieldElement(fieldName, element, controller){
               switch (fieldName) {
                   case 'CONTROLE':
                       _itemCotacaoControle = controller;
                       break;
                   case 'QTDCOTADA':
                       _fieldQtdProduto = controller;
                       break;
                   case 'MARCA':
                       _fieldMarca = controller;
                       break;

                   case 'CODVOL':
                       pesquisaVolume = controller;
                       break;
                    case 'PRECO':
                        _fieldPrecoColetaItem = controller;
                        break;
                    case 'TOTALPRODUTO':
                        _fieldTotProdColetaItem = controller;
                        break;
               }
            }

            function interceptFieldElementColetaItemCotacaoName(fieldName, element, controller) {
                switch (fieldName) {
                    case 'OBS':
                        _fieldobservacaoColeta = controller;
                        break;
                    case 'CODMOEDA':
                        _campoMoeda = controller;
                        break;
                    case 'PRECO':
                        _fieldPrecoColetaItem = controller;
                        break;
                    case 'PRECOMOE':
                        _fieldPrecoMoedaColetaItem = controller;
                        break;
                    case 'TOTALPRODUTO':
                        _fieldTotProdColetaItem = controller;
                        break;
                    case 'CONTROLE':
                        _itemCotacaoControleNovo = controller;
                        break;
                    case 'QTDCOTADA':
                        _fieldQtdProdutoNovo = controller;
                        break;
                    case 'CODLOCAL':
                        _fieldLocalColetaItemNovo = controller;
                        break;
                    case 'CODVOL':
                        _fieldVolumeColetaItemNovo = controller;
                        break;
                }
            }

            function acceptFieldNovo(field, dataset) {
                var entityName = dataset.getEntityName();
                var fieldName = field.name;

                if (entityName == 'ItemCotacao') {
                    if (['CODPARC', 'NUMCOTACAO', 'DIFERENCIADOR', 'CABECALHO', 'SITUACAO', 'STATUSPRODCOT','PRECO'].indexOf(fieldName) > -1) {
                        return false;
                    }
                }
                
                return true;
            }

            function calculaValorCampo(ds, aliq, campoOrigem, campoDestino, chaveLabelCampo, validaMax100, decimais = 2) {
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

                            MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgErrAliqMaiorCem", [labelCampo]));
                        }

                        if (aliqValida) {
                            var result = precoDig * aliq / 100;
                            result = RotinaCotacaoUtil.getNumberWit2Digits(result, decimais);

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


            function enabledBtnAprov() {
                var _enabled = !self.dsColetaItemCotacao.isInsertionMode() && self.dsColetaItemCotacao.size() > 0;

                if (self.dsColetaItemCotacao.size() > 0 && _parmPermiteDesaprovar) {
                    var fornAprovar = self.dsColetaItemCotacao.getCurrentRowAsObject();

                    if (fornAprovar == null) {
                        _enabled = false;
                    }

                } else if (self.dsItemCotacao.size() > 0 && !_parmPermiteDesaprovar) {
                    var itemAprovar = self.dsItemCotacao.getCurrentRowAsObject();

                    if (itemAprovar == null || itemAprovar.STATUSPRODCOT == "F") {
                        _enabled = false;
                    }

                } else {
                    _enabled = false;
                }

                if (!_enabled) {
                    self.labelAprovDesaprov = i18n('cot_labelAprovar');
                }

                self.disabledAprovDesaprov = !_enabled;
            }

            function calculaTotalProdutoParceiro() {

                if (_fieldTotProdColetaItem) {
                    var item = self.dsColetaItemCotacao.getCurrentRowAsObject();
                    var total = RotinaCotacaoUtil.calculaTotalItemCotacaoByItem(item);
                    var qtdDigitos = Number(_produtoDECVLR) > 0 ? Number(_produtoDECVLR) : (item != null ? (item["PRODDECVLR"] != null ? item["PRODDECVLR"] : 2) : 2);

                    _fieldTotProdColetaItem.scope.precision = Number(qtdDigitos);
                    _fieldTotProdColetaItem.scope.value = NumberUtils.stringToNumber(total, qtdDigitos);
                }

            }

            function enabledDisabledOperacaoMoeda() {
                let isMoedaPadrao = self.dsColetaItemCotacao.getFieldValueAsNumberOrZero("CODMOEDA") == MGEParameters.asInteger("civil.moeda.padrao");

                //Campos de Reais
                self.dynaColetaItemCotacao.setFieldProperty('PRECO', 'enabled', isMoedaPadrao);
                self.dynaColetaItemCotacao.setFieldProperty('VLRDESC', 'enabled', isMoedaPadrao);
                
                //Campos de Moeda estranjeira
                self.dynaColetaItemCotacao.setFieldProperty('PRECOMOE', 'enabled', !isMoedaPadrao);
                self.dynaColetaItemCotacao.setFieldProperty('VLRDESCMOE', 'enabled', !isMoedaPadrao);
                self.dynaColetaItemCotacao.setFieldProperty('VLRMOEDA', 'enabled', !isMoedaPadrao);
            }

            function carregaPreferencias(callback) {
                var config = { config: { chave: self.resourceIDItens, tipo: "T" } };

                ServiceProxy.callService('mge@SystemUtilsSP.getConf', config
                ).then(function (result) {

                    var config = ObjectUtils.getProperty(result, 'responseBody.config');

                    self.preferencias = {};
                    if(config){
                        self.preferencias["CALCULARCUSTOS"] = RotinaCotacaoUtil.getObjectValue(config.calculaCusto) == "true";
                        self.preferencias["CALCULARIMPOSTOS"] = RotinaCotacaoUtil.getObjectValue(config.calculaImpostos) == "true";
                        self.preferencias["ULTIMOVALORCOMPRA"] = RotinaCotacaoUtil.getObjectValue(config.ultimoValorCompra) == "true";
                        self.preferencias["USAPRAZOENTREGARESUMO"] = RotinaCotacaoUtil.getObjectValue(config.usaDtEntregaResumo) == "true";
                        self.preferencias["NUNOTACALCULOCUSTO"] = RotinaCotacaoUtil.getObjectValue(config.nuNota);
                        self.preferencias["ATUALMOECALCMELHORFORNECEDOR"] = RotinaCotacaoUtil.getObjectValue(config.atualMoeCalcMelhorFornecedor) == "true";
                        self.preferencias["ATUALMOECALCGERARPEDIDO"] = RotinaCotacaoUtil.getObjectValue(config.atualMoeGerarPedido) == "true";
                    }

                    if (callback != null) {
                        callback();
                    }

                });
            }

            function habilitaCampoImpostosColeta() {
                _dynaformItemCotacao.setFieldProperty(getNomesCamposImpostos(), 'enabled', !self.preferencias["CALCULARIMPOSTOS"]);
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

            function getCamposCustos() {
                var camposCustos = [];

                camposCustos.push("CUSGER");
                camposCustos.push("CUSMEDICM");
                camposCustos.push("CUSREP");
                camposCustos.push("CUSSEMICM");
                camposCustos.push("CUSVARIAVEL");

                return camposCustos;
            }

            function refreshDsItemCotacao(crit, pkItem) {

                if (pkItem == null) {
                    pkItem = getPkItemCotacao(self.dsItemCotacao.getCurrentRowAsObject());
                    self.dsItemCotacao.refresh(crit, pkItem);
                } else {
                    self.dsItemCotacao.refresh(crit);
                }
            }

            function getPkItemCotacao(itemSel) {
                var pkItemCotacao = new Object();

                if (itemSel != null) {
                    pkItemCotacao["NUMCOTACAO"] = itemSel["NUMCOTACAO"];
                    pkItemCotacao["CODPROD"] = itemSel["CODPROD"];
                    pkItemCotacao["CODLOCAL"] = itemSel["CODLOCAL"];
                    pkItemCotacao["CONTROLE"] = itemSel["CONTROLE"];
                    pkItemCotacao["DIFERENCIADOR"] = itemSel["DIFERENCIADOR"];
                    pkItemCotacao["CABECALHO"] = itemSel["CABECALHO"];
                    pkItemCotacao["CODPARC"] = itemSel["CODPARC"];
                }

                return pkItemCotacao;
            }

            function getCriteriaColetaItem() {
                self.dsColetaItemCotacao.addTXProperty("usa.ultimo.valor.unitario.compra", self.preferencias["ULTIMOVALORCOMPRA"]);

                return RotinaCotacaoUtil.getEnvironmentCriteriaMoeda(self.dsColetaItemCotacao.getFieldValueAsNumberOrZero("CODPARC"));;
            }

            function onFormLoadedItemCotacaoNovo(form) {
                _formApiItemCotacao = form;
            }

            function atualizarControleUI(controleUI, tipo, label, opcoes, novoItemCotacao) {
                // console.log(controleUI, tipo, label, opcoes, novoItemCotacao);
                
                if(controleUI){
                        var formLabel = null;
                    	
                        if(tipo == "S"){
                            _formApiItemCotacao.setFieldProperty('CONTROLE', 'visible', true);
                        	
                            formLabel = label;
                        	
                            if(opcoes){
                                controleUI.populateCombo(opcoes);
                            }

                            controleUI.selectUI(tipo);

                            _formApiItemCotacao.setFieldProperty('CONTROLE', 'description', (StringUtils.isNotEmpty(formLabel) ? formLabel : i18n('cot_labelControle')));
                            
                            _dynaformItemCotacao.setFieldProperty('CONTROLE', 'description', (StringUtils.isNotEmpty(formLabel) ? formLabel : i18n('cot_labelControle')));
                            _dynaformItemCotacao.setFieldProperty('CONTROLE', 'visible', true);

                            if(novoItemCotacao){
                                self.dsItemCotacaoNovo.makeFieldRequired("CONTROLE");
                            } 
                        }else{
                            _formApiItemCotacao.setFieldProperty('CONTROLE', 'visible', false);

                            if(novoItemCotacao){
                                self.dsItemCotacaoNovo.makeFieldNonRequired("CONTROLE");
                            } 
                        }
                }
            }

            function personalizaItemCotacaoPorProduto(codProd, campoControle, campoQuantidade, campoPreco) {
                if (codProd > 0) {
                    var objProduto = {};

                    var parametros = { parametros: { codProd: codProd } };

                    ServiceProxy.callService('mgecot@CotacaoSP.carregaConfigProduto', parametros
                    ).then(function (result) {

                        var produto = ObjectUtils.getProperty(result, 'responseBody.produto');

                        if (produto) {

                            objProduto["TIPCONTEST"] = RotinaCotacaoUtil.getObjectValue(produto.TIPCONTEST);
                            objProduto["LISCONTEST"] = RotinaCotacaoUtil.getObjectValue(produto.LISCONTEST);
                            objProduto["TITCONTEST"] = RotinaCotacaoUtil.getObjectValue(produto.TITCONTEST);
                            objProduto["USALOCAL"] = RotinaCotacaoUtil.getObjectValue(produto.USALOCAL);
                            objProduto["MARCA"] = RotinaCotacaoUtil.getObjectValue(produto.MARCA);

                            _agrupMinItemCotacao = produto.AGRUPMIN;

                            _produtoDECQTD = RotinaCotacaoUtil.getObjectValue(produto.DECQTD);
                            _produtoDECVLR = RotinaCotacaoUtil.getObjectValue(produto.DECVLR);

							_produtoDECQTD = NumberUtils.getNumberOrZero(_produtoDECQTD);
							_produtoDECVLR = NumberUtils.getNumberOrZero(_produtoDECVLR);

                            atualizarControleUI(campoControle, objProduto["TIPCONTEST"], objProduto["TITCONTEST"], objProduto["LISCONTEST"], false);

                            atualizaPrecisaoCampoQtdItemCotacao(campoQuantidade, _produtoDECQTD);
                            atualizaPrecisaoCampoQtdItemCotacao(campoPreco, _produtoDECVLR);
                            fechaPreferencias();
                        }
                    });
                }
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

            function validaAgrupMinProd(agrupMinProd, qtdCompradaProd) {
                var result = true;

                if (agrupMinProd > qtdCompradaProd) {
                    MessageUtils.showError(MessageUtils.TITLE_WARNING, i18n("cot_msgQtdMenorAgrupMin"));
                    result = false;
                } else {
                    if (agrupMinProd > 0 && qtdCompradaProd % agrupMinProd != 0) {
                        MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n('Cotacao.RotinaCotacao.msgQtdForaAgrupMin', [NumberUtils.stringToNumber(agrupMinProd, 2)]));
                        result = false;
                    }
                }
                return result
            }

            function addProdutos() {

                if (self.dsCabecalho != null && !self.dsCabecalho.canInsert) {
                    MessageUtils.showAlert(MessageUtils.TITLE_WARNING, i18n("SanDB.DataSet.messageNaoPermitidoInserir"));
                    return;
                }
                if(!self.canInsert){
                    MessageUtils.showAlert(SkI18nService.instant('Attach.msgControleAcesso'), SkI18nService.instant('Attach.NaoehPossivelInserirRecord'));
                    return;
                }

                adicionarProdutosCotacao();
            }

            function voltarPreferencias() {
                if (self.dsCabecalhoCotacaoNovo) {
                    self.dsCabecalhoCotacaoNovo.refreshCurrentRow();
                }

                fechaPreferencias();
            }

            function gerarPedidos() {
                getItensCotacao(function (itensSelecionados) {
                    if (possuiSomenteItensAprovados(itensSelecionados)) {
                        var strValidacaoDtLimite = validateDataLimiteItens(itensSelecionados);

                        if (StringUtils.emptyAsNull(strValidacaoDtLimite) == null) {
                            resumoItensAprovadosFornecedores(itensSelecionados);
                        } else {
                            var param = [strValidacaoDtLimite];
                            var msg = i18n("cot_msgAvisoPrazoVencido");
                            var confirm = i18n("cot_desejaContinuar");
                            var msgToShow = msg + "\n\n" + strValidacaoDtLimite + "\n" + confirm;

                            MessageUtils.showAlertWithConfirm(MessageUtils.TITLE_CONFIRMATION, msgToShow, null, { okBtnLabel: i18n('Geral.buttonSim') })
                                .then(function () {
                                    resumoItensAprovadosFornecedores(itensSelecionados);
                                }, function (reason) {
                                });

                        }
                    } else {
                        MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n('Cotacao.RotinaCotacao.cot_msgValidateGerarPedidos'));
                    }
                }, true);
            }

            function resumoItensAprovadosFornecedores(itensSelecionados) {
                var parametros = getXmlItensCotacao(itensSelecionados);

                parametros.usaDtEntregaResumo = self.preferencias["USAPRAZOENTREGARESUMO"];
                parametros.mantermoeda = self.preferencias["ATUALMOECALCGERARPEDIDO"];

                ServiceProxy.callService('mgecot@CotacaoSP.buscaResumoItensAprovForn', parametros)
                    .then(function (result) {
                        // console.log(result);

                        var records = self.resumoItensAprovados.gradeParceiros(ObjectUtils.getProperty(result, 'responseBody.fornecedores'));
                        // var records = ObjectUtils.getProperty(result, 'responseBody.fornecedores');

                        if (self.resumoItensAprovados.isObrigatorioInformarProdEsp(records)) {
                            SanPopup.open({
                                title: i18n('Cotacao.RotinaCotacao.titlePopupProdutosEspecificos'),
                                templateUrl: 'html5/RotinaCotacao/popup/PopupProdutosEspecificos.tpl.html',
                                controller: 'PopupProdutosEspecificosController',
                                controllerAs: 'ctrl',
                                size: 'sm',
                                height: '400',
                                okBtnLabel: i18n('Geral.confirmar'),
                                windowClass: 'popUpProdutosEspecificos',
                                resolve: {
                                    data: {
                                        records: records,
                                        confirmarFunction: function (newRecords) {
                                            // console.log(newRecords);
                                            chamaResumoItensFornecedor(newRecords);
                                        }
                                    }
                                }
                            }).result
                                .then(function (result) {
                                    // console.log(result);
                                 });
                        } else {
                            chamaResumoItensFornecedor(records);
                        }
                    });
            }

            function chamaResumoItensFornecedor(records) {
                self.indiceViewStack = GERAR_PEDIDO;
                self.resumoItensAprovados.chamaResumoItensFornecedor(records);
            }

            // Envia os itens selecionados + o tipo de negociacao (popup) para o servico geraPedidoSP.
            function geraPedidoNovoServico(itensSelecionados) {
                openParametrosGeraPedidoPopup().then(function (result) {
                    // Monta os itens no mesmo formato usado por resumoItensAprovadosFornecedores.
                    // O service usa esses itens apenas para identificar as cotacoes (NUMCOTACAO).
                    var parametros = getXmlItensCotacao(itensSelecionados);

                    // Parametro do popup (nivel raiz do request) — equivale ao antigo
                    // contextoAcao.getParam("CODTIPVENDA") da acao de botao.
                    parametros.CODTIPVENDA = result.psqCodTipVenda;

                    ServiceProxy.callService('geraPedidoSP.geraPedido', parametros)
                        .then(function (res) {
                            var msg = ObjectUtils.getProperty(res, 'responseBody.MENSAGEM');
                            MessageUtils.showInfo(MessageUtils.TITLE_INFORMATION, msg || i18n("cot_msgGeraPedidoSucesso"));
                            self.dsItemCotacao.refresh();
                        })
                        .catch(function (err) {
                            MessageUtils.showError(MessageUtils.TITLE_ERROR, "" + err);
                        });
                });
            }

            function openParametrosGeraPedidoPopup() {
                return SanPopup.open({
                    title: i18n('Cotacao.RotinaCotacao.titlePopupParametrosGeraPedido'),
                    templateUrl: 'html5/RotinaCotacao/popup/PopupParametrosGeraPedido.tpl.html',
                    controller: 'PopupParametrosGeraPedidoController',
                    controllerAs: 'ctrl',
                    size: 'md',
                    height: '450',
                    okBtnLabel: i18n('Geral.confirmar')
                }).result;
            }


            function voltarGerarPedido () {
                self.indiceViewStack = MAIN_PANEL;
            }

            function onGerarPedidoCreated ($instance) {
                self.resumoItensAprovados = $instance;
            }

            function getItensCotacao (callBack, apenasAprovados) {
                if (self.dsItemCotacao.isInsertionMode() || self.dsItemCotacao.getCurrentRow() == null) {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgSelecioneUmItem"));
                    return;
                }

                ServiceProxy.callService('mgecot@CotacaoSP.getItensCotacao', { params: { numCotacao: self.dsItemCotacao.getFieldValue("NUMCOTACAO") } })
                    .then(function (result) {
                        var responseBody = ObjectUtils.getProperty(result, 'responseBody');
                        var itens = getItensByXML(responseBody, apenasAprovados);
                        callBack(itens);
                    });
            }

            function getItensByXML (result, apenasAprovados) {
                var itens = [];

                var itensCotacao = ObjectUtils.getProperty(result, 'itensCotacao.item');

                if (!angular.isArray(itensCotacao)) {
                    itensCotacao = [itensCotacao];
                }
                itensCotacao.forEach(function (item) {
                
                	if($.isEmptyObject(item.CONTROLE)){
                		item.CONTROLE = { $: " " };
                	}

                    if (apenasAprovados) {
                        if (RotinaCotacaoUtil.getObjectValue(item["STATUSPRODCOT"]) == "A") {
                            itens.push(item);
                        }
                    } else {
                        itens.push(item);
                    }
                });

                return itens;
            }

            function dynaformCreated() {
                _paramUsaProdutoGenerico = MGEParameters.asBoolean("mgecom.usa.produto.generico");
                _parmPermiteDesaprovar = MGEParameters.asBoolean("mge.cotacao.permite.desaprovar.apos.gerar.pedido");

                if (self.dsCabecalho != null) {
                    self.painelFiltroVisible = false;
                }

                carregaPreferencias(null);

                if (self.painelFiltro) {
                    self.painelFiltro.buscaUltimoFiltro();
                }


                setEditProfile(false);

                if (!angular.isUndefined(self.dsCabecalhoCotacaoNovo)) {
	                self.dsCabecalhoCotacaoNovo.addRecordRemovedListener = function () {
	                    canConfirm();
	                }
	
	                self.dsCabecalhoCotacaoNovo.loadRecordsFromServer = true;
	            }                

                if (!angular.isUndefined(self.dsItemCotacaoNovo)) {

	                self.dsItemCotacaoNovo.beforePostAction(function () {
	                    if (self.dsItemCotacaoNovo.validateRecord()) {
	                        var qtdItem = self.dsItemCotacaoNovo.getFieldValueAsNumberOrZero("QTDCOTADA");
	                        var validacaoAgrupMin = validaAgrupMinProd(_agrupMinItemCotacaoNovo, qtdItem);
	                        if (!validacaoAgrupMin) {
	                            return false;
	                        }
	                        var validaLocalAnalitico = validaLocalItemCotacaoNovoAnalitico();
	                        if (!validaLocalAnalitico) {
	                            return false;
	                        }
	                        if (self.dsItemCotacaoNovo.isInsertionMode() || self.dsItemCotacaoNovo.isCopyingRecord()) {
	                            return incluirItemCotacao();
	                        }
	                    } else {
	                        return false;
	                    }
	                    return true;
	                })
	
	                self.dsItemCotacaoNovo.addDataSavedListener(function () {
	                    canConfirm();
	                });
	
	                self.dsItemCotacaoNovo.addRecordRemovedListener(function () {
	                    canConfirm();
	                })
	
	                self.dsItemCotacaoNovo.addInsertionModeListener(function () {
	
	                    var codProd = self.dsItemCotacaoNovo.getFieldValueAsNumberOrZero("CODPROD");
	
	                    // valores padrao para novo item de cotacao
	                    self.dsItemCotacaoNovo.makeFieldRequired("CODLOCAL");
	                    self.dsItemCotacaoNovo.makeFieldRequired("CONTROLE");
	                    self.dsItemCotacaoNovo.makeFieldRequired("CODVOL");
	
	                    self.dsItemCotacaoNovo.setFieldValue("CODPARC", 0);
	                    self.dsItemCotacaoNovo.setFieldValue("CABECALHO", "S");
	                    self.dsItemCotacaoNovo.setFieldValue("DIFERENCIADOR", 0);
	
	                });
	
	                self.dsItemCotacaoNovo.addLineChangeListener(function () {
	                    var codProd = self.dsItemCotacaoNovo.getFieldValueAsNumberOrZero("CODPROD");
	                    personalizaItemCotacaoNovoPorProduto(codProd);
	                });
	
	                self.dsItemCotacaoNovo.addDataModifiedListener(function (modifiedFieldId) {
	                    if (modifiedFieldId == "CODLOCAL") {
	                        var codLocal = self.dsItemCotacaoNovo.getFieldValueAsNumber("CODLOCAL");
	                        buscaLocalProdutoItemNovaCotacao(codLocal);
	                    }
	                });

                }                

                registerEventsParceirorSimplificado();

                self.camposFiltro = ["CABECALHO", "DIFERENCIADOR", "ALIQICMS", "ALIQIPI", "CODCONTATO", "CODMOEDA", "CODPARC", "CODTIPVENDA", "CONFIABFORN", "CUSGER", "CUSMEDICM", "CUSREP", "CUSSEMICM", "CUSVARIAVEL", "DHENTREGA", "DIFALIQICMS", "DTCOLETAPRECO", "DTMOEDA", "FATMINIMO", "GARANTIA", "ICMS", "IPI", "MELHOR", "OUTROS", "PERCACRESC", "PERCDESC", "PRAZOENTREGA", "PRAZOMEDIO", "PRAZOVALPROP", "PRECO", "PRECOCALC", "QUALATEND", "QUALPROD", "RESULTCOT", "SITUACAO", "TAXAJURO", "VLRACRESC", "VLRDESC", "VLRMOEDA", "VLRSUBST", "SEQITEMCOT", "TIPOCOLPRECO", "DTLIMPRECO", "ULTVLRUNITCOMP", "ULTCUSGER", "ULTCUSREP", "ULTCUSVAR"];

            }

            function validaLocalItemCotacaoNovoAnalitico() {
                var result = true;
                var localAnalitico = "";
                var codLocal = 0;
                if (_localItemCotacaoNovo != null) {
                    localAnalitico = RotinaCotacaoUtil.getObjectValue(_localItemCotacaoNovo["ANALITICO"]);
                    codLocal = _localItemCotacaoNovo["CODLOCAL"];
                }
                if (StringUtils.emptyAsNull(localAnalitico) == null || codLocal == 0) {
                    result = true;
                } else if ("S" != localAnalitico) {
                    MessageUtils.showError(MessageUtils.TITLE_WARNING, i18n("cot_msgErroLocalNaoAnalitico"));
                    result = false;
                } else {
                    result = true;
                }
                return result;
            }


            function sugereUnidadePadrao() {
                var codProd = self.dsItemCotacaoNovo ? self.dsItemCotacaoNovo.getFieldValueAsNumberOrZero("CODPROD") : 0;
                
                if (NumberUtils.getNumberOrZero(codProd) > 0) {
                    var parametros = { parametros: { codProd: codProd  } };

                    ServiceProxy.callService('mgecot@CotacaoSP.sugerirUnidadePadrao', parametros)
                        .then(function (result) {
                            var response = ObjectUtils.getProperty(result, 'responseBody');
							self.dsItemCotacaoNovo.setFieldValueAsString("CODVOL", "");

                            if (response.hasOwnProperty("codVol")) {
                                var codVol = response.codVol;
                                self.dsItemCotacaoNovo.setFieldValueAsString("CODVOL", codVol);
                            }

                        });
                }
            }
            
            function carregaComplementoProduto() {
            	var codProd = self.dsItemCotacaoNovo ? self.dsItemCotacaoNovo.getFieldValueAsNumberOrZero("CODPROD") : 0;

            	if (NumberUtils.getNumberOrZero(codProd) > 0) {
            		var parametros = { parametros: { codProd: codProd  } };
            		ServiceProxy.callService('mgecot@CotacaoSP.carregarComplementoProduto', parametros)
            		.then(function (result) {
            			var response = ObjectUtils.getProperty(result, 'responseBody');

            			if (response.hasOwnProperty("complDesc")) {
            				var complDesc = response.complDesc;
            				self.dsItemCotacaoNovo.setFieldValueAsString("COMPLDESC", complDesc);
            			} else {
            				self.dsItemCotacaoNovo.setFieldValueAsString("COMPLDESC", null);
            			}

            		});
            	}
            }

            function incluirItemCotacao() {
                var codProdNew = self.dsItemCotacaoNovo.getFieldValueAsNumber("CODPROD");

                var controle = self.dsItemCotacaoNovo.getFieldValueAsString("CONTROLE");
                var codLocal = self.dsItemCotacaoNovo.getFieldValueAsNumber("CODLOCAL");
                
                if (_produto.codProd == codProdNew && _produto.usaLocal == 'S' && codLocal == 0) {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n('Cotacao.RotinaCotacao.msgInformeLocalproduto', [codProdNew]));
                    return false;
                }

                var indiceItem = indiceProdutoGrid(codProdNew, controle, codLocal);
                if (indiceItem >= 0) {

                    MessageUtils.simpleConfirm(i18n('cot_msgProdutoCotacaoExisteGrid')).then(
                        function () {
                            var qtdAdicionada = self.dsItemCotacaoNovo.getFieldValueAsNumber("QTDCOTADA");
                            var itensGrid = self.dsItemCotacaoNovo.getRecordsList();
                            var order = self.dsItemCotacaoNovo.getFieldMetadata("QTDCOTADA").order;

                            var qtdItemGrid = itensGrid.getItem(indiceItem)[order];
                            var novaQtd = qtdAdicionada + qtdItemGrid;

                            itensGrid.getItem(indiceItem)[order] = novaQtd;
                            self.dsItemCotacaoNovo.gotoRow(indiceItem);

                            if (self.dsItemCotacaoNovo.isInsertionMode()) {
                                self.dsItemCotacaoNovo.cancelEdition();
                            }
                        },
                        function () {
                            if (self.dsItemCotacaoNovo.isInsertionMode()) {
                                self.dsItemCotacaoNovo.cancelEdition();
                            }
                        }
                    );

                    return false;
                } else {
                    return true;
                }
            }

            function indiceProdutoGrid(codProd, controle, codLocal) {

                var itensCotacao = self.dsItemCotacaoNovo.getRecordsAsObjects();

                for (var i = 0; i < itensCotacao.length; i += 1) {
                    var item = itensCotacao[i];

                    var controleObj = item["CONTROLE"] == null ? "" : item["CONTROLE"];

                    if (item["CODPROD"] == codProd && controleObj == controle && item["CODLOCAL"] == codLocal) {
                        return i;
                    }
                }
                return -1;
            }


            function canConfirm() {
                _canConfirm = (self.dsItemCotacaoNovo.getRecordsAsObjects().length > 0);
            }


            function buscaLocalProdutoItemNovaCotacao(codLocal) {
                if (codLocal) {


                    var params = {
                        entity: {
                            name: "LocalFinanceiro",
                            criterio: {
                                nome: "CODLOCAL",
                                valor: codLocal
                            },
                            fields: {
                                field: [
                                    {
                                        name: "ANALITICO"
                                    }
                                ]
                            }
                        }
                    };

                    ServiceProxy.callService('mge@crud.find', params)
                        .then(function (result) {
                            var local = ObjectUtils.getProperty(result, 'responseBody.entidades.entidade');

                            _localItemCotacaoNovo = {};
                            _localItemCotacaoNovo["CODLOCAL"] = codLocal;

                            if (local != null) {
                                _localItemCotacaoNovo["ANALITICO"] = local.ANALITICO;
                            } else {
                                _localItemCotacaoNovo["ANALITICO"] = 'N';
                            }

                        });

                }
            }

            function personalizaItemCotacaoNovoPorProduto(codProd) {
                if (codProd > 0) {
                    var objProduto = new Object();
                    var parametros = { parametros: { codProd: codProd } };

                    ServiceProxy.callService('mgecot@CotacaoSP.carregaConfigProduto', parametros)
                        .then(function (result) {

                            var produto = ObjectUtils.getProperty(result, 'responseBody.produto');

                            if (produto) {
                                objProduto["TIPCONTEST"] = RotinaCotacaoUtil.getObjectValue(produto.TIPCONTEST);
                                objProduto["LISCONTEST"] = RotinaCotacaoUtil.getObjectValue(produto.LISCONTEST);
                                objProduto["TITCONTEST"] = RotinaCotacaoUtil.getObjectValue(produto.TITCONTEST);
                                objProduto["DECQTD"] = RotinaCotacaoUtil.getObjectValue(produto.DECQTD);
                                objProduto["USALOCAL"] = RotinaCotacaoUtil.getObjectValue(produto.USALOCAL);

                                _agrupMinItemCotacaoNovo = RotinaCotacaoUtil.getObjectValue(produto.AGRUPMIN);
                                _produtoDECQTDItemCotacaoNovo = RotinaCotacaoUtil.getObjectValue(produto.DECQTD);

                                atualizarControleUI(_itemCotacaoControleNovo, objProduto["TIPCONTEST"], objProduto["TITCONTEST"], objProduto["LISCONTEST"], true);

                                atualizaPrecisaoCampoQtdItemCotacao(_fieldQtdProdutoNovo, objProduto["DECQTD"]);

                                var atualizaLocal = (MGEParameters.asBoolean("UTILIZALOCAL") && (objProduto["USALOCAL"] == 'S'));

                                atualizaLocalUI(atualizaLocal);
                            }
                        });

                }
            }



            function atualizaLocalUI(usaLocalProduto) {
                _fieldLocalColetaItemNovo.somenteAnalitico = true;
                
                var codLocalAtual = self.dsItemCotacaoNovo.getFieldValueAsNumberOrZero("CODLOCAL");
                if (usaLocalProduto) {
                    if (codLocalAtual >= 0) {
						_fieldLocalColetaItemNovo.setData(codLocalAtual);
                        _fieldLocalColetaItemNovo.loadDescription();
                    } else {
                        self.dsItemCotacaoNovo.setFieldValue("CODLOCAL", null);
                        _fieldLocalColetaItemNovo.setDescriptionValue("");
                    }
                } else {
                    self.dsItemCotacaoNovo.setFieldValue("CODLOCAL", 0);
                    _fieldLocalColetaItemNovo.setData(0);
                    _fieldLocalColetaItemNovo.loadDescription();
                }

                _formApiItemCotacao.setFieldProperty('CODLOCAL', 'enabled', usaLocalProduto);
                _formApiItemCotacao.setFieldProperty('CODLOCAL', 'required', usaLocalProduto);
            }

            function atualizaCriteriaVolumeItemCotacaoNovo() {
                _fieldVolumeColetaItemNovo.setDescriptionValue('');
                _fieldVolumeColetaItemNovo.enviromentCriteria = getCodVolProdCriteria;
            }

            function registerEventsParceirorSimplificado() {
                $document.bind('keydown', keydownHandler);
            }

            function keydownHandler(evt) {
                var key = evt.keyCode;
                if (key == _keymap.F2) {
                    openCadastroParceiroSimplificado();
                }
            }

            function openCadastroParceiroSimplificado() {
                var data = {
                    resourceIDTelaPai: SkApplicationInstance.getScreenResourceID() + '.personalizedFilter.RotinaCotacao',
                    codigoParceiro: self.dsItemCotacao.getFieldValue("CODPARC"),
                };

                CadastroParceiroSimplificadoService.show(data)
                    .result.then(function (result) {

                    });
            }


            function buscaUsaLocalProduto(codProd) {

                if (codProd) {
                    var params = {
                        entity: {
                            name: "Produto",
                            criterio: {
                                nome: "CODPROD",
                                valor: codProd
                            },
                            fields: {
                                field: [
                                    {
                                        name: "USALOCAL"
                                    }
                                ]
                            }
                        }
                    };
    
                    ServiceProxy.callService('mge@crud.find', params)
                        .then(function (result) {
                            _produto.codProd = codProd
                            _produto.usaLocal = ObjectUtils.getProperty(result, 'responseBody.entidades.entidade.USALOCAL.$');
                        });
                }
            }
        }


    ]);