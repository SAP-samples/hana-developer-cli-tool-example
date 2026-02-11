sap.ui.define([
    "sap/hanacli/inspect/controller/App.controller",
    "sap/m/Text",
    "sap/ui/table/Column"
], function (AppController, Text, Column) {
    "use strict";

    const API_BASE_URL = "/hana/";

    const I18N_KEYS = {
        ERROR_COMMAND_NOT_CONFIGURED: "error.commandNotConfigured",
        ERROR_HTTP: "error.httpError"
    };

    return AppController.extend("sap.hanacli.inspect.controller.querySimple-ui", {

        onInit: function () {
            this.onAppInit();
            this.initOutputTypes();
        },

        initOutputTypes: function () {
            const outputModel = this.getModel("outputModel");
            outputModel.setData({
                outputTypes: [
                    {
                        text: this.getResourceBundle().getText("types.table"),
                        key: "table"
                    },
                    {
                        text: this.getResourceBundle().getText("types.json"),
                        key: "json"
                    },
                    {
                        text: this.getResourceBundle().getText("types.excel"),
                        key: "excel"
                    },
                    {
                        text: this.getResourceBundle().getText("types.csv"),
                        key: "csv"
                    }
                ]
            });
        },

        executeCmd: function () {
            this.startBusy();

            this.updatePrompts();

            const cmd = this.getModel("config")?.getProperty("/cmd");
            const resourceBundle = this.getResourceBundle();
            if (!cmd) {
                const errorMsg = resourceBundle.getText(I18N_KEYS.ERROR_COMMAND_NOT_CONFIGURED);
                this.onErrorCall(new Error(errorMsg), this);
                this.endBusy();
                return;
            }

            const url = `${API_BASE_URL}${cmd}/`;
            const oController = this;

            fetch(url)
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
                    oController.processQueryResults(result.body);
                    oController.endBusy();
                })
                .catch(error => {
                    oController.onErrorCall(error, oController);
                    oController.endBusy();
                });
        },

        processQueryResults: function (responseData) {
            const resultsModel = this.getModel("resultsModel");
            const metadata = this.extractMetadata(responseData);

            resultsModel.setData({
                rows: responseData,
                columns: metadata
            });

            this.bindTableColumns("table", "/columns");
        },

        extractMetadata: function (dataArray) {
            if (!dataArray || !dataArray[0]) {
                return [];
            }

            return Object.keys(dataArray[0]).map(key => ({ property: key }));
        },

        bindTableColumns: function (tableId, bindingPath) {
            const table = this.getView().byId(tableId);

            table.bindColumns(`resultsModel>${bindingPath}`, (id, context) => {
                const columnId = context.getObject().property;
                const template = new Text({
                    text: { path: `resultsModel>${columnId}` }
                });

                return new Column({
                    id: columnId,
                    label: columnId,
                    template: template,
                    sortProperty: columnId,
                    filterProperty: columnId
                });
            });
        }
    });
});