sap.ui.define([
    "sap/hanacli/common/controller/BaseController",
    "sap/m/Link"
], function (BaseController, Link) {
    "use strict";

    return BaseController.extend("sap.hanacli.version.controller.App", {

        onInit: function () {
            try {
                this.loadVersionInfo();

                const hanaModel = this.getModel("hanaModel");
                if (!hanaModel) {
                    const resourceBundle = this.getResourceBundle();
                    console.error(resourceBundle.getText("error.hanaModelNotFound"));
                    return;
                }

                this.getView().setModel(hanaModel);
            } catch (error) {
                const resourceBundle = this.getResourceBundle();
                const errorMsg = resourceBundle.getText("error.initializationFailed", ["version"]);
                console.error(errorMsg + ":", error);
            }
        },

        loadVersionInfo: async function () {
            try {
                const response = await fetch('/hana/version-ui');
                const data = await response.json();
                
                // Separate core info from packages
                const coreFields = ["hana-cli", "Node.js", "cf-cli", "btp-cli", "hana-cli home", "latestVersion"];
                const packages = [];
                
                // Iterate through all properties in data
                for (const key in data) {
                    if (data.hasOwnProperty(key) && !coreFields.includes(key)) {
                        // This is a package - add it to the packages array
                        packages.push({
                            name: key,
                            version: data[key] || "Not installed"
                        });
                    }
                }
                
                // Sort packages alphabetically by name
                packages.sort((a, b) => a.name.localeCompare(b.name));
                
                // Transform data structure
                const transformedData = {
                    "hana-cli": data["hana-cli"],
                    "Node.js": data["Node.js"],
                    "cf-cli": data["cf-cli"],
                    "btp-cli": data["btp-cli"],
                    "hana-cli home": data["hana-cli home"],
                    "latestVersion": data["latestVersion"],
                    "packages": packages
                };
                
                const hanaModel = this.getModel("hanaModel");
                hanaModel.setData(transformedData);
            } catch (error) {
                console.error("Error loading version info:", error);
            }
        }
    });
});
