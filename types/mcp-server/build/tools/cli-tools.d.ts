export function initCliTools(commands: any): void;
export function getCliToolDefinitions(): {
    name: string;
    description: string;
    inputSchema: {
        properties: {
            __projectContext: {
                type: string;
                description: string;
                properties: {
                    projectPath: {
                        type: string;
                        description: string;
                    };
                    connectionFile: {
                        type: string;
                        description: string;
                    };
                    host: {
                        type: string;
                        description: string;
                    };
                    port: {
                        type: string;
                        description: string;
                    };
                    user: {
                        type: string;
                        description: string;
                    };
                    password: {
                        type: string;
                        description: string;
                    };
                    database: {
                        type: string;
                        description: string;
                    };
                };
            };
        };
        type: string;
        required?: string[];
        items?: any;
        enum?: any[];
        default?: any;
        description?: string;
    };
}[];
export function handleCliTool(toolName: any, args: any): Promise<import("./types.js").ToolResponse | null>;
