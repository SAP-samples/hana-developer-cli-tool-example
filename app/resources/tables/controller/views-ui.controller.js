/* eslint-disable no-undef */
/*eslint-env es6 */
"use strict";
sap.ui.define([
    "sap/hanacli/tables/controller/App.controller"
], function (AppController) {

    /**
     * Views UI Controller
     * Initializes the views table view with schema and view filters
     */
    return AppController.extend("sap.hanacli.tables.controller.views-ui", {
        /**
         * Controller initialization
         * Sets up filters for Schema and View columns
         */
        onInit: function () {
            this.onAppInit();
            this.setFilterAsContains("Schema");
            this.setFilterAsContains("ViewViews");
        },

        /**
         * Loads and populates view filter suggestions
         * @param {Array} myJSON - Array of view objects
         * @param {Object} oController - The controller instance
         */
        onLoadViewFilter: function (myJSON, oController) {
            const oSearchControl = oController.getView().byId("ViewViews");
            oSearchControl.destroySuggestionItems();
            for (let i = 0; i < myJSON.length; i++) {
                oSearchControl.addSuggestionItem(new sap.ui.core.Item({
                    text: myJSON[i].VIEW_NAME
                }));
            }
        }
    });
});