/* eslint-disable no-undef */
/*eslint-env es6 */
"use strict";
sap.ui.define([
    "sap/hanacli/inspect/controller/App.controller",
    "sap/m/Text",
    "sap/ui/table/Column"
],
    function (AppController, Text, Column) {

        return AppController.extend("sap.hanacli.inspect.controller.querySimple-ui", {

            onInit: function () {
                this.onAppInit()  
                this.initOutputTypes()
            },


            initOutputTypes: function () {
                let oOutput = this.getModel("outputModel")
                oOutput.setData({
                    outputTypes: [{
                        text: this.getResourceBundle().getText("types.table"),
                        key: "table"
                    }, {
                        text: this.getResourceBundle().getText("types.json"), 
                        key: "json"
                    }, {
                        text: this.getResourceBundle().getText("types.excel"), 
                        key: "excel"
                    },
                    {
                        text: this.getResourceBundle().getText("types.csv"), 
                        key: "csv"
                    }]
                })
            },

            executeCmd: async function () {
                this.startBusy()
                this.updatePrompts().then(() => {
                    let aUrl = `/hana/${this.getModel("config").getProperty("/cmd")}/`
                    let oController = this
                    jQuery.ajax({
                        url: aUrl,
                        method: "GET",
                        dataType: "json",
                        success: function (myJSON) {
                            oController.endBusy(oController)
                            let model = oController.getModel("resultsModel")
                            let metaData = []
                            if (myJSON[0]) {
                                for (const key of Object.keys(myJSON[0])) {
                                    metaData.push({ property: key })
                                }
                            }
                            let data = { rows: myJSON, columns: metaData }
                            model.setData(data)

                            let oTable = oController.getView().byId("table")
                            oTable.bindColumns('resultsModel>/columns', function (sId, oContext) {
                                var sColumnId = oContext.getObject().property
                                let template = new Text({ "text": { path: "resultsModel>" + sColumnId } })
                                return new Column({
                                    id: sColumnId,
                                    label: sColumnId,
                                    template: template,
                                    sortProperty: sColumnId,
                                    filterProperty: sColumnId
                                })
                            })
                        },
                        error: function (error) {
                            oController.onErrorCall(error, oController)
                        }
                    })
                })
            }
        })
    }
)