export function getContentToolDefinitions(): ({
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            command: {
                type: string;
                description: string;
            };
            intent?: undefined;
            limit?: undefined;
            result?: undefined;
            scenario?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            intent: {
                type: string;
                description: string;
            };
            limit: {
                type: string;
                description: string;
                default: number;
            };
            command?: undefined;
            result?: undefined;
            scenario?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            command?: undefined;
            intent?: undefined;
            limit?: undefined;
            result?: undefined;
            scenario?: undefined;
        };
        required: never[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            command: {
                type: string;
                description: string;
            };
            result: {
                type: string;
                description: string;
            };
            intent?: undefined;
            limit?: undefined;
            scenario?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            scenario: {
                type: string;
                description: string;
            };
            command?: undefined;
            intent?: undefined;
            limit?: undefined;
            result?: undefined;
        };
        required: string[];
    };
})[];
export function handleContentTool(commandName: any, args: any): import("./types.js").ToolResponse | null;
