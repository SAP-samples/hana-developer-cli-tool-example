import { textResponse, errorResponse } from './types.js';
import { extractCommandInfo } from '../command-parser.js';
import { executeCommand, formatResult } from '../executor.js';
import { hasExamples, hasPresets } from '../examples-presets.js';
import { isTier1Command, sanitizeToolName, PROJECT_CONTEXT_SCHEMA } from './tier-config.js';
let commandsMap = new Map();
export function initCliTools(commands) {
    commandsMap = commands;
}
function buildToolDefinition(name, commandModule) {
    const info = extractCommandInfo(commandModule);
    let fullDescription = info.description;
    if (info.category)
        fullDescription += ` [Category: ${info.category}]`;
    if (info.tags && info.tags.length > 0)
        fullDescription += ` [Tags: ${info.tags.join(', ')}]`;
    if (info.useCases && info.useCases.length > 0) {
        fullDescription += `\n\nCommon Use Cases:\n${info.useCases.map((uc) => `- ${uc}`).join('\n')}`;
    }
    if (info.relatedCommands && info.relatedCommands.length > 0) {
        fullDescription += `\n\nRelated Commands: ${info.relatedCommands.map((rc) => `hana_${rc}`).join(', ')}`;
    }
    if (hasExamples(name)) {
        fullDescription += `\n\nTip: Use hana_examples with command="${name}" to see usage examples.`;
    }
    if (hasPresets(name)) {
        fullDescription += `\nTip: Use hana_parameter_presets with command="${name}" to see parameter templates.`;
    }
    return {
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
    };
}
/** Returns tool definitions for tier-1 commands only (the default initial surface). */
export function getCliToolDefinitions() {
    const tools = [];
    for (const [name, commandModule] of commandsMap) {
        if (!isTier1Command(name))
            continue;
        tools.push(buildToolDefinition(name, commandModule));
    }
    return tools;
}
/** Returns tool definitions for ALL commands (backwards-compat / --full mode). */
export function getAllCliToolDefinitions() {
    const tools = [];
    for (const [name, commandModule] of commandsMap) {
        tools.push(buildToolDefinition(name, commandModule));
    }
    return tools;
}
/** Returns tool definitions for commands belonging to the specified category. */
export function getCliToolDefinitionsForCategory(category) {
    const tools = [];
    for (const [name, commandModule] of commandsMap) {
        const info = extractCommandInfo(commandModule);
        if (info.category === category) {
            tools.push(buildToolDefinition(name, commandModule));
        }
    }
    return tools;
}
export async function handleCliTool(toolName, args) {
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
                if (actualCommandName !== commandName)
                    break;
            }
        }
    }
    if (!commandsMap.has(actualCommandName)) {
        return null;
    }
    try {
        const context = args?.__projectContext;
        const cleanArgs = { ...args };
        delete cleanArgs.__projectContext;
        const result = await executeCommand(actualCommandName, cleanArgs, context);
        const formattedOutput = formatResult(result);
        return textResponse(formattedOutput);
    }
    catch (error) {
        return errorResponse(`Error executing command: ${error instanceof Error ? error.message : String(error)}`);
    }
}
//# sourceMappingURL=cli-tools.js.map