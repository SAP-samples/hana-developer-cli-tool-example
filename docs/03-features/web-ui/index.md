# Web User Interface

Complete documentation for the HANA CLI web application - a modern SAP UI5-based Fiori interface.

## Quick Start

Launch the Fiori Launchpad web interface:

```bash
hana-cli ui
# Starts server and opens http://localhost:3010/ui/#Shell-home automatically
```

By default, the web server runs on **port 3010**. Change it if needed:

```bash
hana-cli ui --port 3030
```

The server can also be accessed from other machines on your network:

```bash
hana-cli ui --host 0.0.0.0 --port 8080
```

## Overview

The web UI provides a graphical interface to all HANA CLI functionality:

- **Fiori Launchpad** - Unified navigation and app management
- **SAP UI5 Framework** - Enterprise-grade UI components
- **Real-time communication** - WebSocket connection to CLI backend
- **Responsive design** - Works on desktop and tablet devices
- **Light & dark themes** - Auto-detects system preference
- **Integrated help** - SAP Enable Now contextual assistance

## Web Applications

The Fiori Launchpad includes multiple specialized applications:

### Tables & Objects Browser

**Application ID:** `sap.hanacli.tables`  

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

**Additional Features:**

- Search across objects
- View object properties and metadata
- Export object definitions
- Generate SQL statements
- Connection switching

**Available Routes:**

- `#tables-ui` - List all tables
- `#views-ui` - List all views
- `#schemas-ui` - List all schemas
- `#containers-ui` - List HDI containers
- `#certificates-ui` - List system certificates
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

### Inspect Tool

**Application ID:** `sap.hanacli.inspect`  

Provides detailed inspection capabilities for database objects:

**Features:**

- Inspect table structures, columns, and metadata
- Inspect view definitions and columns
- Execute and analyze SQL queries
- View object properties and attributes
- Export inspection results in multiple formats
- Table structure analysis
- View column mapping
- Data type review
- Constraints and indexes
- Column statistics
- Object metadata

**Available Routes:**

- `#inspectTable-ui` - Inspect table details
- `#inspectView-ui` - Inspect view details
- `#querySimple-ui` - Execute SQL queries

### Mass Converter

**Application ID:** `sap.hanacli.massConvert`  

Enables mass conversion of database tables to different formats:

**Features:**

- Convert multiple tables simultaneously
- Support for CDS (Core Data Services) format
- Generate `.hdbtable` files for HDI deployments
- Generate `.hdbmigrationtable` files for migrations
- Real-time progress tracking via WebSocket
- Configurable output options (HANA types, catalog definitions)
- Export to local folder
- Multi-table batch processing

**Configuration Options:**

- Output format selection (CDS, HDBTable, HDBMigrationTable)
- Use HANA-specific data types
- Use "pure" catalog definitions
- Target folder specification
- Connection parameter override

**Available Routes:**

- `#massconvert-ui` - Mass conversion interface

### System Information

**Application ID:** `sap.hanacli.systemInfo`  

Provides comprehensive system information about the connected HANA database:

**Features:**

- Current session details
- Database version information
- System ID and configuration
- Database name and host
- Start time and uptime
- System status overview
- Connection parameters
- Resource usage

**Available Routes:**

- `#systeminfo-ui` - System information dashboard

## Architecture

### Technology Stack

| Component | Purpose | Version |
| --- | --- | --- |
| SAP UI5 | UI Framework | 1.144.1 |
| Fiori Launchpad | App Container | Latest |
| Node.js Express | Backend API | Runtime |
| WebSockets | Real-time comms | Native |
| SAP DFA | Help system | Latest |

### Folder Structure

