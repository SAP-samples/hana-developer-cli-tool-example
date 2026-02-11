sap.ui.define([
    "sap/hanacli/common/Component"
], function (UIComponent) {
    "use strict";

    return UIComponent.extend("sap.hanacli.massConvert.Component", {

        metadata: {
            manifest: "json"
        },

        init: function () {
            this.superInit();
            this.initializeLogModel();
        },

        initializeLogModel: function () {
            const logModel = this.getModel("logModel");

            if (!logModel) {
                console.error("Log model not found in Component initialization");
                return;
            }

            logModel.setData({
                log: "",
                message: "",
                progress: 0
            });
        }
    });
});