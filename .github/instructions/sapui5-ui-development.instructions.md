---
description: "Use when creating or updating SAPUI5 user interfaces in app/resources/. Enforces consistent component structure, controller patterns, view conventions, model usage, internationalization, and integration with the common UI framework. Ensures new UIs follow established patterns for reusability, maintainability, and consistent user experience."
applyTo: "app/resources/**/Component.js,app/resources/**/controller/*.js,app/resources/**/view/*.xml,app/resources/**/manifest.json,app/resources/**/index.html"
---

# SAPUI5 UI Development Guidelines

Use this guide when creating or modifying SAPUI5 user interfaces in the `app/resources/` directory.

## Scope and Purpose

This guide applies to all UI components in `app/resources/`. Each feature area (e.g., `systemInfo`, `inspect`, `tables`) is a self-contained SAPUI5 application that follows common patterns and extends shared base components from `app/resources/common/`.

## Critical Principles

1. **Consistency**: All UI components follow the same structural pattern and inheritance model.
2. **Reusability**: Extend `sap.hanacli.common.controller.BaseController` for all controllers.
3. **Internationalization**: All user-facing text comes from i18n resource bundles.
4. **Type Safety**: Use JSDoc comments and structured error handling.
5. **Shared Resources**: Leverage common fragments, models, and utilities.
6. **Responsive Design**: Support desktop, tablet, and phone device types.
7. **Theme Support**: Include dark mode detection and Fiori 3 theme variants.
8. **Namespace Convention**: All components use `sap.hanacli.*` namespace.

## Folder Structure Template

Each UI component follows this structure:

```
app/resources/<featureName>/
├── Component.js           # Component definition extending common.Component
├── manifest.json          # Application descriptor with routing, models, i18n
├── index.html             # Bootstrap HTML with UI5 CDN and dark mode detection
├── controller/
│   └── App.controller.js  # Main controller extending BaseController
└── view/
    └── App.view.xml       # Main view with responsive layout
```

## Component Definition (Component.js)

Every component extends the common base component:

```javascript
sap.ui.define([
    "sap/hanacli/common/Component"
], function (UIComponent) {
    "use strict";

    return UIComponent.extend("sap.hanacli.<featureName>.Component", {

        metadata: {
            manifest: "json"
        },

        init: function () {
            this.superInit();
        }
    });
});
```

**Rules:**
- Always extend `sap.hanacli.common.Component`
- Use `this.superInit()` to call base component initialization
- Set `manifest: "json"` in metadata
- Namespace format: `sap.hanacli.<featureName>.Component`
- Minimal logic here - delegate to controllers

## Controller Pattern (controller/*.js)

All controllers extend `BaseController` which provides common functionality:

```javascript
sap.ui.define([
    "sap/hanacli/common/controller/BaseController"
], function (BaseController) {
    "use strict";

    const I18N_KEYS = {
        ERROR_INIT: "error.appInitFailed",
        ERROR_LOAD: "error.loadDataFailed"
    };

    return BaseController.extend("sap.hanacli.<featureName>.controller.App", {

        onInit: function () {
            try {
                // Initialize HANA connection status
                this.getHanaStatus();

                // Get and configure models
                const hanaModel = this.getModel("hanaModel");
                if (!hanaModel) {
                    const resourceBundle = this.getResourceBundle();
                    console.error(resourceBundle.getText(I18N_KEYS.ERROR_INIT));
                    return;
                }

                // Bind model to view
                this.getView().setModel(hanaModel);
                
                // Load initial data
                this.loadData();
            } catch (error) {
                const resourceBundle = this.getResourceBundle();
                const errorMsg = resourceBundle.getText(I18N_KEYS.ERROR_INIT);
                console.error(errorMsg + ":", error);
                this.showErrorMessage(errorMsg);
            }
        },

        loadData: async function () {
            try {
                await this.updatePrompts();
                const url = "/api/endpoint";
                
                const data = await new Promise((resolve, reject) => {
                    jQuery.ajax({
                        url: url,
                        method: "GET",
                        dataType: "json",
                        success: resolve,
                        error: reject
                    });
                });
                
                this.processData(data);
            } catch (error) {
                this.onErrorCall(error);
            }
        },

        processData: function (data) {
            const model = this.getModel("hanaModel");
            model.setProperty("/data", data);
        }
    });
});
```

