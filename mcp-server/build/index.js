#!/usr/bin/env node
/**
 * MCP Server for SAP HANA CLI
 *
 * CRITICAL: This file implements the Model Context Protocol (MCP) server.
 * MCP communicates via JSON-RPC over STDIO. All logging MUST use console.error()
 * to write to stderr, never console.log() which writes to stdout.
 *
 * Any non-JSON output to stdout will break the protocol and cause errors like:
 * "Failed to parse message: ..."
 *
 * Use console.error() for all logging throughout this file and in modules it imports.
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema, ListPromptsRequestSchema, GetPromptRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';
import { extractCommandInfo } from './command-parser.js';
import { executeCommand, formatResult, validateEnvironment } from './executor.js';
import { CATEGORIES, searchCommandsByTag, getCommandsInCategory, getAllWorkflows, searchWorkflowsByTag, getWorkflowById } from './command-metadata.js';
import { getCommandExamples, getCommandPresets, hasExamples, hasPresets, getCommandsWithExamples, getCommandsWithPresets } from './examples-presets.js';
import { recommendCommands, getQuickStartGuide } from './recommendation.js';
import { getTroubleshootingGuide } from './next-steps.js';
import { previewWorkflow, executeWorkflow } from './workflow-execution.js';
import { interpretResult } from './result-interpretation.js';
import { smartSearch } from './smart-search.js';
import { getConversationTemplate, listConversationTemplates } from './conversation-templates.js';
import ReadmeKnowledgeBase from './readme-knowledge-base.js';
import { docsSearch } from './docs-search.js';
import { listResources, readResource } from './resources.js';
import { listPrompts, getPrompt } from './prompts.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
/**
 * Sanitize tool name to conform to MCP naming rules [a-z0-9_-]
 */
function sanitizeToolName(name) {
    return name.replace(/[^a-z0-9_-]/g, '_');
}
/**
 * MCP Server for SAP HANA CLI Tools
 *
 * Exposes all hana-cli commands as MCP tools that can be called by LLMs
 */
