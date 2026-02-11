sap.ui.define([
    "sap/hanacli/common/Component"
], function (UIComponent) {
    "use strict";

    return UIComponent.extend("sap.hanacli.systemInfo.Component", {

        metadata: {
            manifest: "json"
        },

        init: function () {
            this.superInit();
        }
    });
});