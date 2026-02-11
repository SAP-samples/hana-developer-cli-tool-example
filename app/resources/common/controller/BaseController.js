/*global history */
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/core/Fragment",
    "sap/ui/core/syncStyleClass",
    "sap/ui/core/Item",
    "sap/m/MessageBox",
    "sap/m/library"
], function (Controller, History, Fragment, syncStyleClass, Item, MessageBox, mobileLibrary) {
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
                this.getRouter().navTo("master", {}, true);
            }
        },

        updatePrompts: async function () {
            try {
                const model = this.getModel("promptsModel");
                if (!model) {
                    return;
                }
                const promptsData = model.getData();
                const aUrl = "/";

                await new Promise((resolve, reject) => {
                    jQuery.ajax({
                        url: aUrl,
                        contentType: 'application/json',
                        method: "PUT",
                        data: JSON.stringify(promptsData),
                        dataType: "json",
                        success: resolve,
                        error: reject
                    });
                });
            } catch (error) {
                this.onErrorCall(error);
            }
        },

        getPrompts: async function () {
            try {
                const model = this.getModel("promptsModel");
                if (!model) {
                    return;
                }
                const aUrl = "/";

                const response = await new Promise((resolve, reject) => {
                    jQuery.ajax({
                        url: aUrl,
                        method: "GET",
                        dataType: "json",
                        success: resolve,
                        error: reject
                    });
                });
                model.setData(response);
            } catch (error) {
                this.onErrorCall(error);
            }
        },

        getHanaStatus: async function () {
            try {
                const oHanaModel = this.getModel("hanaModel");
                if (!oHanaModel) {
                    return;
                }
                const aHanaUrl = "/hana";

                const response = await new Promise((resolve, reject) => {
                    jQuery.ajax({
                        url: aHanaUrl,
                        method: "GET",
                        dataType: "json",
                        success: resolve,
                        error: reject
                    });
                });
                oHanaModel.setData(response);
            } catch (error) {
                this.onErrorCall(error);
            }
        },

        refreshConnection: async function () {
            try {
                await this.updatePrompts();
                await this.getPrompts();
                await this.getHanaStatus();
            } catch (error) {
                this.onErrorCall(error);
            }
        },

        openUrl: function (url, newTab) {
            // Open the URL in a new window or tab (same as _blank):
            mobileLibrary.URLHelper.redirect(url, newTab);
        },

        onSchemaLiveChange: function () {
            const model = this.getModel("promptsModel");
            if (model) {
                model.refresh();
            }
        },


        loadSchemaFilter: async function () {
            try {
                await this.updatePrompts();
                const aUrl = "/hana/schemas/";
                
                const myJSON = await new Promise((resolve, reject) => {
                    jQuery.ajax({
                        url: aUrl,
                        method: "GET",
                        dataType: "json",
                        success: resolve,
                        error: reject
                    });
                });
                this.onLoadSchemaFilter(myJSON);
            } catch (error) {
                this.onErrorCall(error);
            }
        },

        onLoadSchemaFilter: function (myJSON) {
            const oSearchControl = this.getView().byId("Schema");
            if (!oSearchControl) {
                return;
            }
            
            oSearchControl.destroySuggestionItems();
            //**CURRENT_SCHEMA**
            oSearchControl.addSuggestionItem(new Item({
                text: '**CURRENT_SCHEMA**'
            }));
            for (let i = 0; i < myJSON.length; i++) {
                oSearchControl.addSuggestionItem(new Item({
                    text: myJSON[i].SCHEMA_NAME
                }));
            }
        },

        loadTableFilter: async function () {
            try {
                await this.updatePrompts();
                const aUrl = "/hana/tables/";
                
                const myJSON = await new Promise((resolve, reject) => {
                    jQuery.ajax({
                        url: aUrl,
                        method: "GET",
                        dataType: "json",
                        success: resolve,
                        error: reject
                    });
                });
                this.onLoadTableFilter(myJSON);
            } catch (error) {
                this.onErrorCall(error);
            }
        },

        onLoadTableFilter: function (myJSON) {
            const oSearchControl = this.getView().byId("Table");
            if (!oSearchControl) {
                return;
            }
            
            oSearchControl.destroySuggestionItems();
            for (let i = 0; i < myJSON.length; i++) {
                oSearchControl.addSuggestionItem(new Item({
                    text: myJSON[i].TABLE_NAME
                }));
            }
        },

        loadViewFilter: async function () {
            try {
                await this.updatePrompts();
                const aUrl = "/hana/views/";
                
                const myJSON = await new Promise((resolve, reject) => {
                    jQuery.ajax({
                        url: aUrl,
                        method: "GET",
                        dataType: "json",
                        success: resolve,
                        error: reject
                    });
                });
                this.onLoadViewFilter(myJSON);
            } catch (error) {
                this.onErrorCall(error);
            }
        },

        onLoadViewFilter: function (myJSON) {
            const oSearchControl = this.getView().byId("View");
            if (!oSearchControl) {
                return;
            }
            
            oSearchControl.destroySuggestionItems();
            for (let i = 0; i < myJSON.length; i++) {
                oSearchControl.addSuggestionItem(new Item({
                    text: myJSON[i].VIEW_NAME
                }));
            }
        },

        loadFunctionFilter: async function () {
            try {
                await this.updatePrompts();
                const aUrl = "/hana/functions/";
                
                const myJSON = await new Promise((resolve, reject) => {
                    jQuery.ajax({
                        url: aUrl,
                        method: "GET",
                        dataType: "json",
                        success: resolve,
                        error: reject
                    });
                });
                this.onLoadFunctionFilter(myJSON);
            } catch (error) {
                this.onErrorCall(error);
            }
        },

        onLoadFunctionFilter: function (myJSON) {
            const oSearchControl = this.getView().byId("Function");
            if (!oSearchControl) {
                return;
            }
            
            oSearchControl.destroySuggestionItems();
            for (let i = 0; i < myJSON.length; i++) {
                oSearchControl.addSuggestionItem(new Item({
                    text: myJSON[i].FUNCTION_NAME
                }));
            }
        },

        setFilterAsContains: function (controlId) {
            const control = this.byId(controlId);
            if (control) {
                control.setFilterFunction(function (sTerm, oItem) {
                    // A case-insensitive "string contains" style filter
                    if (sTerm === "*") {
                        return oItem.getText();
                    } else {
                        try {
                            // Escape special regex characters from user input
                            const escapedTerm = sTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                            return oItem.getText().match(new RegExp(escapedTerm, "i"));
                        } catch (e) {
                            return false;
                        }
                    }
                });
            }
        },

        startBusy: function () {
            if (!this._pBusyDialog) {
                this._pBusyDialog = Fragment.load({
                    name: "sap.hanacli.common.view.BusyDialog",
                    controller: this
                }).then(function (oBusyDialog) {
                    this.getView().addDependent(oBusyDialog);
                    syncStyleClass("sapUiSizeCompact", this.getView(), oBusyDialog);
                    return oBusyDialog;
                }.bind(this));
            }

            this._pBusyDialog.then(function (oBusyDialog) {
                oBusyDialog.open();
            }.bind(this));
        },
        
        endBusy: function () {
            if (this._pBusyDialog) {
                this._pBusyDialog.then(function (oBusyDialog) {
                    oBusyDialog.close();
                });
            }
        },

        onErrorCall: function (oError) {
            this.endBusy();
            
            console.error(oError);
            
            let errorMessage = "";
            const statusCode = oError.statusCode || oError.status;
            
            if (statusCode === 500 || statusCode === 400) {
                const errorRes = oError.responseText;
                
                // Try to parse JSON error response
                try {
                    const errorJson = JSON.parse(errorRes);
                    // Extract message from JSON if available
                    if (errorJson.message) {
                        errorMessage = errorJson.message;
                    } else if (errorJson.error) {
                        // Handle nested error object
                        errorMessage = typeof errorJson.error === 'string' 
                            ? errorJson.error 
                            : errorJson.error.message || JSON.stringify(errorJson.error);
                    } else {
                        // If no standard message field, display formatted JSON
                        errorMessage = errorRes;
                    }
                } catch (e) {
                    // If not JSON, use the raw response text
                    errorMessage = errorRes || "An error occurred";
                }
            } else {
                errorMessage = oError.statusText || oError.message || "An error occurred";
            }
            
            MessageBox.alert(errorMessage);
        },
        
        onExit: function () {
            // Clean up resources
            if (this._pBusyDialog) {
                this._pBusyDialog.then(function (oBusyDialog) {
                    oBusyDialog.destroy();
                });
                this._pBusyDialog = null;
            }
            this.updatePrompts();
        }

    });
});