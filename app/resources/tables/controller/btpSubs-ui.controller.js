/* eslint-disable no-undef */
/*eslint-env es6 */
"use strict";
sap.ui.define([
    "sap/hanacli/tables/controller/App.controller"
], function (AppController) {

    /**
     * BTP Subscriptions UI Controller
     * Initializes the BTP subscriptions table view
     */
    return AppController.extend("sap.hanacli.tables.controller.btpSubs-ui", {
        /**
         * Controller initialization
         */
        onInit: function () {
            this.onAppInit();
        }
    });
});
