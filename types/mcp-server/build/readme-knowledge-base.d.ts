export class ReadmeKnowledgeBase {
    /**
     * Global Standard Parameters - Available in all commands
     */
    static GLOBAL_PARAMETERS: ({
        name: string;
        alias: string;
        type: string;
        default: string;
        description: string;
    } | {
        name: string;
        type: string;
        default: string;
        description: string;
        alias?: undefined;
    })[];
    /**
     * Standardized command categories with their parameter conventions
     */
    static COMMAND_CATEGORIES: {
        'data-manipulation': {
            name: string;
            description: string;
            standardParameters: {
                name: string;
                alias: string;
                type: string;
                default: string;
                description: string;
            }[];
        };
        'batch-operations': {
            name: string;
            description: string;
            standardParameters: ({
                name: string;
                alias: string;
                type: string;
                default: string;
                description: string;
            } | {
                name: string;
                type: string;
                default: string;
                description: string;
                alias?: undefined;
            })[];
        };
        'list-inspect': {
            name: string;
            description: string;
            standardParameters: {
                name: string;
                alias: string;
                type: string;
                default: string;
                description: string;
            }[];
        };
    };
    /**
     * Connection resolution order (7-step process)
     */
    static CONNECTION_RESOLUTION: {
        order: number;
        name: string;
        file: string;
        description: string;
        notes: string;
    }[];
    /**
     * Security best practices and connection guidelines
     */
    static SECURITY_GUIDELINES: {
        topic: string;
        description: string;
        details: string[];
    }[];
    /**
     * Parameter naming conventions and best practices
     */
    static NAMING_CONVENTIONS: {
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
    static PROJECT_STRUCTURE: {
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
    static DOCUMENTATION_RESOURCES: {
        'docs-home': {
            path: string;
            title: string;
            description: string;
            contents: string;
        };
        'getting-started': {
            path: string;
            title: string;
            description: string;
            contents: string;
        };
        'web-ui': {
            path: string;
            title: string;
            description: string;
            contents: string;
        };
        'api-reference': {
            path: string;
            title: string;
            description: string;
            contents: string;
        };
        'http-routes': {
            path: string;
            title: string;
            description: string;
            contents: string;
        };
        'mcp-server': {
            path: string;
            title: string;
            description: string;
            contents: string;
        };
        swagger: {
            path: string;
            title: string;
            description: string;
            contents: string;
        };
        'command-reference': {
            path: string;
            title: string;
            description: string;
            contents: string;
        };
    };
    /**
     * Get connection resolution guide with detailed explanations
     */
    static getConnectionGuide(): any;
    /**
     * Get standard parameters for a specific command category
     */
    static getStandardParameters(category: any): any[];
    /**
     * Get security guidelines as formatted text
     */
    static getSecurityGuidelines(): any;
    /**
     * Get parameter guidelines for a specific command category
     */
    static getParameterGuide(category: any): string;
    /**
     * Get project structure overview
     */
    static getProjectStructure(): any;
    /**
     * Get best practices and naming conventions guide
     */
    static getBestPractices(): any;
    /**
     * Search documentation by keyword
     */
    static searchDocumentation(query: any): string;
}
export default ReadmeKnowledgeBase;
