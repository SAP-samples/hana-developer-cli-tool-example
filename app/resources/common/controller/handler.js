/* eslint-disable no-undef */
/*eslint-env es6 */
"use strict";
sap.ui.define([
    "sap/m/MessageToast",
  ], function(MessageToast) {
    "use strict";
  
    return function(controller) {
      const message = `Pressed from ${controller.getMetadata().getName()}`
      MessageToast.show(message)
    }
  })