/**
 * Converts a yargs builder object to JSON Schema format for MCP tool parameters
 */
export function yargsBuilderToJsonSchema(builder: any): {
    type: string;
    properties: {};
    required: string[];
};
export function extractCommandInfo(commandModule: any): {
    name: any;
    aliases: any;
    description: any;
    schema: {
        type: string;
        properties: {};
        required: string[];
    };
};