```bash
app/
├── resources/
│   ├── index.html           # Main Fiori Launchpad entry
│   ├── init.js              # Launchpad initialization
│   ├── WebAssistant.js      # SAP Enable Now integration
│   ├── favicon.ico          # Browser tab icon
│   ├── common/              # Shared components
│   │   ├── BaseController.js
│   │   ├── handler.js
│   │   ├── models.js
│   │   ├── Component.js
│   │   ├── index.js
│   │   ├── css/             # Shared stylesheets
│   │   ├── images/          # Common icons
│   │   ├── view/            # Shared XML fragments
│   │   │   ├── BusyDialog.fragment.xml
│   │   │   ├── Connection.fragment.xml
│   │   │   └── Debug.fragment.xml
│   │   ├── controller/      # Shared controllers
│   │   └── model/           # Extended models
│   ├── inspect/             # Inspect application
│   │   ├── Component.js
│   │   ├── manifest.json
│   │   ├── index.html
│   │   ├── controller/
│   │   ├── view/
│   │   └── i18n/
│   │       ├── inspect.properties
│   │       └── inspect_de.properties
│   ├── massConvert/         # Mass converter app
│   │   ├── Component.js
│   │   ├── manifest.json
│   │   ├── index.html
│   │   ├── controller/
│   │   ├── view/
│   │   └── i18n/
│   │       ├── massConvert.properties
│   │       └── massConvert_de.properties
│   ├── systemInfo/          # System info app
│   │   ├── Component.js
│   │   ├── manifest.json
│   │   ├── index.html
│   │   ├── controller/
│   │   ├── view/
│   │   └── i18n/
│   │       ├── systemInfo.properties
│   │       └── systemInfo_de.properties
│   └── tables/              # Tables browser app
│       ├── Component.js
│       ├── manifest.json
│       ├── index.html
│       ├── controller/
│       ├── view/
│       └── i18n/
│           ├── tables.properties
│           └── tables_de.properties
├── appconfig/
│   └── fioriSandboxConfig.json  # Launchpad configuration
├── dfa/
│   └── help/                # DFA help library
│       ├── library.js
│       ├── library-preload.js
│       ├── catalog/         # Help catalog
│       ├── context/         # Context-sensitive help
│       ├── utils/           # Help utilities
│       └── wpb/             # Web page builder
├── i18n/                    # i18n resource bundles
├── ui5.yaml                 # UI5 build config
├── ui5-local.yaml           # Local dev overrides
├── .gitignore               # Git ignore rules
└── README.md                # Detailed app docs
```

#### Core Files

**`resources/index.html`** - Main entry point for the Fiori Launchpad

- Loads UI5 framework from CDN `https://ui5.sap.com/<version>/`
- Configures the Fiori Launchpad sandbox environment
- Supports both light and dark themes (auto-detected based on system preferences)
- Registers resource roots for all UI5 applications

**`resources/init.js`** - Initialization script for the Launchpad

- Creates and renders the Fiori shell container
- Configures flexibility services for UI adaptation
- Sets up session storage connector for personalization

**`resources/WebAssistant.js`** - SAP Enable Now Web Assistant integration

- Provides contextual help and guided tours
- Loads from SAP productive environment
- Enables in-app learning and documentation

**`appconfig/fioriSandboxConfig.json`** - Complete Launchpad configuration

- Defines tile groups and layouts
- Configures navigation targets
- Sets up application routes
- Enables personalization and themes
- Configures DFA (Digital Foundation Adapter) integration
- Defines three main tile groups:
  - **List Objects** - Database object listings
  - **Admin** - Administrative functions
  - **CF/XS** - Cloud Foundry and XSA service instances

### Component Sharing

All applications use shared components from `/resources/common`:

**Controllers:**

- **BaseController.js** - Base class with common functionality for all app controllers
- **handler.js** - Shared event handlers and utility functions

**Views (XML Fragments):**

- **BusyDialog.fragment.xml** - Loading indicator dialog
- **Connection.fragment.xml** - Database connection configuration UI
- **Debug.fragment.xml** - Debug information display

**Models:**

- **models.js** - Shared data models and model creation utilities

**Additional Resources:**

- **Component.js** - Reusable component definition
- **index.js** - Common module exports
- **/css** - Shared stylesheets
- **/images** - Common images and icons
- **/view** - Additional shared view fragments
- **/model** - Extended model definitions
- **/controller** - Additional shared controllers

### WebSocket Communication

