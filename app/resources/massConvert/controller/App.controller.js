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

                this.setFilterAsContains("Schema")
                this.setFilterAsContains("Table")

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

                this.refreshConnection().then(() => {
                    let oModel = this.getOwnerComponent().getModel("logModel")
                    oModel.setData({
                        log: "",
                        progress: 0
                    }, true)
                    connection.send(JSON.stringify({
                        action: "massConvert"
                    }))
                })
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
            }


        })
    }
)