/**
 * README Knowledge Base
 *
 * Aggregates and indexes all documentation from the project's markdown files
 * to provide context-aware guidance and parameter information for the MCP server.
 */
export class ReadmeKnowledgeBase {
    /**
     * Global Standard Parameters - Available in all commands
     */
    static GLOBAL_PARAMETERS = [
        {
            name: '--admin',
            alias: '-a',
            type: 'boolean',
            default: 'false',
            description: 'Connect via admin credentials (uses default-env-admin.json)'
        },
        {
            name: '--conn',
            type: 'string',
            default: 'not set',
            description: 'Connection filename to override default-env.json'
        },
        {
            name: '--disableVerbose',
            alias: '--quiet',
            type: 'boolean',
            default: 'false',
            description: 'Disable verbose output for scripting'
        },
        {
            name: '--debug',
            alias: '-d',
            type: 'boolean',
            default: 'false',
            description: 'Enable debug output for troubleshooting'
        },
    ];
    /**
     * Standardized command categories with their parameter conventions
     */
    static COMMAND_CATEGORIES = {
        'data-manipulation': {
            name: 'Data Manipulation',
            description: 'Commands for importing, exporting, and transforming data',
            standardParameters: [
                {
                    name: '--schema',
                    alias: '-s',
                    type: 'string',
                    default: '**CURRENT_SCHEMA**',
                    description: 'Target schema name'
                },
                {
                    name: '--sourceSchema',
                    alias: '-ss',
                    type: 'string',
                    default: '**CURRENT_SCHEMA**',
                    description: 'Source schema for operations'
                },
                {
                    name: '--targetSchema',
                    alias: '-ts',
                    type: 'string',
                    default: '**CURRENT_SCHEMA**',
                    description: 'Target schema for operations'
                },
                {
                    name: '--table',
                    alias: '-t',
                    type: 'string',
                    default: 'not set',
                    description: 'Table name(s)'
                },
                {
                    name: '--sourceTable',
                    alias: '-st',
                    type: 'string',
                    default: 'not set',
                    description: 'Source table name'
                },
                {
                    name: '--targetTable',
                    alias: '-tt',
                    type: 'string',
                    default: 'not set',
                    description: 'Target table name'
                },
                {
                    name: '--output',
                    alias: '-o',
                    type: 'string',
                    default: 'not set',
                    description: 'Output file path'
                },
                {
                    name: '--format',
                    alias: '-f',
                    type: 'string',
                    default: 'csv/json/summary',
                    description: 'Output format'
                },
                {
                    name: '--limit',
                    alias: '-l',
                    type: 'number',
                    default: '1000',
                    description: 'Maximum result set size'
                },
                {
                    name: '--batchSize',
                    alias: '-b, --batch',
                    type: 'number',
                    default: '1000',
                    description: 'Batch size for processing'
                },
                {
                    name: '--timeout',
                    alias: '-to',
                    type: 'number',
                    default: '3600',
                    description: 'Operation timeout in seconds (1 hour)'
                },
                {
                    name: '--dryRun',
                    alias: '-dr, --preview',
                    type: 'boolean',
                    default: 'false',
                    description: 'Preview operation without committing changes'
                },
                {
                    name: '--profile',
                    alias: '-p',
                    type: 'string',
                    default: 'not set',
                    description: 'Database profile (hana, postgresql, sqlite, etc.)'
                },
            ]
        },
        'batch-operations': {
            name: 'Batch Operations',
            description: 'Commands for performing actions on multiple objects (massGrant, massUpdate, massDelete, etc.)',
            standardParameters: [
                {
                    name: '--schema',
                    alias: '-s',
                    type: 'string',
                    default: 'not set',
                    description: 'Schema containing objects'
                },
                {
                    name: '--object',
                    alias: '-o',
                    type: 'string',
                    default: 'not set',
                    description: 'Object name pattern'
                },
                {
                    name: '--limit',
                    alias: '-l',
                    type: 'number',
                    default: '1000',
                    description: 'Maximum objects to process'
                },
                {
                    name: '--dryRun',
                    alias: '-dr, --preview',
                    type: 'boolean',
                    default: 'false',
                    description: 'Preview without executing'
                },
                {
                    name: '--log',
                    type: 'boolean',
                    default: 'false',
                    description: 'Enable operation logging'
                },
            ]
        },
        'list-inspect': {
            name: 'List/Inspect',
            description: 'Commands for listing and inspecting database objects (tables, views, schemas, etc.)',
            standardParameters: [
                {
                    name: '--schema',
                    alias: '-s',
                    type: 'string',
                    default: '**CURRENT_SCHEMA**',
                    description: 'Filter by schema'
                },
                {
                    name: '--limit',
                    alias: '-l',
                    type: 'number',
                    default: '200',
                    description: 'Maximum results to return'
                },
                {
                    name: '--profile',
                    alias: '-p',
                    type: 'string',
                    default: 'not set',
                    description: 'Database profile selector'
                },
            ]
        },
    };
    /**
     * Connection resolution order (7-step process)
     */
    static CONNECTION_RESOLUTION = [
        {
            order: 1,
            name: 'Admin Credentials Override',
            file: 'default-env-admin.json',
            description: 'Highest priority. If --admin flag is set, overrides all other parameters.',
            notes: 'Search in current directory and 5 parent directories'
        },
        {
            order: 2,
            name: 'CAP/CDS Secure Binding',
            file: '.cdsrc-private.json',
            description: 'Most secure option. Uses cds bind functionality to lookup credentials dynamically.',
            notes: 'Adds a few seconds per command but credentials are not stored locally'
        },
        {
            order: 3,
            name: 'Environment Variables',
            file: '.env',
            description: 'Environment file with VCAP_SERVICES section',
            notes: 'Search up to 5 parent directories'
        },
        {
            order: 4,
            name: 'Connection Parameter',
            file: '--conn parameter',
            description: 'Explicit connection file specified via --conn parameter',
            notes: 'Search in current directory, parent directories, or ${homedir}/.hana-cli/'
        },
        {
            order: 5,
            name: 'Home Directory',
            file: '${homedir}/.hana-cli/configured file',
            description: 'Connection file in user home directory .hana-cli folder',
            notes: 'Used after --conn parameter file lookup fails'
        },
        {
            order: 6,
            name: 'Default Configuration',
            file: 'default-env.json',
            description: 'Standard default configuration file',
            notes: 'Search in current directory and 5 parent directories'
        },
        {
            order: 7,
            name: 'Home Default',
            file: '${homedir}/.hana-cli/default.json',
            description: 'Last resort fallback in user home directory',
            notes: 'Final fallback if all other methods fail'
        },
    ];
    /**
     * Security best practices and connection guidelines
     */
    static SECURITY_GUIDELINES = [
        {
            topic: 'Connection Configuration',
            description: 'Best practices for managing database connections safely',
            details: [
                'Never commit credentials to version control (use .gitignore)',
                'Use .cdsrc-private.json with cds bind for cloud environments - most secure as credentials are not stored locally',
                'Use default-env-admin.json for local admin connections only',
                'Keep .env files out of repositories',
                'Use environment variables for sensitive connection strings in CI/CD pipelines',
                'The tool searches in parent directories to allow flexible project structures',
            ]
        },
        {
            topic: 'SQL Injection Protection',
            description: 'Built-in protection against SQL injection attacks',
            details: [
                'All schema, table, and user parameters are validated against SQL injection patterns',
                'The sqlInjection utility is used across all commands to sanitize inputs',
                'Wildcard patterns (%) are allowed only in specific contexts (e.g., schema/table filtering)',
                'Comments (--) are automatically rejected in parameter values',
                'Always use parameterized queries when possible',
            ]
        },
        {
            topic: 'Parameter Security',
            description: 'Secure handling of parameters in commands',
            details: [
                'Use --disableVerbose/--quiet flags when running in scripts to prevent credential logging',
                'Avoid passing passwords directly in command line; use connection files instead',
                'The --debug flag shows detailed information but should be disabled in production',
                'Use --dryRun/--preview to test operations before execution',
                'Always review operation logs in sensitive environments',
            ]
        },
        {
            topic: 'Environment Security',
            description: 'Securing the execution environment',
            details: [
                'Run hana-cli in isolated environments for multi-tenant scenarios',
                'Use process isolation when executing from enterprise applications',
                'Implement proper access controls for connection configuration files',
                'Monitor command execution logs in regulated environments',
                'Use the --timeout parameter to prevent long-running operations',
            ]
        }
    ];
    /**
     * Parameter naming conventions and best practices
     */
    static NAMING_CONVENTIONS = {
        singleOperations: 'Use singular names (e.g., schema, table, user)',
        sourceTarget: 'Use paired names (e.g., sourceSchema/targetSchema)',
        booleanFlags: 'Use descriptive names (e.g., dryRun, includeHeaders)',
        aggregation: 'Use plural or descriptive names (e.g., columns, indexes)',
        aliases: {
            singleLetter: 'First letter of parameter (e.g., -s for schema)',
            extended: 'Meaningful abbreviation (e.g., -dr for dryRun)',
            noSelfReference: 'Parameter name itself is not used as alias',
            maxAliases: 'Parameters have at most 2 aliases'
        }
    };
    /**
     * Key project folders and their purposes
     */
    static PROJECT_STRUCTURE = {
        'bin': 'CLI command definitions and entry points (150+ commands)',
        'app': 'Web UI (Fiori Launchpad) with UI5 applications',
        'routes': 'HTTP/REST API endpoints (27+ endpoints for programmatic access)',
        'utils': 'Reusable utility modules for connections, security, database abstraction',
        'docs': 'In-depth command documentation and examples',
        'tests': 'Test suites for CLI commands and functionality',
        'types': 'TypeScript type definitions',
        'mcp-server': 'Model Context Protocol server for AI assistants',
        '_i18n': 'Internationalization files (multiple languages)'
    };
    /**
     * Key markdown documentation files and their contents
     */
    static DOCUMENTATION_RESOURCES = {
        'main-readme': {
            path: 'README.md',
            title: 'Main README',
            description: 'Complete guide to hana-cli, including installation, security, parameters, and conventions',
            contents: 'Covers: Description, Installation, Security (7-step connection resolution), Examples, Project Structure, Standard Parameters, Naming Conventions, Alias Conventions, Default Values, Current Schema Defaults, Multi-Profile Database Support'
        },
        'app-guide': {
            path: 'app/README.md',
            title: 'Web Applications Guide',
            description: 'Documentation for the Fiori Launchpad web UI and all UI5 applications',
            contents: 'Covers: Architecture, Folder Structure, Core Files, Resource Organization, All UI5 Apps (inspect, list, convert, system-info, etc.)'
        },
        'routes-guide': {
            path: 'routes/README.md',
            title: 'HTTP Routes Documentation',
            description: 'Complete API documentation for all REST endpoints (27+ endpoints)',
            contents: 'Covers: Base Configuration, HANA Database Endpoints, Inspection Operations, WebSocket Support, Excel Export, Error Handling'
        },
        'utils-guide': {
            path: 'utils/README.md',
            title: 'Utils Directory Guide',
            description: 'Documentation for internal utility modules used by all commands',
            contents: 'Covers: Core Utilities (base, connections, dbInspect, locale, sqlInjection, versionCheck), CLI Integration (btp, cf, xs), Database Utilities, Database Abstraction Layer'
        },
        'mcp-server': {
            path: 'mcp-server/README.md',
            title: 'MCP Server Documentation',
            description: 'Setup and usage guide for the Model Context Protocol integration',
            contents: 'Covers: Installation, Configuration, Available Commands, Discovery Features, Workflows, Examples, Parameter Presets, Intent-Based Discovery'
        },
        'swagger': {
            path: 'SWAGGER_IMPLEMENTATION.md',
            title: 'Swagger/OpenAPI Implementation',
            description: 'Documentation for the interactive API specification and exploration interface',
            contents: 'Covers: API Documentation, Interactive Testing, OpenAPI 3.0 Support, Organized Endpoints, Export Support'
        },
    };
    /**
     * Get connection resolution guide with detailed explanations
     */
    static getConnectionGuide() {
        const steps = this.CONNECTION_RESOLUTION
            .map(step => `${step.order}. **${step.name}** (${step.file})
   ${step.description}
   Note: ${step.notes}`)
            .join('\n\n');
        return `# Connection Resolution Order

The hana-cli tool uses a 7-step process to determine database connection parameters:

${steps}

**Selection Strategy**: The tool stops at the first match found and uses those credentials. This allows flexible configuration for different environments (local dev, cloud, CI/CD).

**Recommended Approach**:
- Local Development: Use \`default-env.json\`
- Cloud/BTP: Use \`.cdsrc-private.json\` with \`cds bind\` (most secure)
- CI/CD Pipelines: Use \`--conn\` parameter or environment variables
- Admin Operations: Use \`default-env-admin.json\` with \`--admin\` flag`;
    }
    /**
     * Get standard parameters for a specific command category
     */
    static getStandardParameters(category) {
        const categoryData = this.COMMAND_CATEGORIES[category];
        if (!categoryData) {
            return [];
        }
        // Combine global and category-specific parameters
        return [...this.GLOBAL_PARAMETERS, ...(categoryData.standardParameters || [])];
    }
    /**
     * Get security guidelines as formatted text
     */
    static getSecurityGuidelines() {
        const sections = this.SECURITY_GUIDELINES
            .map(guide => `## ${guide.topic}

${guide.description}

${guide.details.map(d => `- ${d}`).join('\n')}`)
            .join('\n\n');
        return `# Security and Best Practices

${sections}

## Quick Security Checklist

- ✓ Use .cdsrc-private.json with cds bind for production
- ✓ Never commit connection files to version control
- ✓ Use --disableVerbose in scripts to prevent logging credentials
- ✓ Test with --dryRun before executing sensitive operations
- ✓ Review operation logs in regulated environments
- ✓ Keep hana-cli updated to get latest security patches
- ✓ Run commands from appropriate user accounts with minimal required permissions`;
    }
    /**
     * Get parameter guidelines for a specific command category
     */
    static getParameterGuide(category) {
        const categoryData = this.COMMAND_CATEGORIES[category];
        if (!categoryData) {
            return `Category "${category}" not found. Available categories: ${Object.keys(this.COMMAND_CATEGORIES).join(', ')}`;
        }
        const params = this.getStandardParameters(category);
        const paramTable = params
            .map(p => `| \`${p.name}\` | ${p.alias || '—'} | ${p.type} | \`${p.default}\` | ${p.description} |`)
            .join('\n');
        return `# ${categoryData.name} Parameters

${categoryData.description}

## Standard Parameters

| Parameter | Alias | Type | Default | Description |
|-----------|-------|------|---------|-------------|
${paramTable}

## Usage Notes

- **CURRENT_SCHEMA**: This placeholder automatically uses your current database schema
- **dryRun**: Use \`--dryRun\` or \`--preview\` to preview operations before execution
- **format**: Output format varies by command (csv, json, excel, summary, cds, edmx)
- **timeout**: Specified in seconds; default 1 hour for long-running operations
- **profile**: Select alternative database configuration without changing connections`;
    }
    /**
     * Get project structure overview
     */
    static getProjectStructure() {
        const folders = Object.entries(this.PROJECT_STRUCTURE)
            .map(([folder, purpose]) => `- **${folder}/**: ${purpose}`)
            .join('\n');
        return `# hana-cli Project Structure

${folders}

## Key Documentation Files

${Object.entries(this.DOCUMENTATION_RESOURCES)
            .map(([key, resource]) => `### ${resource.title}
- **Path**: \`${resource.path}\`
- **Purpose**: ${resource.description}
- **Contains**: ${resource.contents}`)
            .join('\n\n')}

