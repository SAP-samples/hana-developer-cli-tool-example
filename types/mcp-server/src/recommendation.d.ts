/**
 * Intent-based command recommendation system
 * Helps agents find the right command based on natural language intent
 */
export interface CommandRecommendation {
    command: string;
    confidence: 'high' | 'medium' | 'low';
    reason: string;
    category: string;
    tags: string[];
    useCases?: string[];
    exampleParameters?: Record<string, string>;
}
/**
 * Get command recommendations based on natural language intent
 */
export declare function recommendCommands(intent: string, limit?: number): CommandRecommendation[];
/**
 * Quick start commands for new users
 */
export interface QuickStartStep {
    order: number;
    command: string;
    description: string;
    purpose: string;
    parameters?: Record<string, string>;
    tips?: string[];
}
export declare function getQuickStartGuide(): QuickStartStep[];
