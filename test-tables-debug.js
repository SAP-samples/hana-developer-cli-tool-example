const tables = require('./bin/tables.js');

async function testTables() {
    try {
        console.log('Testing tables command with default schema...');
        
        // Test with explicit **CURRENT_SCHEMA**
        console.log('\n1. Testing with schema: **CURRENT_SCHEMA**');
        const result1 = await tables.default({
            table: '*',
            schema: '**CURRENT_SCHEMA**',
            limit: 200,
            disableVerbose: true,
            debug: false
        });
        console.log('Result with **CURRENT_SCHEMA**:', result1 ? `${result1.length} chars` : 'null');
        console.log('First 500 chars:', result1 ? result1.substring(0, 500) : 'N/A');
        
        // Test with undefined schema (should use default)
        console.log('\n2. Testing with undefined schema');
        const result2 = await tables.default({
            table: '*',
            limit: 200,
            disableVerbose: true,
            debug: false
        });
        console.log('Result with undefined schema:', result2 ? `${result2.length} chars` : 'null');
        console.log('First 500 chars:', result2 ? result2.substring(0, 500) : 'N/A');
        
    } catch (error) {
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

testTables();