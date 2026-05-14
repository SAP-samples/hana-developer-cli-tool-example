import { ToolDefinition, ToolResponse, textResponse, errorResponse } from './types.js';
import { executeCommand, formatResult } from '../executor.js';
import { ConnectionContext } from '../connection-context.js';
import { ROUTER_TOOL_NAME } from './tier-config.js';

function sanitizeToolName(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');
}

const PROJECT_CONTEXT_SCHEMA = {
  type: 'object',
  description: 'Project-specific connection context (optional). Use this to connect to a project-specific database instead of the default.',
  properties: {
    connectionFile: { type: 'string', description: 'Connection file name relative to projectPath (e.g., ".env", "default-env.json").' },
    database: { type: 'string', description: 'Database name (default "SYSTEMDB").' },
    host: { type: 'string', description: 'Database host (for direct connection).' },
    password: { type: 'string', description: 'Database password. SECURITY WARNING: Prefer connection files instead.' },
    port: { type: 'number', description: 'Database port (default 30013).' },
    projectPath: { type: 'string', description: 'Absolute path to the project directory.' },
    user: { type: 'string', description: 'Database user.' },
  },
};

let commandsMap: Map<string, any> = new Map();

export function initRouterTool(commands: Map<string, any>): void {
  commandsMap = commands;
}

export function getRouterToolDefinition(): ToolDefinition {
  return {
    name: ROUTER_TOOL_NAME,
    description:
      'Execute any hana-cli command by name. Use hana_discover_categories, hana_discover_by_category, or hana_recommend to find available commands before calling this tool.',
    inputSchema: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description: 'The command name to execute (e.g., "tables", "inspectTable", "querySimple").',
        },
        args: {
          type: 'object',
          description: 'Command-specific arguments to pass to the command.',
          properties: {},
          additionalProperties: true,
        },
        __projectContext: PROJECT_CONTEXT_SCHEMA,
      },
      required: ['command'],
    },
  };
}

export async function handleRouterTool(args: Record<string, any>): Promise<ToolResponse | null> {
  const { command, args: commandArgs = {}, __projectContext } = args;

  if (!command || typeof command !== 'string') {
    return errorResponse('Missing required parameter: command. Use hana_discover_categories or hana_recommend to find available commands.');
  }

  // Resolve the actual command name: direct match first
  let actualCommandName: string | undefined;

  if (commandsMap.has(command)) {
    actualCommandName = command;
  } else {
    // Try sanitized match or alias match (same logic as cli-tools.ts)
    const sanitized = sanitizeToolName(command);
    for (const [cmdName, cmdModule] of commandsMap) {
      if (sanitizeToolName(cmdName) === sanitized) {
        actualCommandName = cmdName;
        break;
      }
      if (cmdModule.aliases) {
        for (const alias of cmdModule.aliases) {
          if (sanitizeToolName(String(alias)) === sanitized) {
            actualCommandName = cmdName;
            break;
          }
        }
        if (actualCommandName !== undefined) break;
      }
    }
  }

  if (actualCommandName === undefined) {
    return errorResponse(
      `Unknown command: "${command}". Use hana_discover_categories, hana_discover_by_category, or hana_recommend to find available commands.`
    );
  }

  try {
    const context = __projectContext as ConnectionContext | undefined;

    const result = await executeCommand(actualCommandName, commandArgs as Record<string, any>, context);
    const formattedOutput = formatResult(result);
    return textResponse(formattedOutput);
  } catch (error) {
    return errorResponse(`Error executing command "${actualCommandName}": ${error instanceof Error ? error.message : String(error)}`);
  }
}
