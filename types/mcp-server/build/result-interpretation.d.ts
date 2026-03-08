/**
 * Result interpretation system
 * Provides AI-friendly analysis and insights from command results
 */
/**
 * Interpret command results and provide insights
 */
export function interpretResult(command: any, output: any): {
    command: string;
    summary: string;
    insights: string[];
    recommendations: {
        priority: string;
        action: string;
        reason: string;
    }[];
    normalBehavior: string;
    concernsDetected: string[];
} | {
    command: any;
    summary: string;
    insights: string[];
    recommendations: never[];
    concernsDetected: never[];
};
