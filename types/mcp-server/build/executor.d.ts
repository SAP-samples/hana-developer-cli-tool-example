/**
 * Executes a hana-cli command and captures its output
 *
 * @param commandName - The command to execute (e.g., 'status', 'tables')
 * @param args - Arguments to pass to the command as key-value pairs
 * @param context - Optional connection context for project-specific connections
 * @returns Promise with execution result including the command name for formatting
 */
export function executeCommand(commandName: any, args: {}, context: any): Promise<any>;
/**
 * Validates that required environment variables are set for database connection
 */
export function validateEnvironment(): {
    valid: boolean;
};
/**
 * Formats execution result for display using the output formatter
 */
export function formatResult(result: any): string;
