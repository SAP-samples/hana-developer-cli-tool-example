/* eslint-disable no-undef */
/*eslint no-console: 0, no-unused-vars: 0, no-use-before-define: 0, no-redeclare: 0, no-shadow:0 */
/*eslint-env es6 */

/**
 * Application initialization
 * Sets up the SAPUI5 shell renderer and configures flexibility services for SAP UI
 */
sap.ui.require(["sap/ui/core/Core", "sap/ui/core/Component"], () => {
    // Render the Fiori shell container
    sap.ushell.Container.createRenderer().placeAt("content");
    
    // Configure flexibility services for UI adaptations
    sap.ui
        .getCore()
        .getConfiguration()
        .setFlexibilityServices([{
            connector: "SessionStorageConnector"
        }]);
});