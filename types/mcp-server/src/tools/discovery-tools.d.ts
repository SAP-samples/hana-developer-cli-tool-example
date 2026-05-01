import { ToolDefinition, ToolResponse } from './types.js';
export declare function getDiscoveryToolDefinitions(): ToolDefinition[];
export declare function handleDiscoveryTool(commandName: string, args: Record<string, any>): ToolResponse | null;
