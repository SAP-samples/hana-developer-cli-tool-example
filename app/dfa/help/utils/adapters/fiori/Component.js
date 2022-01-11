sap.ui.define(["sap/ui/core/UIComponent"], function(e) {
    "use strict";
    return e.extend("sap.dfa.help.utils.adapters.fiori.Component", {
        metadata: {
            version: "3.1.0"
        },
        _getRendererExtensions: function() {
            var e = jQuery.Deferred()
              , r = jQuery.sap.getObject("sap.ushell.renderers.fiori2.RendererExtensions");
            return r ? e.resolve(r) : sap.ui.getCore().getEventBus().subscribe("sap.ushell.renderers.fiori2.Renderer", "rendererLoaded", function() {
                e.resolve(jQuery.sap.getObject("sap.ushell.renderers.fiori2.RendererExtensions"))
            }),
            e.promise()
        },
        init: function() {
            var i = this;
            e.prototype.init.apply(this, arguments),
            sap.ui.require(["sap/dfa/help/wpb/Help4"], function() {
                i._getRendererExtensions().done(function(e) {
                    var r, n = i.getComponentData().config;
                    "WPB" === n.backend ? r = "WPB" : "CP11" === n.backend && (r = "UACP"),
                    Help4.TIMESTAMP = "",
                    Help4.init(Help4.extendObject({
                        type: "fiori",
                        rendererExtensions: e,
                        isComponent: !0,
                        serviceLayerVersion: r
                    }, n, !1))
                })
            })
        }
    })
});