## Key Resources for MCP Integration

- **Commands**: 150+ CLI commands available via hana-cli (see \`bin/\`)
- **HTTP API**: 27+ REST endpoints for programmatic access (\`routes/\`)
- **Web UI**: Complete Fiori Launchpad interface (\`app/\`)
- **Utilities**: Shared modules for connections, database, security (\`utils/\`)
- **Documentation**: In-depth command examples and guides (\`docs/\`)`;
    }
    /**
     * Get best practices and naming conventions guide
     */
    static getBestPractices() {
        const conventions = this.NAMING_CONVENTIONS;
        const aliasRules = Object.entries(conventions.aliases)
            .map(([rule, desc]) => `- **${rule}**: ${desc}`)
            .join('\n');
        return `# hana-cli Best Practices and Conventions

## Parameter Naming Conventions

- **Single Operations**: ${conventions.singleOperations}
- **Source/Target Operations**: ${conventions.sourceTarget}
- **Boolean Flags**: ${conventions.booleanFlags}
- **Aggregation Parameters**: ${conventions.aggregation}

## Alias Conventions

${aliasRules}

## Parameter Usage Examples

\`\`\`bash
# List commands
hana-cli tables -s myschema -l 100                    # Limit to 100 results
hana-cli procedures --schema production               # Explicit parameter

# Data manipulation
hana-cli export -t CUSTOMERS -s SALES -f csv -dr      # Dry-run preview
hana-cli import -t ORDERS --dryRun --log              # With logging

# Batch operations
hana-cli massGrant -s SCHEMA -o TABLE -p SELECT -dr   # Preview grants
hana-cli massUpdate -s SCHEMA -o TABLE -c "COL='VAL'" # Update with condition

# Debug and connection
hana-cli status --debug                                # Enable debug output
hana-cli tables --conn /path/to/config.json           # Custom connection
hana-cli tables --admin                                # Admin credentials
\`\`\`

## Common Patterns

### Safe Operation Pattern
\`\`\`bash
# 1. Preview the operation
hana-cli import -t TABLE -f input.csv --dryRun

# 2. Check parameters one more time
hana-cli import -t TABLE -f input.csv --dryRun --debug

# 3. Execute for real
hana-cli import -t TABLE -f input.csv
\`\`\`

### Cross-Database Pattern
\`\`\`bash
# Use --profile to work with different databases
hana-cli tables --profile production
hana-cli export -t CUSTOMERS -p staging
hana-cli compareData --sourceSchema SRC -p source --targetSchema TGT -p target
\`\`\`

### Batch Processing Pattern
\`\`\`bash
# Preview batch operation
hana-cli massExport -s SCHEMA -l 50 --dryRun

# Execute with logging
hana-cli massExport -s SCHEMA -l 50 --log
\`\`\``;
    }
    /**
     * Search documentation by keyword
     */
    static searchDocumentation(query) {
        const lowerQuery = query.toLowerCase();
        const results = [];
        // Search in command categories
        Object.entries(this.COMMAND_CATEGORIES).forEach(([key, category]) => {
            if (key.includes(lowerQuery) || category.description.toLowerCase().includes(lowerQuery)) {
                results.push(`**Command Category**: ${category.name} - ${category.description}`);
            }
        });
        // Search in documentation resources
        Object.values(this.DOCUMENTATION_RESOURCES).forEach(resource => {
            if (resource.title.toLowerCase().includes(lowerQuery) ||
                resource.description.toLowerCase().includes(lowerQuery) ||
                resource.contents.toLowerCase().includes(lowerQuery)) {
                results.push(`**Documentation**: [${resource.title}](${resource.path}) - ${resource.description}`);
            }
        });
        // Search in project structure
        Object.entries(this.PROJECT_STRUCTURE).forEach(([folder, purpose]) => {
            if (purpose.toLowerCase().includes(lowerQuery)) {
                results.push(`**Project Folder**: \`${folder}/\` - ${purpose}`);
            }
        });
        // Search in security guidelines
        this.SECURITY_GUIDELINES.forEach(guide => {
            if (guide.topic.toLowerCase().includes(lowerQuery) ||
                guide.description.toLowerCase().includes(lowerQuery)) {
                results.push(`**Security Guideline**: ${guide.topic} - ${guide.description}`);
            }
        });
        if (results.length === 0) {
            return `No documentation found matching "${query}". Try searching for:
- Command categories (data-manipulation, batch-operations, list-inspect)
- Topics (security, connection, parameters, naming, profile)
- Folders (bin, app, routes, utils, docs)`;
        }
        return `# Documentation Search Results for "${query}"\n\n${results.join('\n\n')}`;
    }
}
export default ReadmeKnowledgeBase;
//# sourceMappingURL=readme-knowledge-base.js.map