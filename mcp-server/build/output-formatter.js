/**
 * Output formatter for hana-cli MCP server
 * Improves readability of command outputs
 */
/**
 * Parse ASCII table output from hana-cli
 */
function parseAsciiTable(output) {
    const lines = output.split('\n').filter(line => line.trim());
    // Find header row (contains │ separators)
    const headerIndex = lines.findIndex(line => line.includes('│') && !line.startsWith('╭') && !line.startsWith('├'));
    if (headerIndex === -1)
        return null;
    const headerLine = lines[headerIndex];
    const headers = headerLine
        .split('│')
        .map(h => h.trim())
        .filter(h => h.length > 0);
    // Parse data rows
    const rows = [];
    for (let i = headerIndex + 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('├') || line.startsWith('╰'))
            continue;
        const cells = line
            .split('│')
            .map(c => c.trim())
            .filter(c => c.length > 0);
        if (cells.length === headers.length) {
            rows.push(cells);
        }
    }
    return { headers, rows };
}
/**
 * Shorten schema names (UUIDs) to last 6 characters
 */
function shortenSchemaName(schema) {
    if (schema.length > 32 && schema.match(/^[A-F0-9]+$/)) {
        return '...' + schema.slice(-6);
    }
    return schema;
}
/**
 * Group tables by prefix
 */
function groupTables(tables) {
    const groups = new Map();
    for (const table of tables) {
        const prefix = table.split('_')[0];
        if (!groups.has(prefix)) {
            groups.set(prefix, []);
        }
        groups.get(prefix).push(table);
    }
    return groups;
}
/**
 * Format table data as markdown
 */
function formatAsMarkdown(data) {
    const { headers, rows } = data;
    // Calculate column widths
    const widths = headers.map((h, i) => {
        // Handle empty rows case: Math.max() with empty array returns -Infinity
        const cellLengths = rows.map(r => (r[i] || '').length);
        const maxCellWidth = cellLengths.length > 0 ? Math.max(...cellLengths) : 0;
        return Math.max(h.length, maxCellWidth);
    });
    // Build markdown table
    let output = '\n| ' + headers.map((h, i) => h.padEnd(widths[i])).join(' | ') + ' |\n';
    output += '| ' + widths.map(w => '-'.repeat(w)).join(' | ') + ' |\n';
    for (const row of rows) {
        output += '| ' + row.map((cell, i) => (cell || '').padEnd(widths[i] || 0)).join(' | ') + ' |\n';
    }
    return output;
}
/**
 * Format tables command output
 */
function formatTablesOutput(output) {
    const table = parseAsciiTable(output);
    if (!table)
        return output;
    const { headers, rows } = table;
    // Find schema and table name columns
    const schemaIdx = headers.findIndex(h => h.includes('SCHEMA'));
    const tableIdx = headers.findIndex(h => h.includes('TABLE_NAME'));
    if (schemaIdx === -1 || tableIdx === -1)
        return output;
    // Process rows
    const processedRows = rows.map(row => {
        const newRow = [...row];
        if (schemaIdx < newRow.length) {
            newRow[schemaIdx] = shortenSchemaName(newRow[schemaIdx]);
        }
        return newRow;
    });
    // Group tables
    const tableNames = processedRows.map(r => r[tableIdx]);
    const groups = groupTables(tableNames);
    // Build formatted output
    let result = '\n## Database Tables\n\n';
    result += `**Total Tables:** ${rows.length}\n\n`;
    // Show table groups
    result += '### Table Groups:\n';
    for (const [prefix, tables] of Array.from(groups.entries()).sort()) {
        result += `- **${prefix}**: ${tables.length} tables\n`;
    }
    result += '\n';
    // Show formatted table
    result += '### Table Details:\n';
    result += formatAsMarkdown({ headers, rows: processedRows });
    return result;
}
/**
 * Format schemas command output
 */
function formatSchemasOutput(output) {
    const table = parseAsciiTable(output);
    if (!table)
        return output;
    const { headers, rows } = table;
    // Shorten schema names
    const processedRows = rows.map(row => {
        return row.map((cell, idx) => {
            if (headers[idx]?.includes('SCHEMA')) {
                return shortenSchemaName(cell);
            }
            return cell;
        });
    });
    let result = '\n## Database Schemas\n\n';
    result += `**Total Schemas:** ${rows.length}\n\n`;
    result += formatAsMarkdown({ headers, rows: processedRows });
    return result;
}
/**
 * Format views command output
 */
