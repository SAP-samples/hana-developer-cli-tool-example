sap.ui.define([
    "sap/hanacli/inspect/controller/App.controller",
    "sap/m/Text",
    "sap/ui/table/Column"
], function (AppController, Text, Column) {
    "use strict";

    const API_BASE_URL = "/hana/";

    const I18N_KEYS = {
        ERROR_CONTROL_NOT_FOUND: "error.controlNotFound",
        ERROR_COMMAND_NOT_CONFIGURED: "error.commandNotConfigured",
        ERROR_HTTP: "error.httpError"
    };

    return AppController.extend("sap.hanacli.inspect.controller.inspectView-ui", {

        onInit: function () {
            this.onAppInit();
            this.setFilterAsContains("Schema");
            this.setFilterAsContains("ViewInspectView");

            const configModel = this.getModel("config");
            const viewInput = configModel.getProperty("/viewInput");

            if (viewInput) {
                const promptsModel = this.getModel("promptsModel");
                promptsModel.setProperty("/view", viewInput);
                
                // Wait for updatePrompts to complete before executing command
                this.updatePrompts().then(() => {
                    this.executeCmd();
                });
            }
        },

        onLoadViewFilter: function (viewList, oController) {
            // If oController is not provided, use 'this' context
            const controller = oController || this;
            const searchControl = controller.getView().byId("ViewInspectView");

            if (!searchControl) {
                const resourceBundle = controller.getResourceBundle();
                const errorMsg = resourceBundle.getText(I18N_KEYS.ERROR_CONTROL_NOT_FOUND, ["ViewInspectView"]);
                console.error(errorMsg);
                return;
            }

            searchControl.destroySuggestionItems();

            viewList.forEach((view) => {
                searchControl.addSuggestionItem(
                    new sap.ui.core.Item({ text: view.VIEW_NAME })
                );
            });
        },

        executeCmd: function () {
            this.startBusy();

            const cmd = this.getModel("config").getProperty("/cmd");
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
                    oController.processViewData(result.body);
                    oController.endBusy();
                })
                .catch(error => {
                    oController.onErrorCall(error, oController);
                    oController.endBusy();
                });
        },

        processViewData: function (responseData) {
            const resultsModel = this.getModel("resultsModel");

            const fieldsMetadata = this.extractMetadata(responseData.fields);

            resultsModel.setData({
                rows: responseData,
                fieldsColumns: fieldsMetadata
            });

            this.bindTableColumns("fieldsTableInspectView", "/fieldsColumns");
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

                return new Column({
                    label: columnId,
                    template: new Text({
                        text: { path: `resultsModel>${columnId}` }
                    }),
                    sortProperty: columnId,
                    filterProperty: columnId
                });
            });
        }
    });
});