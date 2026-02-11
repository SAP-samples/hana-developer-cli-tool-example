sap.ui.define([
    "sap/hanacli/common/Component",
    "sap/base/util/UriParameters"
], function (UIComponent, UriParameters) {
    "use strict";

    return UIComponent.extend("sap.hanacli.inspect.Component", {

        metadata: {
            manifest: "json"
        },

        createContent: function () {
            const configModel = this.getModel("config");
            const cmd = configModel?.getProperty("/cmd");

            if (!cmd) {
                console.error("Command not configured in Component initialization");
                return null;
            }

            const view = sap.ui.view({
                id: "App",
                viewName: `sap.hanacli.inspect.view.${cmd}`,
                type: "XML",
                async: true,
                viewData: {
                    component: this
                }
            });

            return view;
        },

        init: function () {
            const configModel = this.getModel("config");
            const uriParams = UriParameters.fromQuery(window.location.search);

            // Get command from query parameters or URL hash
            let cmd = uriParams.get("cmd") || this.getCommandFromHash();
            const tbl = uriParams.get("tbl");
            const viewInput = uriParams.get("viewInput");

            if (!cmd) {
                console.error("No command provided via query parameters or URL hash");
            }

            configModel.setData({
                cmd: cmd,
                tbl: tbl,
                viewInput: viewInput
            });

            this.superInit();
        },

        getCommandFromHash: function () {
            const hash = window.location.hash;
            // Remove leading '#' from hash
            return hash ? hash.substring(1) : null;
        }
    });
});