#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';
import { extractCommandInfo } from './command-parser.js';
import { executeCommand, formatResult, validateEnvironment } from './executor.js';
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
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            const tools = [];
            for (const [name, commandModule] of this.commands) {
                const info = extractCommandInfo(commandModule);
                tools.push({
                    name: `hana_${sanitizeToolName(name)}`,
                    description: info.description,
                    inputSchema: info.schema,
                });
                // Also register aliases
                if (info.aliases && info.aliases.length > 0) {
                    for (const alias of info.aliases) {
                        tools.push({
                            name: `hana_${sanitizeToolName(alias)}`,
                            description: `${info.description} (alias for ${name})`,
                            inputSchema: info.schema,
                        });
                    }
                }
            }
            return { tools };
        });
        // Execute tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            // Remove 'hana_' prefix to get actual command name
            const commandName = name.startsWith('hana_') ? name.slice(5) : name;
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
                const result = await executeCommand(actualCommandName, args || {});
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
            console.error(`[MCP] Loaded ${commands.length} commands from hana-cli`);
            // Store commands in map
            for (const cmd of commands) {
                if (cmd && typeof cmd.command === 'string') {
                    const commandName = cmd.command.split(' ')[0];
                    this.commands.set(commandName, cmd);
                }
            }
            console.error(`[MCP] Registered ${this.commands.size} unique commands`);
        }
        catch (error) {
            console.error('[MCP] Failed to load commands:', error);
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