/* eslint-disable no-undef */
/*eslint-env es6 */
"use strict";
sap.ui.define([
    "sap/hanacli/tables/controller/App.controller"
], function (AppController) {

    /**
     * Functions UI Controller
     * Initializes the functions table view with schema and function filters
     */
    return AppController.extend("sap.hanacli.tables.controller.functions-ui", {
        /**
         * Controller initialization
         * Sets up filters for Schema and Function columns
         */
        onInit: function () {
            this.onAppInit();
            this.setFilterAsContains("Schema");
            this.setFilterAsContains("Function");
        }
    });
});