**Rules:**
- Always extend `sap.hanacli.common.controller.BaseController`
- Define `I18N_KEYS` constant at top for all i18n keys used
- Use try/catch in `onInit` with proper error messaging
- Call `this.getHanaStatus()` for DB-connected UIs
- Use `this.getResourceBundle()` to access i18n texts
- Use `jQuery.ajax` wrapped in Promise for async API calls
- Use `this.onErrorCall(error)` for centralized error handling

### BaseController Inherited Methods

Your controller automatically has access to these methods:

- `getRouter()` - Returns the component router
- `getModel(sName)` - Gets a named model from the view
- `setModel(oModel, sName)` - Sets a named model on the view
- `getResourceBundle()` - Gets the i18n resource bundle
- `onNavBack()` - Navigates back in history
- `updatePrompts()` - Updates prompts model via API
- `getPrompts()` - Retrieves prompts from API
- `getHanaStatus()` - Checks HANA database status
- `onErrorCall(error)` - Centralized error handling
- `loadSchemaFilter()` - Loads schema suggestions
- `openUrl(url, newTab)` - Opens URLs with URLHelper

## View Definition (view/*.xml)

Views use XML notation with responsive layout patterns:

```xml
<mvc:View controllerName="sap.hanacli.<featureName>.controller.App" 
    height="100%" width="100%"
    xmlns:l="sap.ui.layout"
    xmlns:f="sap.ui.layout.form"
    xmlns:mvc="sap.ui.core.mvc"
    xmlns:core="sap.ui.core"
    xmlns="sap.m">
    
    <ScrollContainer
        id="scrollContainer"
        height="100%"
        width="100%"
        vertical="true"
        focusable="true">
        
        <f:SimpleForm 
            id="mainForm" 
            editable="false" 
            layout="ResponsiveGridLayout" 
            labelSpanXL="4" 
            labelSpanL="3" 
            labelSpanM="4" 
            labelSpanS="12" 
            adjustLabelSpan="false" 
            emptySpanXL="0" 
            emptySpanL="4" 
            emptySpanM="0" 
            emptySpanS="0" 
            columnsXL="2" 
            columnsL="1" 
            columnsM="1"
            ariaLabelledBy="titleMain">
            
            <f:toolbar>
                <Toolbar id="toolbarMain">
                    <Title id="titleMain" text="{i18n>appTitle}"/>
                    <ToolbarSpacer id="spacer1" />
                </Toolbar>
            </f:toolbar>
            
            <f:content>
                <Label id="labelField1" text="{i18nReuse>fieldLabel}" />
                <Input id="inputField1" value="{/fieldValue}" />
            </f:content>
        </f:SimpleForm>

        <Table id="dataTable" items="{/data}">
            <headerToolbar>
                <OverflowToolbar id="tableToolbar">
                    <Title id="titleTable" text="{i18n>tableTitle}" level="H2"/>
                    <ToolbarSpacer id="spacer2"/>
                </OverflowToolbar>
            </headerToolbar>
            <columns>
                <Column id="colName" width="12em">
                    <Text id="textHeaderName" text="{i18nReuse>name}" />
                </Column>
                <Column id="colValue" minScreenWidth="Tablet" demandPopin="true">
                    <Text id="textHeaderValue" text="{i18nReuse>value}" />
                </Column>
            </columns>
            <items>
                <ColumnListItem id="dataItem">
                    <cells>
                        <Text id="textName" text="{NAME}" />
                        <ObjectIdentifier id="objValue" title="{VALUE}" />
                    </cells>
                </ColumnListItem>
            </items>
        </Table>
    </ScrollContainer>
</mvc:View>
```

