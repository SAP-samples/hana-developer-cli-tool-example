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
                const i18nModel = this.getModel("i18n");
                const resourceBundle = i18nModel ? i18nModel.getResourceBundle() : null;
                const errorMsg = resourceBundle ? resourceBundle.getText("error.logModelNotFound") : "Log model not found in Component initialization";
                console.error(errorMsg);
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