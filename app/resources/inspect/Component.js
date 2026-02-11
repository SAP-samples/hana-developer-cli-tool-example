/* eslint-disable no-undef */
/*eslint-env es6 */
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
            // create root view
            var oView = sap.ui.view({
                id: "App",
                viewName: `sap.hanacli.inspect.view.${this.getModel("config").getProperty("/cmd")}`,
                type: "XML",
                async: true,
                viewData: {
                    component: this
                }
            });

            return oView;
        },

        init: function () {
            let model = this.getModel("config");
            let cmd = UriParameters.fromQuery(window.location.search).get("cmd");
            let tbl = UriParameters.fromQuery(window.location.search).get("tbl");
            let viewInput = UriParameters.fromQuery(window.location.search).get("viewInput");

            if (!cmd) {
                cmd = window.location.hash.substr(1);
            }
            model.setData({ cmd: cmd, tbl: tbl, viewInput: viewInput });
            this.superInit();
        }
    });
});
