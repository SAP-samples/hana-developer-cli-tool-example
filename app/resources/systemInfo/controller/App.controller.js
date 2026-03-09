sap.ui.define([
    "sap/hanacli/common/controller/BaseController"
], function (BaseController) {
    "use strict";

    return BaseController.extend("sap.hanacli.systemInfo.controller.App", {

        onInit: function () {
            try {
                this.getHanaStatus();

                const hanaModel = this.getModel("hanaModel");
                if (!hanaModel) {
                    const resourceBundle = this.getResourceBundle();
                    console.error(resourceBundle.getText("error.hanaModelNotFound"));
                    return;
                }

                this.getView().setModel(hanaModel);
            } catch (error) {
                const resourceBundle = this.getResourceBundle();
                const errorMsg = resourceBundle.getText("error.initializationFailed", ["systemInfo"]);
                console.error(errorMsg + ":", error);
            }
        }
    });
});