function formatViewsOutput(output) {
    const table = parseAsciiTable(output);
    if (!table)
        return output;
    const { headers, rows } = table;
    const schemaIdx = headers.findIndex(h => h.includes('SCHEMA'));
    const processedRows = rows.map(row => {
        const newRow = [...row];
        if (schemaIdx >= 0 && schemaIdx < newRow.length) {
            newRow[schemaIdx] = shortenSchemaName(newRow[schemaIdx]);
        }
        return newRow;
    });
    let result = '\n## Database Views\n\n';
    result += `**Total Views:** ${rows.length}\n\n`;
    result += formatAsMarkdown({ headers, rows: processedRows });
    return result;
}
/**
 * Format procedures command output
 */
function formatProceduresOutput(output) {
    const table = parseAsciiTable(output);
    if (!table)
        return output;
    const { headers, rows } = table;
    const schemaIdx = headers.findIndex(h => h.includes('SCHEMA'));
    const processedRows = rows.map(row => {
        const newRow = [...row];
        if (schemaIdx >= 0 && schemaIdx < newRow.length) {
            newRow[schemaIdx] = shortenSchemaName(newRow[schemaIdx]);
        }
        return newRow;
    });
    let result = '\n## Stored Procedures\n\n';
    result += `**Total Procedures:** ${rows.length}\n\n`;
    result += formatAsMarkdown({ headers, rows: processedRows });
    return result;
}
/**
 * Format functions command output
 */
function formatFunctionsOutput(output) {
    const table = parseAsciiTable(output);
    if (!table)
        return output;
    const { headers, rows } = table;
    const schemaIdx = headers.findIndex(h => h.includes('SCHEMA'));
    const processedRows = rows.map(row => {
        const newRow = [...row];
        if (schemaIdx >= 0 && schemaIdx < newRow.length) {
            newRow[schemaIdx] = shortenSchemaName(newRow[schemaIdx]);
        }
        return newRow;
    });
    let result = '\n## Database Functions\n\n';
    result += `**Total Functions:** ${rows.length}\n\n`;
    result += formatAsMarkdown({ headers, rows: processedRows });
    return result;
}
/**
 * Format system info output
 */
function formatSystemInfoOutput(output) {
    const table = parseAsciiTable(output);
    if (!table)
        return output;
    const { headers, rows } = table;
    let result = '\n## System Information\n\n';
    // Convert to key-value format for better readability
    for (let i = 0; i < headers.length; i++) {
        result += `**${headers[i]}:** ${rows[0]?.[i] || 'N/A'}\n`;
    }
    return result;
}
/**
 * Format containers output
 */
function formatContainersOutput(output) {
    const table = parseAsciiTable(output);
    if (!table)
        return output;
    const { headers, rows } = table;
    let result = '\n## HDI Containers\n\n';
    result += `**Total Containers:** ${rows.length}\n\n`;
    result += formatAsMarkdown({ headers, rows });
    return result;
}
/**
 * Main formatter function
 */
export function formatOutput(command, output) {
    // Remove the connection config message for cleaner output
    const cleanOutput = output.replace(/Using Connection Configuration.*\n\n?/, '');
    // Detect command type and apply appropriate formatting
    if (command.includes('tables') || command.includes(' t ')) {
        return formatTablesOutput(cleanOutput);
    }
    else if (command.includes('schemas') || command.includes(' sch ')) {
        return formatSchemasOutput(cleanOutput);
    }
    else if (command.includes('views') || command.includes(' v ')) {
        return formatViewsOutput(cleanOutput);
    }
    else if (command.includes('procedures') || command.includes(' p ')) {
        return formatProceduresOutput(cleanOutput);
    }
    else if (command.includes('functions') || command.includes(' f ')) {
        return formatFunctionsOutput(cleanOutput);
    }
    else if (command.includes('systemInfo') || command.includes('sysInfo')) {
        return formatSystemInfoOutput(cleanOutput);
    }
    else if (command.includes('containers') || command.includes('cont')) {
        return formatContainersOutput(cleanOutput);
    }
    // For other commands, try generic table formatting
    const table = parseAsciiTable(cleanOutput);
    if (table && table.rows.length > 0) {
        let result = '\n## Command Output\n\n';
        result += `**Total Rows:** ${table.rows.length}\n\n`;
        result += formatAsMarkdown(table);
        return result;
    }
    // Return original output if no formatting applied
    return output;
}
//# sourceMappingURL=output-formatter.js.map