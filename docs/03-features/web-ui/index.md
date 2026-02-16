# Web User Interface

Complete documentation for the HANA CLI web application - a modern SAP UI5-based Fiori interface.

## Quick Start

Launch the web interface with any CLI command using the `-w` or `--web` flag:

```bash
hana-cli tables -w
# Opens http://localhost:3010 automatically
```

By default, the web server runs on **port 3010**. Change it if needed:

```bash
hana-cli tables -w --port 3030
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

**Launch:** `hana-cli tables -w`

Browse all database objects:
- Tables (with column details)
- Views and calculation views
- Schemas and containers
- HDI service instances
- Functions and procedures
- Indexes and sequences

Features:
- Search across objects
- View object properties and metadata
- Export object definitions
- Generate SQL statements
- Connection switching

### Inspect Tool

**Launch:** `hana-cli inspect -w`

Detailed inspection of individual objects:
- Table structure analysis
- View column mapping
- Data type review
- Constraints and indexes
- Column statistics
- Object metadata

### Mass Converter

**Launch:** `hana-cli massConvert -w`

Bulk conversion of database objects:
- Convert tables to CDS (Core Data Services)
- Generate `.hdbtable` files
- Generate `.hdbmigrationtable` files
- Create HDI migration scripts
- Export to local files
- Multi-table batch processing

Options:
- HANA-specific data types
- Catalog-only definitions
- Target folder configuration

### System Information

**Launch:** `hana-cli systemInfo -w`

Database and connection information:
- System ID and version
- Database name and host
- Session details and uptime
- System configuration
- Resource usage
- Connection parameters

## Architecture

### Technology Stack

| Component | Purpose | Version |
|-----------|---------|---------|
| SAP UI5 | UI Framework | 1.144.1 |
| Fiori Launchpad | App Container | Latest |
| Node.js Express | Backend API | Runtime |
| WebSockets | Real-time comms | Native |
| SAP DFA | Help system | Latest |

### Folder Structure

```
app/
├── resources/
│   ├── index.html           # Main Fiori Launchpad entry
│   ├── init.js              # Launchpad initialization
│   ├── WebAssistant.js      # Help integration
│   ├── common/              # Shared components
│   ├── inspect/             # Inspect app
│   ├── massConvert/         # Converter app
│   ├── systemInfo/          # System info app
│   └── tables/              # Tables browser app
├── ui5.yaml                 # UI5 build config
├── ui5-local.yaml           # Local dev config
└── README.md                # Detailed app docs
```

### Component Sharing

All applications use shared components from `/resources/common`:
- **BaseController.js** - Base class with utilities
- **Connection.fragment.xml** - Database connection UI
- **BusyDialog.fragment.xml** - Loading indicators
- **models.js** - Shared data models
- **CSS & images** - Styling and assets

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

- Remember window preferences
- Save connection configurations
- Retain search/filter states
- Session persistence

## Connected Operations

The web UI connects to the HANA CLI backend running locally:

```
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
hana-cli tables -w

# In browser:
# 1. Search for schema
# 2. Browse tables and views
# 3. View column details
# 4. Export table definitions
```

### Convert Tables for HDI

```bash
# Launch mass converter
hana-cli massConvert -w

# In browser:
# 1. Select tables to convert
# 2. Choose output format (CDS, HDBTable, etc)
# 3. Configure options
# 4. Start conversion
# 5. Download results
```

### Inspect Object Details

```bash
# Launch inspector
hana-cli inspect -w

# In browser:
# 1. Search for table/view
# 2. View full schema details
# 3. Check constraints
# 4. Review statistics
# 5. Export inspection report
```

### Check System Status

```bash
# Launch system info
hana-cli systemInfo -w

# View:
# - Current connection info
# - Database version
# - System ID and hostname
# - Uptime and resources
```

## See Also

- [REST API Server](../api-server/)
- [Web UI Apps Details](../../app/README.md)
- [Getting Started](../../01-getting-started/)
- [Features Guide](../)
