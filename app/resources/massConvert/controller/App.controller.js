sap.ui.define([
    "sap/hanacli/common/controller/BaseController",
    "sap/ui/core/ws/WebSocket",
    "sap/m/MessageToast"
], function (BaseController, WebSocket, MessageToast) {
    "use strict";

    const I18N_KEYS = {
        CONNECTION_OPENED: "connection.opened",
        CONNECTION_ERROR: "connection.error",
        CONNECTION_CLOSED: "connection.close",
        OUTPUT_CDS: "types.cds",
        OUTPUT_MIGRATION_TABLE: "types.hdbmigrationtable",
        OUTPUT_TABLE: "types.hdbtable"
    };

    const FILTERS = ["Schema", "Table", "View"];
    const WEBSOCKET_URL = "/websockets";

    return BaseController.extend("sap.hanacli.massConvert.controller.App", {

        onInit: function () {
            // Initialize WebSocket as instance property
            this.connection = new WebSocket(WEBSOCKET_URL);

            this.getHanaStatus();
            this.getPrompts();
            this.initOutputTypes();

            const model = this.getModel("promptsModel");
            this.getView().setModel(model);

            // Apply filters
            FILTERS.forEach(filter => {
                this.setFilterAsContains(filter);
            });

            this.setupWebSocketHandlers();
        },

        setupWebSocketHandlers: function () {
            const resourceBundle = this.getResourceBundle();
            const connOpenedMsg = resourceBundle.getText(I18N_KEYS.CONNECTION_OPENED);
            const connErrorMsg = resourceBundle.getText(I18N_KEYS.CONNECTION_ERROR);
            const connClosedMsg = resourceBundle.getText(I18N_KEYS.CONNECTION_CLOSED);

            // WebSocket connection opened
            this.connection.attachOpen(() => {
                MessageToast.show(connOpenedMsg);
            });

            // Server messages
            this.connection.attachMessage((oControlEvent) => {
                try {
                    const logModel = this.getModel("logModel");
                    if (!logModel) {
                        console.error("Log model not found");
                        return;
                    }

                    const eventData = oControlEvent.getParameter("data");
                    const result = logModel.getData();

                    const data = JSON.parse(eventData);
                    const msg = data.text || "";
                    const lastInfo = result.log || "";
                    let progress = result.progress || 0;

                    if (data.progress) {
                        progress = data.progress;
                    }

                    const newLog = lastInfo
                        ? `${msg}\r\n${lastInfo}`
                        : msg;

                    logModel.setData({
                        log: newLog,
                        progress: progress
                    }, true);
                } catch (error) {
                    console.error("Error processing WebSocket message:", error);
                }
            }, this);

            // Error handling
            this.connection.attachError(() => {
                MessageToast.show(connErrorMsg);
            });

            // Connection close
            this.connection.attachClose(() => {
                MessageToast.show(connClosedMsg);
            });
        },

        onBeginConvert: function () {
            this.refreshConnection().then(() => {
                const logModel = this.getOwnerComponent().getModel("logModel");
                if (!logModel) {
                    console.error("Log model not found");
                    return;
                }

                logModel.setData({
                    log: "",
                    progress: 0
                }, true);

                this.connection.send(JSON.stringify({
                    action: "massConvert"
                }));
            }).catch((error) => {
                console.error("Failed to refresh connection:", error);
                MessageToast.show("Failed to establish connection");
            });
        },

        initOutputTypes: function () {
            const outputModel = this.getModel("outputModel");
            if (!outputModel) {
                console.error("Output model not found");
                return;
            }

            const resourceBundle = this.getResourceBundle();

            outputModel.setData({
                outputTypes: [
                    {
                        text: resourceBundle.getText(I18N_KEYS.OUTPUT_CDS),
                        key: "cds"
                    },
                    {
                        text: resourceBundle.getText(I18N_KEYS.OUTPUT_MIGRATION_TABLE),
                        key: "hdbmigrationtable"
                    },
                    {
                        text: resourceBundle.getText(I18N_KEYS.OUTPUT_TABLE),
                        key: "hdbtable"
                    }
                ]
            });
        }
    });
});