/**
 * Created by Handz (Eduardo,Charles) on 13/12/2019.
 */

angular
    .module('RotinaCotacaoApp')
    .controller('PopUpAvaliableFieldsController', ['data','ObjectUtils',
        function (data, ObjectUtils) {
            var self = this;

            self.onKeydown = onKeydown;
            self.dpAvailableFields = data.dpAvailableFields;
            self.dpCamposDisponiveis = data.dpCamposDisponiveis;
            self.moveFields = data.moveFields;
            self.addToForm = addToForm;
            self.itemSelectedList;
            self.onChangeDraggableItemList = onChangeDraggableItemList;
            self.doDragDrop = doDragDrop;
            self.filterList = filterList;
            self.txtSearchField;
            self.dpAvailableFieldsBackUp = null;
            self.typePopUp = data.typePopUp;
            self.labelBtn = "";

            init();


            function init() {
            	if(self.typePopUp == "CpGrid" || self.typePopUp == "tpNeg"){
            		self.labelBtn = "Adicionar Grade";
            	} else if(self.typePopUp == "CpForm") {
            		self.labelBtn = "Adicionar Form.";
            	} else {
            		self.labelBtn = "Adicionar";
            	}
                if (self.dpAvailableFields && self.dpAvailableFields.length > 0 && self.dpAvailableFieldsBackUp == null) {
                    self.dpAvailableFieldsBackUp = Array.from(self.dpAvailableFields);
                }
            }

            function addToForm() {

                self.itemSelectedList.forEach(function (itemSelecionado) {
                    var indexSelecionado = self.dpAvailableFieldsBackUp.findIndex(x => x.descricao === itemSelecionado.descricao);

                    if (indexSelecionado > -1) {
                        self.dpAvailableFieldsBackUp.splice(indexSelecionado, 1);
                    }
                });

                self.moveFields(self.dpCamposDisponiveis, self.dpAvailableFields, self.itemSelectedList);
            }

            function onKeydown($event) {
                filterList(self.txtSearchField);
            }

            function filterList(search) {

                if (search && search.length > 0) {
                    var listaFiltrada = [];

                    self.dpAvailableFields.forEach(function (item) {
                        var descricaoItem = item.descricao.toLowerCase();

                        if (descricaoItem.indexOf(search.toLowerCase()) >= 0) {
                            listaFiltrada.push(item);
                        }
                    });

                    self.dpAvailableFields = Array.from(listaFiltrada);

                } else {
                    self.dpAvailableFields = Array.from(self.dpAvailableFieldsBackUp);
                }

            }

            function onChangeDraggableItemList(item, positionToInsert) {
                
            }

            function doDragDrop(event) {
                event.preventDefault();               
            }


        }
    ]);