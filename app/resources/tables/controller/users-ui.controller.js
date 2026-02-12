/* eslint-disable no-undef */
/*eslint-env es6 */
"use strict";
sap.ui.define([
    "sap/hanacli/tables/controller/App.controller"
], function (AppController) {

    /**
     * Users UI Controller
     * Initializes the users table view
     */
    return AppController.extend("sap.hanacli.tables.controller.users-ui", {
        /**
         * Controller initialization
         */
        onInit: function () {
            this.onAppInit();
            this.setFilterAsContains("User");
        }
    });
});
