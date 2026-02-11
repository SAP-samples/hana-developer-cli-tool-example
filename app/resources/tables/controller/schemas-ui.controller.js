/* eslint-disable no-undef */
/*eslint-env es6 */
"use strict";
sap.ui.define([
    "sap/hanacli/tables/controller/App.controller"
], function (AppController) {

    /**
     * Schemas UI Controller
     * Initializes the schemas table view
     */
    return AppController.extend("sap.hanacli.tables.controller.schemas-ui", {
        /**
         * Controller initialization
         * Sets up filter for Schema column
         */
        onInit: function () {
            this.onAppInit();
            this.setFilterAsContains("Schema");
        }
    });
});