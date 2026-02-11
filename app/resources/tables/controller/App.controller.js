/* eslint-disable no-undef */
/*eslint-env es6 */
"use strict";
sap.ui.define([
    "sap/hanacli/common/controller/BaseController",
    "sap/m/Text",
    "sap/m/Link",
    "sap/ui/table/Column"
], function (BaseController, Text, Link, Column) {

    const I18N_KEYS = {
        ERROR_HTTP: "error.httpError"
    };

    return BaseController.extend("sap.hanacli.tables.controller.App", {

        onAppInit: function () {
            this.getHanaStatus();
            this.getPrompts();
            let model = this.getModel("promptsModel");
            this.getView().setModel(model);
        },

        downloadExcel: function () {
            window.open("/excel");
            return;
        },

        executeCmd: async function () {
            this.startBusy();
            this.updatePrompts().then(() => {
                let cmd = this.getModel("config").getProperty("/cmd");
                let aUrl = `/hana/${cmd}/`;

                let oController = this;
                const resourceBundle = this.getResourceBundle();
                
                fetch(aUrl)
                    .then(response => {
                        return response.json().then(data => ({
                            status: response.status,
                            ok: response.ok,
                            body: data
                        }));
                    })
                    .then(result => {
                        if (!result.ok) {
                            const errorMsg = result.body.message || resourceBundle.getText(I18N_KEYS.ERROR_HTTP, [result.status]);
                            const error = new Error(errorMsg);
                            error.response = result.body;
                            throw error;
                        }

                        oController.endBusy();
                        let model = oController.getModel("resultsModel");
                        let metaData = [];
                        if (result.body[0]) {
                            for (const key of Object.keys(result.body[0])) {
                                metaData.push({ property: key });
                            }
                        }
                        let data = { rows: result.body, columns: metaData };
                        model.setData(data);

                        let oTable = oController.getView().byId("table");

                        oTable.bindColumns("resultsModel>/columns", function (sId, oContext) {
                            var sColumnId = oContext.getObject().property;
                            let template = new Text({ text: { path: "resultsModel>" + sColumnId } });
                            if (cmd === "btpSubs-ui" && /url/i.test(sColumnId)) {
                                template = new Link({
                                    text: { path: "resultsModel>" + sColumnId },
                                    target: "_blank",
                                    href: { path: "resultsModel>" + sColumnId }
                                });
                            }
                            if (cmd === "tables-ui" && sColumnId === "TABLE_NAME") {
                                template = new Link({
                                    text: { path: "resultsModel>" + sColumnId },
                                    target: "_blank",
                                    href: { path: "resultsModel>" + sColumnId, formatter: function(value) { return "/ui/?tbl=" + value + "#inspectTable-ui"; } }
                                });
                            }
                            if (cmd === "views-ui" && sColumnId === "VIEW_NAME") {
                                template = new Link({
                                    text: { path: "resultsModel>" + sColumnId },
                                    target: "_blank",
                                    href: { path: "resultsModel>" + sColumnId, formatter: function(value) { return "/ui/?viewInput=" + value + "#inspectView-ui"; } }
                                });
                            }
                            return new Column({
                                id: sColumnId,
                                label: sColumnId,
                                template: template,
                                sortProperty: sColumnId,
                                filterProperty: sColumnId
                            });
                        });
                    })
                    .catch(error => {
                        oController.onErrorCall(error, oController);
                        oController.endBusy();
                    });
            });
        }
    });
});

