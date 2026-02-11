/* eslint-disable no-undef */
/*eslint-env es6 */
"use strict";
sap.ui.define([
    "sap/hanacli/inspect/controller/App.controller",
    "sap/m/Text",
    "sap/ui/table/Column"
],
    function (AppController, Text, Column) {

        return AppController.extend("sap.hanacli.inspect.controller.inspectTable-ui", {

            onInit: function () {

                this.onAppInit()                
                this.setFilterAsContains("Schema")
                this.setFilterAsContains("TableInspectTable")
                let tbl = this.getModel("config").getProperty("/tbl")
                if(tbl){
                    this.getModel("promptsModel").setProperty("/table", tbl)
                    //let editor = this.getView().byId("aCodeEditor")
                   // editor.session.setMode("/ace/hanasql1")
                    this.executeCmd()
                }

            },

            onLoadTableFilter: function (myJSON, oController) {
                let oSearchControl = oController.getView().byId("TableInspectTable")
                oSearchControl.destroySuggestionItems()
                for (let i = 0; i < myJSON.length; i++) {
                    oSearchControl.addSuggestionItem(new sap.ui.core.Item({
                        text: myJSON[i].TABLE_NAME
                    }))
                }
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
                            let fieldsMetaData = []
                            if (myJSON.fields[0]) {
                                for (const key of Object.keys(myJSON.fields[0])) {
                                    fieldsMetaData.push({ property: key })
                                }
                            }
                            let constraintsMetaData = []
                            if (myJSON.constraints[0]) {
                                for (const key of Object.keys(myJSON.constraints[0])) {
                                    constraintsMetaData.push({ property: key })
                                }
                            }

                            let data = { rows: myJSON, fieldsColumns: fieldsMetaData, constraintsColumns: constraintsMetaData}
                            model.setData(data)

                            let oTable = oController.getView().byId("fieldsTableInspectTable")

                            oTable.bindColumns('resultsModel>/fieldsColumns', function (sId, oContext) {
                                var sColumnId = oContext.getObject().property

                                return new Column({
                                    //id: sColumnId,
                                    label: sColumnId,
                                    template: new Text({ "text": { path: "resultsModel>" + sColumnId } }),
                                    sortProperty: sColumnId,
                                    filterProperty: sColumnId
                                })
                            })

                            let oTable2 = oController.getView().byId("constraintsTableInspectTable")

                            oTable2.bindColumns('resultsModel>/constraintsColumns', function (sId, oContext) {
                                var sColumnId = oContext.getObject().property

                                return new Column({
                                    //id: sColumnId,
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