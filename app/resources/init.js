/* eslint-disable no-undef */
/*eslint no-console: 0, no-unused-vars: 0, no-use-before-define: 0, no-redeclare: 0, no-shadow:0 */
/*eslint-env es6 */
sap.ui.require(["sap/ui/core/Core", "sap/ui/core/Component"], (oCore, Component) => {

    sap.ushell.Container.createRenderer().placeAt('content')
    sap.ui
        .getCore()
        .getConfiguration()
        .setFlexibilityServices([{
            connector: "SessionStorageConnector"
        }])

})