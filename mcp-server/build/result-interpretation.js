/**
 * Result interpretation system
 * Provides AI-friendly analysis and insights from command results
 */
/**
 * Interpret command results and provide insights
 */
export function interpretResult(command, output) {
    const outputLower = output.toLowerCase();
    // Command-specific interpretation
    switch (command) {
        case 'memoryAnalysis':
            return interpretMemoryAnalysis(output);
        case 'dataProfile':
            return interpretDataProfile(output);
        case 'healthCheck':
            return interpretHealthCheck(output);
        case 'tables':
            return interpretTables(output);
        case 'expensiveStatements':
            return interpretExpensiveStatements(output);
        case 'duplicateDetection':
            return interpretDuplicateDetection(output);
        case 'status':
            return interpretStatus(output);
        default:
            return interpretGeneric(command, output);
    }
}
/**
 * Interpret memory analysis results
 */
function interpretMemoryAnalysis(output) {
    const lines = output.split('\n');
    const tableCount = (output.match(/\│/g) || []).length / 4; // Rough estimate
    const concerns = [];
    const insights = [];
    const recommendations = [];
    // Check for high memory usage patterns
    if (output.includes('GB') || output.includes('MB')) {
        const hasLargeTable = output.match(/(\d+\.?\d*)\s*GB/);
        if (hasLargeTable && parseFloat(hasLargeTable[1]) > 5) {
            concerns.push('Single table using >5GB memory detected');
            insights.push('One or more tables are using significant memory (>5GB)');
            recommendations.push({
                priority: 'high',
                action: 'Consider partitioning large tables',
                reason: 'Large tables can cause memory pressure and slow queries',
                command: 'partitionAnalysis',
            });
        }
    }
    insights.push(`Memory usage analysis completed for ${Math.floor(tableCount)} tables`);
    if (concerns.length === 0) {
        insights.push('Memory distribution appears normal');
    }
    else {
        recommendations.push({
            priority: 'medium',
            action: 'Review table growth trends',
            reason: 'Monitor tables to prevent future memory issues',
        });
    }
    return {
        command: 'memoryAnalysis',
        summary: `Analyzed memory consumption across ${Math.floor(tableCount)} tables`,
        insights,
        recommendations,
        normalBehavior: 'Top 20% of tables typically use 80% of memory (Pareto principle)',
        concernsDetected: concerns,
        keyMetrics: {
            tablesAnalyzed: Math.floor(tableCount),
        },
    };
}
/**
 * Interpret data profile results
 */
function interpretDataProfile(output) {
    const concerns = [];
    const insights = [];
    const recommendations = [];
    // Check for data quality issues
    if (output.includes('NULL') || output.includes('null')) {
        const nullPercentage = output.match(/(\d+)%.*null/i);
        if (nullPercentage && parseInt(nullPercentage[1]) > 50) {
            concerns.push('High NULL percentage detected (>50%)');
            recommendations.push({
                priority: 'medium',
                action: 'Review nullable columns',
                reason: 'High NULL rates may indicate data quality issues',
            });
        }
    }
    if (output.includes('duplicate') || output.includes('Duplicate')) {
        concerns.push('Potential duplicate values detected');
        recommendations.push({
            priority: 'high',
            action: 'Run duplicate detection',
            reason: 'Profile suggests duplicate records exist',
            command: 'duplicateDetection',
        });
    }
    insights.push('Data profiling completed with statistical analysis');
    if (output.includes('distinct')) {
        insights.push('Cardinality analysis shows column distinctness');
    }
    return {
        command: 'dataProfile',
        summary: 'Data profile analysis completed with distribution statistics',
        insights,
        recommendations,
        normalBehavior: 'Low cardinality columns are good candidates for indexing',
        concernsDetected: concerns,
    };
}
/**
 * Interpret health check results
 */
function interpretHealthCheck(output) {
    const outputLower = output.toLowerCase();
    const concerns = [];
    const insights = [];
    const recommendations = [];
    // Check for warnings and errors
    if (outputLower.includes('warning') || outputLower.includes('alert')) {
        concerns.push('System warnings detected');
        recommendations.push({
            priority: 'high',
            action: 'Review alerts and warnings',
            reason: 'System health check identified issues',
            command: 'alerts',
        });
    }
    if (outputLower.includes('error') || outputLower.includes('critical')) {
        concerns.push('Critical issues detected');
        recommendations.push({
            priority: 'high',
            action: 'Run diagnostics immediately',
            reason: 'Critical health issues require attention',
            command: 'diagnose',
        });
    }
    if (outputLower.includes('memory')) {
        insights.push('Memory status checked');
        if (outputLower.includes('high') || outputLower.includes('critical')) {
            recommendations.push({
                priority: 'high',
                action: 'Analyze memory consumption',
                reason: 'High memory usage detected',
                command: 'memoryAnalysis',
            });
        }
    }
    if (concerns.length === 0) {
        insights.push('System health appears normal');
    }
    return {
        command: 'healthCheck',
        summary: concerns.length > 0 ? 'Health check identified issues' : 'System health is good',
        insights,
        recommendations,
        normalBehavior: 'Healthy systems should have no warnings or critical alerts',
        concernsDetected: concerns,
    };
}
/**
 * Interpret tables listing
 */
