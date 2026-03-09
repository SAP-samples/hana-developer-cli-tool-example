/**
 * Intent-based command recommendation system
 * Helps agents find the right command based on natural language intent
 */
import { COMMAND_METADATA_MAP } from './command-metadata.js';
/**
 * Intent keywords mapped to related terms
 */
const INTENT_PATTERNS = {
    // Data Operations
    'import': ['import', 'load', 'insert', 'upload', 'bring in', 'add data', 'bulk load', 'csv to table'],
    'export': ['export', 'extract', 'download', 'save', 'output', 'dump', 'to csv', 'to excel'],
    'copy': ['copy', 'clone', 'duplicate', 'replicate', 'backup table'],
    'sync': ['sync', 'synchronize', 'replicate', 'mirror'],
    // Data Quality
    'validate': ['validate', 'check', 'verify', 'quality', 'integrity', 'rule'],
    'duplicate': ['duplicate', 'duplicates', 'dupe', 'repeated', 'redundant', 'same'],
    'profile': ['profile', 'analyze', 'statistics', 'distribution', 'summary'],
    'compare': ['compare', 'diff', 'difference', 'versus', 'vs'],
    // Database Info
    'list': ['list', 'show', 'display', 'see', 'view', 'get all'],
    'inspect': ['inspect', 'examine', 'details', 'metadata', 'info about', 'describe'],
    'find': ['find', 'search', 'locate', 'lookup', 'query'],
    'schema': ['schema', 'namespace', 'database schema'],
    'table': ['table', 'tables', 'relation'],
    'view': ['view', 'views'],
    'procedure': ['procedure', 'stored procedure', 'sproc', 'function'],
    // Performance
    'performance': ['performance', 'slow', 'bottleneck', 'optimize', 'speed', 'fast'],
    'memory': ['memory', 'ram', 'memory usage', 'memory consumption'],
    'expensive': ['expensive', 'costly', 'resource intensive', 'slow query', 'long running'],
    // Security
    'user': ['user', 'users', 'account', 'accounts'],
    'role': ['role', 'roles', 'permission', 'permissions'],
    'privilege': ['privilege', 'privileges', 'grant', 'access', 'authorization'],
    'security': ['security', 'secure', 'vulnerability', 'audit'],
    // System Admin
    'status': ['status', 'connection', 'connected', 'current state'],
    'health': ['health', 'healthy', 'check health', 'system health'],
    'version': ['version', 'build', 'release'],
    'backup': ['backup', 'back up', 'save database'],
    'restore': ['restore', 'recover', 'recovery'],
    // Monitoring
    'alert': ['alert', 'alerts', 'warning', 'warnings', 'notification'],
    'trace': ['trace', 'traces', 'tracing', 'debug'],
    'log': ['log', 'logs', 'logging', 'audit log'],
    'monitor': ['monitor', 'monitoring', 'watch'],
    // Troubleshooting
    'error': ['error', 'errors', 'failure', 'failed', 'problem', 'issue'],
    'diagnose': ['diagnose', 'diagnostic', 'troubleshoot', 'debug'],
    'fix': ['fix', 'repair', 'resolve', 'solve'],
};
/**
 * Calculate similarity score between intent and command metadata
 */
function calculateScore(intent, commandName, metadata) {
    let score = 0;
    const intentLower = intent.toLowerCase();
    const words = intentLower.split(/\s+/);
    // Check command name
    if (commandName.toLowerCase().includes(intentLower)) {
        score += 50;
    }
    for (const word of words) {
        if (commandName.toLowerCase().includes(word)) {
            score += 10;
        }
    }
    // Check tags
    if (metadata.tags) {
        for (const tag of metadata.tags) {
            if (tag.toLowerCase().includes(intentLower)) {
                score += 30;
            }
            for (const word of words) {
                if (tag.toLowerCase().includes(word)) {
                    score += 5;
                }
            }
        }
    }
    // Check use cases
    if (metadata.useCases) {
        for (const useCase of metadata.useCases) {
            const useCaseLower = useCase.toLowerCase();
            if (useCaseLower.includes(intentLower)) {
                score += 20;
            }
            for (const word of words) {
                if (useCaseLower.includes(word)) {
                    score += 3;
                }
            }
        }
    }
    // Check category
    if (metadata.category && metadata.category.toLowerCase().includes(intentLower)) {
        score += 15;
    }
    // Match against intent patterns
    for (const [key, patterns] of Object.entries(INTENT_PATTERNS)) {
        for (const pattern of patterns) {
            if (intentLower.includes(pattern)) {
                // Check if command or tags match this pattern key
                if (commandName.toLowerCase().includes(key) ||
                    (metadata.tags && metadata.tags.some((t) => t.toLowerCase().includes(key)))) {
                    score += 25;
                }
            }
        }
    }
    return score;
}
/**
 * Get command recommendations based on natural language intent
 */
