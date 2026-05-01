import { ToolDefinition, ToolResponse } from './types.js';
export declare function getContentToolDefinitions(): ToolDefinition[];
export declare function handleContentTool(commandName: string, args: Record<string, any>): ToolResponse | null;
