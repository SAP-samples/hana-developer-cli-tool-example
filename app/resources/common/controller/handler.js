sap.ui.define([
    "sap/m/MessageToast"
], function(MessageToast) {
    "use strict";

    /**
     * Generic handler function to show a message toast indicating which controller triggered the action
     * @param {sap.ui.core.mvc.Controller} controller - The controller instance that triggered the handler
     * @returns {void}
     */
    return function(controller) {
        if (!controller) {
            MessageToast.show("Handler called without a valid controller");
            return;
        }

        try {
            const metadata = controller.getMetadata();
            const controllerName = metadata ? metadata.getName() : "Unknown Controller";
            const message = `Pressed from ${controllerName}`;
            MessageToast.show(message);
        } catch (error) {
            console.error("Error in handler:", error);
            MessageToast.show("An error occurred while processing the action");
        }
    };
});