/* eslint-disable no-undef */
/*eslint-env es6 */
sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "sap/hanacli/massConvert/model/models"
], function (UIComponent, Device, models) {
    "use strict"

    return UIComponent.extend("sap.hanacli.massConvert.Component", {

        metadata: {
            manifest: "json"
        },

        /**
         * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
         * @public
         * @override
         */
        init: function () {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments)

            // enable routing
            this.getRouter().initialize()

            // set the device model
            this.setModel(models.createDeviceModel(), "device")



            let oModel = this.getModel("promptsModel")
            var aUrl = "/"
            oModel.setData(JSON.parse(
                jQuery.ajax({
                    url: aUrl,
                    method: "GET",
                    dataType: "json",
                    async: false
                }).responseText))

            let oHanaModel = this.getModel("hanaModel")
            let aHanaUrl = "/hana"
            oHanaModel.setData(JSON.parse(
                jQuery.ajax({
                    url: aHanaUrl,
                    method: "GET",
                    dataType: "json",
                    async: false
                }).responseText))
        }


    })
})