sap.ui.define([
    "sap/hanacli/inspect/controller/App.controller",
    "sap/m/Text",
    "sap/ui/table/Column"
], function (AppController, Text, Column) {
    "use strict";

    const API_BASE_URL = "/hana/";

    const I18N_KEYS = {
        CONTROL_NOT_FOUND: "error.controlNotFound",
        COMMAND_NOT_CONFIGURED: "error.commandNotConfigured"
    };

    return AppController.extend("sap.hanacli.inspect.controller.inspectTable-ui", {

        onInit: function () {
            this.onAppInit();
            this.setFilterAsContains("Schema");
            this.setFilterAsContains("TableInspectTable");

            const configModel = this.getModel("config");
            const tableParam = configModel.getProperty("/tbl");

            if (tableParam) {
                const promptsModel = this.getModel("promptsModel");
                promptsModel.setProperty("/table", tableParam);
                
                // Wait for updatePrompts to complete before executing command
                this.updatePrompts().then(() => {
                    this.executeCmd();
                });
            }
        },

        onLoadTableFilter: function (tableList, oController) {
            // If oController is not provided, use 'this' context
            const controller = oController || this;
            const searchControl = controller.getView().byId("TableInspectTable");
            
            if (!searchControl) {
                const resourceBundle = controller.getResourceBundle();
                const errorMsg = resourceBundle.getText(I18N_KEYS.CONTROL_NOT_FOUND, ["TableInspectTable"]);
                console.error(errorMsg);
                return;
            }
            
            searchControl.destroySuggestionItems();

            tableList.forEach((table) => {
                searchControl.addSuggestionItem(
                    new sap.ui.core.Item({ text: table.TABLE_NAME })
                );
            });
        },

        executeCmd: function () {
            this.startBusy();
            
            const cmd = this.getModel("config").getProperty("/cmd");
            if (!cmd) {
                const resourceBundle = this.getResourceBundle();
                const errorMsg = resourceBundle.getText(I18N_KEYS.COMMAND_NOT_CONFIGURED);
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
                        const resourceBundle = oController.getResourceBundle();
                        const errorMsg = result.body.message || resourceBundle.getText("error.httpError", [result.status]);
                        const error = new Error(errorMsg);
                        error.response = result.body;
                        throw error;
                    }
                    oController.processTableData(result.body);
                    oController.endBusy();
                })
                .catch(error => {
                    oController.onErrorCall(error, oController);
                    oController.endBusy();
                });
        },

        processTableData: function (responseData) {
            const resultsModel = this.getModel("resultsModel");

            const fieldsMetadata = this.extractMetadata(responseData.fields);
            const constraintsMetadata = this.extractMetadata(responseData.constraints);

            resultsModel.setData({
                rows: responseData,
                fieldsColumns: fieldsMetadata,
                constraintsColumns: constraintsMetadata
            });

            this.bindTableColumns("fieldsTableInspectTable", "/fieldsColumns");
            this.bindTableColumns("constraintsTableInspectTable", "/constraintsColumns");
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