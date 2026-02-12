sap.ui.define([
    "sap/hanacli/inspect/controller/App.controller",
    "sap/m/Text",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/CheckBox",
    "sap/m/DatePicker",
    "sap/ui/table/Column",
    "sap/m/IconTabFilter",
    "sap/ui/table/Table",
    "sap/m/BusyIndicator",
    "sap/ui/core/Item"
], function (AppController, Text, Label, Input, CheckBox, DatePicker, Column, IconTabFilter, Table, BusyIndicator, Item) {
    "use strict";

    const API_BASE_URL = "/hana/";

    const I18N_KEYS = {
        CONTROL_NOT_FOUND: "error.controlNotFound",
        COMMAND_NOT_CONFIGURED: "error.commandNotConfigured",
        PROCEDURE_NOT_SELECTED: "error.procedureNotSelected",
        LOAD_PARAMS_FIRST: "error.loadParamsFirst"
    };

    return AppController.extend("sap.hanacli.inspect.controller.callProcedure-ui", {

        onInit: function () {
            this.onAppInit();
            this.setFilterAsContains("Schema");
            this.setFilterAsContains("ProcedureCallProcedure");

            const configModel = this.getModel("config");
            const procedureParam = configModel.getProperty("/proc");

            if (procedureParam) {
                const promptsModel = this.getModel("promptsModel");
                promptsModel.setProperty("/procedure", procedureParam);
                
                // Wait for updatePrompts to complete before loading parameters
                this.updatePrompts().then(() => {
                    this.onLoadParameters();
                });
            }

            // Initialize results model
            const resultsModel = this.getModel("resultsModel");
            if (!resultsModel.getData()) {
                resultsModel.setData({
                    hasParameters: false,
                    hasResults: false,
                    hasOutputScalar: false,
                    hasResults1: false,
                    parameters: [],
                    outputScalar: [],
                    results: []
                });
            }
        },

        onProcedureChange: function () {
            // Clear parameters when procedure changes
            const resultsModel = this.getModel("resultsModel");
            resultsModel.setProperty("/hasParameters", false);
            resultsModel.setProperty("/hasResults", false);
            resultsModel.setProperty("/parameters", []);
            
            // Clear dynamic parameter fields
            const parametersForm = this.getView().byId("parametersForm");
            if (parametersForm) {
                parametersForm.removeAllContent();
            }
        },



        onLoadParameters: async function () {
            try {
                const promptsModel = this.getModel("promptsModel");
                const procedure = promptsModel.getProperty("/procedure");

                if (!procedure) {
                    const resourceBundle = this.getResourceBundle();
                    const errorMsg = resourceBundle.getText(I18N_KEYS.PROCEDURE_NOT_SELECTED);
                    sap.m.MessageBox.error(errorMsg);
                    return;
                }

                this.startBusy();
                await this.updatePrompts();

                const url = `${API_BASE_URL}callProcedure/parameters/`;
                
                const response = await new Promise((resolve, reject) => {
                    jQuery.ajax({
                        url: url,
                        method: "GET",
                        dataType: "json",
                        success: resolve,
                        error: reject
                    });
                });

                const resultsModel = this.getModel("resultsModel");
                resultsModel.setProperty("/parameters", response.parameters);
                resultsModel.setProperty("/procedureInfo", response.procedureInfo);
                resultsModel.setProperty("/hasParameters", response.parameters.length > 0);

                // Create dynamic input fields
                this.createDynamicInputFields(response.parameters);

                this.endBusy();
            } catch (error) {
                this.onErrorCall(error);
            }
        },

        createDynamicInputFields: function (parameters) {
            const parametersForm = this.getView().byId("parametersForm");
            const resourceBundle = this.getResourceBundle();
            
            if (!parametersForm) {
                return;
            }

            // Clear existing fields
            parametersForm.removeAllContent();

            // Create input fields for each IN parameter
            parameters.forEach((param) => {
                if (!param.TABLE_TYPE_NAME && param.PARAMETER_TYPE === 'IN') {
                    // Create label
                    const label = new Label({
                        text: param.PARAMETER_NAME + (param.IS_NULLABLE === 'FALSE' ? ' *' : ''),
                        required: param.IS_NULLABLE === 'FALSE'
                    });

                    // Create appropriate input control based on data type
                    let inputControl;
                    
                    switch (param.DATA_TYPE_NAME) {
                        case 'BOOLEAN':
                            inputControl = new CheckBox({
                                id: this.createId(`param_${param.PARAMETER_NAME}`),
                                selected: "{promptsModel>/" + param.PARAMETER_NAME + "}"
                            });
                            break;
                        
                        case 'DATE':
                        case 'TIMESTAMP':
                            inputControl = new DatePicker({
                                id: this.createId(`param_${param.PARAMETER_NAME}`),
                                value: "{promptsModel>/" + param.PARAMETER_NAME + "}",
                                displayFormat: param.DATA_TYPE_NAME === 'DATE' ? "yyyy-MM-dd" : "yyyy-MM-dd HH:mm:ss",
                                valueFormat: param.DATA_TYPE_NAME === 'DATE' ? "yyyy-MM-dd" : "yyyy-MM-dd'T'HH:mm:ss"
                            });
                            break;
                        
                        case 'TINYINT':
                        case 'SMALLINT':
                        case 'INTEGER':
                        case 'BIGINT':
                            inputControl = new Input({
                                id: this.createId(`param_${param.PARAMETER_NAME}`),
                                value: "{promptsModel>/" + param.PARAMETER_NAME + "}",
                                type: "Number",
                                placeholder: resourceBundle.getText("gui.enterInteger")
                            });
                            break;
                        
                        case 'DECIMAL':
                        case 'REAL':
                        case 'DOUBLE':
                        case 'SMALLDECIMAL':
                            inputControl = new Input({
                                id: this.createId(`param_${param.PARAMETER_NAME}`),
                                value: "{promptsModel>/" + param.PARAMETER_NAME + "}",
                                type: "Number",
                                placeholder: resourceBundle.getText("gui.enterDecimal")
                            });
                            break;
                        
                        default:
                            // String types
                            inputControl = new Input({
                                id: this.createId(`param_${param.PARAMETER_NAME}`),
                                value: "{promptsModel>/" + param.PARAMETER_NAME + "}",
                                placeholder: resourceBundle.getText("gui.enterValue"),
                                maxLength: param.LENGTH > 0 ? param.LENGTH : 0
                            });
                    }

                    parametersForm.addContent(label);
                    parametersForm.addContent(inputControl);
                }
            });

            // Add execute button at the end
            const executeButton = new sap.m.Button({
                id: this.createId("executeProcedureButton"),
                text: resourceBundle.getText("gui.execute"),
                press: this.executeProcedure.bind(this),
                type: "Emphasized",
                icon: "sap-icon://play"
            });

            parametersForm.addContent(new Label({ text: "" })); // Empty label for spacing
            parametersForm.addContent(executeButton);
        },

        executeCmd: function () {
            try {
                const resultsModel = this.getModel("resultsModel");
                const hasParameters = resultsModel.getProperty("/hasParameters");

                if (!hasParameters) {
                    const resourceBundle = this.getResourceBundle();
                    const errorMsg = resourceBundle.getText(I18N_KEYS.LOAD_PARAMS_FIRST);
                    sap.m.MessageBox.error(errorMsg);
                    return;
                }

                this.startBusy();
                
                const cmd = this.getModel("config").getProperty("/cmd");
                if (!cmd) {
                    const resourceBundle = this.getResourceBundle();
                    const errorMsg = resourceBundle.getText(I18N_KEYS.COMMAND_NOT_CONFIGURED);
                    this.onErrorCall(new Error(errorMsg));
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
                        oController.processProcedureResults(result.body);
                        oController.endBusy();
                    })
                    .catch(error => {
                        oController.onErrorCall(error);
                        oController.endBusy();
                    });
            } catch (error) {
                this.onErrorCall(error);
                this.endBusy();
            }
        },

        executeProcedure: function () {
            // Alias for executeCmd to be called from the execute button in parameters form
            this.executeCmd();
        },

        processProcedureResults: function (responseData) {
            const resultsModel = this.getModel("resultsModel");

            // Clear previous results
            resultsModel.setProperty("/hasResults", false);
            resultsModel.setProperty("/hasOutputScalar", false);
            resultsModel.setProperty("/hasResults1", false);

            // Clear dynamic tabs
            const tabBar = this.getView().byId("outputTabBar");
            const existingItems = tabBar.getItems();
            // Remove all tabs except the first two (outputScalar and results)
            for (let i = existingItems.length - 1; i >= 2; i--) {
                tabBar.removeItem(existingItems[i]);
                existingItems[i].destroy();
            }

            // Process output scalar
            if (responseData.outputScalar && Object.keys(responseData.outputScalar).length > 0) {
                const scalarArray = [responseData.outputScalar];
                const scalarMetadata = this.extractMetadata(scalarArray);
                
                resultsModel.setProperty("/outputScalar", scalarArray);
                resultsModel.setProperty("/outputScalarColumns", scalarMetadata);
                resultsModel.setProperty("/hasOutputScalar", true);
                resultsModel.setProperty("/hasResults", true);

                this.bindTableColumns("outputScalarTable", "/outputScalarColumns");
            }

            const outputKeys = Object.keys(responseData);
            const resultKeys = outputKeys.filter(key => key.startsWith('results'));

            if (resultKeys.length === 0) {
                // No table results
            } else if (resultKeys.length === 1 && resultKeys[0] === 'results') {
                // Single result set
                if (responseData.results && responseData.results.length > 0) {
                    const resultsMetadata = this.extractMetadata(responseData.results);
                    
                    resultsModel.setProperty("/results", responseData.results);
                    resultsModel.setProperty("/resultsColumns", resultsMetadata);
                    resultsModel.setProperty("/hasResults1", true);
                    resultsModel.setProperty("/hasResults", true);

                    this.bindTableColumns("resultsTable", "/resultsColumns");
                }
            } else {
                // Multiple result sets
                resultKeys.forEach((key, index) => {
                    if (responseData[key] && responseData[key].length > 0) {
                        const resultMetadata = this.extractMetadata(responseData[key]);
                        
                        resultsModel.setProperty(`/${key}`, responseData[key]);
                        resultsModel.setProperty(`/${key}Columns`, resultMetadata);
                        resultsModel.setProperty("/hasResults", true);

                        // Create dynamic tab
                        this.createDynamicResultTab(key, index + 1);
                    }
                });
            }
        },

        createDynamicResultTab: function (resultKey, tabNumber) {
            const resourceBundle = this.getResourceBundle();
            const tabBar = this.getView().byId("outputTabBar");

            const resultTable = new Table({
                id: this.createId(`${resultKey}Table`),
                selectionMode: "MultiToggle",
                visibleRowCount: 10,
                enableSelectAll: false,
                rows: `{resultsModel>/${resultKey}}`,
                threshold: 15,
                enableBusyIndicator: true,
                noData: new BusyIndicator({
                    class: "sapUiMediumMargin"
                })
            });

            const tabFilter = new IconTabFilter({
                id: this.createId(`iconTabFilter${resultKey}`),
                text: resourceBundle.getText("gui.resultSet", [tabNumber]),
                key: resultKey,
                content: [resultTable]
            });

            tabBar.addItem(tabFilter);

            // Bind columns for this table
            this.bindTableColumns(`${resultKey}Table`, `/${resultKey}Columns`);
        },

        extractMetadata: function (dataArray) {
            if (!dataArray || !dataArray[0]) {
                return [];
            }

            return Object.keys(dataArray[0]).map(key => ({ property: key }));
        },

        bindTableColumns: function (tableId, bindingPath) {
            const table = this.getView().byId(tableId);

            if (!table) {
                return;
            }

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
