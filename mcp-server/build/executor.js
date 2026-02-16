import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { formatOutput } from './output-formatter.js';
import { getNextSteps, analyzeOutputForTips } from './next-steps.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
/**
 * Analyzes error messages and provides actionable suggestions
 */
function analyzeError(commandName, error, output) {
    const errorLower = error.toLowerCase();
    const outputLower = output.toLowerCase();
    const combined = errorLower + ' ' + outputLower;
    // Table not found errors
    if (combined.includes('table') && (combined.includes('not found') || combined.includes('does not exist') || combined.includes('invalid'))) {
        return {
            errorType: 'TABLE_NOT_FOUND',
            originalError: error,
            possibleCauses: [
                'Table name is case-sensitive - check capitalization',
                'Table may be in a different schema',
                'Table may not exist yet',
                'User may not have permission to see the table',
            ],
            suggestions: [
                {
                    action: 'List tables in the schema to verify the table name',
                    command: 'hana_tables',
                    parameters: { schema: '<schema-name>' },
                },
                {
                    action: 'List all available schemas',
                    command: 'hana_schemas',
                },
                {
                    action: 'Check current user and permissions',
                    command: 'hana_status',
                },
            ],
        };
    }
    // Schema not found errors
    if (combined.includes('schema') && (combined.includes('not found') || combined.includes('does not exist') || combined.includes('invalid'))) {
        return {
            errorType: 'SCHEMA_NOT_FOUND',
            originalError: error,
            possibleCauses: [
                'Schema name is case-sensitive',
                'Schema does not exist',
                'User does not have access to the schema',
            ],
            suggestions: [
                {
                    action: 'List all available schemas',
                    command: 'hana_schemas',
                },
                {
                    action: 'Check current user permissions',
                    command: 'hana_status',
                },
            ],
        };
    }
    // File not found errors
    if (combined.includes('file') && (combined.includes('not found') || combined.includes('enoent') || combined.includes('cannot find'))) {
        return {
            errorType: 'FILE_NOT_FOUND',
            originalError: error,
            possibleCauses: [
                'File path is incorrect',
                'File does not exist at the specified location',
                'Relative path may need to be absolute',
            ],
            suggestions: [
                {
                    action: 'Check that the file exists and path is correct',
                },
                {
                    action: 'Use absolute file paths instead of relative paths',
                },
            ],
        };
    }
    // Connection errors
    if (combined.includes('connect') || combined.includes('connection') || combined.includes('econnrefused') || combined.includes('etimedout')) {
        return {
            errorType: 'CONNECTION_ERROR',
            originalError: error,
            possibleCauses: [
                'Database credentials not configured',
                'Database server is not reachable',
                'Network connectivity issue',
                'Database is offline or maintenance',
            ],
            suggestions: [
                {
                    action: 'Verify database connection settings in .env or default-env.json',
                },
                {
                    action: 'Check if database server is running',
                },
                {
                    action: 'Test basic connectivity',
                    command: 'hana_status',
                },
            ],
        };
    }
    // Authentication errors
    if (combined.includes('authenticat') || combined.includes('authorization') || combined.includes('credential') || combined.includes('permission denied')) {
        return {
            errorType: 'AUTHENTICATION_ERROR',
            originalError: error,
            possibleCauses: [
                'Invalid username or password',
                'User account may be locked or expired',
                'Insufficient privileges for the operation',
            ],
            suggestions: [
                {
                    action: 'Verify credentials in .env or default-env.json',
                },
                {
                    action: 'Check user status and roles',
                    command: 'hana_status',
                },
                {
                    action: 'Contact database administrator for access',
                },
            ],
        };
    }
    // Timeout errors
    if (combined.includes('timeout') || combined.includes('timed out')) {
        return {
            errorType: 'TIMEOUT',
            originalError: error,
            possibleCauses: [
                'Operation taking too long (default 30s)',
                'Large dataset requires more time',
                'Database performance issue',
            ],
            suggestions: [
                {
                    action: 'For data operations, consider filtering or limiting results',
                },
                {
                    action: 'Check system health',
                    command: 'hana_healthCheck',
                },
                {
                    action: 'For import/export, use timeoutSeconds parameter to increase timeout',
                },
            ],
        };
    }
    // Parameter/syntax errors
    if (combined.includes('parameter') || combined.includes('argument') || combined.includes('required') || combined.includes('missing')) {
        return {
            errorType: 'PARAMETER_ERROR',
            originalError: error,
            possibleCauses: [
                'Required parameter is missing',
                'Parameter value format is incorrect',
                'Parameter name may be misspelled',
            ],
            suggestions: [
                {
                    action: 'Check parameter requirements and examples',
                    command: 'hana_examples',
                    parameters: { command: commandName },
                },
                {
                    action: 'View parameter presets for this command',
                    command: 'hana_parameter_presets',
                    parameters: { command: commandName },
                },
            ],
        };
    }
    // Generic error with generic suggestions
    return {
        errorType: 'UNKNOWN_ERROR',
        originalError: error,
        possibleCauses: [
            'Check the error message for specific details',
        ],
        suggestions: [
            {
                action: 'Try checking system health',
                command: 'hana_healthCheck',
            },
            {
                action: 'View examples for this command',
                command: 'hana_examples',
                parameters: { command: commandName },
            },
        ],
    };
}
/**
 * Executes a hana-cli command and captures its output
 *
 * @param commandName - The command to execute (e.g., 'status', 'tables')
 * @param args - Arguments to pass to the command as key-value pairs
 * @param context - Optional connection context for project-specific connections
 * @returns Promise with execution result including the command name for formatting
 */
