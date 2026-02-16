/**
 * Conversation templates system
 * Provides guided interaction patterns for common scenarios
 */
export interface ConversationTemplate {
    scenario: string;
    description: string;
    goal: string;
    estimatedTime: string;
    steps: TemplateStep[];
    tips: string[];
    commonQuestions?: QuestionAnswer[];
}
export interface TemplateStep {
    order: number;
    phase: string;
    description: string;
    commands: string[];
    expectedOutcome: string;
    nextIf?: {
        condition: string;
        action: string;
    };
}
export interface QuestionAnswer {
    question: string;
    answer: string;
}
/**
 * Available conversation templates
 */
export declare const CONVERSATION_TEMPLATES: Record<string, ConversationTemplate>;
/**
 * Get conversation template by scenario
 */
export declare function getConversationTemplate(scenario: string): ConversationTemplate | null;
/**
 * List all available conversation templates
 */
export declare function listConversationTemplates(): {
    scenario: string;
    description: string;
    goal: string;
}[];
/**
 * Find templates matching a search query
 */
export declare function searchTemplates(query: string): ConversationTemplate[];
//# sourceMappingURL=conversation-templates.d.ts.map