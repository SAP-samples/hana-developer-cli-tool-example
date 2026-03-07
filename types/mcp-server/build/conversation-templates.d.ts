/**
 * Get conversation template by scenario
 */
export function getConversationTemplate(scenario: any): any;
/**
 * List all available conversation templates
 */
export function listConversationTemplates(): {
    scenario: string;
    description: string;
    goal: string;
}[];
/**
 * Find templates matching a search query
 */
export function searchTemplates(query: any): {
    scenario: string;
    description: string;
    goal: string;
    estimatedTime: string;
    steps: {
        order: number;
        phase: string;
        description: string;
        commands: string[];
        expectedOutcome: string;
    }[];
    tips: string[];
}[];
/**
 * Conversation templates system
 * Provides guided interaction patterns for common scenarios
 */
/**
 * Available conversation templates
 */
export const CONVERSATION_TEMPLATES: {
    'data-exploration': {
        scenario: string;
        description: string;
        goal: string;
        estimatedTime: string;
        steps: ({
            order: number;
            phase: string;
            description: string;
            commands: string[];
            expectedOutcome: string;
            nextIf?: undefined;
        } | {
            order: number;
            phase: string;
            description: string;
            commands: string[];
            expectedOutcome: string;
            nextIf: {
                condition: string;
                action: string;
            };
        })[];
        tips: string[];
        commonQuestions: {
            question: string;
            answer: string;
        }[];
    };
    troubleshooting: {
        scenario: string;
        description: string;
        goal: string;
        estimatedTime: string;
        steps: {
            order: number;
            phase: string;
            description: string;
            commands: string[];
            expectedOutcome: string;
        }[];
        tips: string[];
    };
    'data-migration': {
        scenario: string;
        description: string;
        goal: string;
        estimatedTime: string;
        steps: {
            order: number;
            phase: string;
            description: string;
            commands: string[];
            expectedOutcome: string;
        }[];
        tips: string[];
    };
    'performance-tuning': {
        scenario: string;
        description: string;
        goal: string;
        estimatedTime: string;
        steps: {
            order: number;
            phase: string;
            description: string;
            commands: string[];
            expectedOutcome: string;
        }[];
        tips: string[];
    };
    'security-audit': {
        scenario: string;
        description: string;
        goal: string;
        estimatedTime: string;
        steps: {
            order: number;
            phase: string;
            description: string;
            commands: string[];
            expectedOutcome: string;
        }[];
        tips: string[];
    };
};
