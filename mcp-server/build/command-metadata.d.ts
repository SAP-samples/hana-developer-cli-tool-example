/**
 * Command metadata mapping - categorizes commands and provides discovery information
 * Categories help agents understand available functionality at a glance
 */
export interface CommandMetadata {
    command: string;
    category: string;
    tags: string[];
    useCases?: string[];
    prerequisites?: string[];
    relatedCommands?: string[];
}
/**
 * Category definitions with descriptions
 */
export declare const CATEGORIES: {
    readonly 'data-tools': {
        readonly name: "Data Tools";
        readonly description: "Import, export, compare, validate, and manage data across systems";
    };
    readonly 'schema-tools': {
        readonly name: "Schema Tools";
        readonly description: "Explore schemas, tables, views, and database object metadata";
    };
    readonly 'object-inspection': {
        readonly name: "Object Inspection";
        readonly description: "Inspect tables, views, procedures, indexes, and related objects";
    };
    readonly 'analysis-tools': {
        readonly name: "Analysis Tools";
        readonly description: "Analyze dependencies, privileges, calculations, and relationships";
    };
    readonly 'performance-monitoring': {
        readonly name: "Performance Monitoring";
        readonly description: "Monitor performance, expensive operations, and system bottlenecks";
    };
    readonly 'backup-recovery': {
        readonly name: "Backup & Recovery";
        readonly description: "Create backups, manage restores, and verify recovery readiness";
    };
    readonly 'system-admin': {
        readonly name: "System Administration";
        readonly description: "System health, configuration, diagnostics, and maintenance";
    };
    readonly 'system-tools': {
        readonly name: "System Tools";
        readonly description: "System diagnostics, logs, host info, and runtime utilities";
    };
    readonly security: {
        readonly name: "Security";
        readonly description: "User, role, privilege, and security audit management";
    };
    readonly 'mass-operations': {
        readonly name: "Mass Operations";
        readonly description: "Bulk operations for grants, updates, deletions, and conversions";
    };
    readonly 'connection-auth': {
        readonly name: "Connection & Auth";
        readonly description: "Connection setup, authentication helpers, and configuration tools";
    };
    readonly 'btp-integration': {
        readonly name: "BTP Integration";
        readonly description: "SAP BTP integration tools and account management utilities";
    };
    readonly 'hana-cloud': {
        readonly name: "HANA Cloud";
        readonly description: "Manage SAP HANA Cloud instances and related services";
    };
    readonly 'hdi-management': {
        readonly name: "HDI Management";
        readonly description: "Manage HDI containers, groups, and deployment operations";
    };
    readonly 'developer-tools': {
        readonly name: "Developer Tools";
        readonly description: "Developer utilities, templates, docs, and interactive helpers";
    };
};
export declare const COMMAND_METADATA_MAP: Record<string, Omit<CommandMetadata, 'command'>>;
/**
 * Workflow definition for multi-step tasks
 */
export interface Workflow {
    id: string;
    name: string;
    description: string;
    goal: string;
    steps: WorkflowStep[];
    estimatedTime?: string;
    tags?: string[];
}
export interface WorkflowStep {
    order: number;
    command: string;
    description: string;
    keyParameters?: Record<string, string>;
    expectedOutput?: string;
}
/**
 * Workflow registry - common multi-step tasks
 */
export declare const WORKFLOWS: Record<string, Workflow>;
/**
 * Get all commands grouped by category
 */
export declare function getCommandsByCategory(): Record<string, CommandMetadata[]>;
/**
 * Search commands by tags
 */
export declare function searchCommandsByTag(tag: string): CommandMetadata[];
/**
 * Get commands in a specific category
 */
export declare function getCommandsInCategory(category: string): CommandMetadata[];
/**
 * Get all workflows
 */
export declare function getAllWorkflows(): Workflow[];
/**
 * Search workflows by tag
 */
export declare function searchWorkflowsByTag(tag: string): Workflow[];
/**
 * Get workflow by ID
 */
export declare function getWorkflowById(id: string): Workflow | undefined;
//# sourceMappingURL=command-metadata.d.ts.map