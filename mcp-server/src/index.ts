#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';
import { extractCommandInfo } from './command-parser.js';
import { executeCommand, formatResult, validateEnvironment } from './executor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * MCP Server for SAP HANA CLI Tools
 * 
 * Exposes all hana-cli commands as MCP tools that can be called by LLMs
 */
class HanaCliMcpServer {
  private server: Server;
  private commands: Map<string, any> = new Map();

  constructor() {
    this.server = new Server(
      {
        name: 'hana-cli-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools = [];

      for (const [name, commandModule] of this.commands) {
        const info = extractCommandInfo(commandModule);
        
        tools.push({
          name: `hana_${name}`,
          description: info.description,
          inputSchema: info.schema,
        });

        // Also register aliases
        if (info.aliases && info.aliases.length > 0) {
          for (const alias of info.aliases) {
            tools.push({
              name: `hana_${alias}`,
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
        // Check if it's an alias
        for (const [cmdName, cmdModule] of this.commands) {
          if (cmdModule.aliases && cmdModule.aliases.includes(commandName)) {
            actualCommandName = cmdName;
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
      } catch (error) {
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
  async loadCommands(): Promise<void> {
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
    } catch (error) {
      console.error('[MCP] Failed to load commands:', error);
      throw error;
    }
  }

  async run(): Promise<void> {
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