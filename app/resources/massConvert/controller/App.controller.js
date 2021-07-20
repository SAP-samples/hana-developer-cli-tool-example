/* eslint-disable no-undef */
/*eslint-env es6 */
"use strict";
sap.ui.define([
    "sap/hanacli/common/controller/BaseController",
    "sap/ui/core/ws/WebSocket",
    "sap/m/MessageToast"
],
    function (BaseController, WebSocket, MessageToast) {

        var connection = new WebSocket("/websockets")


        return BaseController.extend("sap.hanacli.massConvert.controller.App", {

            onInit: function () {
                var connOpenedMsg = this.getResourceBundle().getText("connection.opened")
                var connErrorMsg = this.getResourceBundle().getText("connection.error")
                var connClosedMsg = this.getResourceBundle().getText("connection.close")

                this.getHanaStatus()
                this.getPrompts()
                this.initOutputTypes()
                let model = this.getModel("promptsModel")
                this.getView().setModel(model)

                
                this.byId("Schema").setFilterFunction(function (sTerm, oItem) {
                    // A case-insensitive "string contains" style filter
                    if (sTerm === "*") {
                        return oItem.getText()
                    } else {
                        return oItem.getText().match(new RegExp(sTerm, "i"))
                    }
                })

                this.byId("Table").setFilterFunction(function (sTerm, oItem) {
                    // A case-insensitive "string contains" style filter
                    if (sTerm === "*") {
                        return oItem.getText()
                    } else {
                        return oItem.getText().match(new RegExp(sTerm, "i"))
                    }
                })

                // webSocket connection opened 
                connection.attachOpen(() => {
                    MessageToast.show(connOpenedMsg)
                })

                // server messages
                connection.attachMessage(function (oControlEvent) {
                    let oModel = this.getModel("logModel")
                    let eventData = oControlEvent.getParameter("data")
                    let result = oModel.getData()

                    let data = jQuery.parseJSON(eventData)
                    let msg = data.text,
                        lastInfo = result.log
                    var progress = result.progress
                    if (data.progress) {
                        progress = data.progress
                    }


                    if (lastInfo.length > 0) {
                        lastInfo += "\r\n"
                    }
                    oModel.setData({
                        log: msg + "\r\n" + lastInfo,
                        progress: progress
                    }, true)
                }, this)

                // error handling
                connection.attachError(() => {
                    MessageToast.show(connErrorMsg)
                })
                // onConnectionClose
                connection.attachClose(() => {
                    MessageToast.show(connClosedMsg)
                })

            },

            onBeginConvert: function () {
                this.refreshConnection()
                let oModel = this.getOwnerComponent().getModel("logModel")
                oModel.setData({
                    log: "",
                    progress: 0
                }, true)
                connection.send(JSON.stringify({
                    action: "massConvert"
                }))
            },

            openUrl: function (url, newTab) {
                // Require the URLHelper and open the URL in a new window or tab (same as _blank):
                sap.ui.require(["sap/m/library"], ({ URLHelper }) => URLHelper.redirect(url, newTab));
            },

            onSchemaLiveChange: function () {
                let model = this.getModel("promptsModel")
                model.refresh()
            },

            refreshConnection: function () {
                this.updatePrompts()
                this.getPrompts()
                this.getHanaStatus()
            },

            initOutputTypes: function () {
                let oOutput = this.getModel("outputModel")
                oOutput.setData({
                    outputTypes: [{
                        text: this.getResourceBundle().getText("types.cds"),//"CAP Core Data Services (.cds)",
                        key: "cds"
                    }, {
                        text: this.getResourceBundle().getText("types.hdbmigrationtable"), //"Migration Tables (.hdbmigrationtable)",
                        key: "hdbmigrationtable"
                    }, {
                        text: this.getResourceBundle().getText("types.hdbtable"), //"Tables (.hdbtable)",
                        key: "hdbtable"
                    }]
                })
            },

            loadSchemaFilter: function () {
                this.updatePrompts()
                let oController = this
                let aUrl = "/hana/schemas/"
                jQuery.ajax({
                    url: aUrl,
                    method: "GET",
                    dataType: "json",
                    success: function (myJSON) {
                        oController.onLoadSchemaFilter(myJSON, oController)
                    },
                    error: this.onErrorCall
                })
            },

            onLoadSchemaFilter: function (myJSON, oController) {


                let oSearchControl = oController.getView().byId("Schema")
                oSearchControl.destroySuggestionItems()
                //**CURRENT_SCHEMA**
                oSearchControl.addSuggestionItem(new sap.ui.core.Item({
                    text: '**CURRENT_SCHEMA**'
                }))
                for (let i = 0; i < myJSON.length; i++) {
                    oSearchControl.addSuggestionItem(new sap.ui.core.Item({
                        text: myJSON[i].SCHEMA_NAME
                    }))
                }
            },

            loadTableFilter: function () {
                this.updatePrompts()
                let oController = this
                let aUrl = "/hana/tables/"
                jQuery.ajax({
                    url: aUrl,
                    method: "GET",
                    dataType: "json",
                    success: function (myJSON) {
                        oController.onLoadTableFilter(myJSON, oController)
                    },
                    error: this.onErrorCall
                })

            },

            onLoadTableFilter: function (myJSON, oController) {

                let oSearchControl = oController.getView().byId("Table")
                oSearchControl.destroySuggestionItems()
                for (let i = 0; i < myJSON.length; i++) {
                    oSearchControl.addSuggestionItem(new sap.ui.core.Item({
                        text: myJSON[i].TABLE_NAME
                    }))
                }
            }

        })
    }
)