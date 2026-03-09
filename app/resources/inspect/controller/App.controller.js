sap.ui.define([
    "sap/hanacli/common/controller/BaseController"
], function (BaseController) {
    "use strict";

    const I18N_KEYS = {
        INIT_FAILED: "error.appInitFailed"
    };

    return BaseController.extend("sap.hanacli.inspect.controller.App", {

        onAppInit: function () {
            try {
                this.getHanaStatus();
                this.getPrompts().then(() => {
                    const promptsModel = this.getModel("promptsModel");
                    if (!promptsModel) {
                        return;
                    }
                    if (!promptsModel.getProperty("/schema")) {
                        promptsModel.setProperty("/schema", "**CURRENT_SCHEMA**");
                    }
                    if (!promptsModel.getProperty("/table")) {
                        promptsModel.setProperty("/table", "*");
                    }
                    if (!promptsModel.getProperty("/view")) {
                        promptsModel.setProperty("/view", "*");
                    }
                    if (!promptsModel.getProperty("/user")) {
                        promptsModel.setProperty("/user", "*");
                    }
                    if (!promptsModel.getProperty("/limit")) {
                        promptsModel.setProperty("/limit", 200);
                    }
                });
                const model = this.getModel("promptsModel");
                this.getView().setModel(model);
            } catch (error) {
                const resourceBundle = this.getResourceBundle();
                const errorMsg = resourceBundle.getText(I18N_KEYS.INIT_FAILED);
                console.error(errorMsg + ":", error);
                this.showErrorMessage(errorMsg);
            }
        },

        downloadExcel: function () {
            window.open("/excel");
        }
    });
});