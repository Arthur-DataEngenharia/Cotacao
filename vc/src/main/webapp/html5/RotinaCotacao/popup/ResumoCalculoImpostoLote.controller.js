/**
 * Created by Handz (Eduardo,Charles) on 13/12/2019.
 */

angular
    .module('RotinaCotacaoApp')
    .controller('ResumoCalculoImpostoLoteController', ['data', 'SkApplicationInstance', 'RotinaCotacaoUtil',
        function (data, SkApplicationInstance, RotinaCotacaoUtil) {
            var self = this;

            const ORDEM_CAMPOS = ["IMGSTATUS", "NUMCOTACAO", "CODPROD", "Produto_DESCRPROD", "CONTROLE", "CODLOCAL", "LocalEstoque_DESCRLOCAL",
                "CODPARC", "Parceiro_NOMEPARC", "CODVOL", "Volume_DESCRVOL", "QTDCOTADA"];

            self.createDataSet = createDataSet;
            self.changeView = changeView;
            self.insereCotacaoesNaoCalc = insereCotacaoesNaoCalc;
            self.carregaErroNotaSelecionada = carregaErroNotaSelecionada;

            self.imgAlerta = '/assets/img/alerta.png';
            self.resumoCalculoImposto = data.resumoCalculoImposto.length > 0 ? data.resumoCalculoImposto[0] : {};
            self.qtdItensCalculados = self.resumoCalculoImposto.qtdItensCalculados;
            self.qtdItensNaoCalculados = self.resumoCalculoImposto.qtdItensNaoCalculados;
            self.qtdItensColeta = self.resumoCalculoImposto.qtdItensColeta;
            self.resumoCalculoImpostos = "";
            self.erroSolicitacaoSelecionada;
            self.eventoSelecionado = {};
            self.temFalhas = false;
            self.itensColetasNaoCalc = {};
            self.indiceViewStack = 0;

            self.gridConfigId = SkApplicationInstance.getResourceID().replace('-html5', '') + ".resumoconfirmacaocalcImpostos.cabecalho.gridconfig";

            init();

            function init() {

                if (self.resumoCalculoImposto.hasOwnProperty("naoCalculadas")) {
                    self.temFalhas = true;
                    var coleta = self.resumoCalculoImposto.naoCalculadas.coleta;

                    if (coleta) {
                        if (!angular.isArray(coleta)) {
                            coleta = [coleta];
                        }
                        coleta.forEach(function (msg) {
                            self.resumoCalculoImpostos = self.resumoCalculoImpostos + RotinaCotacaoUtil.getObjectValue(msg);
                        });
                    }

                }

                if (self.resumoCalculoImposto.hasOwnProperty("calculadas")) {
                    var coleta = self.resumoCalculoImposto.calculadas.coleta;

                    if (coleta) {
                        if (!angular.isArray(coleta)) {
                            coleta = [coleta];
                        }

                        coleta.forEach(function (msg) {
                            self.resumoCalculoImpostos = self.resumoCalculoImpostos + RotinaCotacaoUtil.getObjectValue(msg);
                        });
                    }

                }
            }

            function carregaErroNotaSelecionada() {
                self.erroSolicitacaoSelecionada = self.dsColetaItemCotacao.getFieldValueAsString("MSG");
            }
       
            function insereCotacaoesNaoCalc(itemColetaCotacaoList) {
                var records = [];

                if (itemColetaCotacaoList) {
                    if(!angular.isArray(itemColetaCotacaoList)){
                        itemColetaCotacaoList = [itemColetaCotacaoList];
                    }
                    itemColetaCotacaoList.forEach(function (itemColeta) {
                        var obj = {};

                        obj.NUMCOTACAO = self.dsColetaItemCotacao.strToTypedData(itemColeta.NUMCOTACAO, "I");
                        obj.CODPROD = self.dsColetaItemCotacao.strToTypedData(itemColeta.CODPROD, "I");
                        obj.Produto_DESCRPROD = self.dsColetaItemCotacao.strToTypedData(itemColeta.DESCRPROD, "S");
                        obj.CONTROLE = self.dsColetaItemCotacao.strToTypedData(itemColeta.CONTROLE, "S");
                        obj.CODLOCAL = self.dsColetaItemCotacao.strToTypedData(itemColeta.CODLOCAL, "I");
                        obj.LocalEstoque_DESCRLOCAL = self.dsColetaItemCotacao.strToTypedData(itemColeta.DESCRLOCAL, "S");
                        obj.CODPARC = self.dsColetaItemCotacao.strToTypedData(itemColeta.CODPARC, "I");
                        obj.Parceiro_NOMEPARC = self.dsColetaItemCotacao.strToTypedData(itemColeta.NOMEPARC, "S");
                        obj.CODVOL = self.dsColetaItemCotacao.strToTypedData(itemColeta.CODVOL, "S");
                        obj.Volume_DESCRVOL = self.dsColetaItemCotacao.strToTypedData(itemColeta.DESCRVOL, "S");
                        obj.QTDCOTADA = self.dsColetaItemCotacao.strToTypedData(itemColeta.QTDCOTADA, "I");
                        obj.MSG = self.dsColetaItemCotacao.strToTypedData(RotinaCotacaoUtil.getObjectValue(itemColeta), "S");

                        records.push(obj);
                    });


                    self.dsColetaItemCotacao.addRecordsAsObjects(records);
                    self.dsColetaItemCotacao.gotoRow(0);
                }
            }

            function createDataSet(dataset) {
                self.dsColetaItemCotacao = dataset;

                self.dsColetaItemCotacao.addLineChangeListener(dsCurrentLineChange);

                self.dsColetaItemCotacao.init().then(function () {

                    if (self.resumoCalculoImposto.hasOwnProperty("naoCalculadas")) {
                        insereCotacaoesNaoCalc(self.resumoCalculoImposto.naoCalculadas.coleta);
                    }

                });


            }

            function dsCurrentLineChange(newIndex) {
                self.erroSolicitacaoSelecionada = self.dsColetaItemCotacao.getFieldValueAsString("MSG");
            }

            function changeView(index) {
                self.indiceViewStack = index;
            }

        }
    ]);