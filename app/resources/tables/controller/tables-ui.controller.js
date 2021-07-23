/* eslint-disable no-undef */
/*eslint-env es6 */
"use strict";
sap.ui.define([
    "sap/hanacli/tables/controller/App.controller"
],
    function (AppController) {

        return AppController.extend("sap.hanacli.tables.controller.tables-ui", {

            onInit: function () {

                this.onAppInit()                
                this.setFilterAsContains("Schema")
                this.setFilterAsContains("Table")

            },

        })
    }
)