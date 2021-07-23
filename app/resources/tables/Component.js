/* eslint-disable no-undef */
/*eslint-env es6 */
sap.ui.define([
    "sap/hanacli/common/Component",
    "sap/base/util/UriParameters"
], function (UIComponent, UriParameters) {
    "use strict"

    return UIComponent.extend("sap.hanacli.tables.Component", {

        metadata: {
            manifest: "json"
        },


        createContent: function () {
            // create root view
            var oView = sap.ui.view({
                id : "App",
                viewName : `sap.hanacli.tables.view.${this.getModel("config").getProperty("/cmd")}`,
                type : "XML", 
                async: true,
                viewData : {
                    component : this
                }
            })

            return oView

        },

        init: function () {
            let model = this.getModel("config")
            let cmd = UriParameters.fromQuery(window.location.search).get("cmd")
            if (!cmd) {
                cmd = window.location.hash.substr(1)
            }
            model.setData({cmd: cmd})
            this.superInit()          
        }


    })
})