/**
 * Documentation Knowledge Base
 *
 * Aggregates and indexes documentation from the project's docs/ folder
 * to provide context-aware guidance and parameter information for the MCP server.
 */
interface ParameterInfo {
    name: string;
    alias?: string | string[];
    type: string;
    default: string;
    description: string;
}
interface CommandCategory {
    name: string;
    description: string;
    examples?: string[];
    standardParameters?: ParameterInfo[];
}
interface SecurityInfo {
    topic: string;
    description: string;
    details: string[];
}
interface ConnectionStep {
    order: number;
    name: string;
    description: string;
    file: string;
    notes?: string;
}
interface ProjectResource {
    path: string;
    title: string;
    description: string;
    contents: string;
}
export declare class ReadmeKnowledgeBase {
    /**
     * Global Standard Parameters - Available in all commands
     */
    static readonly GLOBAL_PARAMETERS: ParameterInfo[];
    /**
     * Standardized command categories with their parameter conventions
     */
    static readonly COMMAND_CATEGORIES: Record<string, CommandCategory>;
    /**
     * Connection resolution order (7-step process)
     */
    static readonly CONNECTION_RESOLUTION: ConnectionStep[];
    /**
     * Security best practices and connection guidelines
     */
    static readonly SECURITY_GUIDELINES: SecurityInfo[];
    /**
     * Parameter naming conventions and best practices
     */
    static readonly NAMING_CONVENTIONS: {
        singleOperations: string;
        sourceTarget: string;
        booleanFlags: string;
        aggregation: string;
        aliases: {
            singleLetter: string;
            extended: string;
            noSelfReference: string;
            maxAliases: string;
        };
    };
    /**
     * Key project folders and their purposes
     */
    static readonly PROJECT_STRUCTURE: {
        bin: string;
        app: string;
        routes: string;
        utils: string;
        docs: string;
        tests: string;
        types: string;
        'mcp-server': string;
        _i18n: string;
    };
    /**
     * Key markdown documentation files and their contents
     */
    static readonly DOCUMENTATION_RESOURCES: Record<string, ProjectResource>;
    /**
     * Get connection resolution guide with detailed explanations
     */
    static getConnectionGuide(): string;
    /**
     * Get standard parameters for a specific command category
     */
    static getStandardParameters(category: string): ParameterInfo[];
    /**
     * Get security guidelines as formatted text
     */
    static getSecurityGuidelines(): string;
    /**
     * Get parameter guidelines for a specific command category
     */
    static getParameterGuide(category: string): string;
    /**
     * Get project structure overview
     */
    static getProjectStructure(): string;
    /**
     * Get best practices and naming conventions guide
     */
    static getBestPractices(): string;
    /**
     * Search documentation by keyword
     */
    static searchDocumentation(query: string): string;
}
export default ReadmeKnowledgeBase;
//# sourceMappingURL=readme-knowledge-base.d.ts.map