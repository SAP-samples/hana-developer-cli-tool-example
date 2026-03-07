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
    readonly 'database-info': {
        readonly name: "Database Information";
        readonly description: "View and analyze database structure, metadata, and current state";
    };
    readonly 'data-quality': {
        readonly name: "Data Quality & Validation";
        readonly description: "Check data integrity, find duplicates, validate against rules";
    };
    readonly 'data-operations': {
        readonly name: "Data Operations";
        readonly description: "Import, export, copy, sync data between systems";
    };
    readonly 'performance-analysis': {
        readonly name: "Performance Analysis";
        readonly description: "Analyze memory usage, expensive operations, and bottlenecks";
    };
    readonly 'schema-management': {
        readonly name: "Schema Management";
        readonly description: "Clone, compare, and analyze database schemas";
    };
    readonly security: {
        readonly name: "Security & Access Control";
        readonly description: "Manage users, roles, privileges, and audit trails";
    };
    readonly 'backup-recovery': {
        readonly name: "Backup & Recovery";
        readonly description: "Create backups, manage restore points, check backup status";
    };
    readonly 'system-admin': {
        readonly name: "System Administration";
        readonly description: "General system health, configuration, and diagnostics";
    };
    readonly 'cloud-management': {
        readonly name: "SAP HANA Cloud Management";
        readonly description: "Manage SAP HANA Cloud instances and subscriptions";
    };
    readonly 'hdi-management': {
        readonly name: "HDI Management";
        readonly description: "Manage HDI (HANA Deployment Infrastructure) containers and groups";
    };
    readonly 'monitoring-diagnostics': {
        readonly name: "Monitoring & Diagnostics";
        readonly description: "Monitor system events, diagnose issues, analyze logs";
    };
    readonly utilities: {
        readonly name: "Utilities & Tools";
        readonly description: "Generate documentation, test data, and perform mass operations";
    };
};
/**
 * Complete command metadata registry
 * Organized by command name for quick lookup
 */
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
