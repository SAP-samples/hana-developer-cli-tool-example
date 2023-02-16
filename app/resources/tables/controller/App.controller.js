/* eslint-disable no-undef */
/*eslint-env es6 */
"use strict";
sap.ui.define([
    "sap/hanacli/common/controller/BaseController",
    "sap/m/Text",
    "sap/m/Link",
    "sap/ui/table/Column"
],
    function (BaseController, Text, Link, Column) {

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
                    let cmd = this.getModel("config").getProperty("/cmd")
                    let aUrl = `/hana/${cmd}/`

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
                                if(cmd === 'tables-ui' && sColumnId === 'TABLE_NAME'){
                                    template = new Link({ "text": { path: "resultsModel>" + sColumnId }, "target": "_blank", "href": { path: "resultsModel>" + sColumnId, formatter: function(value){return `/ui/?tbl=${value}#inspectTable-ui`}  }})
                                }
                                if(cmd === 'views-ui' && sColumnId === 'VIEW_NAME'){
                                    template = new Link({ "text": { path: "resultsModel>" + sColumnId }, "target": "_blank", "href": { path: "resultsModel>" + sColumnId, formatter: function(value){return `/ui/?viewInput=${value}#inspectView-ui`}  }})
                                }
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