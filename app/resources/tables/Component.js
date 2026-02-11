/* eslint-disable no-undef */
/*eslint-env es6 */
sap.ui.define([
    "sap/hanacli/common/Component",
    "sap/base/util/UriParameters"
], function (UIComponent, UriParameters) {
    "use strict";

    /**
     * Tables Component
     * Main component for the tables application
     * Initializes configuration and creates view based on command parameter
     */
    return UIComponent.extend("sap.hanacli.tables.Component", {

        metadata: {
            manifest: "json"
        },

        /**
         * Creates the root view for the application
         * @returns {sap.ui.core.mvc.View} The root view
         */
        createContent: function () {
            const oView = sap.ui.view({
                id: "App",
                viewName: `sap.hanacli.tables.view.${this.getModel("config").getProperty("/cmd")}`,
                type: "XML",
                async: true,
                viewData: {
                    component: this
                }
            });
            return oView;
        },

        /**
         * Component initialization
         * Retrieves command from URI parameters or hash and sets model data
         */
        init: function () {
            const model = this.getModel("config");
            let cmd = UriParameters.fromQuery(window.location.search).get("cmd");
            if (!cmd) {
                cmd = window.location.hash.substr(1);
            }
            model.setData({ cmd: cmd });
            this.superInit();
        }

    });
});