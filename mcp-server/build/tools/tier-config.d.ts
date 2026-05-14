export declare const TIER_1_COMMANDS: string[];
export declare const ROUTER_TOOL_NAME = "hana_execute";
export declare const MAX_DYNAMIC_TOOLS = 50;
export declare function sanitizeToolName(name: string): string;
export declare const PROJECT_CONTEXT_SCHEMA: {
    readonly type: "object";
    readonly description: "Project-specific connection context (optional). Use this to connect to a project-specific database instead of the default.";
    readonly properties: {
        readonly connectionFile: {
            readonly type: "string";
            readonly description: "Connection file name relative to projectPath (e.g., \".env\", \"default-env.json\").";
        };
        readonly database: {
            readonly type: "string";
            readonly description: "Database name (default \"SYSTEMDB\").";
        };
        readonly host: {
            readonly type: "string";
            readonly description: "Database host (for direct connection).";
        };
        readonly password: {
            readonly type: "string";
            readonly description: "Database password. SECURITY WARNING: Prefer connection files instead.";
        };
        readonly port: {
            readonly type: "number";
            readonly description: "Database port (default 30013).";
        };
        readonly projectPath: {
            readonly type: "string";
            readonly description: "Absolute path to the project directory.";
        };
        readonly user: {
            readonly type: "string";
            readonly description: "Database user.";
        };
    };
};
export declare function isTier1Command(name: string): boolean;
export declare function isRouterTool(name: string): boolean;
//# sourceMappingURL=tier-config.d.ts.map