export interface ToolDefinition {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: Record<string, any>;
        required?: string[];
    };
}
export interface ToolResponse {
    content: Array<{
        type: string;
        text: string;
    }>;
    isError?: boolean;
    [key: string]: unknown;
}
export declare function textResponse(text: string): ToolResponse;
export declare function jsonResponse(data: any): ToolResponse;
export declare function errorResponse(message: string): ToolResponse;
