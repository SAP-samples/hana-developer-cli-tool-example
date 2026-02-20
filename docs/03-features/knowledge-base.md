# Knowledge Base Integration

Built-in knowledge base for quick help and learning.

## Accessing Help

### Command Help

```bash
# Show all commands
hana-cli --help

# Command-specific help
hana-cli import --help
hana-cli export --help
hana-cli dataProfile --help
```

### Search Knowledge Base

```bash
# Search for help topic
hana-cli kb "import csv"
hana-cli kb "data validation"
hana-cli kb compare schemas
```

## Knowledge Base Topics

### Getting Started

- Installation and setup
- Configuration
- First steps
- System requirements

### Commands

- Command reference for all 100+ commands
- Option descriptions
- Examples and use cases
- Tips and tricks

### Troubleshooting

- Common errors
- Connection issues
- Performance optimization
- FAQ

### Best Practices

- Data import strategies
- Schema management
- Query optimization
- Security considerations

## Inline Documentation

### Example Help

```bash
$ hana-cli import --help

Usage: hana-cli import [options]

Description:
  Import data from CSV or Excel files into database tables.

Options:
  -n, --filename <path>   Input file path (required)
  -t, --table <name>      Target table (required)
  -m, --matchMode <mode>  Column matching: auto|name|order
  --truncate              Clear table before import

Examples:
  # Import CSV with auto column matching
  $ hana-cli import -n data.csv -t HR.EMPLOYEES

  # Import Excel with name matching
  $ hana-cli import -n data.xlsx -o excel -t SALES -m name

  # Import and truncate
  $ hana-cli import -n data.csv -t EMPLOYEES --truncate

See also:
  hana-cli export --help
  Documentation: https://docs...
```

## Examples Library

Built-in examples for 20+ common commands:

```bash
# Show all available commands with examples
hana-cli examples

# Show detailed examples for a specific command
hana-cli example import
hana-cli example dataProfile
hana-cli example export

# Search examples by keyword
hana-cli examples --search duplicate
hana-cli examples --search csv

# Export examples as JSON
hana-cli examples --format json
```

The `examples` command includes examples for core operations like import/export, data analysis, schema comparison, and more.

## Interactive Mode

Interactive mode provides a guided, menu-driven interface for running commands with step-by-step parameter collection. It's designed for users who prefer visual navigation over command-line arguments.

### Starting Interactive Mode

```bash
# Start interactive mode
hana-cli interactive

# Start in a specific category
hana-cli interactive --category data-tools

# Load a saved preset
hana-cli interactive --preset myimport
```

**Aliases:** You can also use `hana-cli i`, `hana-cli repl`, or `hana-cli shell`

### Features

**Main Menu Options:**

- 🔍 **Search & Run Command** - Search for commands by name with fuzzy matching
- 📂 **Browse by Category** - Navigate commands organized by category (data-tools, schema-tools, etc.)
- 🕐 **Recent Commands** - Re-run or modify recently executed commands
- ⭐ **Load Preset** - Execute saved command configurations
- 🔧 **Guided Workflow** - Step-by-step workflows for common tasks
- ❌ **Exit** - Close interactive mode

**Interactive Features:**

- **Dynamic Parameter Prompts** - Automatically generated from command definitions
- **Preset Management** - Save frequently-used configurations with custom names
- **Command History** - Tracks last 50 executions with parameter preview
- **Context-Aware Validation** - Required field validation and type checking
- **Smart Defaults** - Pre-filled values based on command defaults
- **Graceful Exit** - Press Ctrl+C at any time to exit

### Guided Workflows

Pre-built workflows for common tasks with intelligent parameter collection:

#### 📥 Import Data Workflow

Complete step-by-step data import process:

- File path and format selection (CSV/Excel)
- Target table and schema configuration
- Column matching mode (auto/name/order)
- Optional table truncation
- Dry-run preview mode

#### 📤 Export Data Workflow

Guided data export with validation:

- Table name or SQL query input
- Output format selection (CSV/Excel/JSON)
- Output file path
- Header inclusion options

#### 🔍 Data Analysis Workflow

Choose from analysis tools:

- **Data Profile** - Statistical analysis of table data
- **Duplicate Detection** - Find duplicate records
- **Data Validator** - Validate data quality
- **Data Lineage** - Trace data dependencies

#### 📊 Schema Comparison Workflow

Compare or manage schemas:

- **Compare Schema** - Compare two schemas
- **Schema Clone** - Clone schema structures
- **ERD Diagram** - Generate entity-relationship diagrams

#### 🔧 Database Diagnostics Workflow

System health and performance:

- **Health Check** - Overall system health assessment
- **Blocking** - Check for locks and blocking sessions
- **Long Running Queries** - Identify slow queries
- **Memory Analysis** - Memory consumption breakdown
- **Expensive Statements** - Top resource-consuming SQL