**Rules:**
- Set `controllerName` to full controller path
- Always include `height="100%" width="100%"`
- Declare all xmlns namespaces at the top
- Use semantic control IDs (prefix with control type)
- Use `{i18n>key}` for feature-specific texts
- Use `{i18nReuse>key}` for common/reusable texts
- Wrap scrollable content in `ScrollContainer`
- Use `ResponsiveGridLayout` for forms with configured spans
- Include `ariaLabelledBy` attributes for accessibility
- Use `ToolbarSpacer` for toolbar layout
- Set `minScreenWidth="Tablet" demandPopin="true"` for responsive columns

### Common View Patterns

**Form with Sections:**
```xml
<f:SimpleForm layout="ResponsiveGridLayout">
    <f:toolbar>
        <Toolbar>
            <Title text="{i18n>sectionTitle}"/>
        </Toolbar>
    </f:toolbar>
    <f:content>
        <Label text="{i18nReuse>label}"/>
        <Input value="{/field}"/>
    </f:content>
</f:SimpleForm>
```

**Table with Items:**
```xml
<Table items="{/items}">
    <headerToolbar>
        <OverflowToolbar>
            <Title text="{i18n>title}" level="H2"/>
        </OverflowToolbar>
    </headerToolbar>
    <columns><!-- columns here --></columns>
    <items><!-- items template here --></items>
</Table>
```

## Manifest Configuration (manifest.json)

The manifest defines routing, models, dependencies, and i18n:

```json
{
    "_version": "1.33.0",
    "sap.app": {
        "id": "sap.hanacli.<featureName>",
        "type": "application",
        "i18n": "/i18n/<featureName>.properties",
        "applicationVersion": {
            "version": "1.0.0"
        },
        "title": "{{appTitle}}",
        "description": "{{appDescription}}"
    },

    "sap.ui": {
        "technology": "UI5",
        "icons": {
            "icon": "/ui/common/images/favicon.ico",
            "favIcon": "/ui/common/images/favicon.ico"
        },
        "deviceTypes": {
            "desktop": true,
            "tablet": true,
            "phone": true
        }
    },

    "sap.ui5": {
        "resourceRoots": {
            "sap.hanacli.common": "../common"
        },
        "flexEnabled": true,
        "rootView": {
            "viewName": "sap.hanacli.<featureName>.view.App",
            "type": "XML",
            "async": true,
            "id": "App"
        },
        "dependencies": {
            "minUI5Version": "1.91.0",
            "libs": {
                "sap.ui.core": {},
                "sap.m": {},
                "sap.ui.layout": {}
            }
        },
        "contentDensities": {
            "compact": true,
            "cozy": true
        },
        "models": {
            "hanaModel": {
                "type": "sap.ui.model.json.JSONModel",
                "settings": {
                    "defaultBindingMode": "TwoWay"
                }
            },
            "config": {
                "type": "sap.ui.model.json.JSONModel"
            },
            "i18n": {
                "type": "sap.ui.model.resource.ResourceModel",
                "settings": {
                    "bundleUrl": "/i18n/<featureName>.properties"
                }
            },
            "i18nReuse": {
                "type": "sap.ui.model.resource.ResourceModel",
                "settings": {
                    "bundleUrl": "/i18n/messages.properties"
                }
            }
        },
        "resources": {
            "css": [{
                "uri": "../common/css/style.css"
            }]
        },
        "routing": {
            "config": {
                "routerClass": "sap.m.routing.Router",
                "viewType": "XML",
                "async": true,
                "viewPath": "sap.hanacli.<featureName>.view",
                "controlAggregation": "pages",
                "controlId": "app",
                "clearControlAggregation": false
            },
            "routes": [{
                "name": "RouteApp",
                "pattern": "RouteApp",
                "target": ["TargetApp"]
            }],
            "targets": {
                "TargetApp": {
                    "viewType": "XML",
                    "transition": "slide",
                    "clearControlAggregation": false,
                    "viewId": "App",
                    "viewName": "App"
                }
            }
        }
    }
}
```