function interpretTables(output) {
    const lines = output.split('\n').filter(l => l.includes('│'));
    const tableCount = Math.max(0, lines.length - 2); // Subtract header and separator
    const insights = [];
    const recommendations = [];
    insights.push(`Found ${tableCount} tables in the schema`);
    if (tableCount > 100) {
        insights.push('Large number of tables detected');
        recommendations.push({
            priority: 'low',
            action: 'Consider using table patterns to filter results',
            reason: 'Many tables can make navigation difficult',
        });
    }
    else if (tableCount === 0) {
        recommendations.push({
            priority: 'medium',
            action: 'Verify schema name is correct',
            reason: 'No tables found - schema may be empty or name incorrect',
            command: 'schemas',
        });
    }
    return {
        command: 'tables',
        summary: `Listed ${tableCount} tables`,
        insights,
        recommendations,
        normalBehavior: 'Typical schemas have 10-100 tables',
        concernsDetected: [],
        keyMetrics: {
            tableCount,
        },
    };
}
/**
 * Interpret expensive statements results
 */
function interpretExpensiveStatements(output) {
    const concerns = [];
    const insights = [];
    const recommendations = [];
    const statementCount = (output.match(/SELECT|INSERT|UPDATE|DELETE/gi) || []).length;
    insights.push(`Identified ${statementCount} expensive SQL statements`);
    if (statementCount > 0) {
        concerns.push('Resource-intensive queries detected');
        recommendations.push({
            priority: 'high',
            action: 'Review and optimize expensive queries',
            reason: 'Expensive statements impact system performance',
        });
        recommendations.push({
            priority: 'medium',
            action: 'Check table indexes',
            reason: 'Missing indexes often cause expensive queries',
            command: 'indexes',
        });
    }
    return {
        command: 'expensiveStatements',
        summary: `Found ${statementCount} expensive SQL statements`,
        insights,
        recommendations,
        normalBehavior: 'Well-optimized systems have few expensive statements',
        concernsDetected: concerns,
        keyMetrics: {
            expensiveStatements: statementCount,
        },
    };
}
/**
 * Interpret duplicate detection results
 */
function interpretDuplicateDetection(output) {
    const outputLower = output.toLowerCase();
    const concerns = [];
    const insights = [];
    const recommendations = [];
    const hasDuplicates = outputLower.includes('duplicate') &&
        !outputLower.includes('no duplicate') &&
        !outputLower.includes('0 duplicate');
    if (hasDuplicates) {
        concerns.push('Duplicate records found in table');
        insights.push('Data quality issue: duplicate records detected');
        recommendations.push({
            priority: 'high',
            action: 'Review and remove duplicates',
            reason: 'Duplicates can cause data integrity issues',
        });
        recommendations.push({
            priority: 'medium',
            action: 'Add unique constraints to prevent future duplicates',
            reason: 'Prevent duplicate insertion at database level',
        });
    }
    else {
        insights.push('No duplicate records found - data quality is good');
    }
    return {
        command: 'duplicateDetection',
        summary: hasDuplicates ? 'Duplicate records detected' : 'No duplicates found',
        insights,
        recommendations,
        normalBehavior: 'Clean data should have no duplicates on key columns',
        concernsDetected: concerns,
    };
}
/**
 * Interpret status command results
 */
function interpretStatus(output) {
    const insights = [];
    const recommendations = [];
    insights.push('Database connection verified successfully');
    if (output.includes('role') || output.includes('Role')) {
        insights.push('User roles and permissions retrieved');
    }
    recommendations.push({
        priority: 'low',
        action: 'Explore database schemas',
        reason: 'Connection verified - ready to explore data',
        command: 'schemas',
    });
    return {
        command: 'status',
        summary: 'Connected to database successfully',
        insights,
        recommendations,
        normalBehavior: 'Status command shows current user and granted roles',
        concernsDetected: [],
    };
}
/**
 * Generic interpretation for commands without specific logic
 */
function interpretGeneric(command, output) {
    const insights = [];
    insights.push(`Command ${command} executed successfully`);
    const lineCount = output.split('\n').length;
    if (lineCount > 50) {
        insights.push('Large result set returned');
    }
    return {
        command,
        summary: `Command completed successfully`,
        insights,
        recommendations: [],
        concernsDetected: [],
    };
}
//# sourceMappingURL=result-interpretation.js.map