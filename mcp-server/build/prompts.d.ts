/**
 * MCP Prompts for SAP HANA CLI
 *
 * Prompts are reusable templates that guide agents through multi-step workflows.
 * They provide structured conversation templates for common tasks.
 */
import type { GetPromptResult } from '@modelcontextprotocol/sdk/types.js';
export interface Prompt {
    name: string;
    description: string;
    arguments?: PromptArgument[];
}
export interface PromptArgument {
    name: string;
    description: string;
    required: boolean;
}
/**
 * List all available prompts
 */
export declare function listPrompts(): Prompt[];
/**
 * Get a specific prompt template
 */
export declare function getPrompt(name: string, args?: Record<string, string>): GetPromptResult;
//# sourceMappingURL=prompts.d.ts.map