**Rules:**
- Use namespace `sap.hanacli.<featureName>` for app ID
- Always include two i18n models: `i18n` (feature-specific) and `i18nReuse` (common)
- Set `resourceRoots` to include `sap.hanacli.common: "../common"`
- Primary model is `hanaModel` with `TwoWay` binding
- Include `config` model for UI state management
- Support all device types: desktop, tablet, phone
- Reference common CSS: `../common/css/style.css`
- Set `minUI5Version` to at least `1.91.0`
- Set `flexEnabled: true` for UI adaptations
- Use semantic routing with `RouteApp` pattern

## Bootstrap HTML (index.html)

Each feature has an `index.html` that bootstraps the UI5 application:

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link type="image/x-icon" href="../common/images/favicon.ico" rel="shortcut icon">
        <link type="image/x-icon" href="../common/images/favicon.ico" rel="icon">
        <title data-i18n-key="html.title.<featureName>">Feature Title</title>
        <script id="sap-ui-bootstrap"
            src="https://ui5.sap.com/resources/sap-ui-core.js"
            data-sap-ui-theme="sap_fiori_3"
            data-sap-ui-resourceroots='{
                "sap.hanacli.<featureName>": "./", 
                "sap.hanacli.common": "../common",
                "common": "../common",
                "root": "./",
                "view": "./view"
            }'
            data-sap-ui-xx-bindingSyntax="complex"
            data-sap-ui-compatVersion="edge"
            data-sap-ui-oninit="module:common/index"
            data-sap-ui-async="true"
            data-sap-ui-language="en"
            data-sap-ui-frameOptions="trusted">
        </script>
        <script>
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                sap.ui.getCore().applyTheme("sap_fiori_3_dark") 
            }
        </script>
    </head>
    <body class="sapUiBody" role="application">
        <div id="content"></div>
    </body>
</html>
```

**Rules:**
- Use UI5 CDN: `https://ui5.sap.com/resources/sap-ui-core.js`
- Default theme: `sap_fiori_3`
- Include dark mode detection script
- Configure resource roots for feature and common namespaces
- Set `data-sap-ui-oninit="module:common/index"` for initialization
- Use `data-sap-ui-async="true"` for performance
- Include viewport meta tag for responsive design
- Link to common favicon
- Set `data-i18n-key` attribute on title for localization

## Internationalization (i18n)

All text must come from i18n resource bundles:

### Feature-Specific Bundle (`/i18n/<featureName>.properties`)

Create feature-specific texts:

```properties
appTitle=System Info
appDescription=Display SAP HANA system information
sectionTitle=Current Session
tableTitle=System Overview
error.appInitFailed=Failed to initialize the application
error.loadDataFailed=Failed to load data from server
```

### Common/Reusable Bundle (`/i18n/messages.properties`)

Reference existing common texts:

```properties
gui.conn=Connection
user=User
schema=Schema
host=Host
version=Version
name=Name
value=Value
section=Section
status=Status
```

**Rules:**
- Use `{i18n>key}` for feature-specific texts in views
- Use `{i18nReuse>key}` for common texts in views
- Use `this.getResourceBundle()` in controllers for `i18n` model
- Use dot notation for namespacing: `error.`, `gui.`, etc.
- Always check reusable texts before creating new ones
- Keep keys lowercase with dots separating levels

## Common Fragments

Leverage shared fragments from `app/resources/common/view/`:

### Connection Fragment

```javascript
// In controller onInit or onBeforeRendering
if (!this.connectionDialog) {
    this.connectionDialog = await Fragment.load({
        id: this.getView().getId(),
        name: "sap.hanacli.common.view.Connection",
        controller: this
    });
    this.getView().addDependent(this.connectionDialog);
}
```

