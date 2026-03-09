/**
 * Get command recommendations based on natural language intent
 */
export function recommendCommands(intent: any, limit?: number): {
    command: string;
    confidence: string;
    reason: string;
    category: string;
    tags: string[];
    useCases: string[] | undefined;
    exampleParameters: any;
}[];
export function getQuickStartGuide(): ({
    order: number;
    command: string;
    description: string;
    purpose: string;
    tips: string[];
    parameters?: undefined;
} | {
    order: number;
    command: string;
    description: string;
    purpose: string;
    parameters: {
        schema: string;
        table?: undefined;
    };
    tips: string[];
} | {
    order: number;
    command: string;
    description: string;
    purpose: string;
    parameters: {
        table: string;
        schema: string;
    };
    tips: string[];
})[];