export async function executeCommand(commandName, args = {}, context) {
    return new Promise((resolve) => {
        try {
            // Build the CLI path - go up from build/ to project root, then to bin/cli.js
            const cliPath = join(__dirname, '..', '..', 'bin', 'cli.js');
            // Convert args object to command line arguments
            const commandArgs = [commandName];
            for (const [key, value] of Object.entries(args)) {
                if (value === undefined || value === null)
                    continue;
                // Handle boolean flags
                if (typeof value === 'boolean') {
                    if (value) {
                        commandArgs.push(`--${key}`);
                    }
                    continue;
                }
                // Handle arrays
                if (Array.isArray(value)) {
                    value.forEach(v => {
                        commandArgs.push(`--${key}`, String(v));
                    });
                    continue;
                }
                // Handle other values
                commandArgs.push(`--${key}`, String(value));
            }
            let stdout = '';
            let stderr = '';
            // Build environment with connection context
            const env = {
                ...process.env,
                // Ensure stdio output is captured
                FORCE_COLOR: '0',
            };
            // Apply project context to environment
            if (context?.projectPath) {
                env.HANA_CLI_PROJECT_PATH = context.projectPath;
            }
            if (context?.connectionFile) {
                env.HANA_CLI_CONN_FILE = context.connectionFile;
            }
            // Set direct credentials if provided (use cautiously for security)
            if (context?.host) {
                env.HANA_CLI_HOST = context.host;
                env.HANA_CLI_PORT = String(context.port || 30013);
                if (context.user) {
                    env.HANA_CLI_USER = context.user;
                }
                if (context.password) {
                    env.HANA_CLI_PASSWORD = context.password;
                }
                if (context.database) {
                    env.HANA_CLI_DATABASE = context.database;
                }
            }
            // Determine working directory based on context
            let cwd = join(__dirname, '..', '..');
            if (context?.projectPath) {
                cwd = context.projectPath;
            }
            // Spawn the CLI process
            const child = spawn('node', [cliPath, ...commandArgs], {
                env,
                cwd,
            });
            // Capture stdout
            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });
            // Capture stderr
            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            // Handle process completion
            child.on('close', (code) => {
                if (code === 0) {
                    resolve({
                        success: true,
                        output: stdout || 'Command completed successfully',
                        commandName,
                    });
                }
                else {
                    resolve({
                        success: false,
                        output: stdout,
                        error: stderr || `Command exited with code ${code}`,
                        commandName,
                    });
                }
            });
            // Handle process errors
            child.on('error', (error) => {
                resolve({
                    success: false,
                    output: '',
                    error: `Failed to execute command: ${error.message}`,
                    commandName,
                });
            });
            // Set a timeout to prevent hanging
            const timeout = setTimeout(() => {
                child.kill();
                resolve({
                    success: false,
                    output: stdout,
                    error: 'Command execution timeout (30s)',
                    commandName,
                });
            }, 30000);
            child.on('close', () => {
                clearTimeout(timeout);
            });
        }
        catch (error) {
            resolve({
                success: false,
                output: '',
                error: `Execution error: ${error instanceof Error ? error.message : String(error)}`,
                commandName,
            });
        }
    });
}
/**
 * Validates that required environment variables are set for database connection
 */