Available common fragments:
- `Connection.fragment.xml` - Connection settings dialog
- `BusyDialog.fragment.xml` - Loading indicator
- `Debug.fragment.xml` - Debug information panel

**Rules:**
- Load fragments asynchronously using `Fragment.load()`
- Cache fragment instances in controller properties
- Add fragments as dependents: `this.getView().addDependent(fragment)`
- Pass controller as context for event handlers

## Model Usage

### JSONModel Patterns

Primary model usage for data binding:

```javascript
// Create model
const oModel = new JSONModel({
    user: "",
    schema: "",
    data: [],
    config: {
        showDetails: false
    }
});

// Set model on view
this.setModel(oModel, "hanaModel");

// Get model
const model = this.getModel("hanaModel");

// Set property
model.setProperty("/user", "SYSTEM");
model.setProperty("/data", resultsArray);

// Get property
const user = model.getProperty("/user");

// Refresh bindings
model.refresh();
```

**Rules:**
- Use `JSONModel` for all application data
- Name primary data model `hanaModel`
- Use `config` model for UI state
- Use absolute paths starting with `/` for property access
- Call `model.refresh()` after programmatic changes if needed
- Default binding mode: `TwoWay` for `hanaModel`

## Error Handling

### Controller Error Handling

```javascript
try {
    // Operation that might fail
    const data = await this.loadData();
    this.processData(data);
} catch (error) {
    // Use centralized error handler from BaseController
    this.onErrorCall(error);
    
    // Or handle specifically with i18n
    const resourceBundle = this.getResourceBundle();
    const errorMsg = resourceBundle.getText("error.operationFailed");
    console.error(errorMsg + ":", error);
    this.showErrorMessage(errorMsg);
}
```

### AJAX Error Handling

```javascript
const data = await new Promise((resolve, reject) => {
    jQuery.ajax({
        url: "/api/endpoint",
        method: "GET",
        dataType: "json",
        success: resolve,
        error: reject
    });
});
```

**Rules:**
- Always wrap risky operations in try/catch
- Use `this.onErrorCall(error)` for standard error handling
- Log errors with i18n messages to console
- Show user-friendly error messages via MessageBox or MessageToast
- Include error context in console logs
- Handle Promise rejections in async operations

## Naming Conventions

### Namespaces
- All components: `sap.hanacli.<featureName>`
- Common components: `sap.hanacli.common`

### Files
- Component: `Component.js`
- Controllers: `<ViewName>.controller.js` (e.g., `App.controller.js`)
- Views: `<ViewName>.view.xml` (e.g., `App.view.xml`)
- Manifest: `manifest.json`
- Bootstrap: `index.html`

### IDs (Views)
Use semantic prefixes:
- Forms: `form<Name>` (e.g., `formMain`)
- Inputs: `input<FieldName>` (e.g., `inputUser`)
- Labels: `label<FieldName>` (e.g., `labelUser`)
- Buttons: `btn<Action>` (e.g., `btnRefresh`)
- Tables: `table<Name>` or `<name>Table` (e.g., `dataTable`)
- Columns: `col<FieldName>` (e.g., `colName`)
- Titles: `title<Section>` (e.g., `titleMain`)
- Toolbars: `toolbar<Name>` (e.g., `toolbarMain`)
- Spacers: `spacer<Number>` (e.g., `spacer1`)
- Text: `text<Purpose>` (e.g., `textHeaderName`)

### Variables (Controllers)
- Models: `<name>Model` (e.g., `hanaModel`, `promptsModel`)
- Data results: descriptive names (e.g., `userData`, `schemaList`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `I18N_KEYS`)
- UI controls: `o<ControlType>` (e.g., `oTable`, `oDialog`)

## API Integration Patterns

### GET Request
```javascript
loadData: async function () {
    try {
        await this.updatePrompts();
        const url = "/api/endpoint";
        
        const myJSON = await new Promise((resolve, reject) => {
            jQuery.ajax({
                url: url,
                method: "GET",
                dataType: "json",
                success: resolve,
                error: reject
            });
        });
        
        this.onLoadComplete(myJSON);
    } catch (error) {
        this.onErrorCall(error);
    }
}
```

