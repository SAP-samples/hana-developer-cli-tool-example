/* eslint-disable no-undef */
/*eslint-env es6 */
"use strict";
sap.ui.define([
    "sap/hanacli/massConvert/controller/BaseController"
],
    function (BaseController) {

        return BaseController.extend("sap.hanacli.massConvert.controller.App", {
            onInit: function () {
                let model = this.getModel("promptsModel")
                this.getView().setModel(model)
            },

            openUrl: function (url, newTab) {
                // Require the URLHelper and open the URL in a new window or tab (same as _blank):
                sap.ui.require(["sap/m/library"], ({ URLHelper }) => URLHelper.redirect(url, newTab));
            },

            onSchemaLiveChange: function () {
                alert("In Here")
                let model = this.getModel("promptsModel")
                model.refresh()
            },

            handlePopoverPress: function (oEvent) {
                let oPopover = oEvent.getSource()
                if (oPopover.getCustomIcon()) {
                    oPopover.setCustomIcon(null)
                }
            },

            refreshConnection: function () {
                this.updatePrompts()
                this.getPrompts()
                this.getHanaStatus()
            }

        })
    }
)