/**
 * Created by Handz (Eduardo,Charles) on 10/02/2020.
 */
angular
    .module('RotinaCotacaoApp')
    .component('preferencias', {
        templateUrl: 'html5/RotinaCotacao/containers/Preferencias.tpl.html',
        controller: 'PreferenciasController',
        controllerAs: 'ctrl',
        bindings: {
            voltarFunction: "&?",
            salvarPreferencias: "&?",
            closeFunction: "&?",
            onContentCreated: '&',
        }
    })
    .controller('PreferenciasController', ['PopUpParameter', 'i18n', 'RotinaCotacaoUtil', 'ServiceProxy', 'ObjectUtils', 'MessageUtils', 'ArrayUtils', 'SanPopup', 'MGEParameters', 'StringUtils',
        function (PopUpParameter, i18n, RotinaCotacaoUtil, ServiceProxy, ObjectUtils, MessageUtils, ArrayUtils, SanPopup, MGEParameters, StringUtils) {
            var self = this;

            var _publicAPI = {};
            _publicAPI.setConfig = setConfig;
            _publicAPI.getConfig = getConfig;

            var camposFormDisponiveis;
            var camposGradeDisponiveis;

            self.$onInit = $onInit;
            self.getCriteriaCabecalhoNota = getCriteriaCabecalhoNota;
            self.save = save;
            self.onChangeDraggableItemListFormulario = onChangeDraggableItemListFormulario;
            self.onChangeDraggableItemListGrade = onChangeDraggableItemListGrade;
            self.doDragDrop = doDragDrop;
            self.editField = editField;
            self.moveFields = moveFields;
            self.restoreSettings = restoreSettings;
            self.remCampo = remCampo;
            self.clearList = clearList;
            self.moverCampoLista = moverCampoLista;
            self.openPopUpAvaliableFields = openPopUpAvaliableFields;
            self.editDadosCotacao = editDadosCotacao;
            
            self.itemSelectedListNegociacao;
            self.itemSelectedListFormulario;
            self.itemSelectedListGrade;
            self.usaCustoPreco = false;
            self.calculaImpostos = false;
            self.visualizaUltimoVlrCompra = false;
            self.atualMoeCalcMelhorFornecedor = false;
            self.atualMoeGerarPedido = false;
            self.exibeHistoricoPortal = false;
            self.modeloSimulacaoCompra = "";
            self.camposFormulario = [];
            self.dpAvailableFormFields = [];
            self.dpCamposFormulario = [];
            self.dpAvailableGridFields = [];
            self.dpAvailableTipNeg = [];
            self.dpCamposGrade = [];
            self.dpTiposNegociacao = [];
            self.dpDefaulFormFields = [];
            self.dpDefaulGridFields = [];
            self.usaTipoNegociacaoPortal = false;
            self.filtrarContato = false;
            self.urlLogoEmpresa = null;
            self.liberacaoComplem = false;
            self.trabalhaMoeda = false;
            self.usaRefProdutoEquivalente = false;


            function $onInit() {

                self.onContentCreated({
                    $instance: _publicAPI
                });
                
                self.trabalhaMoeda = MGEParameters.asBoolean("TRABMOECOT");
            }


            function restoreSettings() {
                self.usaTipoNegociacaoPortal = false;

                self.dpCamposFormulario = [];
                self.dpAvailableFormFields = [];
                camposFormDisponiveis.forEach(function (formField) {
                    if (self.dpDefaulFormFields.indexOf(formField.nome) > -1) {
                        self.dpCamposFormulario.push(formField);
                    } else {
                        self.dpAvailableFormFields.push(formField);
                    }
                });


                self.dpAvailableGridFields = [];
                self.dpCamposGrade = [];
                camposGradeDisponiveis.forEach(function (gridField) {
                    if (self.dpDefaulGridFields.indexOf(gridField.nome) > -1) {
                        let verify = self.dpCamposGrade.filter((campo) => {return campo.nome == gridField.nome}).length;
                        if (verify == 0) {
                            self.dpCamposGrade.push(gridField);
                        }
                    } else {
                        self.dpAvailableGridFields.push(gridField);
                    }
                });
            }

            function remCampo(camposSelecionados, listaCamposDisponiveis, listAvailableFields) {
                listaCamposDisponiveis.forEach(function (campoDisponivel, index, object) {
                    camposSelecionados.forEach(function (campoSelecionado) {
                        if (campoSelecionado.codTipVenda) {
                            if (campoDisponivel.codTipVenda == campoSelecionado.codTipVenda) {
                                object.splice(index, 1);
                                listAvailableFields.push(campoSelecionado);
                            }
                        } else if (campoDisponivel.nome == campoSelecionado.nome) {
                            object.splice(index, 1);
                            listAvailableFields.push(campoSelecionado);
                        }
                    });

                });
            }

            function buildAvailableFields(tipo) {

            	if (tipo == "grade") {
                    self.dpAvailableGridFields = [];
                    camposGradeDisponiveis.forEach(function (Field) {
                    	self.dpAvailableGridFields.push(Field);
                    });
                } else if (tipo == "formulario") {
                    self.dpAvailableFormFields = [];
                    camposFormDisponiveis.forEach(function (Field) {
                    	self.dpAvailableFormFields.push(Field);
                    });
                } else if (tipo == "tipoNegociacao") {
                	self.dpAvailableTipNeg = [];
                	var paramsTipoNeg = {
                			entity: {
                				name: "TipoNegociacao",
                                fields: {
                                	field: [
                                		{name: "CODTIPVENDA"},
                                        {name: "DESCRTIPVENDA"}
                                    ]
                                }
                			}
                	};

                	ServiceProxy.callService('mge@crud.find', paramsTipoNeg)
                            .then(function (result) {
                                var tiposNegociacao = ObjectUtils.getProperty(result, 'responseBody.entidades.entidade');

                                if (tiposNegociacao) {
                                    tiposNegociacao.forEach(function (tipoNeg) {
                                        var descricao = RotinaCotacaoUtil.getObjectValue(tipoNeg.DESCRTIPVENDA);
                                        self.dpAvailableTipNeg.push({ codTipVenda: RotinaCotacaoUtil.getObjectValue(tipoNeg.CODTIPVENDA), descricao: descricao });
                                    });
                                }
                            });
                }
            }

            function clearList(lstOrig, tipo) {
                var msg;

                if (tipo == "grade") {
                    msg = "Tem certeza que deseja remover todas as colunas da grade?";
                } else if (tipo == "formulario") {
                    msg = "Tem certeza que deseja remover todos os campos do formulário?";
                } else if (tipo == "tipoNegociacao") {
                    msg = "Tem certeza que deseja remover todos os tipos de negociação?";
                }

                MessageUtils.confirm(
                    "Remover todos",
                    msg).then(
                        function () {
                            lstOrig.splice(0, lstOrig.length)
                            //lstDest.dataProvider.refresh();
                            buildAvailableFields(tipo);
                        }
                    );
            }

            function moveFields(lstOrig, lstDest, lstSelecionados) {

                if (lstSelecionados != null) {

                    for (var i = 0; i < lstSelecionados.length; i++) {
                        var itemSelecionado = lstSelecionados[i];

                        lstOrig.push(itemSelecionado);

                        for (var j = 0; j < lstDest.length; j++) {
                            var itemDestino = lstDest[j];

                            if (itemDestino.descricao == itemSelecionado.descricao) {
                                lstDest.splice(j, 1);
                            }
                        }
                    }
                }

            }

            function moverCampoLista(offset, camposSelecionados, listaCamposDisponiveis) {
                var continuaProcurando = true;
                listaCamposDisponiveis.every(function (campoDisponivel, index) {
                    camposSelecionados.forEach(function (campoSelecionado) {
                        var nextIndex = -1;

                        if (campoSelecionado.codTipVenda) {
                            if (campoDisponivel.codTipVenda == campoSelecionado.codTipVenda) {
                                nextIndex = index + offset;                                
                                continuaProcurando = false;
                            }
                        } else if (campoDisponivel.nome == campoSelecionado.nome) {
                            nextIndex = index + offset;                            
                            continuaProcurando = false;
                        }

                        if (!continuaProcurando) {
                            ArrayUtils.removeAtIndex(listaCamposDisponiveis, index);
                            ArrayUtils.insertAtIndex(listaCamposDisponiveis, nextIndex, campoSelecionado);
                        }

                    });

                    return continuaProcurando;
                });
            }

            function openPopUpAvaliableFields(camposDisponiveis, isTop) {
                let title = isTop == 'tpNeg' ? 'Tipos de negociação disponíveis' : 'Campos disponíveis';

                SanPopup.open({
                    title: title,
                    templateUrl: 'html5/RotinaCotacao/popup/PopUpAvailableFields.tpl.html',
                    controller: 'PopUpAvaliableFieldsController',
                    controllerAs: 'ctrl',
                    size: 'sm',
                    height: 450,
                    showBtnNo: false,
                    showBtnCancel: false,
                    showBtnOk: false,
                    windowClass: 'sk-popup-fields',
                    resolve: {
                        data: {
                            dpAvailableFields: isTop == 'tpNeg' ? self.dpAvailableTipNeg: (isTop == 'CpGrid' ? self.dpAvailableGridFields: self.dpAvailableFormFields),
                            dpCamposDisponiveis: camposDisponiveis,
                            moveFields: self.moveFields,
                            typePopUp: isTop
                        }
                    }
                });
            }

            function editDadosCotacao(dadosCotacao) {
                var _selectedItem = dadosCotacao[0];
                SanPopup.open({
                    title: i18n('Cotacao.RotinaCotacao.lblConfiguracoesCampoSelecionado'),
                    templateUrl: 'html5/RotinaCotacao/popup/PopupEditDadosCotacao.tpl.html',
                    controller: 'PopupEditDadosCotacaoController',
                    controllerAs: 'ctrl',
                    size: 'md',
                    height: 80,
                    windowClass: 'sk-popup-edit-field',
                    resolve: {
                        data: {
                            selectedItem: _selectedItem,
                        }
                    }
                }).result.then(function (result) {
                    _selectedItem.descricao = ObjectUtils.getProperty(result, 'editedField.description');

                    ArrayUtils.forEach(self.dpDadosCotacao, (e) => {
                        if (_selectedItem.nome == e.nome) {
                            e.obrigatorio = StringUtils.toBoolean(ObjectUtils.getProperty(result, 'editedField.required')).toString();
                            return false;
                        }
                    });
                });
            }

            function editField(item, dataProvider, tipo) {

                SanPopup.open({
                    title: i18n('Cotacao.RotinaCotacao.lblConfiguracoesCampoSelecionado'),
                    templateUrl: 'html5/RotinaCotacao/popup/PopUpEditField.tpl.html',
                    controller: 'PopUpFieldsController',
                    controllerAs: 'ctrl',
                    size: 'md',
                    height: 80,
                    windowClass: 'sk-popup-edit-field',
                    resolve: {
                        data: {
                            selectedItem: item[0],
                        }
                    }
                }).result.then(function (result) {
                    var selectedItem = result.selectedItem;
                    var values = result;

                    selectedItem.descricao = values.description;

                    if (!selectedItem.codTipVenda) {
                        selectedItem.obrigatorio = values.required.toString();
                        selectedItem.protegido = values.protected.toString();

                        dataProvider.every(function (fieldList) {
                            if (fieldList.nome == selectedItem.nome) {
                                fieldList.obrigatorio = values.required.toString();
                                fieldList.protegido = values.protected.toString();
                                return false;
                            }
                            return true;
                        });


                        dataProvider.every(function (fieldList) {
                            if (fieldList.nome == selectedItem.nome && fieldList.descricao != selectedItem.descricao) {
                                var msg = (tipo == 'grade' ? "Deseja também alterar a descrição do campo no formulário?" : "Deseja também alterar a descrição da coluna na grade?");
                                MessageUtils.confirm(
                                    "Alterar Descrição",
                                    msg).then(function () {
                                        fieldList.descricao = values.description;
                                        //lstDest.dataProvider.refresh();
                                    });

                                return false;
                            }

                            return true;
                        });
                    }


                });
            }

            function sortStrings(a, b) {
                const descricaoA = a.descricao.toLowerCase();
                const descricaoB = b.descricao.toLowerCase();

                let compare = 0;

                if (descricaoA > descricaoB) {
                    compare = 1;
                } else if (descricaoA < descricaoB) {
                    compare = -1;
                }

                return compare;
            }

            function setConfig(config) {
                self.usaCustoPreco = config ? RotinaCotacaoUtil.getObjectValue(config.calculaCusto) == "true" : "false";
                self.calculaImpostos = config ? RotinaCotacaoUtil.getObjectValue(config.calculaImpostos) == "true" : "false";
                self.visualizaUltimoVlrCompra = config ? RotinaCotacaoUtil.getObjectValue(config.ultimoValorCompra) == "true" : "false";
                self.atualMoeCalcMelhorFornecedor = config ? RotinaCotacaoUtil.getObjectValue(config.atualMoeCalcMelhorFornecedor) == "true" : "false";
                self.atualMoeGerarPedido = config ? RotinaCotacaoUtil.getObjectValue(config.atualMoeGerarPedido) == "true" : "false";
                self.modeloSimulacaoCompra = config ? RotinaCotacaoUtil.getObjectValue(config.nuNota) : "false";
                self.exibeHistoricoPortal = config ? !config.hasOwnProperty("exibeHistoricoPortal") || RotinaCotacaoUtil.getObjectValue(config.exibeHistoricoPortal) == "true" : "false";
                self.usaTipoNegociacaoPortal = config ? RotinaCotacaoUtil.getObjectValue(config.usaTipoNegociacaoPortal) == "true" : "false";
                self.filtrarContato = config ? RotinaCotacaoUtil.getObjectValue(config.filtrarContato) == "true" : "false";
                self.liberacaoComplem = config ? RotinaCotacaoUtil.getObjectValue(config.liberacaoComplem) == "true" : "false";
                self.urlLogoEmpresa =  config ? RotinaCotacaoUtil.getObjectValue(config.urlLogoEmpresa) : "false";
                self.usaRefProdutoEquivalente = config ? config.hasOwnProperty("usaRefProdutoEquivalente") && RotinaCotacaoUtil.getObjectValue(config.usaRefProdutoEquivalente) == "true" : "false";

                self.dpAvailableFormFields = [];
                self.dpCamposFormulario = [];

                self.dpDefaulFormFields = ["DESCRPROD", "REFERENCIA"
                    , "PRECO", "QTDCOTADA", "DESCRVOL", "CONDPAGT", "PRAZOENTREGA", "PRAZOPARC"
                    , "PERCDESC", "VLRDESC", "PRECOTOTAL", "MODFRETE", "FRETE", "DHENTREGA",
                    , "ALIQICMS", "ICMS", "VLRSUBST", "ALIQIPI", "IPI", "NUMCOTACAO", "APEMPRESA", "CODMOEDA", "COMPLDESC"];


                self.dpDefaulGridFields = ["CODPROD", "DESCRPROD", "DESCRVOL", "CONTROLE", "QTDCOTADA", "PRECO", "PERCDESC"
                    , "VLRDESC", "PRECOTOTAL", "CONDPAGT", "PRAZOPARC", "QTDPARCPAGT", "DTLIMITE"
                    , "MARCA", "OBSCOMPRADOR", "CODPROPARC", "DESCRPROPARC", "APEMPRESA", "DHENTREGA"
                    , "NUMCOTACAO", "REJEITADO", "OBS", "DESCRLOCAL", "REFERENCIA", "REFFORN", "CODMOEDA", "COMPLDESC"];


                if (config?.camposFormulario && config?.camposFormulario.campo) {

                    var camposFormulario = config.camposFormulario.campo;
                    
                    if(!angular.isArray(camposFormulario)){
						camposFormulario = [config.camposFormulario.campo];  
            		}

                    camposFormulario.forEach(function (campoForm) {
                        self.dpCamposFormulario.push(
                            {
                                descricao: campoForm.descricao,
                                nome: campoForm.nome,
                                tabela: campoForm.tabela,
                                obrigatorio: campoForm.obrigatorio,
                                protegido: campoForm.protegido,
                                protegidoSistema: campoForm.protegidoSistema,
                                userField: campoForm.userField
                            }
                        );
                    });

                }

                if (config?.camposFormDisponiveis) {

                    if(!angular.isArray(config.camposFormDisponiveis)){
                        config.camposFormDisponiveis = [config.camposFormDisponiveis];
                    }

                    config.camposFormDisponiveis.forEach(item=>{
                        if(item.campo){
                            camposFormDisponiveis = item.campo.map((formField) => {
                                return {
                                    descricao: RotinaCotacaoUtil.getObjectValue(formField.descricao),
                                    nome: formField.nome,
                                    tabela: formField.tabela,
                                    obrigatorio: formField.requeridoSistema,
                                    protegido: formField.protegido,
                                    protegidoSistema: formField.protegidoSistema,
                                    userField: formField.userField
                                }
                            });
                        }                        
                    });          

                    camposFormDisponiveis.forEach(function (formField) {
                        var descricao = RotinaCotacaoUtil.getObjectValue(formField.descricao);

                        var indexForm = self.dpCamposFormulario.findIndex(campo => campo.descricao == descricao)

                        if (indexForm < 0) {
                            self.dpAvailableFormFields.push(formField);
                        }
                    });

                }

                self.dpAvailableGridFields = [];
                self.dpCamposGrade = [];

                if (config?.camposGrade && config?.camposGrade.campo) {
                    var camposGrade = config.camposGrade.campo;
                    
                    if(!angular.isArray(camposGrade)){
						camposGrade = [camposGrade];
					}

                    camposGrade.forEach(function (campoGrade) {
                        self.dpCamposGrade.push(
                            {
                                descricao: campoGrade.descricao,
                                nome: campoGrade.nome,
                                tabela: campoGrade.tabela,
                                obrigatorio: campoGrade.obrigatorio,
                                protegido: campoGrade.protegido,
                                protegidoSistema: campoGrade.protegidoSistema,
                                userField: campoGrade.userField
                            }
                        );
                    });

                }

                self.dpDadosCotacao = [];
				if (config) {
					ArrayUtils.toArray(ObjectUtils.getProperty(config, 'dadosCotacao.campo'))
						.forEach((dadosCotacao) => {
							self.dpDadosCotacao.push({
								descricao: dadosCotacao.descricao,
								nome: dadosCotacao.nome,
								obrigatorio: dadosCotacao.obrigatorio
							});
						});
				}
				

                if (config?.camposGradeDisponiveis) {

                    if(!angular.isArray(config.camposGradeDisponiveis)){
                        config.camposGradeDisponiveis = [config.camposGradeDisponiveis];
                    }

                    config.camposGradeDisponiveis.forEach(item =>{
                        if(item.campo){
                            camposGradeDisponiveis = item.campo.map((gridField) => {
                                return {
                                    descricao: RotinaCotacaoUtil.getObjectValue(gridField.descricao),
                                    nome: gridField.nome,
                                    tabela: gridField.tabela,
                                    obrigatorio: gridField.requeridoSistema,
                                    protegido: gridField.protegido,
                                    protegidoSistema: gridField.protegidoSistema,
                                    userField: gridField.userField
                                }
                            });
                        }                        
                    });                    

                    camposGradeDisponiveis.forEach(function (gridField) {
                        var descricao = RotinaCotacaoUtil.getObjectValue(gridField.descricao);

                        var indexGrade = self.dpCamposGrade.findIndex(campo => campo.descricao == descricao);

                        if (indexGrade < 0) {
                            self.dpAvailableGridFields.push(gridField);
                        }
                    });

                }

                //Tipos de Negociação
                self.dpAvailableTipNeg = [];
				self.dpTiposNegociacao = [];
				
				if (config) {
					self.dpTiposNegociacao = ArrayUtils.toArray(ObjectUtils.getProperty(config, 'tiposNegociacao.tipo')).map((tipo)=>{
						return {
							codTipVenda: tipo.codTipVenda, 
							descricao: tipo.descricao
						};
					});
				}

                var paramsTipoNeg = {
                    entity: {
                        name: "TipoNegociacao",
                        fields: {
                            field: [
                                {
                                    name: "CODTIPVENDA"
                                },
                                {
                                    name: "DESCRTIPVENDA"
                                }
                            ]
                        }
                    }
                };

                ServiceProxy.callService('mge@crud.find', paramsTipoNeg)
                    .then(function (result) {
                        var tiposNegociacao = ObjectUtils.getProperty(result, 'responseBody.entidades.entidade');

                        if (tiposNegociacao) {
                            tiposNegociacao.forEach(function (tipoNeg) {

                                var descricao = RotinaCotacaoUtil.getObjectValue(tipoNeg.DESCRTIPVENDA);

                                var indexTipNeg = self.dpTiposNegociacao.findIndex(campo => campo.descricao == descricao);

                                if (indexTipNeg < 0) {
                                    self.dpAvailableTipNeg.push({ codTipVenda: RotinaCotacaoUtil.getObjectValue(tipoNeg.CODTIPVENDA), descricao: descricao });
                                }


                            });

                        }
                    });



            }

            function getConfig(keepAvailable) {
                var configObj = {};

                configObj.calculaCusto = { $: self.usaCustoPreco.toString() };
                configObj.calculaImpostos = { $: self.calculaImpostos.toString() };
                configObj.atualMoeCalcMelhorFornecedor = { $: self.atualMoeCalcMelhorFornecedor.toString() };
                configObj.atualMoeGerarPedido = { $: self.atualMoeGerarPedido.toString() };
                configObj.ultimoValorCompra = { $: self.visualizaUltimoVlrCompra.toString() };
                configObj.exibeHistoricoPortal = { $: self.exibeHistoricoPortal.toString() };
                configObj.usaTipoNegociacaoPortal = { $: self.usaTipoNegociacaoPortal.toString() };
                configObj.filtrarContato = { $: self.filtrarContato.toString() };
                configObj.liberacaoComplem = { $: self.liberacaoComplem.toString() };
                configObj.nuNota = { $: self.modeloSimulacaoCompra };
                configObj.usaRefProdutoEquivalente = { $: self.usaRefProdutoEquivalente.toString() };

                if (self.urlLogoEmpresa instanceof String && StringUtils.emptyAsNull(self.urlLogoEmpresa) != null && self.urlLogoEmpresa.substring(0, 7) != "Repo://") {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n('cot_msgUrlRepositorio'));
                    return null;
                }

                configObj.urlLogoEmpresa = { $: self.urlLogoEmpresa };

                var xmlCamposGrade = { camposGrade: { campo: [] } };

                self.dpCamposGrade.forEach(function (itemGrade) {
                    var campoGrade = {};
                    campoGrade.descricao = itemGrade.descricao;
                    campoGrade.nome = itemGrade.nome;
                    campoGrade.tabela = itemGrade.tabela;
                    campoGrade.obrigatorio = itemGrade.obrigatorio;
                    campoGrade.protegido = itemGrade.protegido;
                    campoGrade.protegidoSistema = itemGrade.protegidoSistema;
                    campoGrade.userField = itemGrade.userField;

                    xmlCamposGrade.camposGrade.campo.push(campoGrade);
                });

                configObj.camposGrade = xmlCamposGrade.camposGrade;

                var xmlCamposFormulario = { camposFormulario: { campo: [] } };

                self.dpCamposFormulario.forEach(function (itemForm) {
                    var campoForm = {};

                    campoForm.descricao = itemForm.descricao;
                    campoForm.nome = itemForm.nome;
                    campoForm.tabela = itemForm.tabela;
                    campoForm.obrigatorio = itemForm.obrigatorio;
                    campoForm.protegido = itemForm.protegido;
                    campoForm.protegidoSistema = itemForm.protegidoSistema;
                    campoForm.userField = itemForm.userField;

                    xmlCamposFormulario.camposFormulario.campo.push(campoForm);

                });

                configObj.camposFormulario = xmlCamposFormulario.camposFormulario;

                var xmlTiposNegociacao = { tiposNegociacao: { tipo: [] } };

                self.dpTiposNegociacao.forEach(function (itemTipNeg) {
                    var tipoNeg = {};
                    tipoNeg.codTipVenda = itemTipNeg.codTipVenda;
                    tipoNeg.descricao = itemTipNeg.descricao;

                    xmlTiposNegociacao.tiposNegociacao.tipo.push(tipoNeg);
                });

                configObj.tiposNegociacao = xmlTiposNegociacao.tiposNegociacao;

                var xmlDadosCotacao = { dadosCotacao: { campo: [] } };
                self.dpDadosCotacao.forEach(itemForm => {
                    var dadosCotacao = {
                        descricao: itemForm.descricao,
                        nome: itemForm.nome,
                        obrigatorio: itemForm.obrigatorio
                    };
                    xmlDadosCotacao.dadosCotacao.campo.push(dadosCotacao);
                });

                configObj.dadosCotacao = xmlDadosCotacao.dadosCotacao;

                if (keepAvailable) {
                    var availableForm = { camposFormDisponiveis: { campo: [] } };
                    self.dpAvailableFormFields.forEach((item) => {
                        availableForm.camposFormDisponiveis.campo.push(buildAvailableItem(item));
                    });

                    configObj.camposFormDisponiveis = availableForm.camposFormDisponiveis;
                    
                    var availableGrid = { camposGradeDisponiveis: { campo: [] } };
                    self.dpAvailableGridFields.forEach((item) => {
                        availableGrid.camposGradeDisponiveis.campo.push(buildAvailableItem(item));
                    });

                    configObj.camposGradeDisponiveis = availableGrid.camposGradeDisponiveis;
                }

                return configObj;
            }


            function onChangeDraggableItemListFormulario(item, positionToInsert) {

            }

            function onChangeDraggableItemListGrade(item, positionToInsert) {

            }

            function doDragDrop(event) {
                event.preventDefault();

                var initiator = event.originalEvent.dataTransfer.getData('id');
                var targetDrop = event.delegateTarget.id;

                /*if (initiator) {

                    if (initiator == 'listaSelecionados') {

                        var data = event.originalEvent.dataTransfer.getData("items");
                        var parseData = JSON.parse(data);

                        var items = parseData.items;

                        if (targetDrop == 'arvoreCamposDisponiveis') {
                            removeFromSelecionado(items);

                        } else if (targetDrop == 'listaOrdenacao') {
                            addToOrdenacao(items);
                        }

                    } else if (initiator == 'arvoreCamposDisponiveis' && targetDrop == 'listaSelecionados') {

                        var data = event.originalEvent.dataTransfer.getData('items');

                        var parseData = JSON.parse(data);

                        addToSelecionados(parseData.items);

                    } else if (initiator == 'arvoreCamposDisponiveis' && targetDrop == 'filterExpressionn') {

                        var data = event.originalEvent.dataTransfer.getData('items');

                        var parseData = JSON.parse(data);

                        abrePopUpCriterio(parseData.items[0].branch);
                    } else if (initiator == 'listaOrdenacao' && (targetDrop == 'listaSelecionados' || targetDrop == 'arvoreCamposDisponiveis')) {

                        var data = event.originalEvent.dataTransfer.getData('items');

                        var parseData = JSON.parse(data);
                        removeFromOrdenacao(parseData.items);
                    }
                }*/
            }

            function buildAvailableItem(i) {
                return {
                    descricao: i.descricao,
                    nome: i.nome,
                    tabela: i.tabela,
                    requeridoSistema: i.obrigatorio,
                    protegidoSistema: i.protegidoSistema,
                    protegido: i.protegido,
                    userField: i.userField
                }
            }

            function getCriteriaCabecalhoNota() {
                var criteria = Criteria(" this.TIPMOV = 'Z' ");

                return criteria;
            }

            function save() {
                self.salvarPreferencias();
            }
        }

    ]);