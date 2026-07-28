angular
    .module('RotinaCotacaoApp')
    .service('RotinaCotacaoUtil', ['MGEParameters', 'NumberUtils', 'DateUtils',
        function (MGEParameters, NumberUtils, DateUtils) {

            var self = this;

            self.getNumberWit2Digits = getNumberWit2Digits;
            self.recalcularValoresMoeda = recalcularValoresMoeda;
            self.calculaTotalItemCotacaoByItem = calculaTotalItemCotacaoByItem;
            self.getEnvironmentCriteriaMoeda = getEnvironmentCriteriaMoeda;
            self.getEnvironmentCriteriaContato = getEnvironmentCriteriaContato;
            self.objectToXML = objectToXML;
            self.addElements = addElements;
            self.getObjectValue = getObjectValue;
            self.buildRowObject = buildRowObject;

            self.CAMPOS_MOEDA = ["VLRMOEDA", "PRECOMOE", "VLRDESCMOE", "DTMOEDA", "CODMOEDA"];
            self.CAMPOS_CHAVE_CABECALHO = ["CODPROD", "CODLOCAL", "NUMCOTACAO", "CONTROLE"];

            function getNumberWit2Digits(source, digits) {
                var result = 0;

                if (source > 0) {
                    var resultado = NumberUtils.format(source, digits);
					result = NumberUtils.stringToNumber(resultado);
                }
                return result;
            }

            function getObjectValue(value) {
                try {
                    return value.$ ? value.$ : value;
                }
                catch (e) {
                    return value ? value : "";
                }
            }

            function buildRowObject(item) {
                var keys = Object.keys(item);

                var row = {};

                keys.forEach(function (key) {
                    var value = getObjectValue(item[key]);
                    row[key] = Object.keys(value).length === 0 && value.constructor === Object ? "" : value;
                });

                return row;
            }

            function recalcularValoresMoeda(campoAlterado, dataSet) {
                var vlrCotacaoMoeda = dataSet.getFieldValueAsNumberOrZero("VLRMOEDA");
                var precoMoe = dataSet.getFieldValueAsNumberOrZero("PRECOMOE");

                if (vlrCotacaoMoeda > 0) {
                    if ("PRECOMOE" == campoAlterado || campoAlterado == "VLRMOEDA") {
                        var numeroCasasDecimais = MGEParameters.asInteger("mgefin.decimais.calc.moeda") > 0 ? MGEParameters.asInteger("mgefin.decimais.calc.moeda") : 5;
                        var valorReal = precoMoe * vlrCotacaoMoeda;

                        if (numeroCasasDecimais != 0) {
                            valorReal = NumberUtils.round(valorReal, numeroCasasDecimais);
                        }

                        dataSet.setFieldValue("PRECO", valorReal);

                    } else if ("VLRDESCMOE" == campoAlterado) {
                        dataSet.setFieldValue("VLRDESC", dataSet.getFieldValueAsNumberOrZero("VLRDESCMOE") * vlrCotacaoMoeda);

                    } else if ("PERCDESC" == campoAlterado) {
                        var percDesc = dataSet.getFieldValueAsNumberOrZero("PERCDESC");

                        if (percDesc != 0) {
                            var vlrDescMoe = (percDesc * precoMoe) / 100;

                            dataSet.setFieldValue("VLRDESC", vlrDescMoe * vlrCotacaoMoeda);
                            dataSet.setFieldValue("VLRDESCMOE", vlrDescMoe);
                        }
                    }
                }
            }

            function calculaTotalItemCotacaoByItem(item) {
                if (item != null) {
                    var qtdCotada = item["QTDCOTADA"] != null ? item["QTDCOTADA"] : 0;
                    var preco = item["PRECO"] != null ? item["PRECO"] : 0;
                    var ipi = item["IPI"] != null ? item["IPI"] : 0;
                    var vlrAcresc = item["VLRACRESC"] != null ? item["VLRACRESC"] : 0;
                    var vlrDesc = item["VLRDESC"] != null ? item["VLRDESC"] : 0;
                    var frete = item["FRETE"] != null ? item["FRETE"] : 0;
                    var outros = item["OUTROS"] != null ? item["OUTROS"] : 0;
                    var vlrSubst = item["VLRSUBST"] != null ? item["VLRSUBST"] : 0;
                    var result = (preco + vlrAcresc - vlrDesc + ipi + frete + outros) * qtdCotada + vlrSubst;

                    return result;
                }

                return 0;
            }

            function getEnvironmentCriteriaMoeda(codParc) {

                if (codParc == 0) {
                    return Criteria("this.CODMOEDA = -1");
                } else {
                    return Criteria("this.CODMOEDA IN (SELECT DISTINCT(OPC.CODMOEDA) FROM TGFMOPC OPC WHERE OPC.CODPARC = " + codParc + "UNION ALL SELECT DISTINCT(MOE.CODMOEDA) FROM TSIMOE MOE WHERE MOE.CODMOEDA = 0)");
                }
            }
            
            function getEnvironmentCriteriaContato(codParc) {
                return Criteria("this.CODPARC = "+codParc);
            }
            
            function objectToXML(obj, elementName) {
                var object = {};
                object[elementName] = {};
            }

            function addElements(element, record) {

                for (var item in record) {

                    if (item == "CONTROLE") {
                        var controle = getObjectValue(record[item]);

                        if (angular.isObject(controle)) {
                            if (Object.keys(controle).length > 0) {
                                element[item] = { $: controle };
                            } else {
                                element[item] = { $: " " };
                            }
                        } else if (controle) {
                            element[item] = { $: controle };
                        }



                    } else {
                        var value = getObjectValue(record[item]);

                        if (angular.isDate(value)) {
                            value = DateUtils.formatDate(value)
                        }

                        if (angular.isObject(value)) {
                            if (Object.keys(value).length > 0) {
                                element[item] = { $: value };
                            }
                        } else if (value) {
                            element[item] = { $: value };
                        } else if (angular.isNumber(value)) {
                            element[item] = { $: value };
                        }


                    }

                }
            }
        }
    ]);
