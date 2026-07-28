/**
 * Created by Handz (Eduardo,Charles) on 13/12/2019.
 */

angular
    .module('RotinaCotacaoApp')
    .controller('PopUpUltimasComprasController', ['$scope', 'data', 'i18n', 'NumberUtils', 'MessageUtils', 'ServiceProxy', 'ObjectUtils', 'SkApplicationInstance', 'DateUtils', 'StringUtils',
        function ($scope, data, i18n, NumberUtils, MessageUtils, ServiceProxy, ObjectUtils, SkApplicationInstance, DateUtils, StringUtils) {
            var self = this;

            self.resourceIDGrade = "br.com.sankhya.cotacao.ultimasCompras.dataGridUltimasCompras.config";

            self.cmbTipoPeriodoOptions = [
                { index: 0, data: 'Q', value: i18n('cot_labelOpcDiasRetro') },
                { data: 'D', value: i18n('cot_labelOpcDataInicial') }
            ];
            self.cmbTipoPeriodo = 'Q';
            self.txtQtdDiasVisible = true;
            self.txtQtdDiasIncludeInLayout = true;

            self.dsUltimasCompras;
            self.coletaPreco = data.coletaPreco;

            self.createDataSet = createDataSet;
            self.cmbTipoPeriodoChange = cmbTipoPeriodoChange;
            self.buscar = buscar;

            $scope.$success = showGerenciaProdutos;

            function createDataSet(ds) {
                self.dsUltimasCompras = ds;
                self.dsUltimasCompras.init().then(function () {

                })
            }

            function showGerenciaProdutos() {
                var codProd = self.coletaPreco["CODPROD"];
                SkApplicationInstance.openApp("br.com.sankhya.mgecom.cons.GerenciaProdutos", { CODPROD: codProd });
            }

            function validaParametros() {
                var ret = false;

                if ((StringUtils.emptyAsNull(self.cmbTipoPeriodo) == null)) {
                    return true;
                } else if ((StringUtils.emptyAsNull(self.txtQtdDias) != null)) {
                    return true;
                } else if (self.dtDataInicio != null) {
                    return true;
                } else {
                    MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgInformePeriodo"));
                    return false;
                }
                return ret;
            }


            function buscar() {
                if (validaParametros()) {
                    var parametros = { parametros: {} }

                    var tipoPeriodo = "";

                    if (StringUtils.emptyAsNull(self.txtQtdDias) != null) {
                        tipoPeriodo = "Q";
                        parametros.parametros.qtdDias = self.txtQtdDias;

                    } else if (self.dtDataInicio != null) {
                        tipoPeriodo = "D";
                        parametros.parametros.dataInicio = DateUtils.formatDate(self.dtDataInicio);
                    }

                    parametros.parametros.tipoPeriodo = tipoPeriodo;
                    parametros.parametros.codProd = self.coletaPreco["CODPROD"];
                    parametros.parametros.precoCotado = self.coletaPreco["PRECO"];

                    ServiceProxy.callService('mgecot@CotacaoSP.buscaUltimasCompras', parametros
                    ).then(function (result) {
                        atualizaGrid(ObjectUtils.getProperty(result, "responseBody.ultimaCompraList"));
                    });

                }
            }

            function cmbTipoPeriodoChange() {
                if ((StringUtils.emptyAsNull(self.cmbTipoPeriodo) == null)) {
                    self.txtQtdDiasVisible = false;
                    self.txtQtdDias = "";
                    self.dtDataInicioVisible = false;
                    self.dtDataInicio = "";
                } else if (self.cmbTipoPeriodo == "D") {
                    self.txtQtdDiasVisible = false;
                    self.txtQtdDiasIncludeInLayout = false;
                    self.dtDataInicioVisible = true;
                    self.dtDataInicioIncludeInLayout = true;
                    self.txtQtdDias = "";
                } else if (self.cmbTipoPeriodo == "Q") {
                    self.txtQtdDiasVisible = true;
                    self.txtQtdDiasIncludeInLayout = true;
                    self.dtDataInicioVisible = false;
                    self.dtDataInicioIncludeInLayout = false;
                    self.dtDataInicio = null;
                }
            }

            function atualizaGrid(ultimaCompraList) {
                var resultado = [];
                var ultimaCompraArr = ultimaCompraList.ultimaCompra;

                if (ultimaCompraArr) {
	
					self.dsUltimasCompras.clearDataSet();

                    if (!angular.isArray(ultimaCompraArr)) {
                        ultimaCompraArr = [ultimaCompraArr];
                    }

                    ultimaCompraArr.forEach(function (item) {

                        var r = {
                            NUMNOTA: NumberUtils.stringToNumber(item.numNota),
                            CODPARC: NumberUtils.stringToNumber(item.codParc),
                            NOMEPARC: item.nomeParc,
                            QTDE: NumberUtils.stringToNumber(item.qtdNeg),
                            DTNEG: item.dtNeg,
                            PRECO: NumberUtils.stringToNumber(item.precoCompra),
                            VARIACAO: item.variacao
                        };

                        resultado.push(r);
                    });
                    
                    self.dsUltimasCompras.addRecordsAsObjects(resultado);
                    self.dsUltimasCompras.gotoRow(0);
                }

            }

        }
    ]);