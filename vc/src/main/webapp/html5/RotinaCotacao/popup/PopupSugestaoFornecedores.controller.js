/**
 * Created by Handz (Eduardo,Charles) on 13/12/2019.
 */

angular
    .module('RotinaCotacaoApp')
    .controller('SugestaoFornecedorController', ['i18n', '$scope', 'data', 'StringUtils', '$popupInstance', 'RotinaCotacaoUtil', 'DateUtilsConstants', 'DateUtils', 'NumberUtils', 'MessageUtils', 'ServiceProxy', 'ObjectUtils', 'SanPopup', 'ArrayUtils', 'DatasetOnlineFilter',
        function (i18n, $scope, data, StringUtils, $popupInstance, RotinaCotacaoUtil, DateUtilsConstants, DateUtils, NumberUtils, MessageUtils, ServiceProxy, ObjectUtils, SanPopup, ArrayUtils, DatasetOnlineFilter) {
            var self = this;

            self.labelFornecedores = i18n('cot_lblFornecedores') + ":";
            self.labelPeriodoPor = i18n('cot_labelPeriodoPor') + ":";
            self.btnBuscarVisible = false;
            self.areaTipoPeriodoVisible = false;
            self.cmbTipoPeriodo;
            self.cmbTipoSugestao;
            self.qtdDiasVisible = true;
            self.qtdDiasEnabled = false;
            self.txtQtdDias;
            self.dtDataInicio;
            self.enableDataInicio = false;
            self.visibleDataInicio = false;
            self.dsSugestaoFornecedores;
            self.produtos = data.produtos;
            self.dsCabCotacao = data.dsCabCotacao;
            self.dsItemCotacao = data.dsItemCotacao;
            self.produtosAdicao = data.produtos;
            self.popUpAbertoPor = data.openedBy;

            self.cmbTipoSugestaoChange = cmbTipoSugestaoChange;
            self.cmbTipoPeriodoChange = cmbTipoPeriodoChange;
            self.createDataSet = createDataSet;
            self.concluirSugestoes = concluirSugestoes;
            self.buscar = buscar;
            self.vizualizarProdutos = vizualizarProdutos;
            self.substituirProdutos = substituirProdutos;
            self.chamaPopupProdutos = chamaPopupProdutos;
            self.removerSel = removerSel;
            self.removerNaoSel = removerNaoSel;
            self.sugestaoList;
            self.itensSugestao = {};
            self.itensMantidos;

            self.scopeContainerComponent = data.scopeContainerComponent;

            $scope.$success = concluirSugestoes;

            var _toRemove = [];




            self.cbxTipoSugestao = [
                { data: '', value: '' },
                { data: 'jaForneceram', value: i18n('cot_cbTipoSugJaForneceram') },
                { data: 'jaCotaram', value: i18n('cot_cbTipoSugJaCotaram') },
                { data: 'itensSelecionados', value: i18n('cot_cbTipoSugItensSel') },
                { data: 'perfilPrincipal', value: i18n('cot_cbTipoSugPerfilPrinc') },
                { data: 'perfilParceiro', value: i18n('cot_cbTipoSugPerfilCons') }
            ];

            self.cbxTipoPeriodo = [
                { data: '', value: '' },
                { data: 'D', value: i18n('cot_labelOpcDataInicial') },
                { data: 'Q', value: i18n('cot_labelOpcDiasRetro') }
            ];

            var _dsFilter = undefined;




            function concluirSugestoes() {
                var sugestoes = self.dsSugestaoFornecedores.getRecordsAsObjects();

                if (sugestoes.length > 0) {
                    var parametros = { parametros: { sugestoes: {} } };
                    parametros.parametros.sugestoes = { itensSug: getXmlSugestosProdutoFornecedor(sugestoes) };;
                    
                    if (self.popUpAbertoPor == 'ContainerModoCabecalho') {
                        parametros.parametros.eventoEmailContainerModoCabecalho = true;
                    }

                    ServiceProxy.callService('mgecot@CotacaoSP.salvarSugestoesFornecedores', parametros)
                        .then(function (result) {

                            if (self.dsItemCotacao) {
                                self.dsItemCotacao.refreshCurrentRow();

                            } else if (self.dsCabCotacao != null) {
                                self.dsCabCotacao.refreshCurrentRow();
                            }

                            const scopeContainerComponent = self.scopeContainerComponent;
                            if (scopeContainerComponent) {
                                scopeContainerComponent.sugestoesFornecedores = sugestoes;
                            }

                            $popupInstance.success();
                        });


                } else {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n('cot_msgSemSugestoes'));
                }
            }

            function cmbTipoPeriodoChange() {
                if ((StringUtils.emptyAsNull(self.cmbTipoPeriodo) == null)) {
                    self.qtdDiasEnabled = false;
                    self.txtQtdDias = "";
                    self.qtdDiasVisible = true
                    self.dtDataInicioVisible = false;
                    self.dtDataInicio = null;
                } else if (self.cmbTipoPeriodo == "D") {
                    self.qtdDiasVisible = false;
                    self.qtdDiasEnabled = false;
                    self.dtDataInicioVisible = true;
                    self.dtDataInicio = "";
                } else if (self.cmbTipoPeriodo == "Q") {
                    self.qtdDiasVisible = true;
                    self.qtdDiasEnabled = true;
                    self.dtDataInicioVisible = false;
                    self.dtDataInicio = null;
                }
            }

            function getXmlSugestosProdutoFornecedor(sugestoes) {
                var itens = [];

                sugestoes.forEach(function (sugest) {
                    var produtos = sugest.PRODUTOS;

                    produtos.forEach(function (produto) {
                        var codProd = produto["CODPROD"];
                        var codLocal = produto["CODLOCAL"];
                        var controle = produto["CONTROLE"];
                        var diferenciador = produto["DIFERENCIADOR"];
                        var numCotacao = produto["NUMCOTACAO"];
                        var codParc = sugest["CODPARC"];
                        var cabecalho = produto["CABECALHO"];
                        var codContato = StringUtils.nullAsEmpty(produto["CODCONTATO"]);

                        var sugestao = {
                            codProd: codProd,
                            codLocal: codLocal,
                            controle: controle,
                            diferenciador: diferenciador,
                            numCotacao: numCotacao,
                            codParc: codParc,
                            cabecalho: cabecalho,
                            codContato: codContato
                        }

                        itens.push(sugestao);
                    });

                });

                return itens;
            }



            function createDataSet(dataset) {

                _dsFilter = new DatasetOnlineFilter(dataset);

                self.dsSugestaoFornecedores = dataset;
                self.dsSugestaoFornecedores.init().then(function () {
                    _dsFilter.clearFilter(true);
                });

            }

            function removerSel() {
                removeLines(true);
            }


            function removerNaoSel() {
                removeLines(false);
            }

            function removeLines(itensSelected) {
                var itensSelecionados = self.dsSugestaoFornecedores.getSelectedRecordsAsObjects();
                var itens = self.dsSugestaoFornecedores.getRecordsAsObject();

                if (itensSelected && itensSelecionados.length == 0) {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgSelecioneAoMenosUm"));
                } else {

                    var itens = self.dsSugestaoFornecedores.getRecordsAsObjects();
                    var itensSelecionadosArray = [];

                    itensSelecionados.forEach(function (record) {
                        itensSelecionadosArray.push(record.CODPARC);
                    })

                    if (itensSelected) {
                        itensSelecionados.forEach(function (record) {
                            _toRemove.push(record.CODPARC);
                        })
                    } else {
                        itens.forEach(function (record) {
                            if (!ArrayUtils.isIn(itensSelecionadosArray, record.CODPARC)) {
                                _toRemove.push(record.CODPARC);
                            }
                        })
                    }

                    _dsFilter.inFilter('CODPARC', _toRemove, true);
                }
            }

            function buscar() {
                _toRemove = [];
                _dsFilter.clearFilter(true);

                if (validaParametros()) {

                    var parametros = { parametros: { itensCotacao: [] } };

                    parametros.parametros.tipoSugestao = self.cmbTipoSugestao;

                    var tipoPeriodo = "";

                    if (StringUtils.emptyAsNull(self.txtQtdDias) != null) {
                        tipoPeriodo = "Q";
                        parametros.parametros.qtdDias = self.txtQtdDias;
                    } else if (self.dtDataInicio != null) {
                        tipoPeriodo = "D";
                        parametros.parametros.dataInicio = DateUtils.formatDate(self.dtDataInicio, DateUtilsConstants.DEFAULT_DATE_FORMAT);
                    }

                    parametros.parametros.tipoPeriodo = tipoPeriodo;
                    parametros.parametros.itensCotacao = { itemCtacao: getXmlItensCotacao() };

                    ServiceProxy.callService('mgecot@CotacaoSP.buscaSugestaoFornecedores', parametros)
                        .then(function (result) {
                            var sugestaoList = ObjectUtils.getProperty(result, 'responseBody.sugestaoList');

                            if (!ObjectUtils.isEmpty(sugestaoList)) {
                                atualizaGrid(sugestaoList);
                            } else {
                                self.dsSugestaoFornecedores.clearDataSet();
                            }

                        });


                }
            }

            function atualizaGrid(sugestaoList) {

                if (sugestaoList) {
                    var resultadosSugestao = [];
                    var sugestoes = sugestaoList.sugestao;

                    if (!angular.isArray(sugestoes)) {
                        sugestoes = [sugestoes];
                    }

                    self.itensSugestao = {};

                    sugestoes.forEach(function (item) {
                        var itensSugestao = [];

                        var itemSug = item.itensSugeridos.item;

                        if (!angular.isArray(itemSug)) {
                            itemSug = [itemSug];
                        }

                        itemSug.forEach(function (produto) {
                            var i = {
                                CODPROD: NumberUtils.stringToNumber(produto.codProd),
                                DESCRPROD: produto.nomeProd,
                                CONTROLE: StringUtils.isNotEmpty(produto.controle) ? produto.controle : ' ',
                                DIFERENCIADOR: NumberUtils.stringToNumber(produto.diferenciador),
                                CODLOCAL: NumberUtils.stringToNumber(produto.codLocal),
                                NUMCOTACAO: NumberUtils.stringToNumber(produto.numCotacao),
                                DESCRVOLUME: produto.descrVolume,
                                CABECALHO: produto.cabecalho,
                                CODCONTATO: produto.codContato,
                                NOMECONTATO: produto.nomeContato,
                                STATUSPRODCOT: produto.statusProdCot
                            };
                            itensSugestao.push(i);
                        });

                        var r = {
                            CODPARC: NumberUtils.stringToNumber(item.codParc),
                            NOMEPARC: item.nomeParc,
                            ACESSOPORTALCOTACAO: item.acessoPortalCotacao,
                            DTULTCOMPRA: item.dtUltimaCompra,
                            QTDNOTASNEGOC: item.qtdNotasNegoc,
                            PRODUTOS: itensSugestao
                        };

                        self.itensSugestao[item.codParc] = itensSugestao;

                        resultadosSugestao.push(r);
                    });

                    self.dsSugestaoFornecedores.clearDataSet();
                    self.dsSugestaoFornecedores.addRecordsAsObjects(resultadosSugestao);
                    self.dsSugestaoFornecedores.gotoRow(0);
                }
            }

            function openPopUpProdutos(params, nomeOperacao) {
                SanPopup.open({
                    title: nomeOperacao,
                    templateUrl: 'html5/RotinaCotacao/popup/PopupProdutos.tpl.html',
                    controller: 'PopupProdutosController',
                    controllerAs: 'ctrl',
                    size: 'sm',
                    height: '400',
                    showBtnNo: false,
                    showBtnCancel: false,
                    showBtnOk: false,
                    windowClass: 'popUpProdutos',
                    resolve: {
                        data: params
                    }
                }).result
                    .then(function (result) {
                        self.itensMantidos = result;
                    });
            }

            function vizualizarProdutos() {
                chamaPopupProdutos("V");
            }

            function substituirProdutos() {
                chamaPopupProdutos("S");
            }


            function chamaPopupProdutos(operacao) {
                var nomeOperacao;

                var params = {};

                params.indexLinha = self.dsSugestaoFornecedores.getCurrentIndex();
                params.dsSugestoesStandAlone = self.dsSugestaoFornecedores;
                params.tipoPeriodo = self.cmbTipoPeriodo;
                params.dataBusca = self.dtDataInicio;
                params.qtdDias = self.txtQtdDias;
                params.operacao = operacao;
                params.itensSugestao = self.itensSugestao;


                if (operacao == "V") {

                    nomeOperacao = i18n("cot_txtBtnVerProdutos");
                    if (apenasUmItemSelecionado(nomeOperacao)) {
                        openPopUpProdutos(params, nomeOperacao);
                    }

                } else if (operacao == "A") {
                    nomeOperacao = i18n("cot_labelTitAdicionar");
                    params.produtosAdicao = self.produtos;
                    openPopUpProdutos(params, nomeOperacao);

                } else if (operacao == "S") {
                    nomeOperacao = i18n("cot_labelTitSubstituir");

                    if (apenasUmItemSelecionado(nomeOperacao)) {
                        openPopUpProdutos(params, nomeOperacao);
                    }
                }

            }

            function getItensSelecionados() {
                return self.dsSugestaoFornecedores.getSelectedRecordsAsObjects();
            }

            function apenasUmItemSelecionado(operacao) {
                var itens = getItensSelecionados();

                var msg;

                if (itens.length == 1) {
                    return true;
                } else if (itens.length > 1) {
                    MessageUtils.showAlert(i18n('Cotacao.RotinaCotacao.msgSelecioneApenasUm', [operacao]));
                    return false;
                } else {
                    MessageUtils.showAlert(i18n('Cotacao.RotinaCotacao.msgSelecioneUmFornecedor', [operacao]));
                    return false;
                }
            }

            function getXmlItensCotacao() {
                var itens = [];

                if (self.produtos) {

                    self.produtos.forEach(function (ob) {
                        var descrVol = " ";

                        if (ob["CODVOL"] != 0) {
                            descrVol = RotinaCotacaoUtil.getObjectValue(ob["Volume_DESCRVOL"]);
                        }

                        itens.push({
                            codProd: RotinaCotacaoUtil.getObjectValue(ob["CODPROD"]),
                            nomeProd: RotinaCotacaoUtil.getObjectValue(ob["Produto_DESCRPROD"]),
                            codLocal: RotinaCotacaoUtil.getObjectValue(ob["CODLOCAL"]),
                            controle: RotinaCotacaoUtil.getObjectValue(ob["CONTROLE"]),
                            diferenciador: RotinaCotacaoUtil.getObjectValue(ob["DIFERENCIADOR"]),
                            numCotacao: RotinaCotacaoUtil.getObjectValue(ob["NUMCOTACAO"]),
                            codVol: RotinaCotacaoUtil.getObjectValue(ob["CODVOL"]),
                            cabecalho: RotinaCotacaoUtil.getObjectValue(ob["CABECALHO"]),
                            descrVolume: descrVol,
                            statusProdCot: RotinaCotacaoUtil.getObjectValue(ob["STATUSPRODCOT"])
                        });
                    });
                }
                return itens;
            }

            function cmbTipoSugestaoChange() {
                if ((StringUtils.emptyAsNull(self.cmbTipoSugestao)) == null) {
                    self.btnBuscarVisible = false;
                    self.areaTipoPeriodoVisible = false;
                } else if (exigePeriodo()) {
                    self.areaTipoPeriodoVisible = true;
                    self.btnBuscarVisible = true;
                } else {
                    self.btnBuscarVisible = true;
                    self.areaTipoPeriodoVisible = false;
                }
            }

            function validaParametros() {
                var ret = false;
                if (!exigePeriodo()) {
                    return true;
                } else {
                    if ((StringUtils.emptyAsNull(self.cmbTipoPeriodo) == null)) {
                        return true;
                    } else if ((StringUtils.emptyAsNull(self.txtQtdDias) != null)) {
                        return true;
                    } else if ((StringUtils.emptyAsNull(self.dtDataInicio) != null)){
                        return true;
                    } else {
                        MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgInformeData"));
                        return false;
                    }
                }
                return ret;
            }

            function exigePeriodo() {
                if (self.cmbTipoSugestao == "jaForneceram") {
                    return true;
                } else if (self.cmbTipoSugestao == "jaCotaram") {
                    return true
                } else {
                    return false;
                }
            }

        }
    ]);