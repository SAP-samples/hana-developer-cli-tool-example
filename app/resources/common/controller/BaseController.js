/*global history */
/* eslint-disable no-undef */
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History"
], function (Controller, History) {
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
            oHanaModel.setData(JSON.parse(
                jQuery.ajax({
                    url: aHanaUrl,
                    method: "GET",
                    dataType: "json",
                    async: false
                }).responseText))
        },

        onErrorCall: function (oError) {
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