### Example Session

```bash
$ hana-cli interactive

╔═══════════════════════════════════════════════════════════════════════════════╗
║              🚀 HANA CLI Interactive Mode 🚀                              ║
╚═══════════════════════════════════════════════════════════════════════════════╝

  Welcome to the interactive command interface!
  • Search commands, browse categories, and access guided workflows
  • Save presets for frequently used command configurations
  • Press Ctrl+C at any time to exit

════════════════════════════════════════════════════════════════════════════════

? What would you like to do? 
  🔍 Search & Run Command
❯ 📂 Browse by Category
  🕐 Recent Commands
  ⭐ Load Preset
  🔧 Guided Workflow
  ❌ Exit

? Select a category: (Use arrow keys)
❯ Data Tools (15 commands)
  Schema Tools (18 commands)
  Object Inspection (8 commands)
  Performance Monitoring (10 commands)
  ...

? Select a command from Data Tools:
❯ import - Import data from CSV or Excel files
  export - Export data to files
  dataProfile - Statistical analysis
  ...

⚙  Configure import:

? File path to import: data/employees.csv
? File format: csv
? Target table name: HR.EMPLOYEES
? Schema name: (leave empty for current schema) 
? Column matching mode: auto
? Truncate table before import? No
? Perform dry run? Yes

▶  Executing: import
────────────────────────────────────────────────────────────────────────────────
[Command executes with collected parameters...]
────────────────────────────────────────────────────────────────────────────────
✓ Command completed successfully

? Save this configuration as a preset? Yes
? Preset name: employee-import-dryrun
✓ Preset 'employee-import-dryrun' saved!

? Run another command? Yes
```

### Preset Management

After executing any command successfully, you'll be prompted to save the configuration as a preset.

**Saving Presets:**

```bash
✓ Command completed successfully

? Save this configuration as a preset? Yes
? Preset name: weekly-export

✓ Preset 'weekly-export' saved!
```

**Loading Presets:**

From the main menu, select "⭐ Load Preset" to view and execute saved configurations. You can also delete unwanted presets from this menu.

**Preset Storage:**

Presets are stored in `.interactive-state.json` in the project root and persist across sessions.

### Command History

Interactive mode automatically tracks your last 50 command executions:

- View recent commands with their parameters
- Select a command to re-run with the same parameters
- Or modify parameters for a similar execution
- History persists across sessions

### Technical Details

**Dynamic Parameter Collection:**

Interactive mode automatically introspects command definitions to generate appropriate prompts:

- Boolean options → Confirmation prompts (Yes/No)
- Enumerated choices → Selection lists
- String/number options → Input fields with validation
- Required fields → Enforced validation

**State Persistence:**

Your history and presets are automatically saved to `.interactive-state.json` (gitignored) allowing seamless continuation across sessions.

### Tips

- Use **Search** when you know the command name
- Use **Browse by Category** to discover related commands
- Use **Guided Workflows** for complex multi-parameter operations
- Save **Presets** for commands you run frequently
- Check **Recent Commands** to repeat or modify previous operations
- Press **Ctrl+C** at any time to safely exit

### Command Categories

Interactive mode organizes commands into these categories:

- **Data Tools** - Import, export, data analysis, validation
- **Schema Tools** - Tables, views, schemas, objects
- **Object Inspection** - Detailed metadata exploration
- **Performance Monitoring** - Query analysis, diagnostics
- **HDI Management** - Container and service management
- **Developer Tools** - Code generation, templates, testing
- **Security** - User management, certificates, privileges
- **System Tools** - Configuration, monitoring, administration
- **Analysis Tools** - Dependencies, recommendations
- **Mass Operations** - Bulk updates, exports, grants
- **Cloud Management** - SAP HANA Cloud instance management

### Integration with Other Features

Interactive mode works seamlessly with:

- **Examples** - Choose from pre-configured command examples
- **Knowledge Base** - Search help topics from within workflows
- **Help Documentation** - Access command-specific help during parameter collection

Presets persist across sessions and can be loaded from the main menu.

## Offline Documentation

Full documentation available locally:

```bash
# View documentation index
hana-cli docs

# List all available topics
hana-cli docs --list

# View specific doc
hana-cli docs import
hana-cli docs troubleshooting

# Search documentation
hana-cli docs --search "import csv"
```

## Online Resources

- [Full Documentation](https://github.com/SAP-samples/hana-developer-cli-tool-example/tree/main/docs)
- [GitHub Repository](https://github.com/SAP-samples/hana-developer-cli-tool-example)
- [NPM Package](https://www.npmjs.com/package/hana-cli)

## See Also

- [CLI Features](./cli-features.md)
- [Complete Commands Reference](/02-commands/)