### PUT Request
```javascript
saveData: async function () {
    try {
        const model = this.getModel("hanaModel");
        const data = model.getData();
        const url = "/api/endpoint";

        await new Promise((resolve, reject) => {
            jQuery.ajax({
                url: url,
                contentType: 'application/json',
                method: "PUT",
                data: JSON.stringify(data),
                dataType: "json",
                success: resolve,
                error: reject
            });
        });
        
        MessageToast.show("Data saved successfully");
    } catch (error) {
        this.onErrorCall(error);
    }
}
```

**Rules:**
- Use `jQuery.ajax` for HTTP requests
- Wrap AJAX calls in Promises for async/await syntax
- Always call `await this.updatePrompts()` before data operations
- Set `contentType: 'application/json'` for PUT/POST
- Use `JSON.stringify()` for complex data payloads
- Set `dataType: "json"` for expected JSON responses
- Handle errors through try/catch and `this.onErrorCall()`

## Creating a New UI Feature

Follow these steps to create a new UI feature:

### 1. Create Folder Structure
```
app/resources/<newFeature>/
├── controller/
│   └── App.controller.js
├── view/
│   └── App.view.xml
├── Component.js
├── manifest.json
└── index.html
```

### 2. Copy and Adapt Files

Start with an existing similar feature (e.g., `systemInfo`) and:

1. **Component.js**: Update namespace to `sap.hanacli.<newFeature>`
2. **manifest.json**: Update all instances of feature name in:
   - `sap.app.id`
   - `sap.app.i18n`
   - `sap.ui5.rootView.viewName`
   - `sap.ui5.models.i18n.settings.bundleUrl`
   - `sap.ui5.routing.config.viewPath`
3. **index.html**: Update:
   - `data-i18n-key` on title
   - Resource roots in bootstrap
4. **App.controller.js**: Update namespace
5. **App.view.xml**: Update `controllerName`

### 3. Create i18n Properties File

Add `/i18n/<newFeature>.properties` with required keys.

### 4. Implement Business Logic

- Add data loading methods to controller
- Configure view layout and controls
- Wire up event handlers
- Test with backend API routes

### 5. Integration

Register the new UI in the main application navigation/router.

## Common Patterns and Best Practices

### Loading Data on Init
```javascript
onInit: function () {
    try {
        this.getHanaStatus();
        const hanaModel = this.getModel("hanaModel");
        this.getView().setModel(hanaModel);
        this.loadInitialData();
    } catch (error) {
        this.onErrorCall(error);
    }
}
```

### Updating Model Data
```javascript
onDataReceived: function (data) {
    const model = this.getModel("hanaModel");
    model.setProperty("/results", data);
    model.setProperty("/count", data.length);
}
```

### Using Prompts Model
```javascript
// Get prompts from backend
await this.getPrompts();
const promptsModel = this.getModel("promptsModel");

// Set default values if not present
if (!promptsModel.getProperty("/schema")) {
    promptsModel.setProperty("/schema", "**CURRENT_SCHEMA**");
}

// Update prompts to backend
await this.updatePrompts();
```

### Schema Suggestions
```javascript
// Load schema filter (inherited from BaseController)
await this.loadSchemaFilter();

// Custom handling after load
onLoadSchemaFilter: function (schemas) {
    const oSearchControl = this.getView().byId("schemaInput");
    if (!oSearchControl) return;
    
    oSearchControl.destroySuggestionItems();
    schemas.forEach(schema => {
        oSearchControl.addSuggestionItem(new Item({
            text: schema.SCHEMA_NAME
        }));
    });
}
```

### Opening External Links
```javascript
onLinkPress: function () {
    const url = "https://example.com";
    this.openUrl(url, true); // true = open in new tab
}
```

### Downloading Data
```javascript
downloadExcel: function () {
    window.open("/excel");
}
```