Web applications communicate with the backend via:

```javascript
// Frontend
const ws = new WebSocket('ws://localhost:3010');
ws.send(JSON.stringify({
  command: 'tables',
  args: { schema: 'MY_SCHEMA' }
}));

// Backend receives and executes CLI command
// Returns results as markdown table
```

## Features

### Real-time Updates

- Live command execution feedback
- Progress indicators during long operations
- Error messaging and troubleshooting
- Result streaming for large datasets

### Multi-theming

- **Light theme** - Professional business look
- **Dark theme** - Reduced eye strain
- **Auto-detect** - Follows system settings
- **Manual override** - User selection available

### Accessibility

- Keyboard navigation support
- Screen reader compatible
- High contrast mode
- WCAG compliance

### Internationalization

Supports multiple languages:

- **English** - Primary language
- **German** - Full translations
- **Extensible** - Easy to add more languages

Text files: `/resources/*/i18n/*.properties`

### Personalization

Users can personalize the Launchpad:

- Rearrange tiles
- Hide/show tile groups
- Change themes
- Customize content density (compact/cozy)
- Save layouts in session storage
- Remember window preferences
- Save connection configurations
- Retain search/filter states
- Session persistence

Changes are stored locally in browser session storage.

### Authentication

Currently, authentication is handled through the database connection configured in the CLI. The web interface inherits the same connection and credentials.

### Browser Compatibility

Supports modern browsers:

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

Requires JavaScript enabled and WebSocket support.

### DFA Help System

The application includes SAP Digital Foundation Adapter (DFA) help content integration:

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

**Features:**

- Contextual help overlay on UI5 applications
- Guided tours and walkthroughs
- Integration with SAP Enable Now
- What's New announcements
- Product documentation links

## Connected Operations

The web UI connects to the HANA CLI backend running locally:

```bash
┌─────────────────────────────────────────┐
│  Browser (Web UI)                       │
│  ├─ Tables App                          │
│  ├─ Inspect App                         │
│  ├─ Mass Converter App                  │
│  └─ System Info App                     │
└──────────────┬──────────────────────────┘
               │ WebSocket
               │ (ws://localhost:3010)
               ↓
┌──────────────────────────────────────────┐
│  Node.js Server (hana-cli)               │
│  ├─ Command routing                      │
│  ├─ Database connection                  │
│  ├─ Result formatting                    │
│  └─ Error handling                       │
└──────────────┬───────────────────────────┘
               │
               ↓
        ┌──────────────┐
        │  SAP HANA    │
        │  Database    │
        └──────────────┘
```

## Usage Scenarios

### Discover Database Schema

```bash
# Launch web UI
hana-cli tablesUI

# In browser:
# 1. Search for schema
# 2. Browse tables and views
# 3. View column details
# 4. Export table definitions
```

### Convert Tables for HDI

```bash
# Launch mass converter
hana-cli massConvertUI

# In browser:
# 1. Select tables to convert
# 2. Choose output format (CDS, HDBTable, etc)
# 3. Configure options
# 4. Start conversion
# 5. Download results
```

### Check System Status

```bash
# Launch system info
hana-cli systemInfoUI

# View:
# - Current connection info
# - Database version
# - System ID and hostname
# - Uptime and resources
```

## Configuration Files

### ui5.yaml

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

### ui5-local.yaml

Local development overrides (automatically loaded when present)

### .gitignore

Git ignore rules for generated and temporary files

## Development

### Local Development Server

For development with hot-reload:

```bash
cd app
ui5 serve
```

The UI5 tooling will start a development server with automatic reloading on file changes.

### Building for Production

```bash
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

## See Also

- [REST API Endpoint Map](../api-server/)
- [HTTP Routes Documentation](../../04-api-reference/http-routes) - Backend API endpoints
- [Getting Started](../../01-getting-started/)
- [Features Guide](../)
- [UI5 Documentation](https://ui5.sap.com/) - SAP UI5 framework reference
- [Fiori Design Guidelines](https://experience.sap.com/fiori-design-web/) - SAP Fiori design system
