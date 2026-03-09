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
            // For the initial validation check, we try to get resourceBundle but fall back to English
            const bundle = controller ? (controller.getResourceBundle ? controller.getResourceBundle() : null) : null;
            const msg = bundle ? bundle.getText("error.handlerInvalid") : "Handler called without a valid controller";
            MessageToast.show(msg);
            return;
        }

        try {
            const resourceBundle = controller.getResourceBundle ? controller.getResourceBundle() : null;
            const metadata = controller.getMetadata();
            const controllerName = metadata ? metadata.getName() : "Unknown Controller";
            
            let message;
            if (resourceBundle) {
                message = resourceBundle.getText("error.handlerAction", [controllerName]);
            } else {
                message = `Pressed from ${controllerName}`;
            }
            MessageToast.show(message);
        } catch (error) {
            const resourceBundle = controller.getResourceBundle ? controller.getResourceBundle() : null;
            const handlerLogMsg = resourceBundle ? resourceBundle.getText("error.handlerLog") : "Error in handler:";
            console.error(handlerLogMsg, error);
            const errorMsg = resourceBundle ? resourceBundle.getText("error.handlerException") : "An error occurred while processing the action";
            MessageToast.show(errorMsg);
        }
    };
});