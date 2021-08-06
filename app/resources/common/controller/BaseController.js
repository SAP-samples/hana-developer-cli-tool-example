/*global history */
/* eslint-disable no-undef */
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/core/Fragment",
    "sap/ui/core/syncStyleClass",
], function (Controller, History, Fragment, syncStyleClass) {
    "use strict";

    return Controller.extend("sap.hanacli.common.controller.BaseController", {
        /**
         * Convenience method for accessing the router in every controller of the application.
         * @public
         * @returns {sap.ui.core.routing.Router} the router for this component
         */
        getRouter: function () {
            return this.getOwnerComponent().getRouter();
        },

        /**
         * Convenience method for getting the view model by name in every controller of the application.
         * @public
         * @param {string} sName the model name
         * @returns {sap.ui.model.Model} the model instance
         */
        getModel: function (sName) {
            return this.getView().getModel(sName);
        },

        /**
         * Convenience method for setting the view model in every controller of the application.
         * @public
         * @param {sap.ui.model.Model} oModel the model instance
         * @param {string} sName the model name
         * @returns {sap.ui.mvc.View} the view instance
         */
        setModel: function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        /**
         * Convenience method for getting the resource bundle.
         * @public
         * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
         */
        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        /**
         * Event handler for navigating back.
         * It there is a history entry we go one step back in the browser history
         * If not, it will replace the current entry of the browser history with the master route.
         * @public
         */
        onNavBack: function () {
            var sPreviousHash = History.getInstance().getPreviousHash();

            if (sPreviousHash !== undefined) {
                history.go(-1);
            } else {
                this.getRouter().navTo("master", {}, true)
            }
        },

        updatePrompts: function () {
            return new Promise(resolve => {
                let model = this.getModel("promptsModel")
                let promptsData = model.getData()
                let aUrl = "/"

                jQuery.ajax({
                    url: aUrl,
                    contentType: 'application/json',
                    method: "PUT",
                    data: JSON.stringify(promptsData),
                    dataType: "json",
                    processData: false,
                    async: false,
                    error: this.onErrorCall
                })
                resolve()
            })
        },

        getPrompts: function () {

            let model = this.getModel("promptsModel")
            let aUrl = "/"

            model.setData(JSON.parse(
                jQuery.ajax({
                    url: aUrl,
                    method: "GET",
                    dataType: "json",
                    async: false
                }).responseText))
        },

        getHanaStatus: function () {
            let oHanaModel = this.getModel("hanaModel")
            let aHanaUrl = "/hana"
            let oController = this
            oHanaModel.setData(JSON.parse(
                jQuery.ajax({
                    url: aHanaUrl,
                    method: "GET",
                    dataType: "json",
                    async: false,
                    error: function (error) {
                        oController.onErrorCall(error, oController)
                    }
                }).responseText))
        },

        refreshConnection: function () {
            return new Promise(resolve => {
                this.updatePrompts().then(() => {
                    this.getPrompts()
                    this.getHanaStatus()
                    resolve()
                })
            })
        },

        openUrl: function (url, newTab) {
            // Require the URLHelper and open the URL in a new window or tab (same as _blank):
            sap.ui.require(["sap/m/library"], ({ URLHelper }) => URLHelper.redirect(url, newTab));
        },

        onSchemaLiveChange: function () {
            let model = this.getModel("promptsModel")
            model.refresh()
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
                error: function (error) {
                    oController.onErrorCall(error, oController)
                }
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
                error: function (error) {
                    oController.onErrorCall(error, oController)
                }
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
        },

        loadFunctionFilter: function () {
            this.updatePrompts()
            let oController = this
            let aUrl = "/hana/functions/"
            jQuery.ajax({
                url: aUrl,
                method: "GET",
                dataType: "json",
                success: function (myJSON) {
                    oController.onLoadFunctionFilter(myJSON, oController)
                },
                error: function (error) {
                    oController.onErrorCall(error, oController)
                }
            })

        },

        onLoadFunctionFilter: function (myJSON, oController) {

            let oSearchControl = oController.getView().byId("Function")
            oSearchControl.destroySuggestionItems()
            for (let i = 0; i < myJSON.length; i++) {
                oSearchControl.addSuggestionItem(new sap.ui.core.Item({
                    text: myJSON[i].FUNCTION_NAME
                }))
            }
        },

        setFilterAsContains: function (controlId) {
            if (this.byId(controlId)) {
                this.byId(controlId).setFilterFunction(function (sTerm, oItem) {
                    // A case-insensitive "string contains" style filter
                    if (sTerm === "*") {
                        return oItem.getText()
                    } else {
                        return oItem.getText().match(new RegExp(sTerm, "i"))
                    }
                })
            }
        },

        startBusy: function () {
            if (!this._pBusyDialog) {
                this._pBusyDialog = Fragment.load({
                    name: "sap.hanacli.common.view.BusyDialog",
                    controller: this
                }).then(function (oBusyDialog) {
                    this.getView().addDependent(oBusyDialog)
                    syncStyleClass("sapUiSizeCompact", this.getView(), oBusyDialog)
                    return oBusyDialog
                }.bind(this))
            }

            this._pBusyDialog.then(function (oBusyDialog) {
                oBusyDialog.open()
            }.bind(this))
        },
        endBusy: function (oController) {
            if (oController._pBusyDialog) {
                oController._pBusyDialog.then(function (oBusyDialog) {
                    oBusyDialog.close()
                })
            }
        },

        onErrorCall: function (oError, oController) {
            if (oController) {
                oController.endBusy(oController)
            }
            sap.ui.require(["sap/m/MessageBox"], (MessageBox) => {
                console.log(oError)
                if (oError.statusCode === 500 || oError.statusCode === 400 || oError.statusCode === "500" || oError.statusCode === "400" || oError.status === 500) {
                    var errorRes = oError.responseText
                    MessageBox.alert(errorRes)
                    return
                } else {
                    MessageBox.alert(oError.statusText)
                    return
                }
            })
        }

    })

}
)