export function recommendCommands(intent, limit = 5) {
    const recommendations = [];
    for (const [command, metadata] of Object.entries(COMMAND_METADATA_MAP)) {
        const score = calculateScore(intent, command, metadata);
        if (score > 0) {
            let confidence;
            let reason;
            if (score >= 50) {
                confidence = 'high';
                reason = 'Strong match with command name and purpose';
            }
            else if (score >= 25) {
                confidence = 'medium';
                reason = 'Good match with tags or use cases';
            }
            else {
                confidence = 'low';
                reason = 'Partial match found';
            }
            recommendations.push({
                command,
                confidence,
                reason,
                category: metadata.category,
                tags: metadata.tags,
                useCases: metadata.useCases,
                exampleParameters: getExampleParameters(command),
            });
        }
    }
    // Sort by score (calculate again for sorting)
    recommendations.sort((a, b) => {
        const scoreA = calculateScore(intent, a.command, COMMAND_METADATA_MAP[a.command]);
        const scoreB = calculateScore(intent, b.command, COMMAND_METADATA_MAP[b.command]);
        return scoreB - scoreA;
    });
    return recommendations.slice(0, limit);
}
/**
 * Get example parameters for common commands
 */
function getExampleParameters(command) {
    const examples = {
        'tables': { schema: '<schema-name>' },
        'inspectTable': { table: '<table-name>', schema: '<schema-name>' },
        'import': { filename: '<file.csv>', table: '<table-name>', schema: '<schema-name>' },
        'export': { table: '<table-name>', schema: '<schema-name>', filename: '<output.csv>' },
        'dataProfile': { table: '<table-name>', schema: '<schema-name>' },
        'dataValidator': { table: '<table-name>', schema: '<schema-name>', rulesFile: '<rules.json>' },
        'duplicateDetection': { table: '<table-name>', schema: '<schema-name>' },
        'compareSchema': { sourceSchema: '<schema1>', targetSchema: '<schema2>' },
        'schemaClone': { sourceSchema: '<source>', targetSchema: '<target>' },
        'tableCopy': { sourceTable: '<table>', sourceSchema: '<schema>', targetTable: '<new-table>', targetSchema: '<schema>' },
    };
    return examples[command];
}
export function getQuickStartGuide() {
    return [
        {
            order: 1,
            command: 'status',
            description: 'Check your database connection and current user',
            purpose: 'Verify that you are connected and see your user permissions',
            tips: [
                'This should be your first command',
                'Shows current user, roles, and connection details',
            ],
        },
        {
            order: 2,
            command: 'version',
            description: 'View SAP HANA database version',
            purpose: 'Understand which HANA version you are working with',
            tips: [
                'Different versions have different features',
                'Useful for compatibility checks',
            ],
        },
        {
            order: 3,
            command: 'schemas',
            description: 'List all available database schemas',
            purpose: 'Discover what schemas you have access to',
            tips: [
                'Shows all schemas you can read',
                'Use this to find where your data is located',
            ],
        },
        {
            order: 4,
            command: 'tables',
            description: 'List tables in a specific schema',
            purpose: 'See what tables exist in your schema',
            parameters: { schema: '<your-schema-name>' },
            tips: [
                'Replace <your-schema-name> with actual schema from step 3',
                'Shows table types, row counts, and sizes',
            ],
        },
        {
            order: 5,
            command: 'inspectTable',
            description: 'View detailed information about a table',
            purpose: 'See columns, types, keys, and indexes for a table',
            parameters: { table: '<table-name>', schema: '<schema-name>' },
            tips: [
                'Essential before importing or querying data',
                'Shows complete table structure',
            ],
        },
        {
            order: 6,
            command: 'healthCheck',
            description: 'Run a quick system health check',
            purpose: 'Verify database is healthy before running operations',
            tips: [
                'Good to run periodically',
                'Identifies potential issues early',
            ],
        },
    ];
}
//# sourceMappingURL=recommendation.js.map