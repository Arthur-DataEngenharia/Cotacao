angular
    .module('PesoCadastroApp', ['snk'])
    .controller('PesoCadastroController', ['TooltipBuilder', 'DomUtil', '$document', 'StringUtils', 'AngularUtil', 'SkComponentRegistry', 'ServiceProxy', '$q', 'ObjectUtils', 'MessageUtils', 'i18n', 'SanPopup', 'MGEParameters', 'SkApplicationInstance', 'SASUtil', 'Criteria',
        function (TooltipBuilder, $document, DomUtil, StringUtils, AngularUtil, SkComponentRegistry, ServiceProxy, $q, ObjectUtils, MessageUtils, i18n, SanPopup, MGEParameters, SkApplicationInstance, SASUtil, Criteria) {
            var self = this;

            var _camposPeso = ["PESOCONFIABFORN",
                "PESOGARANTIA",
                "PESOPRAZOENTREG",
                "PESOPRAZOMED",
                "PESOPRECO",
                "PESOQUALATEND",
                "PESOQUALPROD",
                "PESOTAXAJURO"];

            ObjectUtils.implements(self, IDynaformInterceptor);
            ObjectUtils.implements(self, IFormInterceptor);
            ObjectUtils.implements(self, IDatagridInterceptor);

            self.onDynaformLoaded = onDynaformLoaded;
            self.interceptBuildField = interceptBuildField;
            self.interceptColumnMetadata = interceptColumnMetadata;

            function onDynaformLoaded(dynaform, dataset) {
                dynaform.goToGridView();

                dataset.getFieldsMetadata().forEach(function (field) {
                    //Em modo formulario tira a aba 'Geral'
                    field.properties.push({ name: "UITabName", value: "__main" });
                    field.tabId = "__main";
                    field.tabName = "__main";

                    if ("CODUSU" == field.id || "DTALTER" == field.id) {
                        field.visible = false;
                    }
                });

                dataset.initAndRefresh();
            }

            function interceptColumnMetadata(fieldMetadata, dataset) {
                if (dataset.getEntityName() == 'PesoCriterioCotacao') {
                    if (_camposPeso.indexOf(fieldMetadata.id) > -1) {
                        fieldMetadata.readOnly = true;
                    }
                }
            }

            function interceptBuildField(fieldName, dataset, fieldProp, scope) {
                if (dataset.getEntityName() == 'PesoCriterioCotacao') {
                    if (_camposPeso.indexOf(fieldName) > -1) {
                        fieldProp['sk-min-value'] = 0;
                        fieldProp['sk-max-value'] = 10;

                        return AngularUtil.createDirective('sk-numeric-stepper', fieldProp, scope);
                    } else if ("CODPPC" == fieldName) {
                        fieldProp['sk-entity-name'] = "PesoCriterioCotacao";

                        return AngularUtil.createDirective('sk-pesquisa-input', fieldProp, scope);
                    }
                }
            }
        }]);
