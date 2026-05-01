import { ToolDefinition, ToolResponse } from './types.js';
export declare function initCliTools(commands: Map<string, any>): void;
export declare function getCliToolDefinitions(): ToolDefinition[];
export declare function handleCliTool(toolName: string, args: Record<string, any>): Promise<ToolResponse | null>;
