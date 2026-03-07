/**
 * Result interpretation system
 * Provides AI-friendly analysis and insights from command results
 */
/**
 * Interpret command results and provide insights
 */
export function interpretResult(command: any, output: any): {
    command: any;
    summary: string;
    insights: string[];
    recommendations: any[];
    concernsDetected: any[];
};
