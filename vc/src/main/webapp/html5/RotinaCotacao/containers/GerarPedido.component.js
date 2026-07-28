/**
 * Created by Handz (Eduardo,Charles) on 10/02/2020.
 */
angular
    .module('RotinaCotacaoApp')
    .component('gerarPedido', {
        templateUrl: 'html5/RotinaCotacao/containers/GerarPedido.tpl.html',
        controller: 'GerarPedidoController',
        controllerAs: 'ctrl',
        bindings: {
            onContentCreated: '&?',
            configRotinaCotacao: '<',
            dsItemCotacao: '=?',
            dsCabCotacao: '=?',
            preferencias: '<',
            voltar: '&?'
        }
    })
    .controller('GerarPedidoController', ['ObjectUtils', 'MessageUtils', 'RotinaCotacaoUtil', 'SanPopup', 'DateUtils', 'NumberUtils', 'i18n', 'ArrayUtils','$scope',
        function (ObjectUtils, MessageUtils, RotinaCotacaoUtil, SanPopup, DateUtils, NumberUtils, i18n, ArrayUtils, $scope) {
            var self = this;
            
            var _publicAPI = {};
            _publicAPI.chamaResumoItensFornecedor = chamaResumoItensFornecedor;
            _publicAPI.isObrigatorioInformarProdEsp = isObrigatorioInformarProdEsp;
            _publicAPI.gradeParceiros = gradeParceiros;

            ObjectUtils.implements(self, IDynaformInterceptor);
            ObjectUtils.implements(self, IDatagridInterceptor);


            //Functions       
            self.$onInit = $onInit;
            self.createDataSetFornecedores = createDataSetFornecedores;
            self.createDataSetItens = createDataSetItens;
            self.chamaPopupGerarPedido = chamaPopupGerarPedido;
            self.removerFornSel = removerFornSel;
            self.removerFornNaoSel = removerFornNaoSel;
            self.onDatagridLoadedForn = onDatagridLoadedForn;
            self.removerItensSel = removerItensSel;
            self.removerItensNaoSel = removerItensNaoSel;
            self.chamaPopupTransferirItens = chamaPopupTransferirItens;
            self.acceptColumnField = acceptColumnField;

            //Vars
            self.gridConfigFornecedoresPedido = "br.com.sankhya.cotacao.resumoitensfornecedor.dataGridFornecedoresPedido.config";
            self.gridConfigItensPedido = "br.com.sankhya.cotacao.resumoitensfornecedor.dataGridItensPedido.config";
            self.lblFornecedores = i18n('cot_lblFornecedores');
            self.lblItensCotacao = i18n('Cotacao.RotinaCotacao.cot_titleItensCotacao');
            self.lblValorTotalItens = i18n('cot_gridPedidosFornTotalItens') + ":";
            self.dsFornecedoresPedido;
            self.gridForn;
            self.txtValorTotalItens = "0,00";

            var columnDtEntregaResumo;

            function $onInit() {
                self.onContentCreated({
                    $instance: _publicAPI
                });
            };

            function acceptColumnField(fieldMD, dataset) {
                if ("PRAZOENTREGA" == fieldMD.name) {

                    columnDtEntregaResumo = column;
                    return _preferencias["USAPRAZOENTREGARESUMO"];
                }

                if (ArrayUtils.isIn(['PRODUTOS'], fieldMD.name)) {
                    return false;
                }

                return true;
            }


            function onDatagridLoadedForn(dg) {
				self.gridForn = dg;
            }

            function buildProductRecords(line) {
                var produtos = null;

                var itemSel = self.dsFornecedoresPedido.getCurrentRowAsObject();

                if (line >= 0) {
                    produtos = ArrayUtils.toArray(ObjectUtils.getProperty(itemSel, 'PRODUTOS'));
                } else {
                    produtos = [];
                }
                
                if(!angular.isUndefined(self.dsItensPedido)){
                	self.dsItensPedido.clearDataSet();
                	self.dsItensPedido.addRecordsAsObjects(produtos);
                	setTimeout(() => {
                		self.dsItensPedido.gotoRow(0);
                	}, 10);
            	}
            }

            function createDataSetFornecedores(ds) {
                self.dsFornecedoresPedido = ds;

                self.dsFornecedoresPedido.addLineChangeListener(function (newIndex) {
                    buildProductRecords(newIndex);
                });

                self.dsFornecedoresPedido.addRecordRemovedListener(function () {
                    if (self.dsFornecedoresPedido.isEmpty()) {
                        if (self.voltar != null) {
                            self.voltar();
                        }
                    }
                });

                self.dsFornecedoresPedido.init();

            }

            function chamaResumoItensFornecedor(records) {
                personolizaExibicaoColunasResumo();

                self.dsItensPedido.clearDataSet();
                self.dsFornecedoresPedido.clearDataSet();

                //Para dar tempo dos datasets serem esvaziados
                setTimeout(() => {
                if (records) {
                    self.dsFornecedoresPedido.addRecordsAsObjects(records);

                    self.dsFornecedoresPedido.gotoRow(0).finally(
                        function () {
                            buildProductRecords(0);
                        }
                    );
                }
                }, 10);                

            }

            function personolizaExibicaoColunasResumo() {
                /*if (columnDtEntregaResumo != null) {
                    if (_preferencias["USAPRAZOENTREGARESUMO"]) {
                        columnDtEntregaResumo.visible = true;
                    } else {
                        columnDtEntregaResumo.visible = false;
                    }
                }*/
            }

            function createDataSetItens(ds) {
                self.dsItensPedido = ds;

                self.dsItensPedido.addRefreshedListener(function (reason) {
                    var totalItensParceiro = calculaTotalItens(self.dsItensPedido.getRecordsAsObjects());
                    self.txtValorTotalItens = NumberUtils.format(totalItensParceiro, 2);
                });

                self.dsItensPedido.init();

            }

            function calculaTotalItens(itens) {
                var total = 0;

                itens.forEach(function (item) {
                    var qtd = NumberUtils.stringToNumber(item["QTDE"]);
                    var preco = NumberUtils.stringToNumber(item["PRECO"]);
                    var vlrAcresc = NumberUtils.stringToNumber(item["VLRACRESC"]);
                    var vlrDesc = NumberUtils.stringToNumber(item["VLRDESC"]);

                    total += qtd * (preco + vlrAcresc - vlrDesc);
                });

                return total;
            }

            function calculaTotalFrete(itens) {
                //Valor total frete
                var totalfrete = 0;

                itens.forEach(function (item) {
                    var qtde = NumberUtils.stringToNumber(item["QTDE"]);
                    var freteUnitario = NumberUtils.stringToNumber(item["FRETE"]);
                    totalfrete += qtde * freteUnitario;
                });

                return totalfrete;
            }

            function getItensPedidoSelecionados() {
                return self.dsItensPedido.getSelectedRecordsAsObjects(true);
            }

            function getFornecedoresSelecionados() {     
				if(angular.isArray(self.dsFornecedoresPedido.getSelectedRecordsAsObjects()) && self.dsFornecedoresPedido.getSelectedRecordsAsObjects().length > 0){
					return self.dsFornecedoresPedido.getSelectedRecordsAsObjects(true);
				}else{
					if(angular.isArray(self.dsFornecedoresPedido.getRecordsAsObjects()) && self.dsFornecedoresPedido.getRecordsAsObjects().length > 0){
						return [self.dsFornecedoresPedido.getCurrentRowAsObject()];
					} 
				}
            }

            function possuiItemPedidoSelecionados() {
                var itens = getItensPedidoSelecionados();
                return null != itens && itens.length > 0
            }

            function apenasUmFornecedorSelecionado() {
                var itens = getFornecedoresSelecionados();

                if (itens.length == 1) {
                    return true;
                } else if (itens.length > 1) {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgSelecioneSomenteUmFornecedor"));
                    return false;
                } else {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgSelecioneUmFornecedor"));
                    return false;
                }
            }

            function atualizaLinhaFornecedor(itens) {
                var linhaFornecedor = self.dsFornecedoresPedido.getCurrentIndex();
                var listFornecedores = self.dsFornecedoresPedido.getRecordsAsObjects();

                if (itens.length > 0) {

                    var totalItensParceiro = calculaTotalItens(itens);
                    var totalfrete = calculaTotalFrete(itens);

                    self.dsFornecedoresPedido.getCurrentRowAsObject().PRODUTOS.length = 0;
                    itens.forEach(function (item) {
                    	self.dsFornecedoresPedido.getCurrentRowAsObject().PRODUTOS.push(item);
                    });

                    listFornecedores.splice(linhaFornecedor, 1);
                    
                    self.dsFornecedoresPedido.setFieldValue("QTDITENS", itens.length);
                    self.dsFornecedoresPedido.setFieldValue("TOTALITENS", totalItensParceiro);
                    self.dsFornecedoresPedido.setFieldValue("VLRTOTALFRETE", totalfrete);
                      
                    self.dsItensPedido.clearDataSet();
                    self.dsItensPedido.addRecordsAsObjects(itens);
                    setTimeout(() => {
                    	self.dsItensPedido.gotoRow(0);
                    }, 10);
                    
                    self.txtValorTotalItens = NumberUtils.format(totalItensParceiro, 2);

                }
            }

            function removerItensSel() {
                if (possuiItemPedidoSelecionados()) {
                    var itensSel = getItensPedidoSelecionados();
                    var itensResultado = self.dsItensPedido.getRecordsAsObjects();
                    var itensNaoRemovidos = [];

                    itensResultado.forEach(function (obj) {

                        var index = itensSel.findIndex(item => item.CODPROD == obj.CODPROD);


                        if (index == -1) {
                            itensNaoRemovidos.push(obj);
                        }
                    });

                    atualizaLinhaFornecedor(itensNaoRemovidos);
                } else {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgSelecioneItemPedido"));
                }
            }

            function removerItensNaoSel() {
                if (possuiItemPedidoSelecionados()) {
                    var itensSel = getItensPedidoSelecionados();
                    atualizaLinhaFornecedor(itensSel);
                } else {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgSelecioneItemPedido"));
                }
            }

            function removerFornNaoSel() {
            	if (possuiFornecedoresSelecionados()) {
                    var itensSel = getFornecedoresSelecionados(); 
                    self.dsFornecedoresPedido.clearDataSet();
                    
	                self.dsFornecedoresPedido.addRecordsAsObjects(itensSel);
	                setTimeout(() => {
		                self.dsFornecedoresPedido.gotoRow(0);
                    }, 10);
                } else {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgSelecioneFornecedor"));
                }
            }

            function removerFornSel() {
                if (possuiFornecedoresSelecionados()) {
                    var selectedRecords = self.dsFornecedoresPedido.getSelectedRecordsAsObjects(true);
			        if (selectedRecords.length > 0) {
			            var allRecords = self.dsFornecedoresPedido.getRecordsAsObject(true);
			
			            for (var i = 0; i < selectedRecords.length; i++) {
			                var objEstSelecionado = selectedRecords[i];
			
			                for (var j = 0; j < allRecords.length; j++) {
			                    var objEstoque = allRecords[j];
			
			                    if (JSON.stringify(objEstoque) == JSON.stringify(objEstSelecionado)) {
			                        allRecords.splice(j, 1);
			                        break;
			                    }
			                }
			            }
			
			            self.dsFornecedoresPedido.clearDataSet();
			            self.dsFornecedoresPedido.addRecordsAsObjects(allRecords);
			            setTimeout(() => {
				            self.dsFornecedoresPedido.gotoRow(0);
				        }, 10);
			        }
                } else {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgSelecioneFornecedor"));
                }
                
                
            }

            function chamaPopupTransferirItens() {
                if (possuiItemPedidoSelecionados() && apenasUmFornecedorSelecionado()) {
                    SanPopup.open({
                        title: i18n('cot_labelTitVisualizar'),
                        templateUrl: 'html5/RotinaCotacao/popup/PopUpTransferirItens.tpl.html',
                        controller: 'TransferirItensController',
                        controllerAs: 'ctrl',
                        size: 'md',
                        height: '400',
                        windowClass: 'popUpTransferirItens',
                        resolve: {
                            data: {
                                fornCotacaoSel: getFornecedoresSelecionados(),
                                itensCotacaoSel: getItensPedidoSelecionados(),
                                dsFornecedoresPedido: self.dsFornecedoresPedido,
                                fornecedorRecordBuilder: buildRecordFornecedorAprovado,
                                closeHandler: function () {
                                    var rowIndex = self.dsFornecedoresPedido.getCurrentIndex();
                                    self.dsFornecedoresPedido.gotoRow(rowIndex);
                                }
                            }
                        }
                    });
                } else {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n('Cotacao.RotinaCotacao.msgTransferirItens'));
                }
            }

            function possuiFornecedoresSelecionados() {
                var itens = getFornecedoresSelecionados();
                return null != itens && itens.length > 0
            }


            function chamaPopupGerarPedido() {
                if (isObrigatorioInformarProdEsp(self.dsFornecedoresPedido.getRecordsAsObjects())) {
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
                                records: self.dsFornecedoresPedido.getRecordsAsOject(),
                            }
                        }
                    });
                } else if (apenasUmFornecedorSelecionado()) {
                    SanPopup.open({
                        title: i18n('cot_titlePopup'),
                        templateUrl: 'html5/RotinaCotacao/popup/PopupGerarPedido.tpl.html',
                        controller: 'PopUpGerarPedidoController',
                        controllerAs: 'ctrl',
                        size: 'md',
                        height: '400',
                        windowClass: 'popUpGerarPedido',
                        resolve: {
                            data: {
                                dsItensCotacao: self.dsItemCotacao,
                                dsFornecedoresPedido: self.dsFornecedoresPedido,
                                dsCabCotacao: self.dsCabCotacao,
                            }
                        }
                    }).result.then(function(result) {
						self.voltar();
					});
                }
            }

            function isObrigatorioInformarProdEsp(records) {
                if (records && records.length > 0) {
                    records.forEach(function (record) {
                        var produtos = record["PRODUTOS"];

                        if (produtos) {
                            produtos.forEach(function (produto) {
                                if (produto["GENERICO"] == "S" && NumberUtils.getNumberOrZero(produto["CODPRODESP"]) == 0) {

                                    var listaProdEsp = produto["LISTCODPRODESP"];

                                    if (listaProdEsp != null && listaProdEsp.length > 1) {
                                        return true; 
                                    }
                                }
                            });
                        }

                    });
                }

                return false;
            }

            function gradeParceiros(fornecedores) {
                var resultadosSugestao = [];

                var records = fornecedores.fornecedor;


                if (records && !angular.isArray(records)) {
                    records = [records];
                }
				if(records){
	                records.forEach(function (item) {
	                    resultadosSugestao.push(buildRecordFornecedorAprovado(item));
	                });
				}
                return resultadosSugestao;
            }


        function buildRecordFornecedorAprovado(item) { 
                var produtos = [];

                if (item.itensPedido.itemPedido) {
                    item.itensPedido.itemPedido = [item.itensPedido.itemPedido];
                }

                let produto =angular.isArray(item.itensPedido.itemPedido[0])?item.itensPedido.itemPedido[0]:[item.itensPedido.itemPedido[0]];

                for (let i = 0; i < produto.length; i++) {
                    var qtde = NumberUtils.stringToNumber(produto[i].QTDE);
                    var frete = NumberUtils.stringToNumber(produto[i].FRETE);
                    var totalFreteItem = qtde * frete;

                    var ehProdutoGenerico = produto[i].GENERICO == "S";
                    var codProdEsp = 0;
                    var listaCodProdEsp = null;

                    if (ehProdutoGenerico) {
                        if (StringUtils.emptyAsNull(produto[i].CODPRODESP) != null) {
                            codProdEsp = NumberUtils.stringToNumber(produto[i].CODPRODESP);
                        }
                        
                        listaCodProdEsp = produto[i].LISTCODPRODESP;
                    }

                    var p = {
                        CODPROD: NumberUtils.stringToNumber(produto[i].CODPROD),
                        DESCRPROD: produto[i].DESCRPROD,
                        CODVOL: produto[i].CODVOL,
                        DESCRVOL: produto[i].DESCRVOL,
                        QTDE: NumberUtils.stringToNumber(produto[i].QTDE),
                        PRECO: NumberUtils.stringToNumber(produto[i].PRECO),
                        CONTROLE: produto[i].CONTROLE,
                        CODLOCAL: NumberUtils.stringToNumber(produto[i].CODLOCAL),
                        DESCRLOCAL: produto[i].DESCRLOCAL,
                        NUMCOTACAO: NumberUtils.stringToNumber(produto[i].NUMCOTACAO),
                        CABECALHO: produto[i].CABECALHO,
                        DIFERENCIADOR: produto[i].DIFERENCIADOR,
                        OBS: produto[i].OBS,
                        NUMEROOS: produto[i].NUMEROOS,
                        VLRDESC: NumberUtils.stringToNumber(produto[i].VLRDESC),
                        PERCDESC: NumberUtils.stringToNumber(produto[i].PERCDESC),
                        ICMS: NumberUtils.stringToNumber(produto[i].ICMS),
                        ALIQICMS: NumberUtils.stringToNumber(produto[i].ALIQICMS),
                        IPI: NumberUtils.stringToNumber(produto[i].IPI),
                        ALIQIPI: NumberUtils.stringToNumber(produto[i].ALIQIPI),
                        VLRSUBST: NumberUtils.stringToNumber(produto[i].VLRSUBST),
                        
                        VLRACRESC: NumberUtils.stringToNumber(produto[i].VLRACRESC),
                        PERCACRESC: NumberUtils.stringToNumber(produto[i].PERCACRESC),
                        PRECOACRESCDESC: NumberUtils.stringToNumber(produto[i].PRECOACRESCDESC),
                        FRETE: NumberUtils.stringToNumber(produto[i].FRETE),
                        VLRTOTALFRETEITEM: totalFreteItem,
                        DHENTREGA: DateUtils.strToDate(produto[i].DHENTREGA),
                        GENERICO: ehProdutoGenerico ? "S" : "N",
                        PRECOMOE: NumberUtils.stringToNumber(produto[i].PRECOMOE),
                        VLRDESCMOE: NumberUtils.stringToNumber(produto[i].VLRDESCMOE),
                        CODPRODESP: codProdEsp,
                        LISTCODPRODESP: listaCodProdEsp
                    };

                    produtos.push(p);
                    
                }
              

                var totalItensParceiro = calculaTotalItens(produtos);
                var qtdItensParceiro = produtos.length;
                var totalFrete = calculaTotalFrete(produtos);

                self.txtValorTotalItens = totalItensParceiro;

                return {
                    CODPARC: NumberUtils.stringToNumber(item.CODPARC),
                    APRESPARCEIRO: item.APRESPARCEIRO,
                    CODTIPOVENDA: NumberUtils.stringToNumber(item.CODTIPOVENDA),
                    APRESTIPOVENDA: item.APRESTIPOVENDA,
                    CODEMPRESA: NumberUtils.stringToNumber(item.CODEMPRESA) || 0,
                    APRESEMPRESA: item.APRESEMPRESA,
                    CODCENCUS: NumberUtils.stringToNumber(item.CODCENCUS),
                    APRESCENTCUS: item.APRESCENTCUS,
                    CODNAT: NumberUtils.stringToNumber(item.CODNAT),
                    APRESNATUREZA: item.APRESNATUREZA,
                    CODPROJETO: NumberUtils.stringToNumber(item.CODPROJETO),
                    APRESPROJETO: item.APRESPROJETO,
                    QTDITENS: qtdItensParceiro,
                    TOTALITENS: totalItensParceiro,
                    PRAZOENTREGA: NumberUtils.stringToNumber(item.PRAZOENTREGA),
                    PRODUTOS: produtos,
                    VLRTOTALFRETE: totalFrete,
                    MODFRETE: item.MODFRETE,
                    CODMOEDA: NumberUtils.stringToNumber(item.CODMOEDA),
                    NOMEMOEDA: item.NOMEMOEDA,
                    VLRMOEDA: NumberUtils.stringToNumber(item.VLRMOEDA) || 0
                };
            }
        }
    ]);