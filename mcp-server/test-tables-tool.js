const path = require('path');

async function testTablesTool() {
    try {
        const binPath = path.join(__dirname, '..', 'bin');
        const tables = require(path.join(binPath, 'tables.js'));
        
        console.log('Testing tables tool with MCP server-like call...');
        
        const args = {
            table: '*',
            schema: '**CURRENT_SCHEMA**',
            limit: 200,
            admin: false,
            disableVerbose: true,
            debug: false
        };
        
        console.log('Args:', args);
        
        const result = await tables.default(args);
        
        console.log('\nResult type:', typeof result);
        console.log('Result is falsy?', !result);
        console.log('Result length:', result ? result.length : 0);
        
        if (result) {
            console.log('\nFirst 1000 characters of result:');
            console.log(result.substring(0, 1000));
        } else {
            console.log('\nResult is empty or null!');
        }
        
    } catch (error) {
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

testTablesTool();