/**
 * Created by Handz (Eduardo,Charles)
 */

angular
    .module('RotinaCotacaoApp')
    .controller('AbaPesosItensController', ['i18n', 'SkPesquisaService', 'RotinaCotacaoUtil', '$scope', 'ServiceProxy', 'ArrayUtils',
        function (i18n, SkPesquisaService, RotinaCotacaoUtil, $scope, ServiceProxy, ArrayUtils) {
            var self = this;

            self.editProfile;
            self.btCriteriosVisible;
            self.dsCabCotacao;
            self.showPopupBuscaPesoCriterio = showPopupBuscaPesoCriterio;

            function setupConfigTab() {
                $scope.$on('configTab', function (event, config) {

                    if (!self.dsCabCotacao) {
                        self.dsCabCotacao = config.dsCabCotacao;

                        self.dsCabCotacao.addInsertionModeListener(function () {
                            atualizaPeso();
                        });
                    }

                    self.editProfile = config.editProfile;
                    self.btCriteriosVisible = config.btCriteriosVisible;
                });


            }

            function atualizaPeso() {
                self.dsCabCotacao.setFieldValue("PESOPRECO", 1);
            }

            function showPopupBuscaPesoCriterio() {
                SkPesquisaService.openPesquisaPopUp('PesoCriterioCotacao', undefined, {
                    label: i18n('cot_lblTitPopupPesquisarPeso'),
                    descriptionField: 'DESCRPPC'
                }).then(function (result) {
                    if (result && result.data) {

                        var entity = {
                            name: "PesoCriterioCotacao",
                            criterio: {
                                nome: "CODPPC",
                                valor: result.data.CODPPC
                            },
                            fields: {
                                field: [
                                    {
                                        name: "PESOCONDPAG"
                                    },
                                    {
                                        name: "PESOCONFIABFORN"
                                    },
                                    {
                                        name: "PESOGARANTIA"
                                    },
                                    {
                                        name: "PESOPRAZOENTREG"
                                    },
                                    {
                                        name: "PESOPRAZOMED"
                                    },
                                    {
                                        name: "PESOPRECO"
                                    },
                                    {
                                        name: "PESOQUALATEND"
                                    },
                                    {
                                        name: "PESOQUALPROD"
                                    },
                                    {
                                        name: "PESOTAXAJURO"
                                    }
                                ]
                            }
                        };

                        ServiceProxy.callService('mge@crud.find', {entity})
                            .then(function (result) {

                                var peso = result.responseBody.entidades.entidade;

                                if (ArrayUtils.toArray(self.dsCabCotacao.getCurrentRowAsObject()).length == 0) {
                                    self.dsCabCotacao.goToInsertionMode();
                                }

                                self.dsCabCotacao.setFieldValue("PESOCONDPAG", RotinaCotacaoUtil.getObjectValue(peso.PESOCONDPAG));
                                self.dsCabCotacao.setFieldValue("PESOCONFIABFORN", RotinaCotacaoUtil.getObjectValue(peso.PESOCONFIABFORN));
                                self.dsCabCotacao.setFieldValue("PESOGARANTIA", RotinaCotacaoUtil.getObjectValue(peso.PESOGARANTIA));
                                self.dsCabCotacao.setFieldValue("PESOPRAZOENTREG", RotinaCotacaoUtil.getObjectValue(peso.PESOPRAZOENTREG));
                                self.dsCabCotacao.setFieldValue("PESOPRAZOMED", RotinaCotacaoUtil.getObjectValue(peso.PESOPRAZOMED));
                                self.dsCabCotacao.setFieldValue("PESOPRECO", RotinaCotacaoUtil.getObjectValue(peso.PESOPRECO));
                                self.dsCabCotacao.setFieldValue("PESOQUALATEND", RotinaCotacaoUtil.getObjectValue(peso.PESOQUALATEND));
                                self.dsCabCotacao.setFieldValue("PESOQUALPROD", RotinaCotacaoUtil.getObjectValue(peso.PESOQUALPROD));
                                self.dsCabCotacao.setFieldValue("PESOTAXAJURO", RotinaCotacaoUtil.getObjectValue(peso.PESOTAXAJURO));

                            });
                    }
                });
            }

            setupConfigTab();
        }
    ]);