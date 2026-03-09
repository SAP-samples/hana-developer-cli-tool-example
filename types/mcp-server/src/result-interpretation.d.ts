/**
 * Result interpretation system
 * Provides AI-friendly analysis and insights from command results
 */
export interface ResultInterpretation {
    command: string;
    summary: string;
    insights: string[];
    recommendations: Recommendation[];
    normalBehavior?: string;
    concernsDetected: string[];
    keyMetrics?: Record<string, string | number>;
}
export interface Recommendation {
    priority: 'high' | 'medium' | 'low';
    action: string;
    reason: string;
    command?: string;
    parameters?: Record<string, any>;
}
/**
 * Interpret command results and provide insights
 */
export declare function interpretResult(command: string, output: string): ResultInterpretation;
