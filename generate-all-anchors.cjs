const fs = require('fs');

const appTiles = {
  "inspectTable-ui": [
    "TableInspectTable", "iconTabFilterBasicInfoInspectTable", "iconTabFilterFieldsInspectTable",
    "iconTabFilterConstraintsInspectTable", "iconTabFilterSQLInspectTable", "iconTabFilterCDSInspectTable",
    "iconTabFilterHDBTableInspectTable", "Schema", "schemaInnerInput", "settingsButtonInspectTable",
    "chkAdmin", "inputConnFile", "connRefresh", "disableVerbose", "debug", "inputSchemaInspectTable",
    "inputTableInspectTable", "inputTableTypeInspectTable", "inputTableOIDInspectTable",
    "inputHasPrimaryKeyInspectTable", "inputIsPreloadInspectTable", "inputUnloadPriorityInspectTable",
    "inputCreatedInspectTable", "fieldsTableInspectTable", "constraintsTableInspectTable",
    "aCodeEditorSQLInspectTable", "aCodeEditorCDSInspectTable", "aCodeEditorHDBTableInspectTable"
  ],
  "inspectView-ui": [
    "ViewInspectView", "iconTabFilterBasicInfoInspectView", "iconTabFilterFieldsInspectView",
    "iconTabFilterSQLInspectView", "iconTabFilterCDSInspectView", "iconTabFilterHDBTableInspectView",
    "Schema", "schemaInnerInput", "settingsButtonInspectView", "chkAdmin", "inputConnFile",
    "connRefresh", "disableVerbose", "debug", "inputSchemaInspectView", "inputViewInspectView",
    "inputViewTypeInspectView", "inputViewOIDInspectView", "inputHasParametersInspectView",
    "inputHasCheckInspectView", "inputHasCacheInspectView", "inputCreatedInspectView",
    "fieldsTableInspectView", "aCodeEditorSQLInspectView", "aCodeEditorCDSInspectView",
    "aCodeEditorHDBTableInspectView"
  ],
  "querySimple-ui": [
    "FolderQuerySimple", "FilenameQuerySimple", "outputFormatQuerySimple", "aCodeEditorSQL",
    "settingsButtonQuerySimple", "chkAdmin", "inputConnFile", "connRefresh", "disableVerbose", "debug"
  ],
  "systeminfo-ui": [
    "currentUser", "currentSchema", "systemId", "databaseName", "host", "startTime", "version",
    "overviewTable"
  ]
};

function generateHotspotAnchor(appUrl, tileId) {
  const json = {
    value: `DIV[id$='application-${appUrl}-component---App--${tileId}']`,
    rule: "IdSelectorUI5",
    offset: { x: 0.5, y: 0.2812 }
  };
  
  const jsonString = JSON.stringify(json);
  const urlEncoded = encodeURIComponent(jsonString);
  const base64Encoded = Buffer.from(urlEncoded).toString('base64');
  const anchor = `WA#2#${base64Encoded}`;
  
  return anchor;
}

const results = [];

for (const [appUrl, tileIds] of Object.entries(appTiles)) {
  for (const tileId of tileIds) {
    results.push({
      appUrl,
      tileId,
      anchor: generateHotspotAnchor(appUrl, tileId)
    });
  }
}

console.log(JSON.stringify(results, null, 2));
fs.writeFileSync('hotspot-anchors-all.json', JSON.stringify(results, null, 2));
console.log(`\nGenerated ${results.length} hotspot anchors and saved to hotspot-anchors-all.json`);
