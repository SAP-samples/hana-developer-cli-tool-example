# hana-cli Web Applications

This folder contains the web-based user interface for hana-cli, built using SAP UI5 and the Fiori Launchpad. The web interface exposes all CLI functionality through an intuitive browser-based interface, making database operations accessible to users who prefer graphical interfaces over command-line interactions.

## Overview

The web application is automatically launched when using CLI commands with the `-w` or `--web` flag. It runs on `http://localhost:3010` by default (configurable via the `--port` parameter).

**Example:**

```shell
hana-cli tables -w
```

## Architecture

The application is built using:

- **SAP UI5 Framework** (version 1.144.1) - Enterprise-grade JavaScript framework
- **Fiori Launchpad** - Provides unified navigation and app management
- **WebSockets** - For real-time communication with the hana-cli backend
- **SAP Digital Foundation Adapter (DFA)** - Integrated help and documentation

## Folder Structure

### `/resources`

The main resources folder contains all UI5 applications and shared components.

#### Core Files

- **`index.html`** - Main entry point for the Fiori Launchpad
  - Loads UI5 framework from CDN (<https://ui5.sap.com/1.144.1/>)
  - Configures the Fiori Launchpad sandbox environment
  - Supports both light and dark themes (auto-detected based on system preferences)
  - Registers resource roots for all UI5 applications

- **`init.js`** - Initialization script for the Launchpad
  - Creates and renders the Fiori shell container
  - Configures flexibility services for UI adaptation
  - Sets up session storage connector for personalization

- **`WebAssistant.js`** - SAP Enable Now Web Assistant integration
  - Provides contextual help and guided tours
  - Loads from SAP productive environment
  - Enables in-app learning and documentation

- **`favicon.ico`** - Application icon displayed in browser tabs

#### `/resources/common`

Shared UI5 components used across all applications:

**Controllers:**

- `BaseController.js` - Base class with common functionality for all app controllers
- `handler.js` - Shared event handlers and utility functions

**Views (XML Fragments):**

- `BusyDialog.fragment.xml` - Loading indicator dialog
- `Connection.fragment.xml` - Database connection configuration UI
- `Debug.fragment.xml` - Debug information display

**Models:**

- `models.js` - Shared data models and model creation utilities

**Additional Resources:**

- `Component.js` - Reusable component definition
- `index.js` - Common module exports
- `/css` - Shared stylesheets
- `/images` - Common images and icons
- `/view` - Additional shared view fragments
- `/model` - Extended model definitions
- `/controller` - Additional shared controllers

#### `/resources/inspect`

**Application ID:** `sap.hanacli.inspect`  
**Purpose:** Inspect individual database objects in detail

This UI5 application provides detailed inspection capabilities for database objects:

**Features:**

- Inspect table structures, columns, and metadata
- Inspect view definitions and columns
- Execute and analyze SQL queries
- View object properties and attributes
- Export inspection results in multiple formats

**Key Files:**

- `Component.js` - Application component definition
- `manifest.json` - Application descriptor with configuration
- `index.html` - Standalone app entry point
- `/controller` - Controller logic for inspection views
- `/view` - XML views for inspection interfaces
- `/i18n/inspect.properties` - Localized text strings
- `/i18n/inspect_de.properties` - German translations

**Routes:**

- `#inspectTable-ui` - Inspect table details
- `#inspectView-ui` - Inspect view details
- `#querySimple-ui` - Execute SQL queries

#### `/resources/massConvert`

**Application ID:** `sap.hanacli.massConvert`  
**Purpose:** Bulk conversion of database tables to various formats

This application enables mass conversion of database tables to different formats:

**Features:**

- Convert multiple tables simultaneously
- Support for CDS (Core Data Services) format
- Generate `.hdbtable` files for HDI deployments
- Generate `.hdbmigrationtable` files for migrations
- Real-time progress tracking via WebSocket
- Configurable output options (HANA types, catalog definitions)
- Export to local folder

**Configuration Options:**

- Output format selection (CDS, HDBTable, HDBMigrationTable)
- Use HANA-specific data types
- Use "pure" catalog definitions
- Target folder specification
- Connection parameter override

**Key Files:**

- `Component.js` - Application component
- `manifest.json` - Application configuration
- `index.html` - Standalone entry point
- `/controller` - Conversion logic and UI controllers
- `/view` - UI layouts and forms
- `/i18n/massConvert.properties` - Localized text strings
- `/i18n/massConvert_de.properties` - German translations

**Routes:**

- `#massconvert-ui` - Mass conversion interface

#### `/resources/systemInfo`

**Application ID:** `sap.hanacli.systemInfo`  
**Purpose:** Display current HANA system and connection information

Provides comprehensive system information about the connected HANA database:

**Features:**

- Current session details
- Database version information
- System ID and configuration
- Database name and host
- Start time and uptime
- System status overview
- Connection parameters

**Key Files:**

- `Component.js` - Application component
- `manifest.json` - Configuration
- `index.html` - Entry point
- `/controller` - System info display logic
- `/view` - System information views
- `/i18n/systemInfo.properties` - Text resources
- `/i18n/systemInfo_de.properties` - German translations

**Routes:**

- `#systeminfo-ui` - System information dashboard

#### `/resources/tables`

**Application ID:** `sap.hanacli.tables`  
**Purpose:** List and browse database objects (tables, views, schemas, containers, etc.)

The primary application for browsing and listing all types of database objects:

**Features:**

- List all tables in the current schema
- List all views and calculation views
- Browse all schemas
- Display HDI containers
- Show HANA data types
- List database functions
- Display indexes
- Cloud Foundry service instance listings:
  - HDI service instances
  - SBSS (Schema & Business Service) instances
  - Schema service instances
  - SecureStore service instances
  - User-Provided Service (UPS) instances

**Key Files:**

- `Component.js` - Application component
- `manifest.json` - Application descriptor
- `index.html` - Entry point
- `/controller` - List display controllers
- `/view` - Table and list views
- `/i18n/tables.properties` - Translations
- `/i18n/tables_de.properties` - German translations

**Routes:**

- `#tables-ui` - List all tables
- `#views-ui` - List all views
- `#schemas-ui` - List all schemas
- `#containers-ui` - List HDI containers
- `#dataTypes-ui` - List HANA data types
- `#functions-ui` - List database functions
- `#indexes-ui` - List database indexes
- `#features-ui` - List HANA features
- `#featureUsage-ui` - List HANA feature usage
- `#hdi-ui` - List HDI service instances (Cloud Foundry)
- `#sbss-ui` - List SBSS service instances
- `#schemaInstances-ui` - List Schema service instances
- `#securestore-ui` - List SecureStore service instances
- `#ups-ui` - List user-provided service instances

### `/i18n`

Internationalization resource bundles served from `/_i18n`.

### `/appconfig`

Contains configuration for the Fiori Launchpad sandbox environment.

- **`fioriSandboxConfig.json`** - Complete Launchpad configuration
  - Defines tile groups and layouts
  - Configures navigation targets
  - Sets up application routes
  - Enables personalization and themes
  - Configures DFA (Digital Foundation Adapter) integration
  - Defines three main tile groups:
    - **List Objects** - Database object listings
    - **Admin** - Administrative functions
    - **CF/XS** - Cloud Foundry and XSA service instances

### `/dfa`

SAP Digital Foundation Adapter (DFA) help content integration.

#### `/dfa/help`

Custom help library for hana-cli with contextual assistance:

**Structure:**

- `library.js` - Help library definition
- `library-preload.js` - Pre-loaded library bundle
- `/catalog` - Help catalog definitions
  - `massconvert-ui.json` - Help for mass convert app
  - `Shell-home.json` - Help for main launchpad
  - `Shell-home!whatsnew.json` - What's new information
- `/context` - Context-sensitive help mappings
- `/utils` - Help utility functions
- `/wpb` - Web page builder resources
  - `/files` - Help content files
  - `/less` - Styling for help content

**Features:**

- Contextual help overlay on UI5 applications
- Guided tours and walkthroughs
- Integration with SAP Enable Now
- What's New announcements
- Product documentation links

## Configuration Files

### `ui5.yaml`

UI5 tooling configuration for development and build:

- **Specification Version:** 1.0
- **Application Name:** test1
- **Type:** Application
- **Default Theme:** sap_fiori_3_dark
- **Server Configuration:**
  - Fiori Tools Proxy middleware for backend connections
  - UI5 version management
  - App reload middleware for hot-reloading
  - Port: 35729
  - Resource paths for UI5 framework

### `ui5-local.yaml`

Local development overrides (automatically loaded when present)

### `.gitignore`

Git ignore rules for generated and temporary files

## Usage

### Starting the Web Interface

1. **From CLI with auto-launch:**

   ```shell
   hana-cli tables -w
   ```

2. **Direct server start:**

   ```shell
   hana-cli serve
   ```

3. **Custom port:**

   ```shell
   hana-cli serve --port 8080
   ```

### Accessing Applications

Once the server is running, navigate to `http://localhost:3010` in your browser.

The Fiori Launchpad will display organized tile groups for:

- Listing database objects (tables, views, schemas, functions, etc.)
- Inspecting individual objects in detail
- Administrative operations
- Cloud Foundry service management
- System information
- Mass conversion utilities

### WebSocket Communication

Applications communicate with the hana-cli backend via WebSocket connections for:

- Real-time data updates
- Long-running operation progress
- Live query results
- Connection status monitoring

## Development

### Local Development Server

For development with hot-reload:

```shell
cd app
ui5 serve
```

The UI5 tooling will start a development server with automatic reloading on file changes.

### Building for Production

```shell
cd app
ui5 build
```

This generates optimized production builds in the `dist/` folder.

### Adding New Applications

To add a new UI5 application:

1. Create a new folder under `/resources`
2. Add `Component.js`, `manifest.json`, and views
3. Register the application in `/appconfig/fioriSandboxConfig.json`
4. Add tiles to appropriate groups
5. Define navigation targets

### Theme Support

The application supports automatic theme detection:

- Light mode: `sap_horizon`
- Dark mode: `sap_horizon_dark`

Theme is auto-selected based on system preferences and can be changed via user settings.

## Integration Points

### Backend API

The web applications communicate with the hana-cli backend through:

- REST API endpoints (documented in [../routes/README.md](../routes/README.md))
- WebSocket connections for real-time updates
- Configuration endpoints for settings management

### HTTP Endpoints

Key endpoints used by web applications:

- `/ui/` - Static UI5 application resources
- `/sap/dfa/help/` - DFA help content
- `/docs/` - Documentation (README, Changelog)
- `/config` - Configuration management
- `/rest/` - Database operation APIs
- WebSocket on the main server port

### Authentication

Currently, authentication is handled through the database connection configured in the CLI. The web interface inherits the same connection and credentials.

## Personalization

Users can personalize the Launchpad:

- Rearrange tiles
- Hide/show tile groups
- Change themes
- Customize content density (compact/cozy)
- Save layouts in session storage

Changes are stored locally in browser session storage.

## Browser Compatibility

Supports modern browsers:

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

Requires JavaScript enabled and WebSocket support.

## Troubleshooting

### Application won't load

- Check that the backend server is running
- Verify port 3010 (or custom port) is not blocked
- Check browser console for errors
- Ensure default-env.json or connection configuration is valid

### WebSocket connection fails

- Verify firewall settings allow WebSocket connections
- Check that the backend server WebSocket endpoint is accessible
- Look for CORS-related errors in browser console

### Tiles not appearing

- Verify `/appconfig/fioriSandboxConfig.json` is valid JSON
- Check that application paths in config match actual folders
- Clear browser cache and reload

### Theme not applying correctly

- Hard refresh the browser (Ctrl+F5 / Cmd+Shift+R)
- Check browser console for CSS loading errors
- Verify UI5 CDN is accessible

## Related Documentation

- [HTTP Routes Documentation](../routes/README.md) - Backend API endpoints
- [Main Project README](../README.md) - Overall project documentation
- [UI5 Documentation](https://ui5.sap.com/) - SAP UI5 framework reference
- [Fiori Design Guidelines](https://experience.sap.com/fiori-design-web/) - SAP Fiori design system
