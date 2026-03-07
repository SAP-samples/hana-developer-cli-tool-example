/**
 * MCP Prompts for SAP HANA CLI
 *
 * Prompts are reusable templates that guide agents through multi-step workflows.
 * They provide structured conversation templates for common tasks.
 */
/**
 * List all available prompts
 */
export function listPrompts(): {
    name: string;
    description: string;
    arguments: {
        name: string;
        description: string;
        required: boolean;
    }[];
}[];
/**
 * Get a specific prompt template
 */
export function getPrompt(name: any, args: any): {
    messages: {
        role: string;
        content: {
            type: string;
            text: string;
        };
    }[];
};
