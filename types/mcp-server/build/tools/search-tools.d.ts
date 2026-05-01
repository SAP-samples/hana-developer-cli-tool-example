export function getSearchToolDefinitions(): ({
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            query: {
                type: string;
                description: string;
            };
            scope: {
                type: string;
                enum: string[];
                description: string;
            };
            category: {
                type: string;
                description: string;
            };
            docType: {
                type: string;
                enum: string[];
                description: string;
            };
            limit: {
                type: string;
                default: number;
                description: string;
            };
            path?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            path: {
                type: string;
                description: string;
            };
            query?: undefined;
            scope?: undefined;
            category?: undefined;
            docType?: undefined;
            limit?: undefined;
        };
        required: string[];
    };
})[];
export function handleSearchTool(commandName: any, args: any): import("./types.js").ToolResponse | null;
