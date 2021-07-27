/* eslint-disable no-undef */
/*eslint-env es6 */
"use strict";
sap.ui.define([
    "sap/hanacli/common/controller/BaseController",
    "sap/m/Text",
    "sap/ui/table/Column"
],
    function (BaseController, Text, Column) {

        return BaseController.extend("sap.hanacli.tables.controller.App", {

            onAppInit: function () {

                this.getHanaStatus()
                this.getPrompts()
                let model = this.getModel("promptsModel")
                this.getView().setModel(model)

            },

            downloadExcel: function () {
                //Excel Download
                window.open("/excel")
                return
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

                                return new Column({
                                    id: sColumnId,
                                    label: sColumnId,
                                    template: new Text({ "text": { path: "resultsModel>" + sColumnId } }),
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