## Checklist for New UI Components

When creating a new UI component, verify:

- [ ] Component extends `sap.hanacli.common.Component`
- [ ] Controller extends `sap.hanacli.common.controller.BaseController`
- [ ] All namespaces use `sap.hanacli.<featureName>` pattern
- [ ] `manifest.json` includes both `i18n` and `i18nReuse` models
- [ ] `manifest.json` includes `hanaModel` and `config` models
- [ ] `index.html` includes dark mode detection script
- [ ] `index.html` resource roots configured correctly
- [ ] All view control IDs follow semantic naming conventions
- [ ] All text uses i18n binding (`{i18n>key}` or `{i18nReuse>key}`)
- [ ] Error handling uses try/catch and `this.onErrorCall()`
- [ ] `I18N_KEYS` constant defined for all i18n keys in controller
- [ ] AJAX calls wrapped in Promises for async/await
- [ ] Form layouts use `ResponsiveGridLayout` with proper spans
- [ ] Tables include responsive columns with `demandPopin`
- [ ] Accessibility attributes included (ariaLabelledBy, etc.)
- [ ] Common CSS linked: `../common/css/style.css`
- [ ] JSDoc comments on all public controller methods

## Anti-Patterns to Avoid

**DON'T:**
- Hard-code text strings in views or controllers
- Create controllers without extending `BaseController`
- Use synchronous AJAX calls
- Ignore error handling in async operations
- Mix absolute and relative resource paths
- Create new common texts when reusable ones exist
- Use OData models (this project uses REST APIs with JSONModel)
- Use UI5 versions below 1.91.0
- Forget to call `this.getHanaStatus()` for DB-connected UIs
- Create duplicate functionality that exists in BaseController

**DO:**
- Always use i18n for user-facing text
- Leverage BaseController inherited methods
- Use semantic control IDs
- Test on multiple device sizes
- Reuse common fragments
- Follow established naming conventions
- Use JSONModel with RESTful APIs
- Include comprehensive JSDoc comments
- Handle all error scenarios gracefully

## Testing Your UI

### Manual Testing Checklist

1. **Functionality**
   - [ ] All controls load without errors
   - [ ] Data loads from API successfully
   - [ ] User interactions work as expected
   - [ ] Error scenarios handled gracefully

2. **Responsive Design**
   - [ ] Test on desktop (full screen)
   - [ ] Test on tablet (medium screen)
   - [ ] Test on phone (small screen)
   - [ ] Verify popin columns work on small screens

3. **Themes**
   - [ ] Light mode (sap_fiori_3)
   - [ ] Dark mode (sap_fiori_3_dark)
   - [ ] Theme switches correctly based on system preference

4. **Internationalization**
   - [ ] All texts display correctly
   - [ ] No hard-coded strings visible
   - [ ] Error messages show in proper language

5. **Accessibility**
   - [ ] Screen reader compatibility
   - [ ] Keyboard navigation works
   - [ ] ARIA labels present and correct

## Examples and References

### Example Components to Reference

- `app/resources/systemInfo/` - Simple read-only info display
- `app/resources/inspect/` - Complex multi-view with prompts
- `app/resources/tables/` - Multiple related views
- `app/resources/massConvert/` - Data manipulation and updates
- `app/resources/common/` - Base classes and shared resources

### External Documentation

- SAPUI5 Documentation: https://ui5.sap.com/
- Fiori Design Guidelines: https://experience.sap.com/fiori-design/
- Icon Explorer: https://ui5.sap.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html

## Summary

This guide ensures all SAPUI5 UIs in the project maintain consistency, reusability, and quality. When in doubt:

1. Examine existing similar components
2. Extend `BaseController` - don't reinvent
3. Use i18n for ALL user-facing text
4. Follow semantic naming conventions
5. Handle errors comprehensively
6. Test responsively across devices

By following these patterns, new UI features integrate seamlessly with the existing application architecture and provide a consistent user experience.
