sap.ui.define([
    "sap/hanacli/common/controller/BaseController"
], function (BaseController) {
    "use strict";

    return BaseController.extend("sap.hanacli.inspect.controller.App", {

        onAppInit: function () {
            try {
                this.getHanaStatus();
                this.getPrompts();
                const model = this.getModel("promptsModel");
                this.getView().setModel(model);
            } catch (error) {
                console.error("Failed to initialize app:", error);
                this.showErrorMessage("Failed to initialize application");
            }
        },

        downloadExcel: function () {
            window.open("/excel");
        }
    });
});