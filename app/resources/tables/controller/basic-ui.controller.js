/* eslint-disable no-undef */
/*eslint-env es6 */
"use strict";
sap.ui.define([
    "sap/hanacli/tables/controller/App.controller"
], function (AppController) {

    /**
     * Basic UI Controller for table views
     * Initializes the app and sets up schema filtering
     */
    return AppController.extend("sap.hanacli.tables.controller.basic-ui", {
        /**
         * Controller initialization
         * Sets up the filter for Schema column
         */
        onInit: function () {
            this.onAppInit();
            this.setFilterAsContains("Schema");
        }
    });
});