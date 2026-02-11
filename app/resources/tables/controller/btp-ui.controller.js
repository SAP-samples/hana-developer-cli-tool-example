/* eslint-disable no-undef */
/*eslint-env es6 */
"use strict";
sap.ui.define([
    "sap/hanacli/common/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (BaseController, JSONModel, MessageToast, MessageBox) {

    const I18N_KEYS = {
        ERROR_HTTP: "error.httpError",
        LOADING: "btp.loading",
        TARGET_SET: "btp.targetSet",
        SELECT_SUBACCOUNT: "btp.selectSubaccount",
        GLOBAL_ACCOUNT: "btp.globalAccount",
        FOLDERS: "btp.folders",
        SUBACCOUNTS: "btp.subaccounts",
        CURRENT_TARGET: "btp.currentTarget"
    };

    return BaseController.extend("sap.hanacli.tables.controller.btp-ui", {
        /**
         * Controller initialization
         */
        onInit: function () {
            this.loadBTPHierarchy();
        },

        /**
         * Load BTP hierarchy data from backend
         */
        loadBTPHierarchy: async function () {
            const oController = this;
            const resourceBundle = this.getResourceBundle();

            this.startBusy();

            try {
                const response = await fetch('/hana/btp-ui');
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || resourceBundle.getText(I18N_KEYS.ERROR_HTTP, [response.status]));
                }

                // Build tree structure for UI
                const treeData = this.buildTreeStructure(result);

                // Create model with data
                const oModel = new JSONModel({
                    globalAccount: result.globalAccount,
                    currentTarget: result.currentTarget,
                    treeData: treeData,
                    selectedSubaccount: null
                });

                this.getView().setModel(oModel, "btpModel");
                this.endBusy();

            } catch (error) {
                this.endBusy();
                this.onErrorCall(error, oController);
            }
        },

        /**
         * Build tree structure from hierarchy data
         * @param {object} data - Hierarchy data from backend
         * @returns {array} Tree structure for UI5 Tree control
         */
        buildTreeStructure: function (data) {
            const hierarchy = data.hierarchy;
            const treeNodes = [];

            // Add root-level subaccounts
            if (hierarchy.subaccounts && hierarchy.subaccounts.length > 0) {
                hierarchy.subaccounts.forEach(sub => {
                    treeNodes.push({
                        text: sub.displayName,
                        guid: sub.guid,
                        type: "subaccount",
                        icon: "sap-icon://post",
                        selectable: true
                    });
                });
            }

            // Add folders/directories with their subaccounts
            if (hierarchy.children && hierarchy.children.length > 0) {
                hierarchy.children.forEach(folder => {
                    const folderNode = {
                        text: folder.displayName,
                        guid: folder.guid,
                        type: "folder",
                        icon: "sap-icon://folder-full",
                        selectable: false,
                        nodes: []
                    };

                    if (folder.subaccounts && folder.subaccounts.length > 0) {
                        folder.subaccounts.forEach(sub => {
                            folderNode.nodes.push({
                                text: sub.displayName,
                                guid: sub.guid,
                                type: "subaccount",
                                icon: "sap-icon://post",
                                selectable: true
                            });
                        });
                    }

                    treeNodes.push(folderNode);
                });
            }

            return treeNodes;
        },

        /**
         * Handle tree item selection
         * @param {sap.ui.base.Event} oEvent - Selection event
         */
        onTreeItemSelect: function (oEvent) {
            const oSelectedItem = oEvent.getParameter("listItem");
            if (!oSelectedItem) {
                return;
            }
            
            const oContext = oSelectedItem.getBindingContext("btpModel");
            if (!oContext) {
                return;
            }
            
            const oData = oContext.getObject();

            // Only allow selection of subaccounts, not folders
            if (oData.type === "subaccount") {
                const oModel = this.getView().getModel("btpModel");
                oModel.setProperty("/selectedSubaccount", oData);
            } else {
                // Deselect if folder was clicked and clear selection
                const oTree = this.getView().byId("btpTree");
                oTree.removeSelections(true);
                const oModel = this.getView().getModel("btpModel");
                oModel.setProperty("/selectedSubaccount", null);
            }
        },

        /**
         * Handle setting the BTP target
         */
        onSetTarget: async function () {
            const oController = this;
            const resourceBundle = this.getResourceBundle();
            const oModel = this.getView().getModel("btpModel");
            const selectedSubaccount = oModel.getProperty("/selectedSubaccount");

            if (!selectedSubaccount) {
                MessageBox.warning(resourceBundle.getText(I18N_KEYS.SELECT_SUBACCOUNT));
                return;
            }

            this.startBusy();

            try {
                const response = await fetch('/hana/btp-ui/setTarget', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        subaccount: selectedSubaccount.guid
                    })
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || resourceBundle.getText(I18N_KEYS.ERROR_HTTP, [response.status]));
                }

                this.endBusy();
                MessageToast.show(resourceBundle.getText(I18N_KEYS.TARGET_SET, [selectedSubaccount.text]));

                // Reload hierarchy to update current target
                this.loadBTPHierarchy();

            } catch (error) {
                this.endBusy();
                this.onErrorCall(error, oController);
            }
        },

        /**
         * Handle refresh action
         */
        onRefresh: function () {
            this.loadBTPHierarchy();
        }
    });
});
