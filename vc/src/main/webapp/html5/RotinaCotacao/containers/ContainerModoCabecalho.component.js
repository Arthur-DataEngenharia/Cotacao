/**
 * Created by Handz (Eduardo,Charles) on 10/02/2020.
 */
angular
    .module('RotinaCotacaoApp')
    .component('containerModoCabecalho', {
        templateUrl: 'html5/RotinaCotacao/containers/ContainerModoCabecalho.tpl.html',
        controller: 'ModoCabecalhoController',
        controllerAs: 'ctrl',
        bindings: {
            onContentCreated: '&?',
            configRotinaCotacao: '<'
        }
    })
    .controller('ModoCabecalhoController', ['WhenReady', 'ServiceProxy', 'i18n', '$scope', 'ObjectUtils', 'MessageUtils', 'RotinaCotacaoUtil', 'SkApplicationInstance', 'SanPopup', 'DateUtils', 'StringUtils','MGEParameters', 'MGEAuthorizationService',
        function (WhenReady, ServiceProxy, i18n, $scope, ObjectUtils, MessageUtils, RotinaCotacaoUtil, SkApplicationInstance, SanPopup, DateUtils, StringUtils, MGEParameters, MGEAuthorizationService) {
            var self = this;

            ObjectUtils.implements(self, IDataSetObserver);
            ObjectUtils.implements(self, IDynaformInterceptor);
            ObjectUtils.implements(self, IFilterPanelInterceptor);

            let _whenFormReady = WhenReady();
            var _dynaformCabecalhoCotacao;
            var _publicAPI = {};
            _publicAPI.loadByPK = loadByPK;
            _publicAPI.setResourceID = setResourceID;
            _publicAPI.setInstance = setInstance;

            self.preferenciasInstance = null;
            self.preferencias = {};

            var _salvarFiltro = false;
            var __copyCotacao = false;
            var cotacaoOrig;
            


            const COLETA_MANUAL_PANEL = 3;
            const GERAR_PEDIDO = 1;
            const PREFERENCIAS_PANEL = 2;
            const MAIN_PANEL = 0;

            self.dsCabCotacao;
            self.resourceID;
            self.coletaManualPanel;
            self.abaItens;
            self.onDynaformLoaded = onDynaformLoaded;
            self.buildDynaOptions = buildDynaOptions;
            self.indiceViewStack = 0;
            self.applyFilter = applyFilter;
            self.onFilterCreated = onFilterCreated;
            self.onColetaCreated = onColetaCreated;
            self.onColetaPreferencias = onColetaPreferencias;
            self.voltarColetaManual = voltarColetaManual;
            self.voltarGerarPedido = voltarGerarPedido;
            self.painelFiltro;
            self.salvarPreferencias = salvarPreferencias;
            self.customTabsLoader = customTabsLoader;
            self.enviarProdutosPortal = enviarProdutosPortal;
            self.enviarItensSugeridosPortal = enviarItensSugeridosPortal;
            self.carregaPreferencias = carregaPreferencias;
            self.gerarPedidos = gerarPedidos;
            self.fechaPreferencias = fechaPreferencias;
            self.aprovarMelhorFornecedorProduto = aprovarMelhorFornecedorProduto;
            self.aprovarCancelamentoDaCotacaoProduto = aprovarCancelamentoDaCotacaoProduto;
            self.onGerarPedidoCreated = onGerarPedidoCreated;
            self.filtrarCotacao = filtrarCotacao;
            self.clearFilter = clearFilter;
            self.onDataGridLoaded = onDataGridLoaded;
            self.loadOnInitialize = MGEParameters.asBoolean("global.carregar.registros.iniciar.tela");

            // Controle de acesso dos botoes (acronyms no menu.xml).
            // Deny por padrao ate a autorizacao carregar.
            self.podeGerarPedido = false;
            self.podeCancelar = false;
            self.podeEnviar = false;
            self.podeAprovar = false;

            self.$onInit = $onInit;

            self.rotinaCotacaoInstance;

            function $onInit() {
                self.onContentCreated({
                    $instance: _publicAPI
                });

                MGEAuthorizationService.loadAuthorization(SkApplicationInstance.getResourceID()).then(function (authData) {
                    self.podeGerarPedido = authData.hasAccess("GPD");
                    self.podeCancelar = authData.hasAccess("CNC");
                    self.podeEnviar = authData.hasAccess("ENV");
                    self.podeAprovar = authData.hasAccess("APR");
                });

                ServiceProxy.addClientEvent('br.com.sankhya.cotacao.sugestao.fornecedores.enviar.email', function (clientEvent) {
                    enviarEmail(clientEvent);
                });
            };

            function onDataGridLoaded(datagrid){
                self.gridCabCotacao = datagrid;
            }

            function setInstance(instance) {
                self.rotinaCotacaoInstance = instance;
            }

            function customTabsLoader(entity) {
                if (entity == 'CabecalhoCotacao') {
                    var customTabs = [];

                    customTabs.push({
                        blockId: 'abaPesos',
                        description: i18n('cot_labelPesosCriterios'),
                        controller: 'AbaPesosController',
                        controllerAs: 'ctrl',
                        templateUrl: 'html5/RotinaCotacao/abas/AbaPesos.tpl.html',
                        properties: {
                            dataSet: self.dsCabCotacao,
                        }

                    });

                    customTabs.push({
                        blockId: 'abaItensCot',
                        description: i18n('cot_labelItensCotacao'),
                        controller: 'AbaItensCotacaoController',
                        controllerAs: 'ctrl',
                        templateUrl: 'html5/RotinaCotacao/abas/AbaItensCotacao.tpl.html',
                        properties: {
                            dataSet: self.dsCabCotacao,
                            dataGrid: self.gridCabCotacao
                        }

                    });

                    customTabs.push({
                        blockId: 'abaFornecedores',
                        description: i18n('cot_lblFornecedores'),
                        controller: 'AbaFornecedoresController',
                        controllerAs: 'ctrl',
                        templateUrl: 'html5/RotinaCotacao/abas/AbaFornecedores.tpl.html',
                        properties: {
                            dataSet: self.dsCabCotacao,
                        }

                    });

                    return customTabs;
                }
            }

            function applyFilter() {

            }

            function filtrarCotacao() {
                if (self.dsCabCotacao) {
                    _salvarFiltro = true;
                    self.dsCabCotacao.refresh();
                }
            }


            function onColetaCreated(instance) {
                self.coletaManualPanel = instance;
            }

            function onColetaPreferencias(instance) {
                self.preferenciasInstance = instance;
                self.preferenciasInstance.setConfig(self.configRotinaCotacao);

            }

            function onFilterCreated(instance) {
                self.painelFiltro = instance;
            }

            function clearFilter() {
                self.painelFiltro.clearFilter();
            }

            function dynaformCreated() {
                carregaPreferencias();
                self.painelFiltro.buscaUltimoFiltro();
            }

            function voltarGerarPedido() {
                self.indiceViewStack = MAIN_PANEL;
            }


            function loadByPK(objPK) {
                _whenFormReady.whenReady().then(function () {
                    _dynaformCabecalhoCotacao.loadByPK(objPK);
                });
            }

            function setResourceID(resourceID) {
                self.resourceID = resourceID;
            }


            function salvarPreferencias() {
                var configPreferencias = self.preferenciasInstance.getConfig(false);
                
                Object.keys(configPreferencias).forEach(function(conf){
					if(angular.isDefined(configPreferencias[conf].$)){
						configPreferencias[conf] = configPreferencias[conf].$;
					}
				});
                
                SkApplicationInstance.saveMgeConfig(self.resourceID, configPreferencias);
                self.rotinaCotacaoInstance.setConfigPreferencias(configPreferencias);
                self.indiceViewStack = MAIN_PANEL;
            }

            function enviarEmail(clientEvent) {
                MessageUtils
                    .simpleConfirm(RotinaCotacaoUtil.getObjectValue(clientEvent.mensagem))
                    .then(function () {
                        carregaPreferencias(enviarItensSugeridosPortal);
                    });
            }


            function fechaPreferencias() {
                carregaPreferencias(function () {
                    self.indiceViewStack = MAIN_PANEL;
                });
            }

            function carregaPreferencias(callback) {
                var config = { config: { chave: SkApplicationInstance.getResourceID(), tipo: "T" } };

                ServiceProxy.callService('mge@SystemUtilsSP.getConf', config)
                    .then(function (result) {

                        var config = ObjectUtils.getProperty(result, 'responseBody.config');

                        self.preferencias = {};
						self.preferencias["CALCULARCUSTOS"] = config ? RotinaCotacaoUtil.getObjectValue(config.calculaCusto) == "true" : "false";
						self.preferencias["CALCULARIMPOSTOS"] = config ? RotinaCotacaoUtil.getObjectValue(config.calculaImpostos) == "true" : "false";
						self.preferencias["ULTIMOVALORCOMPRA"] = config ? RotinaCotacaoUtil.getObjectValue(config.ultimoValorCompra) == "true" : "false";
						self.preferencias["USAPRAZOENTREGARESUMO"] = config ? RotinaCotacaoUtil.getObjectValue(config.usaDtEntregaResumo) == "true" : "false";
						self.preferencias["NUNOTACALCULOCUSTO"] = config ? RotinaCotacaoUtil.getObjectValue(config.nuNota) : "false";
						self.preferencias["ATUALMOECALCMELHORFORNECEDOR"] = config ? RotinaCotacaoUtil.getObjectValue(config.atualMoeCalcMelhorFornecedor) == "true" : "false";
						self.preferencias["ATUALMOECALCGERARPEDIDO"] = config ? RotinaCotacaoUtil.getObjectValue(config.atualMoeGerarPedido) == "true" : "false";

                        if (callback != null) {
                            callback();
                        }

                    });

            }

            function onDynaformLoaded(dynaform, dataset) {
                if (dynaform.getEntityName() == "CabecalhoCotacao") {

                    _dynaformCabecalhoCotacao = dynaform;
                    
                    self.dsCabCotacao = dataset;

                    var obsCabecalhoCotacao = {};

                    ObjectUtils.implements(obsCabecalhoCotacao, IDataSetObserver);

                    obsCabecalhoCotacao.insertionModeActivated(function () {
                        if (self.abaItens != null) {
                            self.abaItens.cancelAddProdutosCotacao();
                        }
                    });

                    self.dsCabCotacao.addCriteriaProvider(function () {
                        var criteria = getCriteriaCab();

                        return criteria;
                    });
                    
                    self.dsCabCotacao.getFieldsMetadata().forEach(function (field) {
                        if (field.id == "PESOPRECO" || field.id == "PESOTAXAJURO" || field.id == "PESOQUALPROD" ||
                            field.id == "PESOCONFIABFORN" || field.id == "PESOPRAZOMED" || field.id == "PESOGARANTIA" ||
                            field.id == "PESOQUALATEND" || field.id == "PESOPRAZOENTREG" || field.id == "PESOCONDPAG") {
                            field.visible = false;
                        }

                        if((field.id == "CODMOTCAN" || field.id == "MOTIVO" || field.id == "OBSMOTCANC") && !MGEParameters.asBoolean("INFMOTCANCOT")){
                        	field.visible = false;
                        }
                    });
                    
                    self.dsCabCotacao.beforePostAction(function() {
                    	
                    	if(self.dsCabCotacao.isInsertionMode()){
                    		
                    		var codUsuLogado = SkApplicationInstance.getUserID();
                        
                        	
                        	self.dsCabCotacao.setFieldValue("CODUSUREQ", codUsuLogado);
                    	}                        
                        
                        return true;
                    });

                    self.dsCabCotacao.afterCopyAction(function() {
                    	
                    	if(self.dsCabCotacao.isInsertionMode()){
                    		
                    		var codUsuLogado = SkApplicationInstance.getUserID();
                            
                        	self.dsCabCotacao.setFieldValue("CODUSUREQ", codUsuLogado);
                    	}                        
                        
                        return true;
                    });

                    self.dsCabCotacao.init().then(function(){
                        if(self.loadOnInitialize) {
                            setTimeout(function () {
                                self.dsCabCotacao.refreshCurrentRow();
                            }, 500);
                        }
                    });

					self.dsCabCotacao.beforeCopyAction(function () {
						self.dsCabCotacao.setFieldValue("SITUACAO", 'A');
					});

                    _dynaformCabecalhoCotacao.goToGridView();

                    dynaformCreated();

                    _whenFormReady.ready();
                }
            }
            
            function duplicarCotacao(){
            	if(StringUtils.isEmpty(self.dsCabCotacao.getFieldValue("NUMCOTACAO"))){
					MessageUtils.showAlert(MessageUtils.TITLE_WARNING, i18n("Cotacao.RotinaCotacao.msgSelecioneUmaCotacao"));
					return;	
            	} 
            	
            	// Se o usuário NÃO clicou no grid para selecionar, vai pegar o NUMCOTACAO da primeira linha da grade (indíce 0)
            	// Se o usuário selecionou várias linhas, vai pegar o NUMCOTACAO do primeiro que o usuário clicou / selecionou
            	var _cotacaoOrig = self.dsCabCotacao.getFieldValue("NUMCOTACAO"); 
            	var configCotacaoItem = { parametros : {cotacaoOrig: _cotacaoOrig}};
            	ServiceProxy.callService('mgecot@CotacaoSP.duplicarItemCotacao', configCotacaoItem)
            		.then(function(result) {
            			var responseBody = ObjectUtils.getProperty(result, 'responseBody');
            			SanPopup.open({
            				templateUrl:
            					'html5/RotinaCotacao/popup/CotacaoDuplicada.tpl.html',
            					controller: 'CotacaoDuplicadaController',
            					controllerAs: 'ctrl',
            					title: i18n("Cotacao.RotinaCotacao.lblCotacaoDuplicada"),
            					size: 'alert',
            					height: 200,
            					showBtnCancel: false,
            					resolve: {
            						payload: function () {
            							return {
            								cotacaoOrig: _cotacaoOrig,
            								cotacaoDest: responseBody.$
            							};
            						}
            					}
            			});
            	});	
            }

            function getCriteriaCab() {
                var criteria = Criteria();

                criteria.append("1 = 1");
                _salvarFiltro = true;

                return self.painelFiltro.getFiltro(_salvarFiltro, criteria);
            }

            function buildDynaOptions(dynaform) {
                if (dynaform.getEntityName() == 'CabecalhoCotacao') {

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
                            label: i18n('cot_menuItemPref'),
                            action: function () {
                                chamaPopupPreferencias();
                            }
                        },
                        {
                        	label: i18n("Cotacao.RotinaCotacao.lblDuplicarCotCompleta"),
                        	action: function (){
                        		duplicarCotacao();
                        	}
                        }
                    ];
                }
            }

            function chamaPopupPreferencias() {
                if (self.preferenciasInstance) {
                    self.preferenciasInstance.setConfig(self.rotinaCotacaoInstance.configPreferencias);
                }

                self.indiceViewStack = PREFERENCIAS_PANEL;
            }


            function coletaManual() {
                if (self.dsCabCotacao.isInsertionMode() || self.dsCabCotacao.getCurrentRow() == null) {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgSelecioneUmItem"));
                    return;
                }

                var situacao = self.dsCabCotacao.getFieldValueAsString("SITUACAO");

                if (situacao == "P" || situacao == "F" || situacao == "C") {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgNaoPodeColetaManutalStatus"));
                    return;
                }


                self.indiceViewStack = COLETA_MANUAL_PANEL;

                if (self.coletaManualPanel) {
                    self.coletaManualPanel.refresh();
                }
            }

            function voltarColetaManual() {
                self.dsCabCotacao.refreshCurrentRow();
                fechaPreferencias();
            }


            function getItensCotacao(callBack, apenasAprovados) {
                if (self.dsCabCotacao.isInsertionMode() || self.dsCabCotacao.getCurrentRow() == null) {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgSelecioneUmItem"));
                    return;
                }

                ServiceProxy.callService('mgecot@CotacaoSP.getItensCotacao', { params: { numCotacao: self.dsCabCotacao.getFieldValue("NUMCOTACAO") } })
                    .then(function (result) {
                        var responseBody = ObjectUtils.getProperty(result, 'responseBody');
                        var itens = getItensByXML(responseBody, apenasAprovados);
                        callBack(itens);
                    });
            }

            function validateEnviarItem(itensFiltrados) {

                let statusPermitidos = ['O', 'E', 'P'];
               
                const possuiStatusPermitido = existeStatusPermitido(itensFiltrados, status =>
                    statusPermitidos.includes(status)
                );

                const possuiStatusNaoPermitido = existeStatusPermitido(itensFiltrados, status =>
                    !statusPermitidos.includes(status)
                );

                if (possuiStatusNaoPermitido && !possuiStatusPermitido) {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgErroStatusEnvioPortal"));
                    return false;
                }

                return true;

            }

            function existeStatusPermitido(itens, condicao) {
                return itens.some(item => {
                    const status = RotinaCotacaoUtil.getObjectValue(item["STATUSPRODCOT"]);
                    return condicao(status);
                });
            }

            function gerarPedidos() {
                if (!self.podeGerarPedido) {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n('Attach.msgControleAcesso'));
                    return;
                }
                getItensCotacao(function (itensSelecionados) {
                    if (possuiSomenteItensAprovados(itensSelecionados)) {
                        geraPedidoNovoServico(itensSelecionados);
                    } else {
                        MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n('Cotacao.RotinaCotacao.cot_msgValidateGerarPedidos'));
                    }
                }, true);
            }

            // Envia o tipo de negociacao (popup) + as cotacoes das linhas selecionadas para o servico geraPedidoSP.
            function geraPedidoNovoServico(itensSelecionados) {
                openParametrosGeraPedidoPopup().then(function (result) {
                    // Payload JSON plano (o ServiceProxy converteria para XML se enviassemos
                    // a estrutura itensCotacao com campos no formato {$: valor}, e o CODTIPVENDA
                    // do topo se perderia no getJsonRequestBody do servico).
                    var numCotacoes = [];
                    itensSelecionados.forEach(function (item) {
                        var nc = RotinaCotacaoUtil.getObjectValue(item["NUMCOTACAO"]);
                        if (nc != null && numCotacoes.indexOf("" + nc) === -1) {
                            numCotacoes.push("" + nc);
                        }
                    });

                    var request = {
                        // equivale ao antigo contextoAcao.getParam("CODTIPVENDA") da acao de botao
                        CODTIPVENDA: result.psqCodTipVenda,
                        NUMCOTACOES: numCotacoes
                    };

                    // Sem .catch: em caso de erro o proprio framework exibe a mensagem real do
                    // servico (MGEModelException). Um .catch com "" + err mostraria "[object Object]".
                    ServiceProxy.callService('addon-cotacao-data@geraPedidoSP.geraPedido', request)
                        .then(function (res) {
                            var msg = ObjectUtils.getProperty(res, 'responseBody.MENSAGEM');
                            MessageUtils.showInfo(MessageUtils.TITLE_INFORMATION, msg || i18n("cot_msgGeraPedidoSucesso"));
                            self.dsCabCotacao.refreshCurrentRow();
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

            function aprovarMelhorFornecedorProduto() {
                if (!self.podeAprovar) {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n('Attach.msgControleAcesso'));
                    return;
                }
                getItensCotacao(function (itens) {
                    if (itens.length == 0) {
                        MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgErroSelecioneProdutoParaAprovar"));
                        return;
                    }

                    MessageUtils.showAlertWithConfirm(MessageUtils.TITLE_CONFIRMATION, i18n("cot_msgConfirmarAprovar"))
                        .then(function () {
                            var itensSel = [];

                            for (var i = 0; i < itens.length; i++) {
                                var item = itens[i];
                                if (validateAprovarMelhorFornecedor(item)) {
                                    itensSel.push(item);
                                }
                            }

                            if (itensSel.length == 0) {
                                MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n('Cotacao.RotinaCotacao.cot_msgSemFornecedoresApropriados'));
                                return;
                            }

                            var rootElem = { parametros: { itensCotacao: { itemCotacao: [] } } };


                            for (var i = 0; i < itensSel.length; i++) {
                                var itemCotacaoElem = {};

                                RotinaCotacaoUtil.addElements(itemCotacaoElem, itensSel[i]);

                                rootElem.parametros.itensCotacao.itemCotacao.push(itemCotacaoElem);
                            }

                            ServiceProxy.callService('mgecot@CotacaoSP.aprovarMelhorFornecedor', rootElem)
                                .then(function (result) {
                                    _salvarFiltro = false;
                                    self.dsCabCotacao.refreshCurrentRow();
                                });



                        }, function (reason) {
                        });

                });
            }

            function aprovarCancelamentoDaCotacaoProduto() {
                if (!self.podeCancelar) {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n('Attach.msgControleAcesso'));
                    return;
                }
                getItensCotacao(function (itens) {
                	
                	var _permiteCancelarProduto = true;
                	itens.forEach(function (item) {

                        if(item.STATUSPRODCOT.$ == 'F'){
                        	_permiteCancelarProduto = false;
                        }
                    });
                	
                	if(_permiteCancelarProduto){
                        MessageUtils.showAlertWithConfirm(MessageUtils.TITLE_CONFIRMATION, i18n("Cotacao.RotinaCotacao.msgConfirmarCancelamento"), null, { okBtnLabel: i18n('Geral.buttonSim') })
                        .then(function () {
                        	cancelarCotacaoProduto(itens);                        		
                        }, function (reason) {
                        });                       		
                	} else {
                        MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("Cotacao.RotinaCotacao.msgCancelarCotacaoCabFechada"));
                	}
                });
            }

            function validateAprovarMelhorFornecedor(item) {
                if (RotinaCotacaoUtil.getObjectValue(item["STATUSPRODCOT"]) == "A" || RotinaCotacaoUtil.getObjectValue(item["STATUSPRODCOT"]) == "F" || RotinaCotacaoUtil.getObjectValue(item["STATUSPRODCOT"]) == "C") {
                    return false;
                }
                return true;
            }

            function getXmlItensCotacao(itensSel, apenasPrecificados) {
                var itemCotacao = { itemCotacao: [] };

                for (var i = 0; i < itensSel.length; i++) {
                    var ob = itensSel[i];

                    if (apenasPrecificados) {
                        if (ob["STATUSPRODCOT"] == "P") {
                            itemCotacao.itemCotacao.push(ob);
                        }
                    } else {
                        itemCotacao.itemCotacao.push(ob);
                    }
                }

                let itens = {itensCotacao: itemCotacao};

                return itens;
            }

            function cancelarCotacaoProduto(itensSelecionados) {       	
            	
            	if(MGEParameters.asBoolean("INFMOTCANCOT")){
            		SanPopup.open({
            			title: i18n("Cotacao.RotinaCotacao.titleMotivoCancelamento"),
            			templateUrl: 'html5/RotinaCotacao/popup/MotivoCancCotPopup.tpl.html',
            			controller: 'MotivoCancCotPopupController',
            			controllerAs: 'ctrl',
            			size: 'md',
            			showBtnNo: false
            		}).result.then(function (resultMotivo) {
            			cancelarCotacaoProdutoCab(itensSelecionados, resultMotivo);
            		});
            	} else {
            		cancelarCotacaoProdutoCab(itensSelecionados, null);
            	}
            		
            }
            function cancelarCotacaoProdutoCab(itensSelecionados, resultMotivo){
                var parametros = { parametros: { preferenciasCotacao: {}, itensCotacao: [] } };
                
                if(resultMotivo != null){
                	parametros.parametros.motivoCancelamento = resultMotivo.motivoCancelamento;
                	parametros.parametros.observacaoCancelamento = resultMotivo.observacao;      	
                }
                var nuNotaModelo = self.preferencias["NUNOTACALCULOCUSTO"] ? self.preferencias["NUNOTACALCULOCUSTO"] : "0";

                var preferenciaCotacao = { nuNotaModelo: nuNotaModelo }


                parametros.parametros.preferenciasCotacao = preferenciaCotacao;

                if (itensSelecionados.length > 0) {

                    for (var i = 0; i < itensSelecionados.length; i++) {
                        var itemCotacaoElem = { itemCotacao: {} };
                        
                        if (validateCancelarItem(itensSelecionados[i])) {
                        	RotinaCotacaoUtil.addElements(itemCotacaoElem.itemCotacao, itensSelecionados[i]);
                        	
                        	parametros.parametros.itensCotacao.push(itemCotacaoElem);          	
                        }

                    }
                }

                if (itensSelecionados.length > 0) {
                	if(parametros.parametros.itensCotacao.length > 0){
                		ServiceProxy.callService('mgecot@CotacaoSP.cancelarCotacao', parametros)
                		.then(function (result) {
                			
                			var msg = RotinaCotacaoUtil.getObjectValue(ObjectUtils.getProperty(result, 'responseBody.MSG'));
                			
                			if (msg != null && msg != '') {
                				MessageUtils.showAlert(MessageUtils.TITLE_WARNING, msg);
                			} else {
                				MessageUtils.showInfo(MessageUtils.TITLE_WARNING, i18n('Cotacao.RotinaCotacao.msgProdutosCanceladosSucesso'));
                			}
                			_salvarFiltro = false;
                			self.dsCabCotacao.refreshCurrentRow();
                		});         		
                	}
                } else {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgSelecioneUmItem"));
                    return;
                }
            }

            function validateCancelarItem(item) {
                if (item["STATUSPRODCOT"].$ == "F") {
/*                    MessageUtils.showError(i18n("Cotacao.RotinaCotacao.msgCancelarCotacaoFechada"));
*/                    return false;
                }
                return true;
            }

            function resumoItensAprovadosFornecedores(itensSelecionados) {
                var parametros = getXmlItensCotacao(itensSelecionados);

                parametros.usaDtEntregaResumo = self.preferencias["USAPRAZOENTREGARESUMO"];
                parametros.mantermoeda = self.preferencias["ATUALMOECALCGERARPEDIDO"];

                ServiceProxy.callService('mgecot@CotacaoSP.buscaResumoItensAprovForn', parametros)
                    .then(function (result) {

                        var records = self.resumoItensAprovados.gradeParceiros(ObjectUtils.getProperty(result, 'responseBody.fornecedores'));

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
                                            chamaResumoItensFornecedor(newRecords);
                                        }
                                    }
                                }
                            }).result
                                .then(function (result) { });

                        } else {
                            chamaResumoItensFornecedor(records);
                        }
                    });
            }

            function chamaResumoItensFornecedor(records) {
                self.indiceViewStack = GERAR_PEDIDO;
                self.resumoItensAprovados.chamaResumoItensFornecedor(records);
            }

            function onGerarPedidoCreated($instance) {
                self.resumoItensAprovados = $instance;
            }

            function validateDataLimiteItens(itensFiltrados) {
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

            function possuiSomenteItensAprovados(itensFiltrados) {
                var aprovados = false;
                itensFiltrados.every(function (item) {
                    if (RotinaCotacaoUtil.getObjectValue(item["STATUSPRODCOT"]) == "A") {
                        aprovados = true;
                        return false;
                    }
                    return true;
                });

                return aprovados;
            }

            function reenviarEmail(rootElem) {
                rootElem.parametros.preferenciasCotacao.reenviarEmail = true;

				ServiceProxy.callService('mgecot@CotacaoSP.enviarProdutosCotacao', rootElem)
                    .then(function(result) {
                        var msg = result.responseBody.MSG;
                        if(msg != null && msg != '') {
                            MessageUtils.showInfo(MessageUtils.TITLE_WARNING, msg);
                        } else {
                            MessageUtils.showInfo(MessageUtils.TITLE_WARNING, i18n("cot_msgRespFilaEnvio"));	
                        }
                        _salvarFiltro = false;
                        self.dsCabCotacao.refreshCurrentRow();
                    });		
			}

            function enviarItensSugeridosPortal() {
                const sugestoesFornecedores = $scope.sugestoesFornecedores;
                const itensSugeridosSelecionados = sugestoesFornecedores[0].PRODUTOS;

                if (itensSugeridosSelecionados && itensSugeridosSelecionados.length > 0) {
                    if (validateEnviarItem(itensSugeridosSelecionados)) {
                            let rootElem = { parametros: { preferenciasCotacao: {}, itensCotacao: {}, parceirosNotificados: {} } }

                            let nuNotaModelo = self.preferencias["NUNOTACALCULOCUSTO"] ? self.preferencias["NUNOTACALCULOCUSTO"] : "0";

                            let preferenciaCotacao = { nuNotaModelo: nuNotaModelo, reenviarEmail: false };

                            rootElem.parametros.preferenciasCotacao = preferenciaCotacao;

                            rootElem.parametros.itensCotacao.itemCotacao = itensSugeridosSelecionados;

                            let itens = [];
                            let item = {};
                            itensSugeridosSelecionados.forEach(function(element) {
                                item = {
                                    CODLOCAL: {$: element.CODLOCAL},
                                    CODPROD: {$: element.CODPROD},
                                    CONTROLE: {$: element.CONTROLE},
                                    DIFERENCIADOR: {$: element.DIFERENCIADOR},
                                    NUMCOTACAO: {$: element.NUMCOTACAO},
                                    STATUSPRODCOT: {$: element.STATUSPRODCOT},
                                    Produto_DESCRPROD: {$: element.DESCRPROD}
                                }
                                itens.push(item);
                            });

                            rootElem.parametros.itensCotacao.itemCotacao = itens;
                            processarEnvioProdutosCotacao(rootElem);
                    }
                } else {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgSelecioneUmItem"));
                    return;
                }
            }

            function enviarProdutosPortal() {
                if (!self.podeEnviar) {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n('Attach.msgControleAcesso'));
                    return;
                }
                getItensCotacao(function (itensSelecionados) {
                    if (itensSelecionados.length > 0) {

                        if (validateEnviarItem(itensSelecionados)) {
                            var rootElem = { parametros: { preferenciasCotacao: {}, itensCotacao: {}, parceirosNotificados: {} } }

                            var nuNotaModelo = self.preferencias["NUNOTACALCULOCUSTO"] ? self.preferencias["NUNOTACALCULOCUSTO"] : "0";

                            var preferenciaCotacao = { nuNotaModelo: nuNotaModelo, reenviarEmail: false };

                            rootElem.parametros.preferenciasCotacao = preferenciaCotacao;

                            rootElem.parametros.itensCotacao.itemCotacao = itensSelecionados;

                            processarEnvioProdutosCotacao(rootElem);
                        }
                    } else {
                        MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgSelecioneUmItem"));
                        return;
                    }
                });
            }

            function processarEnvioProdutosCotacao(rootElem) {
                ServiceProxy.callService('mgecot@CotacaoSP.enviarProdutosCotacao', rootElem)
                .then(function (result) {

                    let msg = RotinaCotacaoUtil.getObjectValue(ObjectUtils.getProperty(result, 'responseBody.MSG'));
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
                    self.dsCabCotacao.refreshCurrentRow();

                });
            }

            function getItensByXML(result, apenasAprovados) {
                var itens = [];

                var itensCotacao = ObjectUtils.getProperty(result, 'itensCotacao.item');
                if (!itensCotacao) {
                    return itens;
                }

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

            function chamaPopupSugestaoForn() {
                getItensCotacao(function (itens) {
                    if (itens.length == 0) {
                        MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgSelecioneProdutoSugestaoForn"));
                        return;
                    }

                    if (!possuiItensRespondidos(itens)) {

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
                                    dsCabCotacao: self.dsCabCotacao,
                                    openedBy: 'ContainerModoCabecalho',
                                    scopeContainerComponent: $scope
                                }
                            }
                        }).result.then(function (result) { });
                    } else {
                        MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgErroProdRespostasSugestaoForn"));
                    }
                });
            }

            function existeItensPrecificados(itens) {

                var itensPrecificados = false;

                itens.every(function (item) {
                    if (RotinaCotacaoUtil.getObjectValue(item["STATUSPRODCOT"]) == "P") {
                        itensPrecificados = true;
                        return false;
                    }

                    return true;
                });

                return itensPrecificados;
            }

            function sugereMelhorFornecedor() {
                getItensCotacao(function (itens) {
                    if (existeItensPrecificados(itens)) {
                        var parametros = {
                            parametros: { mantermoeda: self.preferencias["ATUALMOECALCMELHORFORNECEDOR"], itensCotacao: {} }
                        };

                        parametros.parametros.itensCotacao = getItensCotacaoObj(itens, true);

                        ServiceProxy.callService('mgecot@CotacaoSP.sugerirMelhorFornecedor', parametros)
                            .then(function (result) {

                                MessageUtils.showInfo(MessageUtils.TITLE_INFORMATION, i18n("cot_msgCalculoFornecedorSucesso"));

                                _salvarFiltro = false;

                                self.dsCabCotacao.refreshCurrentRow();

                            });


                    } else {
                        MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgValidateResumoItensFornPrecificado"));
                    }
                });
            }

            function getItensCotacaoObj(itensSel, apenasPrecificados) {
                var itens = { itemCotacao: [] };

                itensSel.forEach(function (ob) {
                    if (apenasPrecificados) {
                        if (RotinaCotacaoUtil.getObjectValue(ob["STATUSPRODCOT"]) == "P") {
                            itens.itemCotacao.push(ob);
                        }
                    } else {
                        itens.itemCotacao.push(ob);
                    }
                });

                return itens;
            }

            function calculaCustosImpostosEmLote() {
                if (self.preferencias["NUNOTACALCULOCUSTO"] == null || (!self.preferencias["CALCULARCUSTOS"] && !self.preferencias["CALCULARIMPOSTOS"])) {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n('Cotacao.RotinaCotacao.msgNaoDefinidoImposto'));
                    return;
                }

                getItensCotacao(function (itensSelecionados) {
                    if (itensSelecionados.length > 0) {

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
                        }


                    } else {
                        MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgSelecioneUmItem"));
                        return;
                    }
                });
            }


            function possuiItensRespondidos(itens) {
                itens.forEach(function (ob) {
                    var statusEnvio = RotinaCotacaoUtil.getObjectValue(ob["STATUSPRECIFICACAO"]);
                    var valoresStatus = statusEnvio.split("/");
                    var qtdRespostas = parseInt(valoresStatus[0]);

                    if (qtdRespostas > 0) {
                        return true
                    }

                });

                return false;
            }



        }
    ]);
