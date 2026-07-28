angular
    .module('ModeloEmailCotacaoApp', ['snk'])
    .controller('ModeloEmailCotacaoController', ['StringUtils', 'ServiceProxy', 'MessageUtils', 'i18n',
        function (StringUtils, ServiceProxy, MessageUtils, i18n) {
            var self = this;

            // Fields
            self.editing = false;
            self.saveConfig = saveConfig;
            self.loadConfig = loadConfig;
            self.changeTipo = changeTipo;
            self.changeRecordAssunto = changeRecordAssunto;
            self.changeVarConteudo = changeVarConteudo;

            // Variáveis
            var _tipoOptions = [
                { value: "", data: ""},
                { value: i18n('cot_emailLblTipoEmailNovProd'), data: "br.com.sankhya.cotacao.modelo.email" },
                { value: i18n('cot_emailLblTipoEmailCancProd'), data: "br.com.sankhya.cotacaocancelamento.modelo.email" }
            ]

            var _assuntoOptions = [
                { value: i18n('cot_gridPedidosFornDescrEmpresa'), data: '$\{nomeempresa.link\}' },
                { value: i18n('cot_labelNumCotacao'), data: '$\{numcotacao\}' }
            ]

            var _emailOptions = {
                "br.com.sankhya.cotacao.modelo.email": [
                    { value: i18n('cot_emailLblNomeParceiro'), data: '$\{nomeparccot.link\}' },
                    { value: i18n('cot_emailLblRazaoSocial'), data: '$\{razaoparccot.link\}' },
                    { value: i18n('cot_emailLblNomeContato'), data: '$\{nomecttcot.link\}' },
                    { value: i18n('cot_emailLblLinkAcesso'), data: '$\{linkcotacao.link\}' },
                    { value: i18n('cot_emailLblCodigoProduto'), data: '$\{codproduto.link\}' },
                    { value: i18n('cot_emailLblNomeProduto'), data: '$\{nomeproduto.link\}' },
                    { value: i18n('cot_emailLblControleProduto'), data: '$\{controleproduto.link\}' },
                    { value: i18n('cot_gridPedidosFornDescrEmpresa'), data: '$\{nomeempresa.link\}' },
                    { value: i18n('cot_nomeComprador'), data: '$\{nomecomprador\}' },
                    { value: i18n('cot_emailComprador'), data: '$\{emailcomprador\}' },
                    { value: i18n('cot_labelNumCotacao'), data: '$\{numcotacao\}' }
                ],
                "br.com.sankhya.cotacaocancelamento.modelo.email": [
                    { value: i18n('cot_emailLblNomeParceiro'), data: '$\{nomeparccot.link\}' },
                    { value: i18n('cot_emailLblRazaoSocial'), data: '$\{razaoparccot.link\}' },
                    { value: i18n('cot_emailLblNomeContato'), data: '$\{nomecttcot.link\}' },
                    { value: i18n('cot_emailLblLinkAcesso'), data: '$\{linkcotacao.link\}' },
                    { value: i18n('cot_gridPedidosFornDescrEmpresa'), data: '$\{nomeempresa.link\}' },
                    { value: i18n('cot_nomeComprador'), data: '$\{nomecomprador\}' },
                    { value: i18n('cot_emailComprador'), data: '$\{emailcomprador\}' },
                    { value: i18n('cot_labelNumCotacao'), data: '$\{numcotacao\}' }
                ]
            }

            // Declarações
            self.tipoOptions = _tipoOptions;
            self.assuntoOptions = _assuntoOptions;
            self.emailOptions = _emailOptions;

            function changeTipo() {
                self.editing = true;
                loadConfig();
            }

            function changeRecordAssunto() {
                if (StringUtils.isEmpty(self.cmbVarAssunto)) {
                    return;
                }

                self.txtAssunto = StringUtils.undefinedAsEmpty(self.txtAssunto) + self.cmbVarAssunto;
                self.cmbVarAssunto = "";
            }

            function changeVarConteudo() {
                if (StringUtils.isEmpty(self.cmbVarConteudo)) {
                    return;
                }

                self.atxtConteudoEmail = StringUtils.undefinedAsEmpty(self.atxtConteudoEmail) + self.cmbVarConteudo;
                self.cmbVarConteudo = "";
            }

            function saveConfig() {
                const chave = self.cmbVarTipo;

                if (StringUtils.isEmpty(chave)) {
                    return;
                }

                const params = {
                    "config": {
                        chave: chave,
                        tipo: "T",
                        codusu: "0",
                        assunto: { "$": self.txtAssunto }
                    }
                }

                var conteudo = self.atxtConteudoEmail;
                if(angular.isDefined(conteudo)){
                	while (conteudo.match(/[\u000d\u000a]/)) {
                		conteudo = conteudo.replace(/[\u000d\u000a]/, "<br/>");
                	}
                }

                console.trace(conteudo);
                params["config"]["conteudoEmail"] = { "$": self.atxtConteudoEmail };

                ServiceProxy.callService("mge@SystemUtilsSP.saveConf", params)
                    .then(function () {
                        MessageUtils.showInfo(MessageUtils.TITLE_INFORMATION, i18n('cot_emailLblModeloSalvoSucesso'));
                    })
            }

            function loadConfig() {
                if (StringUtils.isEmpty(self.cmbVarTipo)) {
                    self.txtAssunto = "";
                    self.atxtConteudoEmail = "";
                    return;
                }

                var params = {
                    "config": {
                        chave: self.cmbVarTipo,
                        tipo: "T",
                        codusu: "0"
                    }
                }

                ServiceProxy.callService("mge@SystemUtilsSP.getConf", params)
                    .then(function (result) {
                        const config = result.responseBody.config;
                        if(angular.isDefined(config)) {
                        	self.txtAssunto = config.assunto.$;
                        	self.atxtConteudoEmail = config.conteudoEmail.$;
                        }
                    });

            }
        }]);
