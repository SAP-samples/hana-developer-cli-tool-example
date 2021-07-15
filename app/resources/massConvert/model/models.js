/* eslint-disable no-undef */
/*eslint-env es6 */
sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], function (JSONModel, Device) {
    "use strict"

    return {

        createDeviceModel: function () {
            var oModel = new JSONModel(Device)
            oModel.setDefaultBindingMode("OneWay")
            return oModel
        }

    }
})