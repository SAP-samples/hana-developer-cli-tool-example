const tables = require('./bin/tables.js');

async function testTablesType() {
    try {
        const result = await tables.default({
            table: '*',
            schema: '**CURRENT_SCHEMA**',
            limit: 5,  // Limit to just 5 to see structure
            disableVerbose: true,
            debug: false
        });
        
        console.log('Result type:', typeof result);
        console.log('Result is null?', result === null);
        console.log('Result is undefined?', result === undefined);
        console.log('Result is empty string?', result === '');
        console.log('Result length:', result ? result.length : 'N/A');
        console.log('Result value:', result);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testTablesType();