class HanaCliMcpServer {
    server;
    commands = new Map();
    constructor() {
        const iconPngDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAM0SURBVFhHxZLfT5JhFMf5E/wPdCRkhWLXXXWvN93VHRVG1szNdVFtaUUta5mhVFKrtF+WAgFmzkz7AWrJfFADMU0gimyllGnLuvg2nhce3vd9rFgXb2f7jHO+5znnfAeoAKj+J5ygNJygNJygNJygNJygNJygNJygNCqN+z0yFLr4vNCVEGmJNOJcINsXz4o14VOiu+eIquBODCny0580b8/mf+rlt0d/+06ip9+JZ9V3YqSgM56nym+dRoY9XXFKpSfOtPzWGVE+jQJZLfRX06S5eE7dNkMKbszm0Z9A3RLCJe8HJJd+Qh4D4S9QtwSx6UpY0m/oT2CNLYTKzlnJ+0xMJr6h0h5BandqXm0LMQptk0R9OUyPUwNHPFH5PItHEwvQnAvgiDsi0UPxJWgtAZhuvZLo4kh+/YHyy0FoLAH6NoWmaYxorePsODXQF/jEhm48SWBbyzhqbobhHJpDuTUAzakXeD71WbI8FWXNAZiuhVjtHJ6j9XA4ybSLvXE6rz01grWnR4jmjF9ynBroHf3IBhYWV9DW/xblZ/1Yax6E1jyIsgY/64uj9VEcu2zjrD7fHYH22CBqWrOmLnRH6Y4i8xApOjHMHacGjNZRNiAO38t5bG30o74j+zU3u16zPPp+GRXnCasHg/Owemapnon6u1PQHn5KNHXeVY9TA+sO9MPY+ALj0/zXHEssUzJRZvaiZyjB6mbnNMvlsfBlBZvrnpL1hx7/9jg1oKvpRYatx7246pmR72LhG/uI6LslVovzTCx8XkFHXwxbjj4jG/Y//ONxwUBVN13U1D4J40kfqs8+l+/MKSy3Q9BVPRCo7iG66p6/HqcGDjaPyHetGs/8c4z55Hd5G5abQegqu1C8p4vo9t7P6Tg1sK/eh7HQvHwfIm8WJXnxLjdKTAInbPwf13J9AsUmDynZ7cn5ODWgN95DBmPtAHbWDtC8RKRLqHAJ8G9ISYUrT2+wl5YaHDmbUG3c4USK0hTbHUK+3ZEl3WM6rbP99CzR73TmfFRiILVEb7ALCw0CrKY9kRlRznSDg+gN9n86Tg3IBaXhBKXhBKXhBKXhBKXhBKXhBKXhBKX5BUtWC46LA416AAAAAElFTkSuQmCC';
        this.server = new Server({
            name: 'hana-cli-mcp-server',
            version: '1.0.0',
            icons: [
                {
                    src: iconPngDataUri,
                    mimeType: 'image/png',
                    sizes: ['any'],
                },
            ],
        }, {
            capabilities: {
                tools: {},
                resources: {},
                prompts: {},
            },
        });
        this.setupHandlers();
        this.setupErrorHandling();
    }
    setupErrorHandling() {
        this.server.onerror = (error) => {
            console.error('[MCP Error]', error);
        };
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }
    setupHandlers() {
        this.setupResourceHandlers();
        this.setupPromptHandlers();
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            const tools = [];
            for (const [name, commandModule] of this.commands) {
                const info = extractCommandInfo(commandModule);
                // Build rich description with metadata
                let fullDescription = info.description;
                // Add category and tags inline
                if (info.category) {
                    fullDescription += ` [Category: ${info.category}]`;
                }
                if (info.tags && info.tags.length > 0) {
                    fullDescription += ` [Tags: ${info.tags.join(', ')}]`;
                }
                // Add use cases if available
                if (info.useCases && info.useCases.length > 0) {
                    fullDescription += `\n\n**Common Use Cases:**\n${info.useCases.map(uc => `- ${uc}`).join('\n')}`;
                }
                // Add related commands
                if (info.relatedCommands && info.relatedCommands.length > 0) {
                    fullDescription += `\n\n**Related Commands:** ${info.relatedCommands.map(rc => `hana_${rc}`).join(', ')}`;
                }
                // Add tip about examples/presets if available
                if (hasExamples(name)) {
                    fullDescription += `\n\n💡 **Tip:** Use \`hana_examples\` with command="${name}" to see usage examples.`;
                }
                if (hasPresets(name)) {
                    fullDescription += `\n\n📋 **Tip:** Use \`hana_parameter_presets\` with command="${name}" to see parameter templates.`;
                }
                // Extend schema with project context parameter
                const extendedSchema = {
                    ...info.schema,
                    properties: {
                        ...(info.schema.properties || {}),
                        __projectContext: {
                            type: 'object',
                            description: 'Project-specific connection context (optional). Use this to connect to a project-specific database instead of the default. The CLI will use connection files from the specified projectPath.',
                            properties: {
                                projectPath: {
                                    type: 'string',
                                    description: 'Absolute path to the project directory. Example: "C:/Users/dev/projects/my-app" or "/home/user/projects/my-app"'
                                },
                                connectionFile: {
                                    type: 'string',
                                    description: 'Connection file name relative to projectPath. Example: ".env" or "default-env.json". If provided, the CLI will use this specific file.'
                                },
                                host: {
                                    type: 'string',
                                    description: 'Database host (for direct connection). Example: "database.example.com"'
                                },
                                port: {
                                    type: 'number',
                                    description: 'Database port (for direct connection). Default is 30013.'
                                },
                                user: {
                                    type: 'string',
                                    description: 'Database user (for direct connection). Example: "DBADMIN"'
                                },
                                password: {
                                    type: 'string',
                                    description: 'Database password (for direct connection). SECURITY WARNING: Use connection files instead of hardcoding passwords.'
                                },
                                database: {
                                    type: 'string',
                                    description: 'Database name (for direct connection). Default is "SYSTEMDB".'
                                }
                            }
                        }
                    }
                };
                tools.push({
                    name: `hana_${sanitizeToolName(name)}`,
                    description: fullDescription,
                    inputSchema: extendedSchema,
                });
                // Also register aliases
                if (info.aliases && info.aliases.length > 0) {
                    for (const alias of info.aliases) {
                        tools.push({
                            name: `hana_${sanitizeToolName(alias)}`,
                            description: `${fullDescription} (alias for ${name})`,
                            inputSchema: extendedSchema,
                        });
                    }
                }
            }
            // Add discovery tools
            tools.push({
                name: 'hana_discover_categories',
                description: 'Discover available command categories and get an overview of what each category does. Use this to find commands for a specific task.',
                inputSchema: {
                    type: 'object',
                    properties: {},
                    required: [],
                },
            });
            tools.push({
                name: 'hana_discover_by_category',
                description: 'Get all commands in a specific category. Useful for finding commands when you know the general area (e.g., "data-quality", "performance-analysis").',
                inputSchema: {
                    type: 'object',
                    properties: {
                        category: {
                            type: 'string',
                            description: 'The category to query (e.g., "database-info", "data-quality", "performance-analysis", "schema-management", "security", "backup-recovery", "system-admin", "cloud-management", "hdi-management", "monitoring-diagnostics", "utilities")',
                        },
                    },
                    required: ['category'],
                },
            });
            tools.push({
                name: 'hana_discover_by_tag',
                description: 'Search commands by tag. Tags help identify commands for specific purposes (e.g., "import", "export", "validation", "performance", "user", "privilege").',
                inputSchema: {
                    type: 'object',
                    properties: {
                        tag: {
                            type: 'string',
                            description: 'The tag to search for (e.g., "import", "export", "validation", "performance", "user", "security")',
                        },
                    },
                    required: ['tag'],
                },
            });
            tools.push({
                name: 'hana_workflows',
                description: 'List available workflows - multi-step task sequences for common scenarios like data validation, performance analysis, security audits, and backup procedures.',
                inputSchema: {
                    type: 'object',
                    properties: {},
                    required: [],
                },
            });
            tools.push({
                name: 'hana_workflow_by_id',
                description: 'Get detailed steps for a specific workflow. Provides complete instructions including commands, parameters, and expected outputs.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Workflow ID (e.g., "validate-and-profile", "export-and-import", "performance-analysis", "security-audit", "backup-and-verify")',
                        },
                    },
                    required: ['id'],
                },
            });
            tools.push({
                name: 'hana_search_workflows',
                description: 'Search for workflows by tag or purpose. Find workflows for specific scenarios.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        tag: {
                            type: 'string',
                            description: 'Search tag (e.g., "data-quality", "performance", "security", "backup", "migration")',
                        },
                    },
                    required: ['tag'],
                },
            });
            tools.push({
                name: 'hana_examples',
                description: 'Get real-world usage examples for a specific command with parameter combinations, scenarios, and expected outputs. Essential for understanding how to use commands correctly.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        command: {
                            type: 'string',
                            description: 'Command name (without hana_ prefix, e.g., "import", "export", "dataProfile")',
                        },
                    },
                    required: ['command'],
                },
            });
            tools.push({
                name: 'hana_parameter_presets',
                description: 'Get parameter presets/templates for common use cases of a command. Shows pre-configured parameter combinations for scenarios like "quick-import", "safe-import", "large-file" etc.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        command: {
                            type: 'string',
                            description: 'Command name (without hana_ prefix)',
                        },
                    },
                    required: ['command'],
                },
            });
            tools.push({
                name: 'hana_commands_with_examples',
                description: 'List all commands that have usage examples available. Use this to discover which commands have detailed examples.',
                inputSchema: {
                    type: 'object',
                    properties: {},
                    required: [],
                },
            });
            // Phase 2: Enhanced Discovery Tools
            tools.push({
                name: 'hana_recommend',
                description: 'Get command recommendations based on natural language intent. Tell me what you want to do, and I\'ll suggest the best commands. Example: "find duplicate rows", "check database version", "export table to CSV".',
                inputSchema: {
                    type: 'object',
                    properties: {
                        intent: {
                            type: 'string',
                            description: 'What you want to accomplish in natural language (e.g., "import CSV file", "find slow queries", "check user permissions")',
                        },
                        limit: {
                            type: 'number',
                            description: 'Maximum number of recommendations to return (default: 5)',
                            default: 5,
                        },
                    },
                    required: ['intent'],
                },
            });
            tools.push({
                name: 'hana_quickstart',
                description: 'Get a beginner-friendly quick start guide with the recommended first 6 commands to run when starting with the database. Perfect for new users or initial database exploration.',
                inputSchema: {
                    type: 'object',
                    properties: {},
                    required: [],
                },
            });
            tools.push({
                name: 'hana_troubleshoot',
                description: 'Get troubleshooting guide for a specific command including common issues, solutions, prerequisites, and tips. Essential when a command isn\'t working as expected.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        command: {
                            type: 'string',
                            description: 'Command name (without hana_ prefix) to get troubleshooting help for',
                        },
                    },
                    required: ['command'],
                },
            });
            // Phase 3: Advanced Features
            tools.push({
                name: 'hana_execute_workflow',
                description: 'Execute a complete multi-step workflow with automatic parameter substitution. Runs multiple commands in sequence according to the workflow definition. Use hana_preview_workflow first to see what will be executed.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        workflowId: {
                            type: 'string',
                            description: 'Workflow ID from hana_workflows (e.g., "validate-and-profile", "export-and-import")',
                        },
                        parameters: {
                            type: 'object',
                            description: 'Parameters to substitute in workflow commands. Keys are parameter names, values are actual values (e.g., {"table-name": "CUSTOMERS", "schema-name": "SALES"})',
                        },
                        stopOnError: {
                            type: 'boolean',
                            default: true,
                            description: 'Stop workflow execution if any command fails',
                        },
                    },
                    required: ['workflowId', 'parameters'],
                },
            });
            tools.push({
                name: 'hana_preview_workflow',
                description: 'Preview what commands will be executed in a workflow with your parameters substituted. Shows all steps, commands, and parameters before execution. Always use this before hana_execute_workflow.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        workflowId: {
                            type: 'string',
                            description: 'Workflow ID to preview',
                        },
                        parameters: {
                            type: 'object',
                            description: 'Parameters to substitute',
                        },
                    },
                    required: ['workflowId', 'parameters'],
                },
            });
            tools.push({
                name: 'hana_interpret_result',
                description: 'Get AI-friendly interpretation of command results with insights, recommendations, and analysis. Provides summary, key metrics, concerns detected, and actionable recommendations.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        command: {
                            type: 'string',
                            description: 'The command that was executed',
                        },
                        result: {
                            type: 'string',
                            description: 'The command output to interpret',
                        },
                    },
                    required: ['command', 'result'],
                },
            });
            tools.push({
                name: 'hana_smart_search',
                description: 'Comprehensive search across all resources: commands, workflows, examples, presets, and parameters. More powerful than discover tools - searches everything at once with relevance scoring.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description: 'Search query (keywords or phrases)',
                        },
                        scope: {
                            type: 'string',
                            enum: ['all', 'commands', 'workflows', 'examples', 'presets'],
                            default: 'all',
                            description: 'What to search (default: all)',
                        },
                        limit: {
                            type: 'number',
                            default: 20,
                            description: 'Maximum results to return',
                        },
                    },
                    required: ['query'],
                },
            });
            // Documentation Search Tools
            tools.push({
                name: 'hana_search_docs',
                description: 'Search the comprehensive documentation website (https://sap-samples.github.io/hana-developer-cli-tool-example/) for guides, tutorials, command references, and detailed explanations. Returns relevant documents with excerpts and metadata.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description: 'Search query (e.g., "import data", "BTP integration", "connection setup", "performance tuning")',
                        },
                        category: {
                            type: 'string',
                            description: 'Optional: limit search to specific category (getting-started, commands, features, api-reference, development)',
                        },
                        docType: {
                            type: 'string',
                            enum: ['tutorial', 'command', 'api', 'feature', 'troubleshooting', 'development', 'general'],
                            description: 'Optional: filter by document type',
                        },
                        limit: {
                            type: 'number',
                            default: 10,
                            description: 'Maximum number of results to return (default: 10)',
                        },
                    },
                    required: ['query'],
                },
            });
            tools.push({
                name: 'hana_get_doc',
                description: 'Retrieve the full content of a specific documentation page. Use after hana_search_docs to get complete details from a relevant document.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        path: {
                            type: 'string',
                            description: 'Document path from search results (e.g., "01-getting-started/installation.md", "02-commands/data-tools/import.md")',
                        },
                    },
                    required: ['path'],
                },
            });
            tools.push({
                name: 'hana_docs_stats',
                description: 'Get documentation statistics including total documents, categories, and document types available. Useful for understanding the scope of available documentation.',
                inputSchema: {
                    type: 'object',
                    properties: {},
                    required: [],
                },
            });
            tools.push({
                name: 'hana_list_doc_categories',
                description: 'List all available documentation categories and document types. Use this to understand what documentation is available before searching.',
                inputSchema: {
                    type: 'object',
                    properties: {},
                    required: [],
                },
            });
            tools.push({
                name: 'hana_conversation_templates',
                description: 'List available conversation templates for common scenarios. Templates provide step-by-step guided workflows for tasks like data-exploration, troubleshooting, data-migration, performance-tuning, and security-audit.',
                inputSchema: {
                    type: 'object',
                    properties: {},
                    required: [],
                },
            });
            tools.push({
                name: 'hana_get_template',
                description: 'Get a detailed conversation template for a specific scenario. Includes all steps, commands, expected outcomes, tips, and common questions with answers.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        scenario: {
                            type: 'string',
                            description: 'Scenario name (e.g., "data-exploration", "troubleshooting", "data-migration", "performance-tuning", "security-audit")',
                        },
                    },
                    required: ['scenario'],
                },
            });
            // Knowledge Base Tools from README and Project Documentation
            tools.push({
                name: 'hana_connection_guide',
                description: 'Get detailed guide on connection resolution order and best practices. Shows all 7 steps the tool uses to find database credentials (admin, cds bind, .env, --conn parameter, home directory, default-env.json, fallback).',
                inputSchema: {
                    type: 'object',
                    properties: {},
                    required: [],
                },
            });
            tools.push({
                name: 'hana_standard_parameters',
                description: 'Get standardized parameters for a specific command category. Shows parameter conventions, aliases, defaults, and usage examples for command types like data-manipulation, batch-operations, and list-inspect.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        category: {
                            type: 'string',
                            enum: ['data-manipulation', 'batch-operations', 'list-inspect'],
                            description: 'Command category to get parameter guide for',
                        },
                    },
                    required: ['category'],
                },
            });
            tools.push({
                name: 'hana_security_guide',
                description: 'Get comprehensive security best practices and guidelines for using hana-cli. Covers connection configuration, SQL injection protection, parameter security, and environment security.',
                inputSchema: {
                    type: 'object',
                    properties: {},
                    required: [],
                },
            });
            tools.push({
                name: 'hana_best_practices',
                description: 'Get naming conventions, alias patterns, and best practice patterns for using the CLI. Includes examples of safe operation patterns, cross-database usage, and batch processing.',
                inputSchema: {
                    type: 'object',
                    properties: {},
                    required: [],
                },
            });
            tools.push({
                name: 'hana_project_structure',
                description: 'Get overview of the hana-cli project structure and key documentation resources. Shows all folders, their purposes, and links to relevant README files.',
                inputSchema: {
                    type: 'object',
                    properties: {},
                    required: [],
                },
            });
            tools.push({
                name: 'hana_docs_search',
                description: 'Search across all project documentation including command categories, security guidelines, best practices, and resources. Use keywords to find relevant information.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description: 'Search query (e.g., "security", "connection", "parameters", "import", "export", "data-quality")',
                        },
                    },
                    required: ['query'],
                },
            });
            return { tools };
        });
        // Execute tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            // Remove 'hana_' prefix to get actual command name
            const commandName = name.startsWith('hana_') ? name.slice(5) : name;
            // Handle discovery tools first
            if (commandName === 'discover_categories') {
                const categoryList = Object.entries(CATEGORIES).map(([key, value]) => ({
                    id: key,
                    name: value.name,
                    description: value.description,
                    total: getCommandsInCategory(key).length,
                }));
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                message: 'Available command categories',
                                categories: categoryList,
                                usage: 'Use hana_discover_by_category to get commands in a specific category',
                            }, null, 2),
                        },
                    ],
                };
            }
            if (commandName === 'discover_by_category') {
                const category = args?.category;
                if (!category) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: 'Error: category parameter is required',
                            },
                        ],
                    };
                }
                const commands = getCommandsInCategory(category);
                if (commands.length === 0) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify({
                                    error: `No commands found in category: ${category}`,
                                    tip: 'Use hana_discover_categories to see available categories',
                                }, null, 2),
                            },
                        ],
                    };
                }
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                category,
                                categoryInfo: CATEGORIES[category],
                                commands: commands.map(cmd => ({
                                    command: cmd.command,
                                    category: cmd.category,
                                    tags: cmd.tags,
                                    useCases: cmd.useCases,
                                    relatedCommands: cmd.relatedCommands,
                                })),
                                total: commands.length,
                            }, null, 2),
                        },
                    ],
                };
            }
            if (commandName === 'discover_by_tag') {
                const tag = args?.tag;
                if (!tag) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: 'Error: tag parameter is required',
                            },
                        ],
                    };
                }
                const commands = searchCommandsByTag(tag);
                if (commands.length === 0) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify({
                                    error: `No commands found with tag: ${tag}`,
                                    tip: 'Try different tags or use hana_discover_by_category to browse',
                                }, null, 2),
                            },
                        ],
                    };
                }
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                tag,
                                commands: commands.map(cmd => ({
                                    command: cmd.command,
                                    category: cmd.category,
                                    tags: cmd.tags,
                                    useCases: cmd.useCases,
                                    relatedCommands: cmd.relatedCommands,
                                })),
                                total: commands.length,
                            }, null, 2),
                        },
                    ],
                };
            }
            if (commandName === 'workflows') {
                const workflows = getAllWorkflows();
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                message: 'Available workflows for common multi-step tasks',
                                workflows: workflows.map(wf => ({
                                    id: wf.id,
                                    name: wf.name,
                                    description: wf.description,
                                    goal: wf.goal,
                                    estimatedTime: wf.estimatedTime,
                                    tags: wf.tags,
                                    steps: wf.steps.length,
                                })),
                                total: workflows.length,
                                usage: 'Use hana_workflow_by_id to see detailed steps for a workflow',
                            }, null, 2),
                        },
                    ],
                };
            }
            if (commandName === 'workflow_by_id') {
                const id = args?.id;
                if (!id) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: 'Error: id parameter is required',
                            },
                        ],
                    };
                }
                const workflow = getWorkflowById(id);
                if (!workflow) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify({
                                    error: `Workflow not found: ${id}`,
                                    tip: 'Use hana_workflows to see available workflow IDs',
                                }, null, 2),
                            },
                        ],
                    };
                }
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(workflow, null, 2),
                        },
                    ],
                };
            }
            if (commandName === 'search_workflows') {
                const tag = args?.tag;
                if (!tag) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: 'Error: tag parameter is required',
                            },
                        ],
                    };
                }
                const workflows = searchWorkflowsByTag(tag);
                if (workflows.length === 0) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify({
                                    error: `No workflows found with tag: ${tag}`,
                                    tip: 'Use hana_workflows to see available workflows',
                                }, null, 2),
                            },
                        ],
                    };
                }
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                tag,
                                workflows: workflows.map(wf => ({
                                    id: wf.id,
                                    name: wf.name,
                                    description: wf.description,
                                    goal: wf.goal,
                                    estimatedTime: wf.estimatedTime,
                                    tags: wf.tags,
                                })),
                                total: workflows.length,
                            }, null, 2),
                        },
                    ],
                };
            }
            if (commandName === 'examples') {
                const command = args?.command;
                if (!command) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: 'Error: command parameter is required',
                            },
                        ],
                    };
                }
                const examples = getCommandExamples(command);
                if (examples.length === 0) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify({
                                    error: `No examples available for command: ${command}`,
                                    tip: 'Use hana_commands_with_examples to see which commands have examples',
                                    availableCommands: getCommandsWithExamples(),
                                }, null, 2),
                            },
                        ],
                    };
                }
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                command,
                                examples: examples.map(ex => ({
                                    scenario: ex.scenario,
                                    description: ex.description,
                                    parameters: ex.parameters,
                                    notes: ex.notes,
                                    expectedOutput: ex.expectedOutput,
                                })),
                                total: examples.length,
                                usage: `To execute: Use hana_${command} with the parameters from any example`,
                            }, null, 2),
                        },
                    ],
                };
            }
            if (commandName === 'parameter_presets') {
                const command = args?.command;
                if (!command) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: 'Error: command parameter is required',
                            },
                        ],
                    };
                }
                const presets = getCommandPresets(command);
                if (presets.length === 0) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify({
                                    error: `No presets available for command: ${command}`,
                                    tip: 'Try hana_examples for usage examples instead',
                                    commandsWithPresets: getCommandsWithPresets(),
                                }, null, 2),
                            },
                        ],
                    };
                }
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                command,
                                presets: presets.map(preset => ({
                                    name: preset.name,
                                    description: preset.description,
                                    parameters: preset.parameters,
                                    notes: preset.notes,
                                    whenToUse: preset.whenToUse,
                                })),
                                total: presets.length,
                                usage: 'Replace placeholder values (e.g., <table-name>) with your actual values',
                            }, null, 2),
                        },
                    ],
                };
            }
            if (commandName === 'commands_with_examples') {
                const commandsWithExamples = getCommandsWithExamples();
                const commandsWithPresets = getCommandsWithPresets();
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                message: 'Commands with examples and presets available',
                                commandsWithExamples: commandsWithExamples.sort(),
                                commandsWithPresets: commandsWithPresets.sort(),
                                totalWithExamples: commandsWithExamples.length,
                                totalWithPresets: commandsWithPresets.length,
                                usage: {
                                    examples: 'Use hana_examples with command name to see detailed examples',
                                    presets: 'Use hana_parameter_presets with command name to see parameter templates',
                                },
                            }, null, 2),
                        },
                    ],
                };
            }
            // Phase 2: Enhanced Discovery Handlers
            if (commandName === 'recommend') {
                const intent = args?.intent;
                const limit = args?.limit || 5;
                if (!intent) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: 'Error: intent parameter is required. Describe what you want to do in natural language.',
                            },
                        ],
                    };
                }
                const recommendations = recommendCommands(intent, limit);
                if (recommendations.length === 0) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify({
                                    message: 'No commands found matching your intent',
                                    intent,
                                    tip: 'Try using different words or browse by category with hana_discover_categories',
                                }, null, 2),
                            },
                        ],
                    };
                }
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                intent,
                                recommendations: recommendations.map(rec => ({
                                    command: `hana_${rec.command}`,
                                    confidence: rec.confidence,
                                    reason: rec.reason,
                                    category: rec.category,
                                    tags: rec.tags,
                                    useCases: rec.useCases,
                                    exampleParameters: rec.exampleParameters,
                                    howToUse: rec.exampleParameters
                                        ? `Call hana_${rec.command} with parameters: ${JSON.stringify(rec.exampleParameters)}`
                                        : `Call hana_${rec.command}`,
                                    getExamples: `Use hana_examples with command="${rec.command}" for detailed examples`,
                                })),
                                total: recommendations.length,
                                nextSteps: recommendations.length > 0
                                    ? `Try the highest confidence recommendation first, or use hana_examples to see usage examples`
                                    : undefined,
                            }, null, 2),
                        },
                    ],
                };
            }
            if (commandName === 'quickstart') {
                const guide = getQuickStartGuide();
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                title: '🚀 Quick Start Guide for SAP HANA CLI',
                                description: 'Follow these steps to get started with your database',
                                steps: guide.map(step => ({
                                    order: step.order,
                                    command: `hana_${step.command}`,
                                    description: step.description,
                                    purpose: step.purpose,
                                    parameters: step.parameters,
                                    tips: step.tips,
                                })),
                                totalSteps: guide.length,
                                recommendation: 'Execute these commands in order. Each step builds on the previous one.',
                            }, null, 2),
                        },
                    ],
                };
            }
            if (commandName === 'troubleshoot') {
                const command = args?.command;
                if (!command) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: 'Error: command parameter is required',
                            },
                        ],
                    };
                }
                const guide = getTroubleshootingGuide(command);
                if (!guide) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify({
                                    error: `No troubleshooting guide available for command: ${command}`,
                                    tip: 'Try hana_examples for usage examples, or check command documentation',
                                    availableGuides: ['import', 'export', 'dataProfile', 'tables', 'status', 'healthCheck'],
                                }, null, 2),
                            },
                        ],
                    };
                }
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                command: guide.command,
                                prerequisites: guide.prerequisites,
                                commonIssues: guide.commonIssues.map(issue => ({
                                    issue: issue.issue,
                                    solution: issue.solution,
                                    suggestedCommand: issue.command ? `hana_${issue.command}` : undefined,
                                    parameters: issue.parameters,
                                })),
                                tips: guide.tips,
                                additionalHelp: {
                                    examples: `Use hana_examples with command="${command}" for usage examples`,
                                    presets: `Use hana_parameter_presets with command="${command}" for parameter templates`,
                                },
                            }, null, 2),
                        },
                    ],
                };
            }
            // Phase 3: Advanced Features Handlers
            if (commandName === 'execute_workflow') {
                const workflowId = args?.workflowId;
                const parameters = args?.parameters || {};
                const stopOnError = args?.stopOnError !== false;
                if (!workflowId) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: 'Error: workflowId parameter is required',
                            },
                        ],
                    };
                }
                const result = await executeWorkflow(workflowId, parameters, stopOnError);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                ...result,
                                note: result.success
                                    ? 'All workflow steps completed successfully'
                                    : 'Workflow failed - see results for details',
                            }, null, 2),
                        },
                    ],
                };
            }
            if (commandName === 'preview_workflow') {
                const workflowId = args?.workflowId;
                const parameters = args?.parameters || {};
                if (!workflowId) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: 'Error: workflowId parameter is required',
                            },
                        ],
                    };
                }
                const preview = previewWorkflow(workflowId, parameters);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                ...preview,
                                note: preview.validation?.valid
                                    ? 'Workflow ready to execute - use hana_execute_workflow with these parameters'
                                    : 'Missing required parameters - see validation.missingParameters',
                            }, null, 2),
                        },
                    ],
                };
            }
            if (commandName === 'interpret_result') {
                const command = args?.command;
                const result = args?.result;
                if (!command || !result) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: 'Error: both command and result parameters are required',
                            },
                        ],
                    };
                }
                const interpretation = interpretResult(command, result);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                ...interpretation,
                                usage: interpretation.recommendations.length > 0
                                    ? 'Follow recommendations in priority order for best results'
                                    : undefined,
                            }, null, 2),
                        },
                    ],
                };
            }
            if (commandName === 'smart_search') {
                const query = args?.query;
                const scope = args?.scope || 'all';
                const limit = args?.limit || 20;
                if (!query) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: 'Error: query parameter is required',
                            },
                        ],
                    };
                }
                const searchResults = smartSearch(query, scope, limit);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                ...searchResults,
                                note: searchResults.totalResults > 0
                                    ? `Found ${searchResults.totalResults} matches. Results sorted by relevance.`
                                    : 'No matches found. Try different keywords or browse by category.',
                            }, null, 2),
                        },
                    ],
                };
            }
            // Documentation Search Tool Handlers
            if (commandName === 'search_docs') {
                const query = args?.query;
                const category = args?.category;
                const docType = args?.docType;
                const limit = args?.limit || 10;
                if (!query) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: 'Error: query parameter is required',
                            },
                        ],
                    };
                }
                if (!docsSearch.isAvailable()) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify({
                                    error: 'Documentation index not available',
                                    tip: 'Run "npm run build:docs-index" in the project root to generate the documentation index',
                                }, null, 2),
                            },
                        ],
                    };
                }
                const results = docsSearch.search(query, { category, docType, limit });
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                query,
                                totalResults: results.length,
                                results: results.map(r => ({
                                    title: r.document.title,
                                    path: r.document.path,
                                    category: r.document.category,
                                    docType: r.document.docType,
                                    relevance: r.relevance,
                                    excerpt: r.snippet || r.document.excerpt,
                                    matchedKeywords: r.matchedKeywords,
                                    url: `https://sap-samples.github.io/hana-developer-cli-tool-example/${r.document.path.replace('.md', '.html')}`,
                                })),
                                tip: results.length > 0
                                    ? 'Use hana_get_doc with the path to read the full document content'
                                    : 'No matches found. Try different keywords or use hana_list_doc_categories to browse available documentation',
                            }, null, 2),
                        },
                    ],
                };
            }
            if (commandName === 'get_doc') {
                const path = args?.path;
                if (!path) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: 'Error: path parameter is required',
                            },
                        ],
                    };
                }
                if (!docsSearch.isAvailable()) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify({
                                    error: 'Documentation index not available',
                                    tip: 'Run "npm run build:docs-index" in the project root to generate the documentation index',
                                }, null, 2),
                            },
                        ],
                    };
                }
                const document = docsSearch.getDocument(path);
                const content = docsSearch.getDocumentContent(path);
                if (!document || !content) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify({
                                    error: `Document not found: ${path}`,
                                    tip: 'Use hana_search_docs to find valid document paths',
                                }, null, 2),
                            },
                        ],
                    };
                }
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                title: document.title,
                                path: document.path,
                                category: document.category,
                                docType: document.docType,
                                url: `https://sap-samples.github.io/hana-developer-cli-tool-example/${path.replace('.md', '.html')}`,
                                headings: document.headings,
                                content: content,
                                relatedLinks: document.links,
                                lastModified: document.lastModified,
                            }, null, 2),
                        },
                    ],
                };
            }
            if (commandName === 'docs_stats') {
                if (!docsSearch.isAvailable()) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify({
                                    error: 'Documentation index not available',
                                    tip: 'Run "npm run build:docs-index" in the project root to generate the documentation index',
                                }, null, 2),
                            },
                        ],
                    };
                }
                const stats = docsSearch.getStats();
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                ...stats,
                                websiteUrl: 'https://sap-samples.github.io/hana-developer-cli-tool-example/',
                                usage: 'Use hana_search_docs to search, hana_list_doc_categories to browse',
                            }, null, 2),
                        },
                    ],
                };
            }
            if (commandName === 'list_doc_categories') {
                if (!docsSearch.isAvailable()) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify({
                                    error: 'Documentation index not available',
                                    tip: 'Run "npm run build:docs-index" in the project root to generate the documentation index',
                                }, null, 2),
                            },
                        ],
                    };
                }
                const categories = docsSearch.getCategories();
                const docTypes = docsSearch.getDocTypes();
                const categorySummary = {};
                categories.forEach(cat => {
                    const docs = docsSearch.listByCategory(cat);
                    categorySummary[cat] = {
                        documentCount: docs.length,
                        sampleDocuments: docs.slice(0, 3).map(d => ({
                            title: d.title,
                            path: d.path,
                        })),
                    };
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                categories: categorySummary,
                                documentTypes: docTypes,
                                totalCategories: categories.length,
                                usage: 'Use hana_search_docs with category parameter to limit search scope',
                            }, null, 2),
                        },
                    ],
                };
            }
            if (commandName === 'conversation_templates') {
                const templates = listConversationTemplates();
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                message: 'Available conversation templates',
                                templates: templates.map(t => ({
                                    scenario: t.scenario,
                                    description: t.description,
                                    goal: t.goal,
                                    usage: `Use hana_get_template with scenario="${t.scenario}" to see full details`,
                                })),
                                total: templates.length,
                            }, null, 2),
                        },
                    ],
                };
            }
            if (commandName === 'get_template') {
                const scenario = args?.scenario;
                if (!scenario) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: 'Error: scenario parameter is required',
                            },
                        ],
                    };
                }
                const template = getConversationTemplate(scenario);
                if (!template) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify({
                                    error: `Template not found: ${scenario}`,
                                    availableTemplates: listConversationTemplates().map(t => t.scenario),
                                }, null, 2),
                            },
                        ],
                    };
                }
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                ...template,
                                usage: 'Follow steps in order. Each step builds on previous results.',
                            }, null, 2),
                        },
                    ],
                };
            }
            // Knowledge Base Tool Handlers
            if (commandName === 'connection_guide') {
                return {
                    content: [
                        {
                            type: 'text',
                            text: ReadmeKnowledgeBase.getConnectionGuide(),
                        },
                    ],
                };
            }
            if (commandName === 'standard_parameters') {
                const category = args?.category;
                if (!category) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: 'Error: category parameter is required. Available categories: data-manipulation, batch-operations, list-inspect',
                            },
                        ],
                    };
                }
                const guide = ReadmeKnowledgeBase.getParameterGuide(category);
                return {
                    content: [
                        {
                            type: 'text',
                            text: guide,
                        },
                    ],
                };
            }
            if (commandName === 'security_guide') {
                return {
                    content: [
                        {
                            type: 'text',
                            text: ReadmeKnowledgeBase.getSecurityGuidelines(),
                        },
                    ],
                };
            }
            if (commandName === 'best_practices') {
                return {
                    content: [
                        {
                            type: 'text',
                            text: ReadmeKnowledgeBase.getBestPractices(),
                        },
                    ],
                };
            }
            if (commandName === 'project_structure') {
                return {
                    content: [
                        {
                            type: 'text',
                            text: ReadmeKnowledgeBase.getProjectStructure(),
                        },
                    ],
                };
            }
            if (commandName === 'docs_search') {
                const query = args?.query;
                if (!query) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: 'Error: query parameter is required',
                            },
                        ],
                    };
                }
                const results = ReadmeKnowledgeBase.searchDocumentation(query);
                return {
                    content: [
                        {
                            type: 'text',
                            text: results,
                        },
                    ],
                };
            }
            // Check if command exists (either as main name or alias)
            let actualCommandName = commandName;
            if (!this.commands.has(commandName)) {
                // Check if it's an alias (compare sanitized versions)
                for (const [cmdName, cmdModule] of this.commands) {
                    if (cmdModule.aliases) {
                        for (const alias of cmdModule.aliases) {
                            if (sanitizeToolName(alias) === commandName) {
                                actualCommandName = cmdName;
                                break;
                            }
                        }
                        if (actualCommandName !== commandName)
                            break;
                    }
                }
            }
            if (!this.commands.has(actualCommandName)) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Unknown command: ${commandName}`,
                        },
                    ],
                };
            }
            // Validate environment if needed
            const envCheck = validateEnvironment();
            if (!envCheck.valid) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Environment validation failed: ${envCheck.message}`,
                        },
                    ],
                };
            }
            // Execute the command
            try {
                // Extract connection context if provided by agent
                const context = args?.__projectContext;
                // Remove context from args before passing to CLI (it's not a CLI parameter)
                const cleanArgs = { ...args };
                delete cleanArgs.__projectContext;
                const result = await executeCommand(actualCommandName, cleanArgs, context);
                const formattedOutput = formatResult(result);
                return {
                    content: [
                        {
                            type: 'text',
                            text: formattedOutput,
                        },
                    ],
                };
            }
            catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error executing command: ${error instanceof Error ? error.message : String(error)}`,
                        },
                    ],
                };
            }
        });
    }
    /**
     * Setup MCP Resource handlers for documentation access
     */
    setupResourceHandlers() {
        // List available resources
        this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
            try {
                const resources = listResources();
                return { resources };
            }
            catch (error) {
                console.error('[MCP] Error listing resources:', error);
                return { resources: [] };
            }
        });
        // Read a specific resource
        this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
            try {
                const { uri } = request.params;
                const content = await readResource(uri);
                return {
                    contents: [content],
                };
            }
            catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                console.error(`[MCP] Error reading resource ${request.params.uri}:`, errorMsg);
                throw new Error(`Failed to read resource: ${errorMsg}`);
            }
        });
    }
    /**
     * Setup MCP Prompt handlers for guided workflows
     */
    setupPromptHandlers() {
        // List available prompts
        this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
            try {
                const prompts = listPrompts();
                return { prompts };
            }
            catch (error) {
                console.error('[MCP] Error listing prompts:', error);
                return { prompts: [] };
            }
        });
        // Get a specific prompt
        this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
            try {
                const { name, arguments: args } = request.params;
                const result = getPrompt(name, args);
                return result;
            }
            catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                console.error(`[MCP] Error getting prompt ${request.params.name}:`, errorMsg);
                throw new Error(`Failed to get prompt: ${errorMsg}`);
            }
        });
    }
    /**
     * Load all commands from the parent hana-cli project
     */
    async loadCommands() {
        try {
            // Import the index.js from parent project that exports init()
            // __dirname is mcp-server/build, so go up 2 levels to project root
            const indexPath = join(__dirname, '..', '..', 'bin', 'index.js');
            // Convert to file:// URL for ES module import (required on Windows)
            const indexUrl = pathToFileURL(indexPath).href;
            const indexModule = await import(indexUrl);
            if (typeof indexModule.init !== 'function') {
                throw new Error('index.js does not export an init() function');
            }
            // Call init() to get all command modules
            const commands = await indexModule.init();
            if (!Array.isArray(commands)) {
                throw new Error('init() did not return an array of commands');
            }
            console.error(`[MCP] Loaded ${commands.length} command modules from hana-cli`);
            // Store commands in map
            let successCount = 0;
            for (const cmd of commands) {
                if (cmd && typeof cmd.command === 'string') {
                    const commandName = cmd.command.split(' ')[0];
                    this.commands.set(commandName, cmd);
                    successCount++;
                }
            }
            console.error(`[MCP] Registered ${this.commands.size} unique commands with ${successCount} processed modules`);
            if (this.commands.size === 0) {
                throw new Error('No valid commands were registered');
            }
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.error(`[MCP] Failed to load commands: ${errorMsg}`);
            throw error;
        }
    }
    async run() {
        // Load commands before starting server
        await this.loadCommands();
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('[MCP] SAP HANA CLI MCP Server running on stdio');
    }
}
// Start the server
const server = new HanaCliMcpServer();
server.run().catch((error) => {
    console.error('[MCP] Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map