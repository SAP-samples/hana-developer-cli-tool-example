import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { formatOutput } from './output-formatter.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
/**
 * Executes a hana-cli command and captures its output
 *
 * @param commandName - The command to execute (e.g., 'status', 'tables')
 * @param args - Arguments to pass to the command as key-value pairs
 * @returns Promise with execution result including the command name for formatting
 */
export async function executeCommand(commandName, args = {}) {
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
            // Spawn the CLI process
            const child = spawn('node', [cliPath, ...commandArgs], {
                env: {
                    ...process.env,
                    // Ensure stdio output is captured
                    FORCE_COLOR: '0',
                },
                cwd: join(__dirname, '..', '..'),
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
    // The hana-cli tool uses various connection methods, but most commonly:
    // - Uses .env files or default-env.json
    // - Can use connection parameters passed via CLI
    // - Some commands don't need DB connection (like version, help)
    // For now, we'll allow commands to run and let the CLI handle connection validation
    return { valid: true };
}
/**
 * Formats execution result for display using the output formatter
 */
export function formatResult(result) {
    if (result.success) {
        // Apply the formatter to the output
        return formatOutput(result.commandName, result.output);
    }
    else {
        const parts = [];
        if (result.output) {
            // Try to format even error output in case there's useful data
            const formatted = formatOutput(result.commandName, result.output);
            parts.push('Output:', formatted);
        }
        if (result.error) {
            parts.push('Error:', result.error);
        }
        return parts.join('\n\n');
    }
}
//# sourceMappingURL=executor.js.map