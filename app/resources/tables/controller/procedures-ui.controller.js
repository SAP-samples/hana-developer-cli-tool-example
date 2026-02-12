/* eslint-disable no-undef */
/*eslint-env es6 */
"use strict";
sap.ui.define([
    "sap/hanacli/tables/controller/App.controller"
], function (AppController) {

    /**
     * Procedures UI Controller
     * Initializes the procedures table view with schema and procedure filters
     */
    return AppController.extend("sap.hanacli.tables.controller.procedures-ui", {
        /**
         * Controller initialization
         * Sets up filters for Schema and Procedure columns
         */
        onInit: function () {
            this.onAppInit();
            this.setFilterAsContains("Schema");
            this.setFilterAsContains("Procedure");
        }
    });
});
