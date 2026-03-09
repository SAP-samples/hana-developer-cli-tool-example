/**
 * Next steps suggestions and troubleshooting tips
 * Provides context-aware guidance after command execution
 */
/**
 * Get suggested next steps after executing a command
 */
export function getNextSteps(command: any, output: any): any;
/**
 * Get troubleshooting guide for a command
 */
export function getTroubleshootingGuide(command: any): any;
/**
 * Get command-specific tips based on output analysis
 */
export function analyzeOutputForTips(command: any, output: any): string[];
