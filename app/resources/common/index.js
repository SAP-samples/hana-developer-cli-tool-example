/* eslint-disable no-undef */
/*eslint no-console: 0, no-unused-vars: 0, no-use-before-define: 0, no-redeclare: 0, no-shadow:0 */
/*eslint-env es6 */
sap.ui.require(["sap/ui/core/Core", "sap/ui/core/Component"], (oCore, Component) => {

	Component.create({
		id: "comp",
		name: "root",
		manifestFirst: true,
		async: true
	}).then((oComp) => {
		sap.ui.require(["sap/ui/core/ComponentContainer"], (ComponentContainer) => {
			let oCont = new ComponentContainer({
				component: oComp,
				height: "100%"
			})

			oCore.loadLibrary("sap.f", {
				async: true
			}).then(() => {
				let oShell = new sap.f.ShellBar({
					id: "myShell",
					homeIcon: "../common/images/sap_18.png",
					showCopilot: true,
					showSearch: true,
					showNotifications: true,
					showProductSwitcher: true,
					profile: new sap.f.Avatar({
						initials: ""
					})
				}).placeAt("content")
				oCont.placeAt("content")
			})
		})
	})

})