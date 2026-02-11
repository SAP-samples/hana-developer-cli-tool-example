/* eslint-disable no-undef */
/*eslint-env es6 */
"use strict";
sap.ui.define([
    "sap/hanacli/tables/controller/App.controller"
], function (AppController) {

    /**
     * Containers UI Controller
     * Initializes the containers table view
     */
    return AppController.extend("sap.hanacli.tables.controller.containers-ui", {
        /**
         * Controller initialization
         */
        onInit: function () {
            this.onAppInit();
        }
    });
});