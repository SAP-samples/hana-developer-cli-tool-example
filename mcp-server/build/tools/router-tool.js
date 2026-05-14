import { textResponse, errorResponse } from './types.js';
import { executeCommand, formatResult } from '../executor.js';
import { ROUTER_TOOL_NAME, sanitizeToolName, PROJECT_CONTEXT_SCHEMA } from './tier-config.js';
let commandsMap = new Map();
export function initRouterTool(commands) {
    commandsMap = commands;
}
export function getRouterToolDefinition() {
    return {
        name: ROUTER_TOOL_NAME,
        description: 'Execute any hana-cli command by name. Use hana_discover_categories, hana_discover_by_category, or hana_recommend to find available commands before calling this tool.',
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
export async function handleRouterTool(args) {
    const { command, args: commandArgs = {}, __projectContext } = args;
    if (!command || typeof command !== 'string') {
        return errorResponse('Missing required parameter: command. Use hana_discover_categories or hana_recommend to find available commands.');
    }
    // Resolve the actual command name: direct match first
    let actualCommandName;
    if (commandsMap.has(command)) {
        actualCommandName = command;
    }
    else {
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
                if (actualCommandName !== undefined)
                    break;
            }
        }
    }
    if (actualCommandName === undefined) {
        return errorResponse(`Unknown command: "${command}". Use hana_discover_categories, hana_discover_by_category, or hana_recommend to find available commands.`);
    }
    try {
        const context = __projectContext;
        const cleanArgs = { ...commandArgs };
        delete cleanArgs.__projectContext;
        const result = await executeCommand(actualCommandName, cleanArgs, context);
        const formattedOutput = formatResult(result);
        return textResponse(formattedOutput);
    }
    catch (error) {
        return errorResponse(`Error executing command "${actualCommandName}": ${error instanceof Error ? error.message : String(error)}`);
    }
}
//# sourceMappingURL=router-tool.js.map