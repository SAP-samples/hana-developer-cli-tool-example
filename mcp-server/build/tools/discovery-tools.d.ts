import { ToolDefinition, ToolResponse } from './types.js';
export declare function getDiscoveryToolDefinitions(): ToolDefinition[];
export interface DiscoveryToolOptions {
    onCategoryActivated?: (category: string) => void;
}
export declare function handleDiscoveryTool(commandName: string, args: Record<string, any>, options?: DiscoveryToolOptions): ToolResponse | null;
//# sourceMappingURL=discovery-tools.d.ts.map