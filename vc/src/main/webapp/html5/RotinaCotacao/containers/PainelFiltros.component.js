/**
 * Created by Handz (Eduardo,Charles) on 10/02/2020.
 */
angular
    .module('RotinaCotacaoApp')
    .component('skPainelFiltrosCotacao', {
        templateUrl: 'html5/RotinaCotacao/containers/PainelFiltros.tpl.html',
        controller: 'PainelFiltrosController',
        controllerAs: 'ctrl',
        bindings: {
            dataSet: "<?",
            callbackFilter: "&?",
            idPersonalizedFilter: "@?",
            idSaveFilter: "@?",
            isCabecalho: "<",
            onContentCreated: '&',

        }
    })
    .controller('PainelFiltrosController', ['i18n', 'StringUtils','ObjectUtils', 'SkApplicationInstance', 'SkApplication', 'DateUtils', 'Criteria',
        function (i18n, StringUtils,ObjectUtils, SkApplicationInstance, SkApplication, DateUtils, Criteria) {
            var self = this;

            var _publicAPI = {};
            _publicAPI.buscaUltimoFiltro = buscaUltimoFiltro;
            _publicAPI.getFiltro = getFiltro;
            _publicAPI.setCamposFiltro = setCamposFiltro;
            _publicAPI.clearFilter = clearFilter;


            self.labelPesquisaProduto = i18n('cot_labelPesquisaProduto');
            self.labelPesquisaParceiro = i18n('cot_labelPesquisaParceiro');
            self.labelPesquisaCotacao = i18n('cot_labelPesquisaCotacao');
            self.labelPesquisaEmpresa = i18n('cot_labelPesquisaEmpresa');
            self.labelPesquisaCentroResult = i18n('cot_labelPesquisaCentroResult');
            self.labelPesquisaPeriodoCotacao = i18n('cot_labelPesquisaPeriodoCotacao');
            self.labelPesquisaDataInicial = i18n('cot_labelPesquisaDataInicial');
            self.labelPesquisaDataFinal = i18n('cot_labelPesquisaDataFinal');
            self.labelTGFCOTSituacao = i18n('field_tgfcot_situacao');
            self.labelTGFITCStatusProdCot = i18n('field_tgfitc_statusprodcot');
            self.lblEmail = i18n('cot_lblFilaEmail');
            self.labelBtnMarcarTodos = i18n('cot_btnMarcarTodos');
            self.labelBtnDesmarcarTodos = i18n('cot_btnDesmarcarTodos');
            self.marcarDesmarcarTodos = marcarDesmarcarTodos;
            self.marcarDesmarcarTodosFila = marcarDesmarcarTodosFila;

            self.camposFiltro;

            var _arrayStatusFiltro = [];

            self.comboPesqCampoPeriodo = "DHINIC";
            self.listValue;
            self.listValueEmail;
            self.lstStatus = [];
            self.lstEmail = [];
            self.pesqProd;
            self.pesqParc;
            self.pesqEmpresa;
            self.pesqCentResult;
            self.callbackFilter;
            self.resourceIdPersonalized = SkApplicationInstance.getResourceID() + "." + self.idPersonalizedFilter;


            self.campoPeriodo = {
                dtIni: undefined,
                dtFim: undefined
            };

            self.cbxPesqCampoPeriodo = [
                { data: 'DHINIC', value: self.labelPesquisaDataInicial },
                { data: 'DHFINAL', value: self.labelPesquisaDataFinal }
            ];

            self.$onInit = $onInit;

            function $onInit() {

                self.onContentCreated({
                    $instance: _publicAPI
                });

                self.lstEmail = getEmailList();
            }

            function setCamposFiltro(camposFiltro) {
                self.camposFiltro = camposFiltro;
            }

            function getFiltro(salvarFiltro, criteria) {

                if (validatePeriodo(self.campoPeriodo.dtIni, self.campoPeriodo.dtFim)) {

                    if (self.callbackFilter) {
                        self.callbackFilter();
                    }

                    if (StringUtils.emptyAsNull(self.pesqCotacao)) {
                        criteria.append(" AND this.NUMCOTACAO = ?");
                        criteria.addParameter(Criteria.buildParameter('N', self.pesqCotacao));
                    }

                    if (StringUtils.emptyAsNull(self.pesqProd)) {

                        if (self.isCabecalho) {
                            criteria.append(" AND EXISTS(SELECT 1 FROM TGFITC ITC WHERE ITC.NUMCOTACAO = this.NUMCOTACAO AND ITC.CODPROD = ?)");
                        } else {
                            criteria.append(" AND this.CODPROD = ?");
                        }

                        criteria.addParameter(Criteria.buildParameter('N', self.pesqProd));
                    }

                    if (StringUtils.emptyAsNull(self.pesqCentResult)) {
                        if (self.isCabecalho) {
                            criteria.append(" AND this.CODCENCUS = ?");
                        } else {
                            criteria.append(" AND CabecalhoCotacao->CODCENCUS = ?");
                        }
                        criteria.addParameter(Criteria.buildParameter('N', self.pesqCentResult));
                    }
                    if (StringUtils.emptyAsNull(self.pesqEmpresa)) {
                        if (self.isCabecalho) {
                            criteria.append(" AND this.CODEMP = ?");
                        } else {
                            criteria.append(" AND CabecalhoCotacao->CODEMP = ?");
                        }
                        criteria.addParameter(Criteria.buildParameter('N', self.pesqEmpresa));
                    }

                    var statusSelecionados = [];

                    self.lstStatus.forEach(function (param) {
                        if (param.checked) {
                            statusSelecionados.push(param);
                        }
                    });


                    var statusString = "";

                    var i;

                    for (i = 0; i < statusSelecionados.length; i++) {
                        if (i < statusSelecionados.length - 1) {
                            statusString += "'" + statusSelecionados[i].data + "',";
                        } else {
                            statusString += "'" + statusSelecionados[i].data + "'";
                        }
                    }

                    if (statusSelecionados.length > 0) {
                        if (self.isCabecalho) {
                            criteria.append(" AND this.SITUACAO IN (" + statusString + ")");
                        } else {
                            criteria.append(" AND this.STATUSPRODCOT IN (" + statusString + ")");
                        }
                    }

                    if (StringUtils.emptyAsNull(self.pesqParc)) {
                        if (self.isCabecalho) {
                            criteria.append(" AND EXISTS(SELECT 1 FROM TGFITC ITC WHERE ITC.NUMCOTACAO = this.NUMCOTACAO AND ITC.CODPARC = ?)");
                        } else {
                            criteria.append(" AND EXISTS (SELECT 1 FROM TGFITC FO WHERE FO.CODPARC = ? AND FO.CABECALHO = 'N' AND FO.NUMCOTACAO = this.NUMCOTACAO AND FO.CODPROD = this.CODPROD AND FO.CONTROLE = this.CONTROLE AND FO.DIFERENCIADOR = this.DIFERENCIADOR AND FO.CODLOCAL = this.CODLOCAL)");
                        }

                        criteria.addParameter(Criteria.buildParameter('N', self.pesqParc));
                    }

                    var dataInicial = self.campoPeriodo.dtIni;
                    var dataFinal = self.campoPeriodo.dtFim;
                    var campoData = self.comboPesqCampoPeriodo;

                    if (angular.isDate(dataInicial)) {

                        if (self.isCabecalho) {
                            criteria.append(" AND onlyDate(this." + campoData + ") >= ? ");
                        } else {
                            criteria.append(" AND onlyDate(CabecalhoCotacao->" + campoData + ") >= ? ");
                        }

                        criteria.addParameter(Criteria.buildParameter('D', DateUtils.formatDate(dataInicial)));
                    }

                    if (angular.isDate(dataFinal)) {
                        if (self.isCabecalho) {
                            criteria.append(" AND onlyDate(this." + campoData + ") <= ? ");
                        } else {
                            criteria.append(" AND onlyDate(CabecalhoCotacao->" + campoData + ") <= ? ");
                        }

                        criteria.addParameter(Criteria.buildParameter('D', DateUtils.formatDate(dataFinal)));
                    }

                    var statusFilaMensagem = [];

                    self.lstEmail.forEach(function (param) {
                        if (param.checked) {
                            statusFilaMensagem.push(param.data);
                        }
                    });

                    if (statusFilaMensagem.length > 0) {
                        var statusFilaMsg = "";

                        if (statusFilaMensagem.includes("S")) {
                            statusFilaMsg += " 'Sucesso: Enviada' ";
                        }

                        if (statusFilaMensagem.includes("P")) {
                            if (statusFilaMsg != "") {
                                statusFilaMsg += ", 'Pendente', 'Pendente: Erro', 'Pendente: Erro SMS', 'Pendente: Erro e-mail', 'Pendente: Erro MSN' ";
                            } else {
                                statusFilaMsg += " 'Pendente', 'Pendente: Erro', 'Pendente: Erro SMS', 'Pendente: Erro e-mail', 'Pendente: Erro MSN' ";
                            }
                        }

                        if (statusFilaMensagem.includes("E")) {

                            var msgErro = " 'Erro: " + i18n("cot_lblErroEmail") + "'";

                            if (statusFilaMsg != "") {
                                statusFilaMsg += " , " + msgErro + ", 'Erro: SMS * Sucesso: e-mail','Erro: e-mail * Sucesso: SMS','Erro: MSN' ";
                            } else {
                                statusFilaMsg += msgErro + ", 'Erro: SMS * Sucesso: e-mail','Erro: e-mail * Sucesso: SMS','Erro: MSN' ";
                            }
                        }

                        criteria.append(" AND EXISTS( SELECT 1 FROM ( TGFITC ITC INNER JOIN TGFNTC NTC ON ITC.NUMCOTACAO = NTC.NUMCOTACAO AND ITC.CODPARC = NTC.CODPARC ) " +
                            " INNER JOIN TMDFMG FMG ON NTC.CODFILA = FMG.CODFILA WHERE ITC.NUMCOTACAO = this.NUMCOTACAO AND FMG.STATUS IN ( " + statusFilaMsg + ") ) ");
                    }

                    if (salvarFiltro) {
                        salvaFiltroCorrente();
                    }

                    return criteria;
                } else {
                    return criteria;
                }
            }

            function clearFilter() {
                self.pesqProd = undefined;
                self.pesqParc = undefined;
                self.pesqCotacao = undefined;
                self.pesqEmpresa = undefined;
                self.pesqCentResult = undefined;
                self.listValue = undefined;
                self.listValueEmail = undefined;

                self.campoPeriodo = {
                    dtIni: undefined,
                    dtFim: undefined
                }
            }

            function marcarDesmarcarTodosFila(selected) {

                self.lstEmail.forEach(function (status) {
                    status.checked = selected;
                });

            }

            function salvaFiltroCorrente() {
                var configObj = {};

                configObj.codProd = self.pesqProd;
                configObj.codParc = self.pesqParc;
                configObj.numCotacao = self.pesqCotacao;
                configObj.codEmp = self.pesqEmpresa;
                configObj.codCenCus = self.pesqCentResult;
                configObj.tipoPeriodo = self.comboPesqCampoPeriodo;
                configObj.periodoInicial = DateUtils.dateToString(self.campoPeriodo.dtIni);
                configObj.periodoFinal = DateUtils.dateToString(self.campoPeriodo.dtFim);
                configObj.statusSel = getFiltroStatusSel();

                SkApplication.instance().saveMgeConfig(SkApplicationInstance.getResourceID() + "." + self.idSaveFilter, configObj);
            }

            function buscaUltimoFiltro() {
                var configName = SkApplicationInstance.getResourceID() + "." + self.idSaveFilter;

                SkApplicationInstance
                    .loadMgeConfig(configName)
                    .then(function (config) {

                        if (config != null && config.config) {
                            config = config.config;
                            
                            if (StringUtils.emptyAsNull(config.codProd) != null && !ObjectUtils.isEmpty(config.codProd)) {                                
                                self.pesqProd = config.codProd?.$ ? config.codProd.$ : config.codProd ;
                            }
                            
                            if (StringUtils.emptyAsNull(config.codParc) != null && !ObjectUtils.isEmpty(config.codParc)) {
                                self.pesqParc = config.codParc?.$ ? config.codParc.$ : config.codParc ;
                            }
                            
                            if (StringUtils.emptyAsNull(config.numCotacao) != null && !ObjectUtils.isEmpty(config.numCotacao)) {
                                self.pesqCotacao = config.numCotacao?.$ ? config.numCotacao.$ : config.numCotacao ;
                            }
                            
                            if (StringUtils.emptyAsNull(config.codEmp) != null && !ObjectUtils.isEmpty(config.codEmp) ){
                                self.pesqEmpresa = config.codEmp?.$ ? config.codEmp.$ : config.codEmp ;
                            }
                            
                            if (StringUtils.emptyAsNull(config.codCenCus) != null && !ObjectUtils.isEmpty(config.codCenCus)) {
                                self.pesqCentResult = config.codCenCus?.$ ? config.codCenCus.$ : config.codCenCus ;
                            }
                            
                            if (StringUtils.emptyAsNull(config.tipoPeriodo) != null && !ObjectUtils.isEmpty(config.tipoPeriodo)) {
                                self.comboPesqCampoPeriodo = config.tipoPeriodo?.$ ? config.tipoPeriodo.$ : config.tipoPeriodo ;
                                if(self.comboPesqCampoPeriodo=='0'){
                                    self.comboPesqCampoPeriodo ="DHINIC";
                                }else if(self.comboPesqCampoPeriodo=='1'){
                                    self.comboPesqCampoPeriodo ="DHFINAL";
                                }
                            }
                            
                            if (StringUtils.emptyAsNull(config.periodoInicial) != null && !ObjectUtils.isEmpty(config.periodoInicial)) {
                                self.campoPeriodo.dtIni = config.periodoInicial?.$ ? DateUtils.stringToDate(config.periodoInicial.$): DateUtils.stringToDate(config.periodoInicial);
                            }
                            
                            if (StringUtils.emptyAsNull(config.periodoFinal) != null && !ObjectUtils.isEmpty(config.periodoFinal)) {
                                self.campoPeriodo.dtFim = config.periodoFinal?.$ ? DateUtils.stringToDate(config.periodoFinal.$) : DateUtils.stringToDate(config.periodoFinal);
                            }
                            
                            if (StringUtils.emptyAsNull(config.statusSel) != null && !ObjectUtils.isEmpty(config.statusSel)) {
                                var strStatusSel = config.statusSel?.$ ? config.statusSel.$ : config.statusSel ;
                                getStatusList().forEach(function (status) {
                                    if (strStatusSel.element) {

                                        if (!angular.isArray(strStatusSel.element)) {
                                            strStatusSel.element = [strStatusSel.element];
                                        }

                                        var index = strStatusSel.element.findIndex(statusElm => statusElm.$ == status.data);

                                        if (index > -1) {
                                            status.checked = true;
                                        } else {
                                            status.checked = false;
                                        }
                                    }
                                    _arrayStatusFiltro.push(status);
                                });

                                self.lstStatus = _arrayStatusFiltro;

                            } else {
                                self.lstStatus = getStatusList();
                            }

                        } else {
                            self.lstStatus = getStatusList();
                        }

                    });
            }

            function getStatusList() {
                var listStatus = [];

                if (self.isCabecalho) {
                    listStatus.push({ value: i18n('cot_lblStatusAberta'), data: 'A', checked: true });
                    listStatus.push({ value: i18n('cot_lblStatusAprovada'), data: 'P', checked: true });
                    listStatus.push({ value: i18n('cot_lblStatusCancelada'), data: 'C', checked: true });
                    listStatus.push({ value: i18n('cot_lblStatusFechada'), data: 'F', checked: true });
                } else {
                    listStatus.push({ value: i18n('cot_lblStatusAberta'), data: 'O', checked: true });
                    listStatus.push({ value: i18n('cot_lblStatusAprovado'), data: 'A', checked: true });
                    listStatus.push({ value: i18n('cot_lblStatusCancelada'), data: 'C', checked: true });
                    listStatus.push({ value: i18n('cot_lblStatusEnviada'), data: 'E', checked: true });
                    listStatus.push({ value: i18n('cot_lblStatusFechada'), data: 'F', checked: true });
                    listStatus.push({ value: i18n('cot_lblStatusPrecificado'), data: 'P', checked: true });
                }

                return listStatus;
            }

            function getEmailList() {
                var listStatus = [];


                listStatus.push({ value: i18n('cot_lblSucessoEmail'), data: 'S', checked: false });
                listStatus.push({ value: i18n('cot_lblPendenteEmail'), data: 'P', checked: false });
                listStatus.push({ value: i18n('cot_lblErroEmail'), data: 'E', checked: false });

                return listStatus;
            }

            function getFiltroStatusSel() {
                var statusSelecionados = [];

                self.lstStatus.forEach(function (status) {
                    if (status.checked) {
                        statusSelecionados.push(status.data);
                    }
                });

                return statusSelecionados;
            }

            function validatePeriodo(dataInicio, dataFinal) {
                if (!(StringUtils.emptyAsNull(dataInicio) == null) && !(StringUtils.emptyAsNull(dataFinal) == null)) {
                    var dtInicio = DateUtils.strToDate(dataInicio);
                    var dtFim = DateUtils.strToDate(dataFinal);

                    if (DateUtils.compareOnlyDate(dtInicio, dtFim) == 1) {
                        MessageUtils.showError(MessageUtils.TITLE_ERROR, i18n("cot_msgDataInicioMaiorFim"));
                        campoPeriodo.focusEnabled;
                        return false;
                    }
                }
                return true;
            }

            function marcarDesmarcarTodos(selected) {
                self.lstStatus.forEach(function (status) {
                    status.checked = selected;
                });
            }

        }
    ]);