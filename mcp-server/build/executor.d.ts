/**
 * Result of command execution
 */
export interface ExecutionResult {
    success: boolean;
    output: string;
    error?: string;
}
/**
 * Executes a hana-cli command and captures its output
 *
 * @param commandName - The command to execute (e.g., 'status', 'tables')
 * @param args - Arguments to pass to the command as key-value pairs
 * @returns Promise with execution result including the command name for formatting
 */
export declare function executeCommand(commandName: string, args?: Record<string, any>): Promise<ExecutionResult & {
    commandName: string;
}>;
/**
 * Validates that required environment variables are set for database connection
 */
export declare function validateEnvironment(): {
    valid: boolean;
    message?: string;
};
/**
 * Formats execution result for display using the output formatter
 */
export declare function formatResult(result: ExecutionResult & {
    commandName: string;
}): string;
//# sourceMappingURL=executor.d.ts.map