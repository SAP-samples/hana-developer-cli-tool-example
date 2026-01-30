const base = require('./utils/base');

async function testNoConnection() {
    try {
        console.log('Testing behavior with no connection config...');
        
        const dbClass = new base(null);
        
        // Try to create connection without config
        try {
            await dbClass.createConnectionFromEnv();
            console.log('Connection created (should not happen without config)');
            console.log('Connection options:', dbClass.options);
            
            // Try to get schema
            const schema = await dbClass.currentSchema();
            console.log('Current schema:', schema);
            
            await dbClass.disconnect();
        } catch (connError) {
            console.log('Connection error (expected):', connError.message);
        }
        
    } catch (error) {
        console.error('Outer error:', error.message);
    }
}

testNoConnection();