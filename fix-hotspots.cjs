const fs = require('fs');
const path = require('path');

// Mapping of app URL to their tile IDs that need hotspot anchors
const uiConfigs = {
  'inspectTable-ui': {
    tiles: [
      'TableInspectTable',
      'iconTabFilterBasicInfoInspectTable',
      'iconTabFilterFieldsInspectTable',
      'iconTabFilterConstraintsInspectTable',
      'iconTabFilterSQLInspectTable',
      'iconTabFilterCDSInspectTable',
      'iconTabFilterHDBTableInspectTable',
      'Schema',
      'schemaInnerInput',
      'settingsButtonInspectTable',
      'chkAdmin',
      'inputConnFile',
      'connRefresh',
      'disableVerbose',
      'debug',
      'inputSchemaInspectTable',
      'inputTableInspectTable',
      'inputTableTypeInspectTable',
      'inputTableOIDInspectTable',
      'inputHasPrimaryKeyInspectTable'
    ]
  },
  'inspectView-ui': {
    tiles: [
      'ViewInspectView',
      'iconTabFilterBasicInfoInspectView',
      'iconTabFilterColumnsInspectView',
      'iconTabFilterSQLInspectView',
      'iconTabFilterCDSInspectView',
      'iconTabFilterHDBViewInspectView',
      'Schema',
      'schemaInnerInput',
      'settingsButtonInspectView',
      'chkAdmin',
      'inputConnFile',
      'connRefresh',
      'disableVerbose',
      'debug',
      'inputSchemaInspectView',
      'inputViewInspectView',
      'inputViewTypeInspectView',
      'inputViewOIDInspectView'
    ]
  },
  'querySimple-ui': {
    tiles: [
      'FolderQuerySimple',
      'FilenameQuerySimple',
      'outputFormatQuerySimple',
      'schemaInnerInput',
      'settingsButtonQuerySimple',
      'chkAdmin',
      'inputConnFile',
      'connRefresh',
      'disableVerbose',
      'debug'
    ]
  },
  'systeminfo-ui': {
    tiles: [
      'currentUser',
      'currentSchema',
      'databaseVersion',
      'hdbClientVersion',
      'chkAdmin',
      'inputConnFile',
      'connRefresh',
      'disableVerbose',
      'debug'
    ]
  }
};

function generateHotspotAnchor(appUrl, tileId) {
  const selector = {
    value: `DIV[id$='application-${appUrl}-component---App--${tileId}']`,
    rule: 'IdSelectorUI5',
    offset: { x: 0.5, y: 0.2812 }
  };
  const json = JSON.stringify(selector);
  const encoded = Buffer.from(encodeURIComponent(json)).toString('base64');
  return 'WA#2#' + encoded;
}

// Generate anchors for all UIs
Object.keys(uiConfigs).forEach(appUrl => {
  console.log(`\n=== ${appUrl} ===`);
  uiConfigs[appUrl].tiles.forEach(tileId => {
    const anchor = generateHotspotAnchor(appUrl, tileId);
    console.log(JSON.stringify({ id: tileId, anchor }));
  });
});
