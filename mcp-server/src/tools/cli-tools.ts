import { ToolDefinition, ToolResponse, textResponse, errorResponse } from './types.js';
import { extractCommandInfo } from '../command-parser.js';
import { executeCommand, formatResult } from '../executor.js';
import { ConnectionContext } from '../connection-context.js';
import { hasExamples, hasPresets } from '../examples-presets.js';

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
    projectPath: { type: 'string', description: 'Absolute path to the project directory.' },
    connectionFile: { type: 'string', description: 'Connection file name relative to projectPath (e.g., ".env", "default-env.json").' },
    host: { type: 'string', description: 'Database host (for direct connection).' },
    port: { type: 'number', description: 'Database port (default 30013).' },
    user: { type: 'string', description: 'Database user.' },
    password: { type: 'string', description: 'Database password. SECURITY WARNING: Prefer connection files instead.' },
    database: { type: 'string', description: 'Database name (default "SYSTEMDB").' },
  },
};

let commandsMap: Map<string, any> = new Map();

export function initCliTools(commands: Map<string, any>): void {
  commandsMap = commands;
}

export function getCliToolDefinitions(): ToolDefinition[] {
  const tools: ToolDefinition[] = [];

  for (const [name, commandModule] of commandsMap) {
    const info = extractCommandInfo(commandModule);

    let fullDescription = info.description;
    if (info.category) fullDescription += ` [Category: ${info.category}]`;
    if (info.tags && info.tags.length > 0) fullDescription += ` [Tags: ${info.tags.join(', ')}]`;
    if (info.useCases && info.useCases.length > 0) {
      fullDescription += `\n\nCommon Use Cases:\n${info.useCases.map(uc => `- ${uc}`).join('\n')}`;
    }
    if (info.relatedCommands && info.relatedCommands.length > 0) {
      fullDescription += `\n\nRelated Commands: ${info.relatedCommands.map(rc => `hana_${rc}`).join(', ')}`;
    }
    if (hasExamples(name)) {
      fullDescription += `\n\nTip: Use hana_examples with command="${name}" to see usage examples.`;
    }
    if (hasPresets(name)) {
      fullDescription += `\nTip: Use hana_parameter_presets with command="${name}" to see parameter templates.`;
    }

    tools.push({
      name: `hana_${sanitizeToolName(name)}`,
      description: fullDescription,
      inputSchema: {
        type: 'object',
        ...info.schema,
        properties: {
          ...(info.schema.properties || {}),
          __projectContext: PROJECT_CONTEXT_SCHEMA,
        },
      },
    });
  }

  return tools;
}

export async function handleCliTool(toolName: string, args: Record<string, any>): Promise<ToolResponse | null> {
  const commandName = toolName.startsWith('hana_') ? toolName.slice(5) : toolName;

  let actualCommandName = commandName;
  if (!commandsMap.has(commandName)) {
    for (const [cmdName, cmdModule] of commandsMap) {
      if (sanitizeToolName(cmdName) === commandName) {
        actualCommandName = cmdName;
        break;
      }
      if (cmdModule.aliases) {
        for (const alias of cmdModule.aliases) {
          if (sanitizeToolName(alias) === commandName) {
            actualCommandName = cmdName;
            break;
          }
        }
        if (actualCommandName !== commandName) break;
      }
    }
  }

  if (!commandsMap.has(actualCommandName)) {
    return null;
  }

  try {
    const context = args?.__projectContext as ConnectionContext | undefined;
    const cleanArgs = { ...args };
    delete cleanArgs.__projectContext;

    const result = await executeCommand(actualCommandName, cleanArgs, context);
    const formattedOutput = formatResult(result);
    return textResponse(formattedOutput);
  } catch (error) {
    return errorResponse(`Error executing command: ${error instanceof Error ? error.message : String(error)}`);
  }
}
