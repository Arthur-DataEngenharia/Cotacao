/**
 * Created by Handz (Eduardo,Charles) on 13/12/2019.
 */

angular
    .module('RotinaCotacaoApp')
    .controller('ListProdutosTransfController', ['$scope', 'data', 'i18n', 'SkApplicationInstance',
        function ($scope, data, i18n, SkApplicationInstance) {
            var self = this;

            self.resourceIDGrade = SkApplicationInstance.getResourceID() + ".popupProdutos.gradeProdutos";

            self.codParc = data.codParc;
            self.nomeParc = data.nomeParc;
            self.indexLinha = data.indexLinha;
            self.produtoList = data.produtoList;

            self.dsProdutos;


            self.createDataSet = createDataSet;

            function atualizaTelaPopup() {
                self.nomeParceiro = self.codParc + " - " + self.nomeParc;
                	
                self.dsProdutos.clearDataSet();
                self.dsProdutos.addRecordsAsObjects(self.produtoList);
                self.dsProdutos.gotoRow(0);

                self.labelNomeParceiro = i18n("cot_labelNomeParceiroVisualizacao");                				
            }


            function createDataSet(ds) {
                self.dsProdutos = ds;
                self.dsProdutos.init().then(function () {
                    atualizaTelaPopup();
                })
            }

        }
    ]);