export function validateEnvironment() {
    // The hana-cli tool uses various connection methods:
    // - .env files or default-env.json in the project root
    // - Connection parameters passed via CLI (--conn, --user, --password, etc.)
    // - Service keys and BTP connections
    // 
    // Most commands don't strictly require these at validation time
    // since connection errors are handled at command execution
    // 
    // Some commands like 'version' and 'help' work without any connection
    // For now, we'll allow commands to run and let the CLI handle connection validation
    // This provides better error messages from the actual command execution
    return { valid: true };
}
/**
 * Formats execution result for display using the output formatter
 */
export function formatResult(result) {
    if (result.success) {
        // Apply the formatter to the output
        let formattedOutput = formatOutput(result.commandName, result.output);
        // Add context-aware tips based on output analysis
        const tips = analyzeOutputForTips(result.commandName, result.output);
        if (tips.length > 0) {
            formattedOutput += '\n\n**📌 Tips:**\n' + tips.join('\n');
        }
        // Add suggested next steps
        const nextSteps = getNextSteps(result.commandName, result.output);
        if (nextSteps.length > 0) {
            formattedOutput += '\n\n**🔄 Suggested Next Steps:**\n';
            nextSteps.forEach((step, i) => {
                formattedOutput += `${i + 1}. **${step.description}**\n`;
                if (step.reason) {
                    formattedOutput += `   ${step.reason}\n`;
                }
                if (step.parameters) {
                    const paramStr = Object.entries(step.parameters)
                        .map(([k, v]) => `${k}: "${v}"`)
                        .join(', ');
                    formattedOutput += `   → Use: \`hana_${step.command}\` with { ${paramStr} }\n`;
                }
                else {
                    formattedOutput += `   → Use: \`hana_${step.command}\`\n`;
                }
            });
        }
        return formattedOutput;
    }
    else {
        // Analyze the error and provide helpful suggestions
        const errorAnalysis = analyzeError(result.commandName, result.error || '', result.output);
        const parts = [];
        // Add the error header
        parts.push('❌ **Command Failed**\n');
        // Add original error
        parts.push('**Error:**');
        parts.push(errorAnalysis.originalError);
        // Add output if available
        if (result.output && result.output.trim()) {
            parts.push('\n**Output:**');
            parts.push(result.output);
        }
        // Add possible causes
        if (errorAnalysis.possibleCauses.length > 0) {
            parts.push('\n**Possible Causes:**');
            errorAnalysis.possibleCauses.forEach((cause, i) => {
                parts.push(`${i + 1}. ${cause}`);
            });
        }
        // Add actionable suggestions
        if (errorAnalysis.suggestions.length > 0) {
            parts.push('\n**💡 Suggestions:**');
            errorAnalysis.suggestions.forEach((suggestion, i) => {
                parts.push(`${i + 1}. ${suggestion.action}`);
                if (suggestion.command) {
                    if (suggestion.parameters) {
                        const paramStr = Object.entries(suggestion.parameters)
                            .map(([k, v]) => `${k}: "${v}"`)
                            .join(', ');
                        parts.push(`   → Try: \`${suggestion.command}\` with parameters: { ${paramStr} }`);
                    }
                    else {
                        parts.push(`   → Try: \`${suggestion.command}\``);
                    }
                }
            });
        }
        return parts.join('\n');
    }
}
//# sourceMappingURL=executor.js.map