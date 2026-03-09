/**
 * Conversation templates system
 * Provides guided interaction patterns for common scenarios
 */
/**
 * Available conversation templates
 */
export const CONVERSATION_TEMPLATES = {
    'data-exploration': {
        scenario: 'Data Exploration',
        description: 'Systematic approach to exploring and understanding database structure and data',
        goal: 'Discover what data exists and understand its structure and quality',
        estimatedTime: '15-30 minutes',
        steps: [
            {
                order: 1,
                phase: 'Connection Verification',
                description: 'Verify database connection and user permissions',
                commands: ['hana_status'],
                expectedOutcome: 'Current user, roles, and connection details displayed',
            },
            {
                order: 2,
                phase: 'Environment Understanding',
                description: 'Understand the database version and system health',
                commands: ['hana_version', 'hana_systemInfo'],
                expectedOutcome: 'HANA version and system configuration details',
            },
            {
                order: 3,
                phase: 'Schema Discovery',
                description: 'Discover available schemas',
                commands: ['hana_schemas'],
                expectedOutcome: 'List of all accessible schemas',
                nextIf: {
                    condition: 'Found interesting schemas',
                    action: 'Proceed to explore tables in selected schema',
                },
            },
            {
                order: 4,
                phase: 'Table Discovery',
                description: 'List tables in schema of interest',
                commands: ['hana_tables'],
                expectedOutcome: 'Tables with types, row counts, and sizes',
            },
            {
                order: 5,
                phase: 'Structure Analysis',
                description: 'Examine detailed structure of interesting tables',
                commands: ['hana_inspectTable'],
                expectedOutcome: 'Columns, types, keys, constraints, and indexes',
            },
            {
                order: 6,
                phase: 'Data Analysis',
                description: 'Profile data to understand distributions and quality',
                commands: ['hana_dataProfile'],
                expectedOutcome: 'Statistics: distinct values, nulls, min/max, distributions',
            },
        ],
        tips: [
            'Start with less important schemas to practice before exploring production data',
            'Use table name patterns (%) to filter large lists',
            'Profile smaller tables first to understand execution time',
            'Take notes on interesting findings for later investigation',
        ],
        commonQuestions: [
            {
                question: 'How do I know which schema to explore?',
                answer: 'Start with schemas that have familiar names related to your project or business domain',
            },
            {
                question: 'What if there are too many tables?',
                answer: 'Use the table parameter with wildcard patterns like "SALES%" to filter by prefix',
            },
        ],
    },
    'troubleshooting': {
        scenario: 'System Troubleshooting',
        description: 'Diagnose and resolve database issues systematically',
        goal: 'Identify root cause of problems and implement solutions',
        estimatedTime: '20-40 minutes',
        steps: [
            {
                order: 1,
                phase: 'Initial Assessment',
                description: 'Check overall system health',
                commands: ['hana_healthCheck'],
                expectedOutcome: 'Health status with any warnings or errors',
            },
            {
                order: 2,
                phase: 'Alert Review',
                description: 'Review active system alerts and warnings',
                commands: ['hana_alerts'],
                expectedOutcome: 'List of alerts with severity levels',
            },
            {
                order: 3,
                phase: 'Resource Analysis',
                description: 'Check memory and resource consumption',
                commands: ['hana_memoryAnalysis', 'hana_expensiveStatements'],
                expectedOutcome: 'Memory usage by tables and expensive queries',
            },
            {
                order: 4,
                phase: 'Detailed Diagnostics',
                description: 'Run comprehensive diagnostics',
                commands: ['hana_diagnose'],
                expectedOutcome: 'Detailed diagnostic report with recommendations',
            },
            {
                order: 5,
                phase: 'Specific Investigation',
                description: 'Investigate specific issues found (blocking, deadlocks, traces)',
                commands: ['hana_blocking', 'hana_deadlocks', 'hana_traces'],
                expectedOutcome: 'Details on specific issues and their causes',
            },
        ],
        tips: [
            'Start with healthCheck for a quick overview',
            'Document all findings before making changes',
            'Check alerts first - they often point to root causes',
            'Compare current state with baseline metrics if available',
        ],
    },
    'data-migration': {
        scenario: 'Data Migration',
        description: 'Safe and reliable data migration between tables or systems',
        goal: 'Move data without loss or corruption',
        estimatedTime: '30-60 minutes',
        steps: [
            {
                order: 1,
                phase: 'Pre-Migration Validation',
                description: 'Verify source and target structures',
                commands: ['hana_inspectTable'],
                expectedOutcome: 'Confirmed table structures match or are compatible',
            },
            {
                order: 2,
                phase: 'Data Quality Check',
                description: 'Profile source data for issues',
                commands: ['hana_dataProfile', 'hana_duplicateDetection'],
                expectedOutcome: 'Understanding of data quality and potential issues',
            },
            {
                order: 3,
                phase: 'Export Data',
                description: 'Export source data with appropriate filters',
                commands: ['hana_export'],
                expectedOutcome: 'Data exported to file successfully',
            },
            {
                order: 4,
                phase: 'Dry Run Import',
                description: 'Test import without committing',
                commands: ['hana_import'],
                expectedOutcome: 'Preview of import shows no errors (use dryRun:true)',
            },
            {
                order: 5,
                phase: 'Actual Import',
                description: 'Import data to target',
                commands: ['hana_import'],
                expectedOutcome: 'Data imported successfully',
            },
            {
                order: 6,
                phase: 'Post-Migration Validation',
                description: 'Verify data integrity after migration',
                commands: ['hana_dataValidator', 'hana_dataProfile'],
                expectedOutcome: 'Confirmed data matches expectations',
            },
        ],
        tips: [
            'Always use dryRun mode first before actual import',
            'Export with WHERE clause to migrate in batches if needed',
            'Keep backup of source data until migration is verified',
            'Use skipWithErrors for large imports to continue on issues',
            'Profile both source and target after migration to compare',
        ],
    },
    'performance-tuning': {
        scenario: 'Performance Analysis and Tuning',
        description: 'Identify and resolve performance bottlenecks',
        goal: 'Improve system performance and query execution times',
        estimatedTime: '30-60 minutes',
        steps: [
            {
                order: 1,
                phase: 'Baseline Measurement',
                description: 'Establish current system performance',
                commands: ['hana_systemInfo', 'hana_healthCheck'],
                expectedOutcome: 'Current system metrics and health status',
            },
            {
                order: 2,
                phase: 'Memory Analysis',
                description: 'Identify memory-intensive tables',
                commands: ['hana_memoryAnalysis'],
                expectedOutcome: 'Tables sorted by memory usage',
            },
            {
                order: 3,
                phase: 'Query Analysis',
                description: 'Find expensive SQL statements',
                commands: ['hana_expensiveStatements'],
                expectedOutcome: 'Most resource-intensive queries',
            },
            {
                order: 4,
                phase: 'Access Pattern Analysis',
                description: 'Identify hot tables and access patterns',
                commands: ['hana_tableHotspots'],
                expectedOutcome: 'Frequently accessed tables',
            },
            {
                order: 5,
                phase: 'Index Review',
                description: 'Check index usage and effectiveness',
                commands: ['hana_indexes'],
                expectedOutcome: 'Index definitions and usage statistics',
            },
        ],
        tips: [
            'Run during representative workload for accurate metrics',
            'Focus on top 10 expensive statements for biggest impact',
            'Check if expensive statements are missing indexes',
            'Consider partitioning for very large tables (>10M rows)',
            'Monitor improvements after each optimization',
        ],
    },
    'security-audit': {
        scenario: 'Security and Access Review',
        description: 'Audit security settings and user access',
        goal: 'Ensure secure configuration and appropriate access controls',
        estimatedTime: '20-40 minutes',
        steps: [
            {
                order: 1,
                phase: 'User Inventory',
                description: 'List all database users',
                commands: ['hana_users'],
                expectedOutcome: 'Complete list of database users',
            },
            {
                order: 2,
                phase: 'Role Analysis',
                description: 'Review role definitions and assignments',
                commands: ['hana_roles'],
                expectedOutcome: 'Roles and their privileges',
            },
            {
                order: 3,
                phase: 'Privilege Analysis',
                description: 'Analyze privilege distribution',
                commands: ['hana_privilegeAnalysis'],
                expectedOutcome: 'Over-privileged users and excessive grants',
            },
            {
                order: 4,
                phase: 'Security Scan',
                description: 'Run comprehensive security scan',
                commands: ['hana_securityScan'],
                expectedOutcome: 'Security issues and vulnerabilities',
            },
            {
                order: 5,
                phase: 'Audit Log Review',
                description: 'Check audit logs for suspicious activity',
                commands: ['hana_auditLog'],
                expectedOutcome: 'Recent security-relevant events',
            },
        ],
        tips: [
            'Review privilege analysis for users with unnecessary admin rights',
            'Check for inactive users that should be disabled',
            'Verify encryption settings for sensitive data',
            'Regular security audits (monthly recommended)',
        ],
    },
};
/**
 * Get conversation template by scenario
 */
export function getConversationTemplate(scenario) {
    return CONVERSATION_TEMPLATES[scenario] || null;
}
/**
 * List all available conversation templates
 */
export function listConversationTemplates() {
    return Object.entries(CONVERSATION_TEMPLATES).map(([key, template]) => ({
        scenario: key,
        description: template.description,
        goal: template.goal,
    }));
}
/**
 * Find templates matching a search query
 */
export function searchTemplates(query) {
    const lowerQuery = query.toLowerCase();
    const results = [];
    for (const template of Object.values(CONVERSATION_TEMPLATES)) {
        if (template.scenario.toLowerCase().includes(lowerQuery) ||
            template.description.toLowerCase().includes(lowerQuery) ||
            template.goal.toLowerCase().includes(lowerQuery)) {
            results.push(template);
        }
    }
    return results;
}
//# sourceMappingURL=conversation-templates.js.map