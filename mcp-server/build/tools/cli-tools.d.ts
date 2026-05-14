import { ToolDefinition, ToolResponse } from './types.js';
export declare function initCliTools(commands: Map<string, any>): void;
/** Returns tool definitions for tier-1 commands only (the default initial surface). */
export declare function getCliToolDefinitions(): ToolDefinition[];
/** Returns tool definitions for ALL commands (backwards-compat / --full mode). */
export declare function getAllCliToolDefinitions(): ToolDefinition[];
/** Returns tool definitions for commands belonging to the specified category. */
export declare function getCliToolDefinitionsForCategory(category: string): ToolDefinition[];
export declare function handleCliTool(toolName: string, args: Record<string, any>): Promise<ToolResponse | null>;
//# sourceMappingURL=cli-tools.d.ts.map