/* eslint-disable no-undef */
'use strict';
sap.ui.require([ ], () => {
    const head = document.getElementsByTagName('head')[0]
    let wa = document.createElement('script')
    wa.src = 'https://webassistant.enable-now.cloud.sap/wa_cfg/hana_cloud_central_productive/WebAssistant.js'
    wa.type = 'text/javascript'
    wa.async = true
    wa.defer = true
    head.insertBefore(wa, null)
})