/**
 * Converts a yargs builder object to JSON Schema format for MCP tool parameters
 */
export function yargsBuilderToJsonSchema(builder: any): {
    type: string;
    properties: {};
    required: string[] | undefined;
};
export function extractCommandInfo(commandModule: any): {
    name: any;
    aliases: any;
    description: any;
    category: string;
    tags: string[];
    useCases: string[] | undefined;
    relatedCommands: string[] | undefined;
    schema: {
        type: string;
        properties: {};
        required: string[] | undefined;
    };
};
