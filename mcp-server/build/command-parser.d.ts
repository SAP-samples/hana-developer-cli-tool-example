/**
 * JSON Schema type for MCP tool parameters
 */
export interface JSONSchema {
    type?: string;
    properties?: Record<string, any>;
    required?: string[];
    items?: any;
    enum?: any[];
    default?: any;
    description?: string;
}
/**
 * Converts a yargs builder object to JSON Schema format for MCP tool parameters
 */
export declare function yargsBuilderToJsonSchema(builder: any): JSONSchema;
/**
 * Extracts command information from a yargs command module
 */
export interface CommandInfo {
    name: string;
    aliases?: string[];
    description: string;
    schema: JSONSchema;
}
export declare function extractCommandInfo(commandModule: any): CommandInfo;
//# sourceMappingURL=command-parser.d.ts.map