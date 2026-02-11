/* eslint-disable no-undef */
/*eslint-env es6 */
"use strict";
sap.ui.define([
    "sap/hanacli/tables/controller/App.controller"
], function (AppController) {

    /**
     * Tables UI Controller
     * Initializes the tables table view with schema and table filters
     */
    return AppController.extend("sap.hanacli.tables.controller.tables-ui", {
        /**
         * Controller initialization
         * Sets up filters for Schema and Table columns
         */
        onInit: function () {
            this.onAppInit();
            this.setFilterAsContains("Schema");
            this.setFilterAsContains("Table");
        }
    });
});