/* eslint-disable no-undef */
/*eslint-env es6 */
"use strict";
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
],
    function (Controller, Model) {

        return Controller.extend("sap.hanacli.massConvert.controller.App", {
            onInit: function () {
                let model = new Model({})
                this.getView().setModel(model)
            }
        })
    }
)