/* eslint-disable no-undef */
/*eslint-env es6 */
"use strict";
sap.ui.define([
    "sap/hanacli/tables/controller/App.controller"
],
    function (AppController) {

        return AppController.extend("sap.hanacli.tables.controller.views-ui", {

            onInit: function () {

                this.onAppInit()                
                this.setFilterAsContains("Schema")
                this.setFilterAsContains("ViewViews")

            },

            onLoadViewFilter: function (myJSON, oController) {
                let oSearchControl = oController.getView().byId("ViewViews")
                oSearchControl.destroySuggestionItems()
                for (let i = 0; i < myJSON.length; i++) {
                    oSearchControl.addSuggestionItem(new sap.ui.core.Item({
                        text: myJSON[i].VIEW_NAME
                    }))
                }
            },

        })
    }
)