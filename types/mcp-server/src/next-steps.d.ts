/**
 * Next steps suggestions and troubleshooting tips
 * Provides context-aware guidance after command execution
 */
export interface NextStep {
    command: string;
    description: string;
    parameters?: Record<string, string>;
    reason?: string;
}
export interface TroubleshootingTip {
    issue: string;
    solution: string;
    command?: string;
    parameters?: Record<string, any>;
}
export interface TroubleshootingGuide {
    command: string;
    commonIssues: TroubleshootingTip[];
    prerequisites: string[];
    tips: string[];
}
/**
 * Get suggested next steps after executing a command
 */
export declare function getNextSteps(command: string, output?: string): NextStep[];
/**
 * Get troubleshooting guide for a command
 */
export declare function getTroubleshootingGuide(command: string): TroubleshootingGuide | null;
/**
 * Get command-specific tips based on output analysis
 */
export declare function analyzeOutputForTips(command: string, output: string): string[];
