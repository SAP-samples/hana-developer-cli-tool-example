/* eslint-disable no-undef */
/*eslint-env es6 */
"use strict";
sap.ui.define([
    "sap/hanacli/common/controller/BaseController"

],
    function (BaseController) {

        return BaseController.extend("sap.hanacli.inspect.controller.App", {

            onAppInit: function () {

                this.getHanaStatus()
                this.getPrompts()
                let model = this.getModel("promptsModel")
                this.getView().setModel(model)

            },

            downloadExcel: function () {
                //Excel Download
                window.open("/excel")
                return
            }        


        })
    }
)