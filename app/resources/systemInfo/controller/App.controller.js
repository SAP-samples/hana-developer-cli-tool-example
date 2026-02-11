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
                    console.error("HANA model not found");
                    return;
                }

                this.getView().setModel(hanaModel);
            } catch (error) {
                console.error("Failed to initialize systemInfo controller:", error);
            }
        }
    });
});