/**
 * Created by Handz (Eduardo,Charles) on 13/12/2019.
 */

angular
    .module('RotinaCotacaoApp')
    .controller('PopUpGerarPedidoController', ['$scope', 'SkApplicationInstance', 'data', '$popupInstance', 'RotinaCotacaoUtil', 'NumberUtils', 'MessageUtils', 'ServiceProxy', 'ObjectUtils', 'AvisosUtils', 'StringUtils', 'i18n', 'DateUtils', 'MGEParameters', 'SanPopup',
        function ($scope, SkApplicationInstance, data, $popupInstance, RotinaCotacaoUtil, NumberUtils, MessageUtils, ServiceProxy, ObjectUtils, AvisosUtils, StringUtils, i18n, DateUtils, MGEParameters, SanPopup) {
            var self = this;

            self.resourceIDGrade = SkApplicationInstance.getResourceID() + ".popupProdutos.gradeProdutos";

            self.dsFornecedoresPedido = data.dsFornecedoresPedido;
            self.dsItensCotacao = data.dsItensCotacao;
            self.dsCabCotacao = data.dsCabCotacao;

            self.pesqEmpresaEnabled = false;
            self.pesqCentCusEnabled = false;
            self.pesqNatEnabled = false;
            self.pesqTipoNegEnabled = false;
            self.pesqProjEnabled = false;
            self.pesqTopEnabled = true;



            self.cmbUsoChange = cmbUsoChange;            
            self.getPesqTOPCriteria = getPesqTOPCriteria;
            self.getPesqEmpresaCriteria = getPesqEmpresaCriteria;

            $scope.$success = confirmarGeracao;

            self.cmbUsaEmpresa = [
                { index: 1, data: 'cotacao', value: i18n('cot_labelItemUsarCotacao') },
                { index: 0, data: 'especifico', value: i18n('cot_labelItemUsarEspecifico') }
            ];

            self.cmbUsaTop = [
                { index: 0, data: 'especifico', value: i18n('cot_labelItemUsarEspecifico') },
                { index: 1, data: 'cotacao', value: i18n('cot_labelItemUsarCotacao') }
            ];

            self.cmbUsaTipoNeg = [
                { index: 0, data: 'especifico', value: i18n('cot_labelItemUsarEspecifico') },
                { index: 1, data: 'cotacao', value: i18n('cot_labelItemUsarCotacao') }
            ];

            self.cmbUsaCentCus = [
                { index: 0, data: 'especifico', value: i18n('cot_labelItemUsarEspecifico') },
                { index: 1, data: 'cotacao', value: i18n('cot_labelItemUsarCotacao') }
            ];

            self.cmbUsaNat = [
                { index: 0, data: 'especifico', value: i18n('cot_labelItemUsarEspecifico') },
                { index: 1, data: 'cotacao', value: i18n('cot_labelItemUsarCotacao') }
            ];

            self.cmbUsaProj = [
                { index: 0, data: 'especifico', value: i18n('cot_labelItemUsarEspecifico') },
                { index: 1, data: 'cotacao', value: i18n('cot_labelItemUsarCotacao') }
            ];


            var fornecedorPedido;
            var _exigecrcfr;
            var _exigenatcfr;
            var _numOsParam;
            var _saveConfigOpEmMoeda = false;
            var _loadConfigOpEmMoeda = false;

            var _gerandoPedido = false;
            var liberacaoConfirmada = true;

			self.isProcessing = function() {
				return _gerandoPedido;
			};

            function creationComplete() {
                ServiceProxy.callService('mgecot@CotacaoSP.carregarParametros', {})
                    .then(function (result) {

                        _exigecrcfr = "true" == ObjectUtils.getProperty(result, 'responseBody.EXIGCRCFR');
                        _exigenatcfr = "true" == ObjectUtils.getProperty(result, 'responseBody.EXIGNATCFR');
                        _numOsParam = "true" == ObjectUtils.getProperty(result, 'responseBody.USANROOSCOT');

                        self.frmItemNatRequired = _exigenatcfr;
                        self.frmItemCentCusRequired = _exigecrcfr;

                        preencheDadosPedido();


                    });
            }

            function cmbUsoChange(enableField, value, propCot) {
                var ehCotacao;

                if (propCot == "CODEMPRESA") {
                    ehCotacao = self.cmbUsaEmpresaValue == 'cotacao';
                    self.pesqEmpresaEnabled = !ehCotacao;
                    self.pesqEmpresa = ehCotacao ? fornecedorPedido[propCot] : null;
                } else if (propCot == "CODTIPOVENDA") {
                    ehCotacao = self.cmbUsaTipoNegValue == 'cotacao';
                    self.pesqTipoNegEnabled = !ehCotacao;
                    self.pesqTipoNeg = ehCotacao ? fornecedorPedido[propCot] : null;
                } else if (propCot == "CODCENCUS") {
                    ehCotacao = self.cmbUsaCentCusValue == 'cotacao';
                    self.pesqCentCusEnabled = !ehCotacao;
                    self.pesqCentCus = ehCotacao ? fornecedorPedido[propCot] : null;
                } else if (propCot == "CODNAT") {
                    ehCotacao = self.cmbUsaNatValue == 'cotacao';
                    self.pesqNatEnabled = !ehCotacao;
                    self.pesqNat = ehCotacao ? fornecedorPedido[propCot] : null;
                } else if (propCot == "CODPROJETO") {
                    ehCotacao = self.cmbUsaProjValue == 'cotacao';
                    self.pesqProjEnabled = !ehCotacao;
                    self.pesqProj = ehCotacao ? fornecedorPedido[propCot] : null;
                }

            }


            function saveConfig(isOperacaoMoeda) {
                var config;

                if (isOperacaoMoeda) {
                    config = { config: { chave: "br.com.sankhya.cotacao.gerarpedido.em.moeda", tipo: "T" } };
                } else {
                    config = { config: { chave: "br.com.sankhya.cotacao.gerarpedido", tipo: "T" } };
                }

                config.config.codTipoOper = self.pesqTop;

                ServiceProxy.callService('mge@SystemUtilsSP.saveConf', config)
                    .then(function (result) {

                    });
            }

            function closeMe() {
                $popupInstance.success();
            }

            function confirmarGeracao() {
                if (_gerandoPedido ) {
            	    return;
            	}

        	    if (!liberacaoConfirmada) {
                    MessageUtils.showAlert(MessageUtils.TITLE_WARNING,
                        i18n('Cotacao.RotinaCotacao.msgLiberacaoNaoConfirmada'));
                    return;
                }

            	if (validatePedido()) {
            	    _gerandoPedido = true;

            		gerarPedido().finally(function() {
            		    _gerandoPedido = false;
            			$scope.$applyAsync(); // Garante atualização do binding
            		});
            	}

            }

            function validatePedido() {
                var camposErro = [];

                if ((null == self.pesqEmpresa) || (StringUtils.emptyAsNull(self.pesqEmpresa) == null)) {
                    camposErro.push(i18n("cot_labelEmpresa"));
                }
                if (("0" == self.pesqTop) || (StringUtils.emptyAsNull(self.pesqTop) == null)) {
                    camposErro.push(i18n("cot_labelTop"));
                }
                if (("0" == self.pesqTipoNeg) || (StringUtils.emptyAsNull(self.pesqTipoNeg) == null)) {
                    camposErro.push(i18n("cot_labelTipoNeg"));
                }

                if (_exigecrcfr) {
                    if ((null == self.pesqCentCus) || (StringUtils.emptyAsNull(self.pesqCentCus) == null)) {
                        camposErro.push(i18n("cot_labelCentCus"));
                    }
                }

                if (_exigenatcfr) {
                    if ((null == self.pesqNat) || (StringUtils.emptyAsNull(self.pesqNat) == null)) {
                        camposErro.push(i18n("cot_labelNatureza"));
                    }
                }

                if (camposErro.length > 0) {
                    var strCamposErro = "";
                    for (var i = 0; i < camposErro.length; i += 1) {
                        var campo = camposErro[i];
                        if (i == 0) {
                            strCamposErro += campo + "\n";
                        } else {
                            strCamposErro += "* " + campo + "\n";
                        }
                    }
                    var msg = i18n("SanDB.DataSet.messagePreenchaCampos", [strCamposErro]);

                    MessageUtils.showAlert(MessageUtils.TITLE_ERROR, msg);

                    return false;
                } else {
                    return true;
                }
            }

            function getXmlPedido() {
                var dataAtual = DateUtils.formatDate(new Date());

                var strTop = self.pesqTop;
                var strCodCenCus = self.pesqCentCus;
                var strCodTipoNeg = self.pesqTipoNeg;
                var strCodEmp = self.pesqEmpresa;
                var strCodNat = self.pesqNat;
                var strCodProj = self.pesqProj;

                var notas = {
                    notas:
                    {
                        regras:
                        {
                            regra: { entityName: "ItemNota", $: "br.com.sankhya.modelcore.comercial.centrais.regrassessao.CotacaoItemNotaRegra" }
                        }
                    }
                };

                var nota = { nota: {} };
                var modFrete = StringUtils.emptyAsNull(fornecedorPedido.MODFRETE);

                var cabecalho = {
                    cabecalho: {
                        NUNOTA: {},
                        TIPMOV: { $: "O" },
                        DTNEG: { $: dataAtual },
                        CODPARC: { $: fornecedorPedido["CODPARC"] },
                        CODTIPOPER: { $: strTop },
                        CODTIPVENDA: { $: strCodTipoNeg },
                        CODEMP: { $: strCodEmp },
                        CODEMPNEGOC: {},
                        CODCENCUS: { $: strCodCenCus },
                        CODNAT: { $: strCodNat },
                        CODPROJ: { $: strCodProj },
                        CODMOEDA: { $: fornecedorPedido["CODMOEDA"] },
                        VLRMOEDA: { $: fornecedorPedido["VLRMOEDA"] },
                        IRFRETIDO: { $: "S" },
                        CIF_FOB: { $: modFrete ? modFrete : undefined }
                    }
                };

                var itensPedido = {  item: [] };

                if (fornecedorPedido["CODMOEDA"] != null && fornecedorPedido["CODMOEDA"] != 0) {
                    itensPedido.recalcularValoresMoeda = "true";
                }

                var listItens = fornecedorPedido["PRODUTOS"];

                var maiorDataEntrega = null;

                var count = 0;

                listItens.forEach(function (itemPedido) {
                    var numOs = "";

                    if (_numOsParam) {
                        numOs = itemPedido["NUMEROOS"];
                    }

                    var percDesconto = NumberUtils.stringToNumber(itemPedido["PERCDESC"]) - NumberUtils.stringToNumber(itemPedido["PERCACRESC"]);
                    var vlrDesconto = NumberUtils.stringToNumber(itemPedido["VLRDESC"]) - NumberUtils.stringToNumber(itemPedido["VLRACRESC"]);
 					var percDescontoDigitado= 0;
					var vlrDescontoDigitado= 0;
					if(vlrDesconto == NumberUtils.stringToNumber(RotinaCotacaoUtil.getNumberWit2Digits( itemPedido["PRECO"] - itemPedido["PRECOACRESCDESC"],2))){
					    vlrDescontoDigitado=vlrDesconto;
					}
					else{
					    percDescontoDigitado=percDesconto;
					}
                    var codProd = NumberUtils.getNumberOrZero(itemPedido["CODPROD"]);

                    if (itemPedido["GENERICO"] == "S" && NumberUtils.getNumberOrZero(itemPedido["CODPRODESP"]) != 0) {
                        codProd = NumberUtils.getNumberOrZero(itemPedido["CODPRODESP"]);
                    }

					var baseIpi = null;
					var vlrIpi = itemPedido["IPI"];					
					if(itemPedido["ALIQIPI"] != null && NumberUtils.getNumberOrZero(itemPedido["ALIQIPI"]) != 0){
						if(angular.isDefined(itemPedido["PRECO"])){
							if(angular.isDefined(itemPedido["QTDE"])){
								let qtd = NumberUtils.getNumberOrZero(itemPedido["QTDE"]);
								baseIpi = itemPedido["PRECO"] * (qtd > 0 ? qtd : 1);
							} else {
								baseIpi = itemPedido["PRECO"];
							}
						} else {
							baseIpi = itemPedido["IPI"] / (itemPedido["ALIQIPI"] / 100 );
						}
						
						if(baseIpi != null){
							vlrIpi = baseIpi * (itemPedido["ALIQIPI"] / 100 );
						}
					}

                    itensPedido.item.push({
                        NUNOTA: {},
                        ATUALESTOQUE: {},
                        CODPROD: { $: codProd },
                        CODLOCALORIG: { $: itemPedido["CODLOCAL"] },
                        CONTROLE: { $: itemPedido["CONTROLE"] },
                        CODVOL: { $: itemPedido["CODVOL"] },
                        QTDNEG: { $: itemPedido["QTDE"] },
                        VLRUNIT: { $: itemPedido["PRECO"] },
                        VLRUNITMOE: { $: itemPedido["PRECOMOE"] },
                        VLRDESCMOE: { $: itemPedido["VLRDESCMOE"] },
                        NUMEROOS: { $: numOs },
                        PERCDESC: { $: percDesconto },
                        VLRDESC: { $: vlrDescontoDigitado > 0 ? itemPedido["QTDE"] * vlrDescontoDigitado : itemPedido["PRECO"] * itemPedido["QTDE"] * (percDesconto / 100)},
                        PERCDESCDIGITADO: { $: percDescontoDigitado },
                        VLRDESCDIGITADO: { $: itemPedido["PRECO"] * itemPedido["QTDE"] * (percDescontoDigitado / 100) },
                        OBSERVACAO: { $: itemPedido["OBS"] },
                        MANTERVLRUNITINFORMADO: { $: "S" },
                        ALIQICMS: { $: itemPedido["ALIQICMS"] },
                        BASEICMS: { $:itemPedido["ALIQICMS"] == null || Number(itemPedido["ALIQICMS"]) == 0 ? null : itemPedido["ICMS"] / (itemPedido["ALIQICMS"] / 100 )},
                        VLRICMS:{ $: itemPedido["ICMS"] },
                        ALIQIPI: { $: itemPedido["ALIQIPI"] },
                        BASEIPI: { $: baseIpi },
                        VLRIPI: { $: vlrIpi},
                        ALIQICMS: { $: itemPedido["ALIQICMS"] },
                        BASESUBSTIT: { $:itemPedido["ALIQICMS"] == null || Number(itemPedido["ALIQICMS"]) == 0 ? null : itemPedido["ICMS"] / (itemPedido["ALIQICMS"] / 100 )},
                        VLRSUBST: { $: itemPedido["VLRSUBST"] },
                        DTINICIO : { $:itemPedido["DHENTREGA"] != null ? itemPedido["DHENTREGA"].toLocaleDateString() + " 0:00:00" : itemPedido["DHENTREGA"] },
                      
                        ITEMCOT_CODMOEDA: { $: fornecedorPedido["CODMOEDA"] },
                        ITEMCOT_NUMCOTACAO: { $: itemPedido["NUMCOTACAO"] },
                        ITEMCOT_CODPROD: { $: itemPedido["CODPROD"] },
                        ITEMCOT_CODPARC: { $: fornecedorPedido["CODPARC"] },
                        ITEMCOT_CONTROLE: { $: itemPedido["CONTROLE"] },
                        ITEMCOT_CODLOCAL: { $: itemPedido["CODLOCAL"] },
                        ITEMCOT_DIFERENCIADOR: { $: itemPedido["DIFERENCIADOR"] }
                    });


                    if (NumberUtils.getNumberOrZero(percDesconto) != 0) {
                        itensPedido.INFORMARPRECO = "true";
                    }

                    var dhEntrega = itemPedido["DHENTREGA"];

                    if (dhEntrega != null) {

                        var diferencaData = DateUtils.diffDates(DateUtils.clearTime(maiorDataEntrega), dhEntrega);

                        if (maiorDataEntrega == null || diferencaData < 0) { 
                            maiorDataEntrega = dhEntrega;
                        }
                    }

                    count++;
                });

                if (maiorDataEntrega != null) {
                    cabecalho.cabecalho.DTPREVENT = maiorDataEntrega; //confirmar
                }

				nota.nota.cabecalho = cabecalho.cabecalho;	

                nota.nota.itens = itensPedido;

                notas.notas.nota = nota.nota;


                return notas;
            }

            function getPesqEmpresaCriteria(){
				return Criteria("EXISTS( SELECT 1 FROM TGFEMP EMP WHERE EMP.CODEMP = this.CODEMP AND EMP.ATIVO = 'S')");
			}

            function getPesqTOPCriteria() {

                var filter = "this.TIPMOV = 'O'";

                if (fornecedorPedido["CODMOEDA"] != null && fornecedorPedido["CODMOEDA"] != 0) {
                    filter += " AND this.OPERCOMMOEDA = 'S'";
                } else {
                    if (!MGEParameters.asBoolean("PERMTOPMOEDACOT")) {
                        filter += " AND this.OPERCOMMOEDA = 'N'";
                    }
                }
                return Criteria(filter);
            }

            function gerarPedido() {
                var parametros = getXmlPedido();
                var codmoeda = RotinaCotacaoUtil.getObjectValue(parametros.notas.nota.cabecalho.CODMOEDA);

                if (codmoeda.$ != 0) {
                    _saveConfigOpEmMoeda = true;
                }

                return ServiceProxy.callService('mgecom@CACSP.incluirNota', parametros)
                    .then(function (result) {
                        var nunota = RotinaCotacaoUtil.getObjectValue(result.responseBody.pk.NUNOTA);


                        if (self.dsCabCotacao != null) {
                            self.dsCabCotacao.refreshCurrentRow();
                        } else if (self.dsItensCotacao) {
                            self.dsItensCotacao.refresh();
                        }

                        saveConfig(_saveConfigOpEmMoeda);


                        if (MGEParameters.asBoolean("mge.cot.conf.automatica.pedidos.cotacao")) {
                            var notas = { notas: { nunota: { $: nunota } } };

                            return ServiceProxy.callService('mgecom@ServicosNfeSP.confirmarNotas', notas)
                                .then(function (result) {
                                    var responseBody = ObjectUtils.getProperty(result, 'responseBody');

                                    if (responseBody.hasOwnProperty("avisos")) {
                                        var popUpHeight = 200;

                                        AvisosUtils.open(ObjectUtils.getProperty(result, 'avisos.aviso'));
                                    }

                                    var teveLiberacao = false;
                                    var liberacoes = ObjectUtils.getProperty(result, 'responseBody.liberacoes.liberacao');

                                    var promiseLiberacao = Promise.resolve();

                                    if (liberacoes) {
                                        teveLiberacao = true;
                                        promiseLiberacao = processaLiberacoes(liberacoes);
                                    }

                                    return promiseLiberacao.then(function () {
                                        var confirmou = ObjectUtils.getProperty(result, 'responseBody.qtdNotas') > 0;

                                        if (confirmou) {
                                            MessageUtils.showInfo(MessageUtils.TITLE_INFORMATION,i18n('Cotacao.RotinaCotacao.msgPedidoGeradoConfirmado', [nunota]));
                                            self.dsFornecedoresPedido.removeCurrentRow(true);
                                        } else {
                                            if (!teveLiberacao) {
                                                MessageUtils.showAlert(MessageUtils.TITLE_WARNING,i18n('Cotacao.RotinaCotacao.msgPedidoGeradoNaoConfirmado', [nunota]));
                                            }
                                        }


                                        if (self.dsCabCotacao != null) {
                                            self.dsCabCotacao.refreshCurrentRow();
                                        } else if (self.dsItensCotacao) {
                                            self.dsItensCotacao.refresh();
                                        }

                                        closeMe();
                                    });
                                });
                        } else {
                            MessageUtils.showInfo(MessageUtils.TITLE_INFORMATION, i18n("Cotacao.RotinaCotacao.msgPedidoGeradoConfirmado", [nunota]));
                            closeMe();
                        }

                        closeMe();
                    });
            }

            function processaLiberacoes(liberacoes) {
                if(liberacoes && !Array.isArray(liberacoes)) {
                    liberacoes = [liberacoes];
                }

				if(liberacoes?.length > 0){
                    var popupLiberacoes =
                        SanPopup.open({
                        title: i18n("Cotacao.RotinaCotacao.msgLiberacoesSolicitadas"),
                        templateUrl: 'html5/RotinaCotacao/popup/PopupProcessaLiberacoes.tpl.html',
                        controller: 'PopUpProcessaLiberacoesController',
                        controllerAs: 'ctrl',
                        size: 'lg',
                        okBtnLabel: i18n('Geral.confirmar'),
                        resolve: {
                            data: {
                                liberacoes: liberacoes
                            }
                        }
                    });

				    return popupLiberacoes.result
                        .then(function() {
                            liberacaoConfirmada = true;
                        })
                        .catch(function() {
                            liberacaoConfirmada = false;
                        });

                }

                return Promise.resolve();

			}

			function loadConfig(isLoadConfigMoeda) {
                var config;

                if (isLoadConfigMoeda) {
                    config = { config: { chave: "br.com.sankhya.cotacao.gerarpedido.em.moeda", tipo: "T" } };
                } else {
                    config = { config: { chave: "br.com.sankhya.cotacao.gerarpedido", tipo: "T" } };
                }

                ServiceProxy.callService('mge@SystemUtilsSP.getConf', config)
                    .then(function (result) {
                        var config = ObjectUtils.getProperty(result, 'responseBody.config');
                        self.cmbUsaTopValue = 'especifico';
                        if(angular.isDefined(config)){
	                        self.pesqTop = RotinaCotacaoUtil.getObjectValue(config.codTipoOper);
                        }                                      
                    });
            }

            function preencheDadosPedido() {
                fornecedorPedido = self.dsFornecedoresPedido.getCurrentRowAsObject();

                var codEmp = NumberUtils.stringToNumber(fornecedorPedido["CODEMPRESA"]);

                if (codEmp == 0) {
                    self.cmbUsaEmpresaValue = 'especifico';                    
                    self.cmbUsaEmpresaEnabled = false;
                    self.pesqEmpresaEnabled = true;
                } else {
                    self.pesqEmpresa = fornecedorPedido["CODEMPRESA"];
                    self.cmbUsaEmpresaValue = 'cotacao';                    
                }

                var tipoNeg = fornecedorPedido["CODTIPOVENDA"];

                if (tipoNeg == 0) {
                    self.cmbUsaTipoNegValue = 'especifico';                
                    self.cmbUsaTipoNegEnabled = false;
                    self.pesqTipoNegEnabled = true;
                } else {
                    self.pesqTipoNeg = tipoNeg;
                    self.cmbUsaTipoNegValue = 'cotacao';
                }

                var centCus = fornecedorPedido["CODCENCUS"];

                if (centCus == "0" && _exigecrcfr) {                    
                    self.cmbUsaCentCusValue = 'especifico';
                    self.cmbUsaCentCusEnabled = false;
                    self.pesqCentCusEnabled = true;
                    self.pesqCentCus = null;
                } else {
                    self.pesqCentCus = centCus;
                    self.cmbUsaCentCusValue = 'cotacao';
                    self.frmItemCentCusRequired = false;
                }

                var nat = fornecedorPedido["CODNAT"];

                if (nat == 0 && _exigenatcfr) {
                    self.cmbUsaNatValue = 'especifico';                    
                    self.cmbUsaNatEnabled = false;
                    self.pesqNatEnabled = true;
                    self.pesqNat = null;
                } else {
                    self.pesqNat = nat;                    
                    self.cmbUsaNatValue = 'cotacao';
                    self.frmItemNatRequired = false;
                }

                var proj = fornecedorPedido["CODPROJETO"];
                self.pesqProj = proj;
                self.cmbUsaProjValue = 'cotacao';

                var codmoeda = fornecedorPedido["CODMOEDA"];

                if (codmoeda != 0) {
                    _loadConfigOpEmMoeda = true;
                }
                loadConfig(_loadConfigOpEmMoeda);
            }
            creationComplete();
        }
    ]);