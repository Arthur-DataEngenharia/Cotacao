/**
 * Created by Handz (Eduardo,Charles) on 13/12/2019.
 */

angular
    .module('RotinaCotacaoApp')
    .controller('TransferirItensController', ['$scope','data', '$popupInstance', 'SanPopup', 'NumberUtils', 'MessageUtils', 'ServiceProxy', 'ObjectUtils','SkApplicationInstance', 'i18n',
        function ($scope, data, $popupInstance, SanPopup, NumberUtils, MessageUtils, ServiceProxy, ObjectUtils, SkApplicationInstance, i18n) {
            var self = this;

            self.resourceIDGrade = SkApplicationInstance.getResourceID() + ".popuptransf.gradefornecedores";
            self.fornecedorRecordBuilder = data.fornecedorRecordBuilder;
            self.closeHandler = data.closeHandler;
            self.dsFornecedoresPedido = data.dsFornecedoresPedido;
            self.itensCotacaoSel = data.itensCotacaoSel;
            self.fornCotacaoSel = data.fornCotacaoSel;

            self.dsFornecedores;

            self.createDataSet = createDataSet;
            self.getItensSelecionados = getItensSelecionados;
            self.removerNaoSel = removerNaoSel;
            self.removerSel = removerSel;
            self.chamaPopupProdutos = chamaPopupProdutos;
            self.itensProdutos = [];

            $scope.$success = trocarFornecedorAprovado;


            function createDataSet(ds) {
                self.dsFornecedores = ds;
                self.dsFornecedores.init().then(function () {
                    buscaFornecedorTransfItens();
                })
            }

            function getItensSelecionados() {
				let itens = self.dsFornecedores.getSelectedRecordsAsObjects();

                if (itens.length == 0 && self.dsFornecedores.getCurrentRowAsObject()) {
                    itens = [self.dsFornecedores.getCurrentRowAsObject()];
                }

                return itens;
            }

            

            function removerSel() {
                if (possuiItensSelecionados()) {
                    var itensSel = getItensSelecionados();
                    var itensResultado = self.dsFornecedores.getRecordsAsObject();
                    var itensNaoRemovidos = [];

                    itensResultado.forEach(function (obj) {
                        if (verificaIndice(itensSel, obj)) {
                            itensNaoRemovidos.push(obj);
                        }
                    });
					self.dsFornecedores.clearDataSet()
					self.dsFornecedores.addRecordsAsObjects(itensNaoRemovidos);
                    self.dsFornecedores.gotoRow(0);
                } else {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgSelecioneAoMenosUm"));
                }
            }

			function verificaIndice(indices, valor) {
                for (var j = 0; j < indices.length; j++) {
                    if (valor.CODPARC == indices[j].CODPARC) {
                        return false;
                    }
                }
                return true;
            }

            function removerNaoSel() {
                if (possuiItensSelecionados()) {
                    var itensSel = getItensSelecionados();
                    
                    self.dsFornecedores.clearDataSet()
                    self.dsFornecedores.addRecordsAsObjects(itensSel);
                    self.dsFornecedores.gotoRow(0);                    
                }
                else {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgSelecioneAoMenosUm"));
                }
            }

            function possuiItensSelecionados() {
                var itens = getItensSelecionados();
                return null != itens && itens.length > 0
            }


            function chamaPopupProdutos() {
                var nomeOperacao = i18n("cot_txtBtnVerProdutos");

                if (apenasUmItemSelecionado(nomeOperacao)) {
                    SanPopup.open({
                        title: i18n('cot_labelTitVisualizar'),
                        templateUrl: 'html5/RotinaCotacao/popup/PopupListaProdutosTransfFornecedor.tpl.html',
                        controller: 'ListProdutosTransfController',
                        controllerAs: 'ctrl',
                        size: 'md',
                        height: '500',
                        windowClass: 'popUpListProdTransf',
                        resolve: {
                            data: {
                                indexLinha: self.dsFornecedores.getCurrentIndex(),
                                produtoList: self.dsFornecedores.getCurrentRowAsObject()["PRODUTOS"],
                                codParc: self.dsFornecedores.getFieldValueAsNumber("CODPARC"),
                                nomeParc: self.dsFornecedores.getFieldValueAsString("NOMEPARC")
                            }
                        }
                    }).result.then(function (result) {

                    });
                }
            }

            function buildItemCotacao(obj, recarregar, codparc) {
                var itemCotacaoAprovadoElem = {}; 

                itemCotacaoAprovadoElem.NUMCOTACAO = obj.NUMCOTACAO;
                itemCotacaoAprovadoElem.CODPROD = obj.CODPROD;
                itemCotacaoAprovadoElem.CONTROLE = obj.CONTROLE;
                itemCotacaoAprovadoElem.CODLOCAL = obj.CODLOCAL;
                itemCotacaoAprovadoElem.CODVOL = obj.CODVOL;
                itemCotacaoAprovadoElem.DIFERENCIADOR = obj.DIFERENCIADOR;

                if (recarregar) {
                    itemCotacaoAprovadoElem.refresh = "S";
                }
                if (codparc != null) {
                    itemCotacaoAprovadoElem.CODPARC = codparc;
                }

                return itemCotacaoAprovadoElem;
            }

            function trocarFornecedorAprovado() {
                var fornOld = self.fornCotacaoSel[0];
                var fornNew = self.dsFornecedores.getCurrentRowAsObject();

                if (fornOld != null && fornNew != null) {

                    var codParcFornOld = fornOld.CODPARC;
                    var codParcFornNew = fornNew.CODPARC;

                    if (self.itensCotacaoSel != null) {
                        var itensForn = { fornecedor: { itemCotacaoAprovado: [] } };

                        itensForn.fornecedor.CODPARCOLD = codParcFornOld;
                        itensForn.fornecedor.CODPARCNEW = codParcFornNew;

                        self.itensCotacaoSel.forEach(function (produto) {
                            itensForn.fornecedor.itemCotacaoAprovado.push(buildItemCotacao(produto, false));                            
                        });

                        self.dsFornecedoresPedido.getRecordsAsObject().forEach(function (fornecedor) {
                            fornecedor.PRODUTOS.forEach(function (produto) {
                                itensForn.fornecedor.itemCotacaoAprovado.push(buildItemCotacao(produto, true, fornecedor.CODPARC));                                
                            });
                        });

                        var parametros = { parametros: {} };
                        parametros.parametros.fornecedor = itensForn.fornecedor;


                        ServiceProxy.callService('mgecot@CotacaoSP.salvarTransferenciaFornecedor', parametros)
                            .then(function (result) {
                                var registros = [];

                                var fornecedores = ObjectUtils.getProperty(result, 'responseBody.fornecedores.fornecedor');

                                if (fornecedores) {
                                	
                                	if (angular.isArray(fornecedores)) {
                                        fornecedores.forEach(function (item) {
                                            registros.push(self.fornecedorRecordBuilder(item));
                                        });
                                	} else {
                                		registros.push(self.fornecedorRecordBuilder(fornecedores));
                                	}
                                }                                
                                
                                self.dsFornecedoresPedido.clearDataSet();
                                self.dsFornecedoresPedido.addRecordsAsObjects(registros);
                                self.dsFornecedoresPedido.gotoRow(0);

                                if (self.closeHandler) {
                                    self.closeHandler();
                                }

                                $popupInstance.success();
                            });
                    }
                }
            }

            function addElements(element, record) {

                for (var item in record) {                    
                    element[item] = { $: record[item] };
                }
            }

            function buscaFornecedorTransfItens() {
                var parametros = { parametros: {} };

                var itensCotacaoElem = { itensCotacao: { itemCotacao: [] } };

                self.itensCotacaoSel.forEach(function (item) {
                    var itemCotacaoElem = {};

                    addElements(itemCotacaoElem, item);

                    itensCotacaoElem.itensCotacao.itemCotacao.push(itemCotacaoElem);
                });

                parametros.parametros.itensCotacao = itensCotacaoElem.itensCotacao;


                ServiceProxy.callService('mgecot@CotacaoSP.buscaFornTransfItens', parametros)
                    .then(function (result) {
                        var fornecedores = ObjectUtils.getProperty(result, 'responseBody.fornecedores');
                        atualizaGrid(fornecedores);
                    });
            }

             function apenasUmItemSelecionado(operacao) {
                var itens = getItensSelecionados(); 
                var msg;
                                    
                if(itens.length==1){
                    return true;
                }else if(itens.length>1) {						
                    MessageUtils.showAlert(MessageUtils.TITLE_ERROR, i18n("cot_msgSelecioneApenasUm",[operacao]));
                    return false;
                } else {						
                    MessageUtils.showAlert(MessageUtils.TITLE_ERROR, i18n("cot_msgSelecioneUm",[operacao]));
                    return false;						
                }
            }		
            


            function atualizaGrid(fornecedores) {
                var resultadosSugestao = [];

                if(fornecedores.fornecedor) {
                    if( !Array.isArray(fornecedores.fornecedor) ) {
                        if( fornecedores.fornecedor && !Array.isArray(fornecedores.fornecedor.itemPedido) ) {
                            fornecedores.fornecedor.itemPedido = [fornecedores.fornecedor.itemPedido];
                        }
    
                        fornecedores.fornecedor = [fornecedores.fornecedor];
                    }
    
                    fornecedores.fornecedor.forEach(function (forn) {
                        var itens = [];
    
    					if( !Array.isArray(forn.itemPedido) ) {
							var i = {
	                                CODPROD: NumberUtils.stringToNumber(forn.itemPedido.CODPROD),
	                                DESCRPROD: forn.itemPedido.DESCRPROD,
	                                CONTROLE: forn.itemPedido.CONTROLE,
	                                DIFERENCIADOR: NumberUtils.stringToNumber(forn.itemPedido.DIFERENCIADOR),
	                                CODLOCAL: NumberUtils.stringToNumber(forn.itemPedido.CODLOCAL),
	                                NUMCOTACAO: NumberUtils.stringToNumber(forn.itemPedido.NUMCOTACAO),
	                                PRECO: NumberUtils.stringToNumber(forn.itemPedido.PRECO),
	                                QTDCOTADA: NumberUtils.stringToNumber(forn.itemPedido.QTDCOTADA),
	                                DESCRVOL: forn.itemPedido.DESCRVOL,
	                                CABECALHO: forn.itemPedido.CABECALHO
	                            };
							itens.push(i);
							self.itensProdutos.push(i);
						} else {
	                        forn.itemPedido.forEach(function (produto) {
	                            var i = {
	                                CODPROD: NumberUtils.stringToNumber(produto.CODPROD),
	                                DESCRPROD: produto.DESCRPROD,
	                                CONTROLE: produto.CONTROLE,
	                                DIFERENCIADOR: NumberUtils.stringToNumber(produto.DIFERENCIADOR),
	                                CODLOCAL: NumberUtils.stringToNumber(produto.CODLOCAL),
	                                NUMCOTACAO: NumberUtils.stringToNumber(produto.NUMCOTACAO),
	                                PRECO: NumberUtils.stringToNumber(produto.PRECO),
	                                QTDCOTADA: NumberUtils.stringToNumber(produto.QTDCOTADA),
	                                DESCRVOL: produto.DESCRVOL,
	                                CABECALHO: produto.CABECALHO
	                            };
	                            itens.push(i);
	                            self.itensProdutos.push(i);
	                        });
						}
    
                        var r = {
                            CODPARC: NumberUtils.stringToNumber(forn.CODPARC),
                            NOMEPARC: forn.NOMEPARC,
                            CODCENCUS: NumberUtils.stringToNumber(forn.CODCENCUS),
                            CODEMPRESA: NumberUtils.stringToNumber(forn.CODEMPRESA),
                            CODNAT: NumberUtils.stringToNumber(forn.CODNAT),
                            CODPROJETO: NumberUtils.stringToNumber(forn.CODPROJETO),
                            CODTIPOVENDA: NumberUtils.stringToNumber(forn.CODTIPOVENDA),
                            PRECIFICADO: forn.PRECIFICADO,
                            PRODUTOS: itens
                        };
    
                        resultadosSugestao.push(r);
                    });
                    
                    self.dsFornecedores.addRecordsAsObjects(resultadosSugestao);
                    self.dsFornecedores.gotoRow(0);  
                }
            }
        }
    ]);