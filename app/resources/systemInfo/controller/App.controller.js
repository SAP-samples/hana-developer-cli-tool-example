/* eslint-disable no-undef */
/*eslint-env es6 */
"use strict";
sap.ui.define([
    "sap/hanacli/common/controller/BaseController"
],
     function (BaseController) {

        return BaseController.extend("sap.hanacli.systemInfo.controller.App", {
            onInit: function () {
                this.getHanaStatus()
                let hanaModel = this.getModel("hanaModel")
                this.getView().setModel(hanaModel)
            }
        })
    }
)