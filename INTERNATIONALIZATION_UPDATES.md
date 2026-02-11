# Internationalization Updates - UI5 Application

## Overview

This document describes the comprehensive internationalization (i18n) updates made to the UI5 application to replace hardcoded English strings with translatable text entries loaded dynamically from the central translation files.

## Translation Files Updated

### 1. `_i18n/messages.properties` (English)

Added 14 new error-related translation keys:

- `error.handlerInvalid` = Handler called without a valid controller
- `error.handlerAction` = Pressed from {0}
- `error.handlerException` = An error occurred while processing the action
- `error.connectionFailed` = Failed to establish connection
- `error.modelNotFound` = Model not found
- `error.hanaModelNotFound` = HANA model not found
- `error.logModelNotFound` = Log model not found
- `error.initializationFailed` = Failed to initialize {0}
- `error.controlNotFound` = {0} control not found
- `error.commandNotConfigured` = Command not configured
- `error.httpError` = HTTP {0}: Internal Server Error
- `error.processingMessage` = Error processing WebSocket message
- `error.generic` = An error occurred
- `error.appInitFailed` = Failed to initialize application

### 2. `_i18n/messages_de.properties` (German)

Added German translations for all 14 new error-related keys above.

### 3. UI Bundle Files (English and German)

Centralized UI5 application bundles were added under `_i18n` and served via `/i18n`:

- `systemInfo.properties` and `systemInfo_de.properties`
- `tables.properties` and `tables_de.properties`
- `inspect.properties` and `inspect_de.properties`
- `massConvert.properties` and `massConvert_de.properties`

## Code Files Updated

### 1. `app/resources/common/controller/handler.js`

**Changes:** Replaced hardcoded error messages with i18n keys

- "Handler called without a valid controller" → `error.handlerInvalid`
- "Pressed from {controllerName}" → `error.handlerAction` (with parameter substitution)
- "An error occurred while processing the action" → `error.handlerException`

### 2. `app/resources/common/controller/BaseController.js`

**Changes:** Updated error fallback messages to use i18n

- "An error occurred" → `error.generic`

### 3. `app/resources/massConvert/controller/App.controller.js`

**Changes:** Added I18N_KEYS object and replaced hardcoded strings

- Added 5 new i18n key mappings
- "Log model not found" → `error.logModelNotFound`
- "Error processing WebSocket message:" → `error.processingMessage`
- "Failed to establish connection" → `error.connectionFailed`
- "Output model not found" → `error.modelNotFound`

### 4. `app/resources/massConvert/Component.js`

**Changes:** Updated error handling to use i18n

- "Log model not found in Component initialization" → `error.logModelNotFound`

### 5. `app/resources/systemInfo/controller/App.controller.js`

**Changes:** Replaced hardcoded error messages

- "HANA model not found" → `error.hanaModelNotFound`
- "Failed to initialize systemInfo controller:" → `error.initializationFailed` with parameter

### 6. `app/resources/inspect/controller/App.controller.js`

**Changes:** Added I18N_KEYS and replaced error messages

- "Failed to initialize application" → `error.appInitFailed`

### 7. `app/resources/inspect/controller/querySimple-ui.controller.js`

**Changes:** Added I18N_KEYS object and error handling

- "Command not configured" → `error.commandNotConfigured`
- "HTTP {status}: Internal Server Error" → `error.httpError` (with parameter)

### 8. `app/resources/inspect/controller/inspectTable-ui.controller.js`

**Changes:** Added I18N_KEYS and parameterized error messages

- "TableInspectTable control not found" → `error.controlNotFound` (with parameter)
- "Command not configured" → `error.commandNotConfigured`
- "HTTP {status}: Internal Server Error" → `error.httpError` (with parameter)

### 9. `app/resources/inspect/controller/inspectView-ui.controller.js`

**Changes:** Added I18N_KEYS and parameterized error messages

- "ViewInspectView control not found" → `error.controlNotFound` (with parameter)
- "Command not configured" → `error.commandNotConfigured`
- "HTTP {status}: Internal Server Error" → `error.httpError` (with parameter)

### 10. `app/resources/tables/controller/App.controller.js`

**Changes:** Added I18N_KEYS object

- "HTTP {status}: Internal Server Error" → `error.httpError` (with parameter)

## i18n Implementation Pattern

All controllers follow this pattern for internationalization:

```javascript
// Define translation keys
const I18N_KEYS = {
    ERROR_KEY: "error.specificError",
    // ... more keys
};

// In methods:
const resourceBundle = this.getResourceBundle();
const message = resourceBundle.getText(I18N_KEYS.ERROR_KEY, [param]);
MessageToast.show(message);
```

## Benefits

1. **Complete Localization Support**: All user-facing error messages can now be easily translated
2. **Centralized Management**: All messages are managed in one place per language
3. **Parameterized Messages**: Support for dynamic substitution (e.g., control names, HTTP status codes)
4. **Consistent Pattern**: All controllers follow the same i18n pattern
5. **Easy Maintenance**: Adding new messages requires only updating the property files
6. **Multi-language Ready**: German translations already included; easy to add more languages

## How to Add New Translations

1. Add new key-value pair to `_i18n/messages.properties`
2. Add corresponding German translation to `_i18n/messages_de.properties`
3. Reference the key in your JavaScript code using `resourceBundle.getText("key.name")`
4. For parameterized messages, pass an array as the second parameter

## How to Add New Languages

1. Create a new properties file: `_i18n/messages_[language_code].properties`
2. Copy all entries from `messages.properties` and translate them
3. The framework will automatically use the correct language based on user locale

## Testing Recommendations

- Test with both English and German language settings
- Verify that error messages appear with correct translations
- Check parameterized messages with different values
- Test console logging to ensure non-user-facing logs still function correctly
