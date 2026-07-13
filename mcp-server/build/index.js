#!/usr/bin/env node
/**
 * MCP Server for SAP HANA CLI
 *
 * CRITICAL: MCP communicates via JSON-RPC over STDIO. All logging MUST use
 * console.error() (stderr), never console.log() (stdout). Any non-JSON output
 * to stdout will break the protocol.
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema, ListPromptsRequestSchema, GetPromptRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { pathToFileURL } from 'url';
import { join } from 'path';
import { readFileSync } from 'fs';
import { listResources, readResource } from './resources.js';
import { listPrompts, getPrompt } from './prompts.js';
import { getDiscoveryToolDefinitions, handleDiscoveryTool } from './tools/discovery-tools.js';
import { getContentToolDefinitions, handleContentTool } from './tools/content-tools.js';
import { getSearchToolDefinitions, handleSearchTool } from './tools/search-tools.js';
import { initCliTools, getCliToolDefinitions, getAllCliToolDefinitions, getCliToolDefinitionsForCategory, handleCliTool } from './tools/cli-tools.js';
import { initRouterTool, getRouterToolDefinition, handleRouterTool } from './tools/router-tool.js';
import { isRouterTool, MAX_DYNAMIC_TOOLS } from './tools/tier-config.js';
import { errorResponse } from './tools/types.js';
const fullMode = process.argv.includes('--full');
const __dirname = import.meta.dirname;
const pkg = JSON.parse(readFileSync(join(__dirname, '..', '..', 'mcp-server', 'package.json'), 'utf-8'));
class HanaCliMcpServer {
    server;
    commands = new Map();
    activatedCategories = [];
    dynamicToolDefinitions = [];
    constructor() {
        const iconPngDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAM0SURBVFhHxZLfT5JhFMf5E/wPdCRkhWLXXXWvN93VHRVG1szNdVFtaUUta5mhVFKrtF+WAgFmzkz7AWrJfFADMU0gimyllGnLuvg2nhce3vd9rFgXb2f7jHO+5znnfAeoAKj+J5ygNJygNJygNJygNJygNJygNJygNCqN+z0yFLr4vNCVEGmJNOJcINsXz4o14VOiu+eIquBODCny0580b8/mf+rlt0d/+06ip9+JZ9V3YqSgM56nym+dRoY9XXFKpSfOtPzWGVE+jQJZLfRX06S5eE7dNkMKbszm0Z9A3RLCJe8HJJd+Qh4D4S9QtwSx6UpY0m/oT2CNLYTKzlnJ+0xMJr6h0h5BandqXm0LMQptk0R9OUyPUwNHPFH5PItHEwvQnAvgiDsi0UPxJWgtAZhuvZLo4kh+/YHyy0FoLAH6NoWmaYxorePsODXQF/jEhm48SWBbyzhqbobhHJpDuTUAzakXeD71WbI8FWXNAZiuhVjtHJ6j9XA4ybSLvXE6rz01grWnR4jmjF9ynBroHf3IBhYWV9DW/xblZ/1Yax6E1jyIsgY/64uj9VEcu2zjrD7fHYH22CBqWrOmLnRH6Y4i8xApOjHMHacGjNZRNiAO38t5bG30o74j+zU3u16zPPp+GRXnCasHg/Owemapnon6u1PQHn5KNHXeVY9TA+sO9MPY+ALj0/zXHEssUzJRZvaiZyjB6mbnNMvlsfBlBZvrnpL1hx7/9jg1oKvpRYatx7246pmR72LhG/uI6LslVovzTCx8XkFHXwxbjj4jG/Y//ONxwUBVN13U1D4J40kfqs8+l+/MKSy3Q9BVPRCo7iG66p6/HqcGDjaPyHetGs/8c4z55Hd5G5abQegqu1C8p4vo9t7P6Tg1sK/eh7HQvHwfIm8WJXnxLjdKTAInbPwf13J9AsUmDynZ7cn5ODWgN95DBmPtAHbWDtC8RKRLqHAJ8G9ISYUrT2+wl5YaHDmbUG3c4USK0hTbHUK+3ZEl3WM6rbP99CzR73TmfFRiILVEb7ALCw0CrKY9kRlRznSDg+gN9n86Tg3IBaXhBKXhBKXhBKXhBKXhBKXhBKXhBKX5BUtWC46LA416AAAAAElFTkSuQmCC';
        this.server = new Server({
            name: 'hana-cli-mcp-server',
            version: pkg.version,
            icons: [
                {
                    src: iconPngDataUri,
                    mimeType: 'image/png',
                    sizes: ['any'],
                },
            ],
        }, {
            capabilities: {
                tools: { listChanged: true },
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
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            if (fullMode) {
                const tools = [
                    ...getDiscoveryToolDefinitions(),
                    ...getContentToolDefinitions(),
                    ...getSearchToolDefinitions(),
                    ...getAllCliToolDefinitions(),
                ];
                return { tools };
            }
            const tools = [
                ...getDiscoveryToolDefinitions(),
                ...getContentToolDefinitions(),
                ...getSearchToolDefinitions(),
                getRouterToolDefinition(),
                ...getCliToolDefinitions(),
                ...this.dynamicToolDefinitions,
            ];
            return { tools };
        });
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            const commandName = name.startsWith('hana_') ? name.slice(5) : name;
            if (isRouterTool(name)) {
                const result = await handleRouterTool(args);
                if (result)
                    return result;
            }
            const discoveryOptions = fullMode ? undefined : {
                onCategoryActivated: (category) => this.activateCategory(category),
            };
            const result = handleDiscoveryTool(commandName, args, discoveryOptions) ??
                handleContentTool(commandName, args) ??
                handleSearchTool(commandName, args) ??
                await handleCliTool(name, args);
            if (result)
                return result;
            return errorResponse(`Unknown tool: ${name}`);
        });
    }
    setupResourceHandlers() {
        this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
            try {
                return { resources: listResources() };
            }
            catch (error) {
                console.error('[MCP] Error listing resources:', error);
                return { resources: [] };
            }
        });
        this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
            try {
                const content = await readResource(request.params.uri);
                return { contents: [content] };
            }
            catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                console.error(`[MCP] Error reading resource ${request.params.uri}:`, errorMsg);
                throw new Error(`Failed to read resource: ${errorMsg}`);
            }
        });
    }
    setupPromptHandlers() {
        this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
            try {
                return { prompts: listPrompts() };
            }
            catch (error) {
                console.error('[MCP] Error listing prompts:', error);
                return { prompts: [] };
            }
        });
        this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
            try {
                const { name, arguments: args } = request.params;
                return getPrompt(name, args);
            }
            catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                console.error(`[MCP] Error getting prompt ${request.params.name}:`, errorMsg);
                throw new Error(`Failed to get prompt: ${errorMsg}`);
            }
        });
    }
    activateCategory(category) {
        if (this.activatedCategories.includes(category))
            return;
        const tier1Names = new Set(getCliToolDefinitions().map(t => t.name));
        const categoryTools = getCliToolDefinitionsForCategory(category)
            .filter(t => !tier1Names.has(t.name));
        if (categoryTools.length === 0)
            return;
        this.activatedCategories.push(category);
        this.dynamicToolDefinitions.push(...categoryTools);
        // Enforce accumulation cap by removing oldest category's tools
        while (this.dynamicToolDefinitions.length > MAX_DYNAMIC_TOOLS && this.activatedCategories.length > 1) {
            const oldestCategory = this.activatedCategories.shift();
            this.dynamicToolDefinitions = this.dynamicToolDefinitions.filter(t => !getCliToolDefinitionsForCategory(oldestCategory).some(ct => ct.name === t.name));
        }
        this.server.sendToolListChanged().catch(() => { });
    }
    async loadCommands() {
        try {
            const indexPath = join(__dirname, '..', '..', 'bin', 'index.js');
            const indexUrl = pathToFileURL(indexPath).href;
            const indexModule = await import(indexUrl);
            if (typeof indexModule.init !== 'function') {
                throw new Error('index.js does not export an init() function');
            }
            const commands = await indexModule.init();
            if (!Array.isArray(commands)) {
                throw new Error('init() did not return an array of commands');
            }
            console.error(`[MCP] Loaded ${commands.length} command modules from hana-cli`);
            for (const cmd of commands) {
                if (cmd && typeof cmd.command === 'string') {
                    const commandName = cmd.command.split(' ')[0];
                    this.commands.set(commandName, cmd);
                }
            }
            console.error(`[MCP] Registered ${this.commands.size} unique commands`);
            if (this.commands.size === 0) {
                throw new Error('No valid commands were registered');
            }
            initCliTools(this.commands);
            initRouterTool(this.commands);
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.error(`[MCP] Failed to load commands: ${errorMsg}`);
            throw error;
        }
    }
    async run() {
        await this.loadCommands();
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('[MCP] SAP HANA CLI MCP Server running on stdio');
    }
}
const server = new HanaCliMcpServer();
server.run().catch((error) => {
    console.error('[MCP] Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map