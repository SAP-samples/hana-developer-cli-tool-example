/**
 * Connection Context Interface
 *
 * Allows MCP tools to specify project-specific connection context
 * that should be used instead of default install path connections.
 *
 * Passed from MCP tool parameters through to CLI execution.
 */
export interface ConnectionContext {
    /**
     * Absolute path to the project directory
     * If provided, CLI will execute from this directory
     * and look for connection files here first
     *
     * @example "/home/user/projects/my-cap-app"
     */
    projectPath?: string;
    /**
     * Connection file name relative to projectPath
     * e.g., ".env", "default-env.json"
     *
     * If provided along with projectPath, CLI will use this specific file
     *
     * @example ".env" or "default-env.json"
     */
    connectionFile?: string;
    /**
     * Direct database connection - host
     * Use only when explicit credentials are available
     *
     * @example "database.example.com" or "localhost"
     */
    host?: string;
    /**
     * Direct database connection - port
     * Default is 30013 for HANA
     *
     * @example 30013
     */
    port?: number;
    /**
     * Direct database connection - user
     * Use only when explicit credentials are available
     *
     * @example "DBADMIN"
     */
    user?: string;
    /**
     * Direct database connection - password
     * Use cautiously - prefer file-based credentials via connectionFile
     *
     * ⚠️ SECURITY: Never pass passwords in parameters if possible
     * Prefer connection files (.env, default-env.json) instead
     *
     * @example "MyPassword123"
     */
    password?: string;
    /**
     * Direct database connection - database name
     * Default is "SYSTEMDB"
     *
     * @example "SYSTEMDB"
     */
    database?: string;
}
