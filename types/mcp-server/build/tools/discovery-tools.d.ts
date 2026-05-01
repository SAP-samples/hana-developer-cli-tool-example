export function getDiscoveryToolDefinitions(): ({
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            category?: undefined;
            tag?: undefined;
            id?: undefined;
        };
        required: never[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            category: {
                type: string;
                description: string;
            };
            tag?: undefined;
            id?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            tag: {
                type: string;
                description: string;
            };
            category?: undefined;
            id?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            id: {
                type: string;
                description: string;
            };
            category?: undefined;
            tag?: undefined;
        };
        required: string[];
    };
})[];
export function handleDiscoveryTool(commandName: any, args: any): import("./types.js").ToolResponse | null;
