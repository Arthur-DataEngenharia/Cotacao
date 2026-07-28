/**
 * Created by Handz (Eduardo,Charles) on 13/12/2019.
 */

angular
    .module('RotinaCotacaoApp')
    .controller('PopupProdutosController', ['StringUtils', 'data', '$popupInstance', 'MessageUtils', 'ServiceProxy', 'ObjectUtils', 'SkApplicationInstance', 'i18n',
        function (StringUtils, data, $popupInstance, MessageUtils, ServiceProxy, ObjectUtils, SkApplicationInstance, i18n) {
            var self = this;

            ObjectUtils.implements(self, IDatagridInterceptor);

            self.resourceIDGrade = SkApplicationInstance.getResourceID() + ".popuptransf.gradefornecedores";

            self.dsProdutosSugeridos;
            self.closeMe = closeMe;
            self.adicionar = adicionar;
            self.enviromentCriteria = enviromentCriteria;
            self.adicionarFornecedor = adicionarFornecedor;
            self.substituirFornecedor = substituirFornecedor;
            self.substituir = substituir;
            self.concluirr = concluir;

            self.evAdicionar = data.evAdicionar;
            self.evConcluir = data.evConcluir
            self.evSubstituir = data.evSubstituir;
            self.produtos = data.produtos;
            self.titulo = data.titulo;
            self.indexLinha = data.indexLinha;
            self.produtosAdicao = data.produtosAdicao;
            self.dsSugestoesStandAlone = data.dsSugestoesStandAlone;
            self.tipoPeriodo = data.tipoPeriodo;
            self.dataBusca = data.dataBusca;
            self.qtdDias = data.qtdDias;
            self.operacao = data.operacao;
            self.itensSugestao = data.itensSugestao;

            self.btnConcluirAdicaoVisible = false;
            self.btnConcluirSubstituicaoVisible = false;
            self.cabAdicSubstituirVisible = true;
            self.btnCancelarVisible = false;
            self.btnOkVisible = false;
            self.ehVisualizacao = false;


            self.labelNomeParceiro = i18n('cot_labelNomeParceiroVisualizacao');

            self.createDataSet = createDataSet;


            function ini() {

                if (self.operacao == "V") {
                    showVisualizacaoProdutos();
                } else if (self.operacao == "A") {
                    self.ehAdicao = true;
                    showAdicionarProdutos();
                } else if (self.operacao == "S") {
                    showSubstituirProdutos();
                }

            }

            function reloadRecords(records) {


                if (self.dsProdutosSugeridos) {
                    self.dsProdutosSugeridos.clearDataSet();

                    if (records) {
                    	self.dsProdutosSugeridos.addRecordsAsObjects(records, function(value) {
                            if (angular.isDefined(value) && angular.isDefined(value['$'])){
								value = value['$'];
							}
                            return value === undefined || StringUtils.emptyAsNull(value) === null ? null : value;
                        });
                        self.dsProdutosSugeridos.gotoRow(0);
                    }
                }
            }

            function atualizaTelaPopup() {
                var sugestaoSelecionada = null;

                if (self.ehAdicao) {
                    reloadRecords(getListaProdutosSelecionados());
                    self.cabVisualizacaoVisible = false;
                } else {
                    sugestaoSelecionada = self.dsSugestoesStandAlone.getRecordsAsObject()[self.indexLinha];
                    self.nomeParceiro = sugestaoSelecionada["CODPARC"] + " - " + sugestaoSelecionada["NOMEPARC"]

                    var itens = self.itensSugestao[sugestaoSelecionada["CODPARC"]];

                    reloadRecords(itens);
                }
                if (self.ehSubstituicao) {
                    self.labelNomeParceiro = i18n("cot_labelTitSubstituir") + ":";
                }
                if (self.ehVisualizacao) {
                    self.labelNomeParceiro = i18n("cot_labelNomeParceiroVisualizacao");
                }

                showItens();
            }

            function showItens() {


                if (self.ehVisualizacao) {
                    self.showCheckBoxSelection = false;
                    self.btnOkVisible = self.ehVisualizacao;
                    self.btnCancelarVisible = !self.ehVisualizacao;
                    self.cabAdicSubstituirVisible = !self.ehVisualizacao;
                    self.btnConcluirAdicao = !self.ehVisualizacao;
                    self.btnConcluirSubstituicaoVisible = !self.ehVisualizacao;
                    self.btnCancelarVisible = !self.ehVisualizacao;

                } else {

                    self.showCheckBoxSelection = true;
                    self.btnOkVisible = self.ehVisualizacao;
                    self.btnCancelarVisible = !self.ehVisualizacao;

                    if (self.ehAdicao) {
                        self.btnConcluirAdicaoVisible = self.ehAdicao;
                        self.btnConcluirSubstituicaoVisible = !self.ehAdicao;
                        self.btnConcluirSubstituicaoVisible = !self.ehAdicao;
                    }

                    if (self.ehSubstituicao) {
                        self.btnConcluirSubstituicaoVisible = self.ehSubstituicao;
                        self.btnConcluirAdicaoVisible = !self.ehSubstituicao;
                    }
                }
            }

            function getListaProdutosSelecionados() {
                var list = [];
                self.produtosAdicao.forEach(function (produto) {
                    var descrVol = "";

                    if (produto["CODVOL"] != 0) {
                        descrVol = produto["Volume_DESCRVOL"];
                    }
                    var i = {
                        CODPROD: produto["CODPROD"],
                        DESCRPROD: produto["Produto_DESCRPROD"],
                        CONTROLE: produto["CONTROLE"],
                        DIFERENCIADOR: produto["DIFERENCIADOR"],
                        CODLOCAL: produto["CODLOCAL"],
                        NUMCOTACAO: produto["NUMCOTACAO"],
                        DESCRVOLUME: descrVol,
                        CABECALHO: produto["CABECALHO"],
                        STATUSPRODCOT: produto["STATUSPRODCOT"]
                    };

                    list.push(i);
                });

                return list;
            }

            function showVisualizacaoProdutos() {
                self.titulo = i18n('cot_labelTitVisualizar')
                self.ehVisualizacao = true;
            }

            function showAdicionarProdutos() {
                self.ehVisualizacao = false;
                self.ehAdicao = true;
            }

            function showSubstituirProdutos() {
                self.ehVisualizacao = false;
                self.ehSubstituicao = true;
            }

            function adicionar() {
                if (self.evAdicionar != null) {
                    self.evAdicionar();
                }
                closeMe();
            }

            function concluir() {
                if (self.evConcluir != null) {
                    self.evConcluir();
                }
                closeMe();
            }

            function substituir() {
                if (evSubstituir != null) {
                    evSubstituir();
                }
                closeMe();
            }

            function possuiItensSelecionados() {
                var itens = getItensSelecionados();
                return null != itens && itens.length > 0
            }

            function validaParametros() {
                var ret = false;
                return ret;
            }

            function getItensSelecionados() {
                var itens = [];
                var itensSelecionados = self.dsProdutosSugeridos.getSelectedRecords();

                if (itensSelecionados) {
                    self.dsProdutosSugeridos.getSelectedRecordsAsObjects().forEach(function (ob) {
                        itens.push(ob);
                    });
                }

                return itens;
            }

            function getIndexesItensSelecionados() {
                var itensSel = [];

                var produtosSug = self.dsProdutosSugeridos.getRecordsAsObjects();

                for (var i = 0; i < produtosSug.length; i++) {
                    var ob = produtosSug[i];
                    if (ob.hasOwnProperty("CHK_SELECTION")) {
                        var sel = ob["CHK_SELECTION"];
                        if (sel == "S") {
                            itensSel.addItem(i);
                        }
                    }
                }
                return itensSel;
            }

            function enviromentCriteria() {
                var criterio = Criteria();
                criterio.append("this.FORNECEDOR = 'S' AND this.ATIVO='S' ");
                return criterio;
            }


            function closeMe(itensMantidos) {
                $popupInstance.success(itensMantidos);
            }

            function createDataSet(ds) {
                self.dsProdutosSugeridos = ds;

                self.dsProdutosSugeridos.whenMetadataLoaded().then(() => {
                    atualizaTelaPopup();
                });


                self.dsProdutosSugeridos.init();
            }

            function adicionarFornecedor() {
                atualizarProdutosSugeridos(false);
            }

            function atualizarProdutosSugeridos(substituiProdutos) {
                if (validaDados()) {
                    var codParc = self.pesqNovoParceiroValue;

                    var itensSel = getItensSelecionados();

                    var sugestoes = self.dsSugestoesStandAlone.getRecordsAsObjects();

                    var linhaParceiro = getIndiceLinhaFornecedor(codParc);

                    var sugestao;

                    if (linhaParceiro >= 0) {

                        sugestao = sugestoes[linhaParceiro];

                        var produtosParceiro = sugestao["PRODUTOS"];
                        var itensMegerd = mergeProdutosFornecedor(produtosParceiro, itensSel)

                        sugestao["PRODUTOS"] = itensMegerd;
                        sugestoes[linhaParceiro] = sugestao;

                    } else {

                        var parametros = { parametros: {} }

                        if (StringUtils.emptyAsNull(self.qtdDias) != null) {
                            self.tipoPeriodo = "Q";
                            parametros.parametros.qtdDias = self.qtdDias;
                        } else if (self.dataBusca != null) {
                            self.tipoPeriodo = "D";
                            self.parametros.parametros.dataInicio = DateUtil.dateFormat(self.dataBusca);
                        }

                        ObjectUtils.setProperty(parametros.parametros, 'tipoPeriodo', self.tipoPeriodo);
                        ObjectUtils.setProperty(parametros.parametros, 'codParc', codParc);

                        ServiceProxy.callService('mgecot@CotacaoSP.buscaDadosNovoFornecedor', parametros)
                            .then(function (result) {
                                var itens = ObjectUtils.getProperty(result, 'responseBody.sugestaoList.sugestao')
                                var item = itens;

                                if (item) {

                                    if (angular.isArray(item)) {
                                        item = [item][0];
                                    }

                                    var itensSugestao = getItensSelecionados();

                                    var novoFornecedor = {
                                        CODPARC: item.codParc,
                                        NOMEPARC: item.nomeParc,
                                        ACESSOPORTALCOTACAO: item.acessoPortalCotacao,
                                        DTULTCOMPRA: item.dtUltimaCompra,
                                        QTDNOTASNEGOC: item.qtdNotasNegoc,
                                        PRODUTOS: getItensSelecionados()
                                    };

                                    self.itensSugestao[item.codParc] = itensSugestao;

                                    sugestoes.push(novoFornecedor);
                                }
                                var produtoSubstituir;

                                if (substituiProdutos) {
                                    sugestao = sugestoes[self.indexLinha];

                                    var itensSelec = [];
                                    var produtosSug = self.dsProdutosSugeridos.getRecordsAsObjects();

                                    produtoSubstituir = self.dsProdutosSugeridos.getSelectedRecordsAsObjects();

                                    for (var i = 0; i < produtosSug.length; i++) {
                                        itensSelec.push(i);
                                    }
                                    var produtosParceiroList = sugestao["PRODUTOS"];

                                    var itensMantidos = removeProdutosFornecedor(produtosParceiroList, itensSelec);

                                    if (itensMantidos.length == 0) {
                                        sugestoes.splice(self.indexLinha, 1);                                        
                                    } else {
                                        sugestao["PRODUTOS"] = itensMantidos;
                                        sugestoes[self.indexLinha] = sugestao;
                                    }
                                }

                                self.dsSugestoesStandAlone.clearDataSet();
                                self.dsSugestoesStandAlone.addRecordsAsObjects(sugestoes);
                                self.dsSugestoesStandAlone.gotoRow(0);

                                closeMe(produtoSubstituir);


                            });


                    }


                }
            }

            function mergeProdutosFornecedor(produtosParceiro, novosItens) {
                var itensMerged = produtosParceiro;

                novosItens.forEach(function (produtoNovo) {
                    if (!listaPossuiProduto(produtosParceiro, produtoNovo)) {
                        itensMerged.push(produtoNovo);
                    }
                });
                return itensMerged;
            }

            function removeProdutosFornecedor(produtosParceiro, itensRemocao) {
                var itensMantidos = [];

                for (var i = 0; i < produtosParceiro.length; i += 1) {
                    if (!itensRemocao.includes(i)) {
                        itensMantidos.push(produtosParceiro[i]);
                    }
                }

                return itensMantidos;
            }


            function listaPossuiProduto(listaParceiro, produto) {
                listaParceiro.forEach(function (item) {

                    if (compararProdutosSugeridos(produto, item)) {
                        return true;
                    }
                });
                return false;
            }

            function compararProdutosSugeridos(p1, p2) {
                var ret = false;
                if ((p1["CODPROD"] == p2["CODPROD"]) && (p1["DESCRPROD"] == p2["DESCRPROD"]) && (p1["CONTROLE"] == p2["CONTROLE"]) && (p1["DIFERENCIADOR"] == p2["DIFERENCIADOR"]) && (p1["NUMCOTACAO"] == p2["NUMCOTACAO"])) {
                    ret = true;
                }
                return ret;
            }

            function substituirFornecedor() {
                atualizarProdutosSugeridos(true);
            }

            function validaDados() {
                if (self.ehSubstituicao) {
                    var codParcNovo = self.pesqNovoParceiroValue;
                    var sugestao = self.dsSugestoesStandAlone.getRecordsAsObjects()[self.indexLinha];
                    var codParcSugerido = sugestao["CODPARC"];

                    if (codParcNovo == codParcSugerido) {
                        MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n('cot_labelParcSugIgualParcAtual'));
                        return false;
                    }
                }

                if ((StringUtils.emptyAsNull(self.pesqNovoParceiroValue) == null) && !possuiItensSelecionados()) {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n('cot_msgInformeParceiroProduto'));
                    return false;
                }

                if (StringUtils.emptyAsNull(self.pesqNovoParceiroValue) == null) {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n('cot_msgSelecioneFornecedor'));
                    return false;
                }

                if (!possuiItensSelecionados()) {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n('cot_msgSelecioneProdutos'));
                    return false;
                }
                return true;
            }

            function produtosLiberados() {
                var itensSel = getItensSelecionados();

                var codParc = self.pesqNovoParceiroValue;

                return "";
            }

            function getIndiceLinhaFornecedor(codParc) {
                var sugestoes = self.dsSugestoesStandAlone.getRecordsAsObjects();

                for (var i = 0; i < sugestoes.length; i++) {
                    var sugestao = sugestoes[i];
                    var codParceiroAtual = sugestao["CODPARC"];
                    if (codParc == codParceiroAtual) {
                        return i;
                    }
                }
                return -1;
            }


            ini();


        }
    ]);