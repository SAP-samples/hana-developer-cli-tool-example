/* eslint-disable no-undef */
/*eslint-env es6 */
sap.ui.define([
    "sap/hanacli/common/Component"
], function (UIComponent) {
    "use strict"

    return UIComponent.extend("sap.hanacli.massConvert.Component", {

        metadata: {
            manifest: "json"
        },


        init: function () {
            this.superInit()
           // Log Model
			var oModel = this.getModel("logModel")
			oModel.setData({
				log: "",
				message: "", 
                progress: 0
			})
        }


    })
})