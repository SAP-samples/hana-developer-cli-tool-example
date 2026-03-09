/**
 * Documentation Knowledge Base
 * 
 * Aggregates and indexes documentation from the project's docs/ folder
 * to provide context-aware guidance and parameter information for the MCP server.
 */

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function readDocsFile(relativePath: string, fallbackText: string): string {
  try {
    const filePath = join(__dirname, '..', '..', relativePath);
    return readFileSync(filePath, 'utf-8');
  } catch {
    return fallbackText;
  }
}

interface ParameterInfo {
  name: string;
  alias?: string | string[];
  type: string;
  default: string;
  description: string;
}

interface CommandCategory {
  name: string;
  description: string;
  examples?: string[];
  standardParameters?: ParameterInfo[];
}

interface SecurityInfo {
  topic: string;
  description: string;
  details: string[];
}

interface ConnectionStep {
  order: number;
  name: string;
  description: string;
  file: string;
  notes?: string;
}

interface ProjectResource {
  path: string;
  title: string;
  description: string;
  contents: string;
}

export class ReadmeKnowledgeBase {
  /**
   * Global Standard Parameters - Available in all commands
   */
  static readonly GLOBAL_PARAMETERS: ParameterInfo[] = [
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
  static readonly COMMAND_CATEGORIES: Record<string, CommandCategory> = {
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
  static readonly CONNECTION_RESOLUTION: ConnectionStep[] = [
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
  static readonly SECURITY_GUIDELINES: SecurityInfo[] = [
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
  static readonly NAMING_CONVENTIONS = {
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
  static readonly PROJECT_STRUCTURE = {
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
  static readonly DOCUMENTATION_RESOURCES: Record<string, ProjectResource> = {
    'docs-home': {
      path: 'docs/README.md',
      title: 'Documentation Home',
      description: 'Entry point for hana-cli documentation, guides, and references',
      contents: 'Covers: Documentation overview, navigation, and key entry points'
    },
    'getting-started': {
      path: 'docs/01-getting-started/index.md',
      title: 'Getting Started',
      description: 'Installation, configuration, and quick start guidance',
      contents: 'Covers: Requirements, setup, configuration, and first commands'
    },
    'web-ui': {
      path: 'docs/03-features/web-ui/index.md',
      title: 'Web UI (Fiori) Guide',
      description: 'Documentation for the Web UI and UI5 applications',
      contents: 'Covers: Web UI architecture, feature overview, and usage'
    },
    'api-reference': {
      path: 'docs/04-api-reference/index.md',
      title: 'API Reference',
      description: 'HTTP API reference and integration guidance',
      contents: 'Covers: API overview, endpoints, and integration patterns'
    },
    'http-routes': {
      path: 'docs/04-api-reference/http-routes.md',
      title: 'HTTP Routes',
      description: 'Detailed documentation for REST endpoints',
      contents: 'Covers: REST endpoints, request/response formats, and usage'
    },
    'mcp-server': {
      path: 'docs/05-development/mcp-server/index.md',
      title: 'MCP Server Documentation',
      description: 'Development and configuration guide for MCP integration',
      contents: 'Covers: MCP server architecture, setup, tools, prompts, and resources'
    },
    'swagger': {
      path: 'docs/04-api-reference/swagger-implementation.md',
      title: 'Swagger/OpenAPI Implementation',
      description: 'Swagger/OpenAPI tooling and implementation details',
      contents: 'Covers: Swagger setup, OpenAPI support, and interactive testing'
    },
    'command-reference': {
      path: 'docs/99-reference/command-reference.md',
      title: 'Command Reference',
      description: 'Reference index for CLI commands and categories',
      contents: 'Covers: Command taxonomy, category mapping, and references'
    },
  };

  /**
   * Get connection resolution guide with detailed explanations
   */
  static getConnectionGuide(): string {
    return readDocsFile(
      'docs/01-getting-started/configuration.md',
      'Connection guide documentation is not available. Check docs/01-getting-started/configuration.md.'
    );
  }

  /**
   * Get standard parameters for a specific command category
   */
  static getStandardParameters(category: string): ParameterInfo[] {
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
  static getSecurityGuidelines(): string {
    return readDocsFile(
      'docs/03-features/knowledge-base.md',
      'Security guidance is not available. Check docs/03-features/knowledge-base.md.'
    );
  }

  /**
   * Get parameter guidelines for a specific command category
   */
  static getParameterGuide(category: string): string {
    const docText = readDocsFile(
      'docs/03-features/cli-features.md',
      'CLI features documentation is not available. Check docs/03-features/cli-features.md.'
    );

    return `# Parameters Reference (${category})\n\n${docText}`;
  }

  /**
   * Get project structure overview
   */
  static getProjectStructure(): string {
    return readDocsFile(
      'docs/05-development/index.md',
      'Project structure documentation is not available. Check docs/05-development/index.md.'
    );
  }

  /**
   * Get best practices and naming conventions guide
   */
  static getBestPractices(): string {
    return readDocsFile(
      'docs/03-features/knowledge-base.md',
      'Best practices guidance is not available. Check docs/03-features/knowledge-base.md.'
    );
  }

  /**
   * Search documentation by keyword
   */
  static searchDocumentation(query: string): string {
    const lowerQuery = query.toLowerCase();
    const results: string[] = [];

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
