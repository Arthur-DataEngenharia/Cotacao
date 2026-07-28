/**
 * Created by Handz (Eduardo,Charles) on 13/12/2019.
 */

angular
    .module('RotinaCotacaoApp')
    .controller('PopUpMultiplasEntregaController', ['$scope', 'data', '$popupInstance', 'NumberUtils', 'ServiceProxy', 'SanPopup', 'DateUtils', 'DatasetObserverEvents', 'i18n', 'ObjectUtils',
        function ($scope, data, $popupInstance, NumberUtils, ServiceProxy, SanPopup, DateUtils, DatasetObserverEvents, i18n, ObjectUtils) {
            var self = this;

            ObjectUtils.implements(self, IDatagridInterceptor);
            self.interceptColumnMetadata = interceptColumnMetadata;

            self.dsMultiplasDatas;
            self.dsItemCotacao = data.dsItemCotacao;

            self.inserirMultiplasDatas = false;

            self.createDataSet = createDataSet;
            self.abreInclusao = abreInclusao;

            $scope.$success = gravarProvisao;

            var _totalProvisionado;

            function createDataSet(ds) {
                self.dsMultiplasDatas = ds;

                self.dsMultiplasDatas.addAllObserverEventsListener(function (eventName, parameter) {

                    if (eventName == DatasetObserverEvents.EVENT_DATA_SAVED) {
                        self.inserirMultiplasDatas = false;
                    } else if (eventName == DatasetObserverEvents.EVENT_INSERT_MODE) {
                        self.inserirMultiplasDatas = true;
                    } else if (eventName == DatasetObserverEvents.EVENT_RECORD_EDITED) {
                        verificaEdicaoRegistro();
                    } else if (eventName == DatasetObserverEvents.EVENT_CURRENT_RECORD_CHANGED || eventName == DatasetObserverEvents.EVENT_DATA_SET_REFRESHED) {
                        provisaoChangeListener();
                    }
                });

                self.dsMultiplasDatas.initAndRefresh();
            }

            function interceptColumnMetadata(fieldMetadata, dataset) {
                if (fieldMetadata.name == 'DATAENTREGA') {
                    fieldMetadata.width = 300;
                }
            }



            function abreInclusao() {

                SanPopup.open({
                    title: "Inclusão",
                    templateUrl: 'html5/RotinaCotacao/popup/PopupIncluir.tpl.html',
                    controller: 'PopupIncluirController',
                    controllerAs: 'ctrl',
                    size: 'sm',
                    height: '150',
                    showBtnNo: false,
                    windowClass: 'popUpIncluirr',
                    resolve: {
                        data: { dsMultiplasDatas: self.dsMultiplasDatas, dataGridEnabled: self.dataGridEnabled }
                    }
                }).result
                    .then(function (result) {

                    });

            }


            function provisaoChangeListener(e) {
                ajustaQuantidadeProvisionada();
            }


            function verificaEdicaoRegistro() {
                ajustaQuantidadeProvisionada();
            }

            function formatNumber(value, precision) {
                if (isNaN(value)) {
                    return 0;
                }

                return NumberUtils.round(NumberUtils.getNumberOrZero(value), precision ? precision : 4);
            }

            function ajustaQuantidadeProvisionada() {
                var qtdCotada = self.dsItemCotacao.getFieldValueAsNumber("QTDCOTADA");

                _totalProvisionado = 0;

                self.dsMultiplasDatas.getRecordsAsObject().forEach(function (registro) {
                    _totalProvisionado += registro.QTDENTREGA;
                });

                var naoProvisionado = qtdCotada - _totalProvisionado;

                self.btnConfirmEnabled = naoProvisionado == 0;

                try {
                    lblFooter.innerHTML = i18n('Cotacao.RotinaCotacao.padraoRodape', [formatNumber(qtdCotada), formatNumber(naoProvisionado)]);

                } catch (ignored) {
                }

            }

            function gravarProvisao() {
                if (self.dsMultiplasDatas.isRecordDirty()) {

                    self.dsMultiplasDatas.save(false, gravarProvisao);

                } else {
                    var param = { params: { previsao: [] } };

                    param.params.NUMCOTACAO = self.dsItemCotacao.getFieldValueAsNumber("NUMCOTACAO");
                    param.params.CODPROD = self.dsItemCotacao.getFieldValueAsNumber("CODPROD");
                    param.params.CODPARC = self.dsItemCotacao.getFieldValueAsNumber("CODPARC");
                    param.params.CONTROLE = self.dsItemCotacao.getFieldValueAsString("CONTROLE");
                    param.params.CODLOCAL = self.dsItemCotacao.getFieldValueAsNumber("CODLOCAL");
                    param.params.CABECALHO = self.dsItemCotacao.getFieldValueAsString("CABECALHO");
                    param.params.DIFERENCIADOR = self.dsItemCotacao.getFieldValueAsNumber("DIFERENCIADOR");
                    param.params.QTDCOTADA = self.dsItemCotacao.getFieldValueAsNumber("QTDCOTADA");

                    self.dsMultiplasDatas.getRecordsAsObject().forEach(function (registro) {
                        var previsao = {};

                        previsao.QTDENTREGA = { $: registro["QTDENTREGA"] };
                        previsao.DATAENTREGA = { $: DateUtils.formatDate(registro["DATAENTREGA"]) };

                        param.params.previsao.push(previsao);
                    });

                    ServiceProxy.callService('mgecot@CotacaoSP.salvarProvisaoEntrega', param)
                        .then(function (result) {
                            self.dsMultiplasDatas.refresh();
                            $popupInstance.success();
                        });

                }

            }

        }
    ]);