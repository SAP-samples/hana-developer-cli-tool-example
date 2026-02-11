/* eslint-disable no-undef */
/*eslint-env es6 */
"use strict";
sap.ui.define([
    "sap/hanacli/common/controller/BaseController",
    "sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {

    const I18N_KEYS = {
        ERROR_HTTP: "error.httpError",
        ERROR_FETCH: "error.fetchError"
    };

    /**
     * BTP Info UI Controller
     * Displays BTP configuration information
     */
    return BaseController.extend("sap.hanacli.tables.controller.btpInfo-ui", {
        /**
         * Controller initialization
         * Fetches BTP configuration data
         */
        onInit: function () {
            this.getBTPInfo();
        },

        /**
         * Fetches BTP configuration information
         */
        getBTPInfo: async function () {
            try {
                const btpModel = new JSONModel();
                this.getView().setModel(btpModel, "btpModel");

                this.startBusy();
                const aUrl = "/hana/btpInfo";
                const resourceBundle = this.getResourceBundle();

                const response = await fetch(aUrl);
                const result = await response.json();

                if (!response.ok) {
                    const errorMsg = result.message || resourceBundle.getText(I18N_KEYS.ERROR_HTTP, [response.status]);
                    throw new Error(errorMsg);
                }

                btpModel.setData(result);
                this.endBusy();
            } catch (error) {
                this.onErrorCall(error);
                this.endBusy();
            }
        },

        /**
         * Refresh BTP configuration data
         */
        refreshBTPInfo: function () {
            this.getBTPInfo();
        },

        /**
         * Navigate to BTP Target Selection UI
         */
        navigateToBtpTarget: function () {
            window.location.hash = "btp-ui";
        }
    });
});
