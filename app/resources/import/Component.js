sap.ui.define([
    "sap/hanacli/common/Component"
], function (UIComponent) {
    "use strict";

    return UIComponent.extend("sap.hanacli.import.Component", {

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
                try {
                    const i18nModel = this.getModel("i18n");
                    const resourceBundle = i18nModel?.getResourceBundle();
                    if (resourceBundle) {
                        const errorMsg = resourceBundle.getText("error.logModelNotFound");
                        console.error(errorMsg);
                    }
                } catch (e) {
                    // Log error but don't use hardcoded strings
                    console.error(e);
                }
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
