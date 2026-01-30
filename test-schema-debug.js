const base = require('./utils/base');

async function testSchema() {
    try {
        const dbClass = new base(null);
        await dbClass.createConnectionFromEnv();
        
        console.log('Testing currentSchema()...');
        const schema = await dbClass.currentSchema();
        console.log('Current schema result:', schema);
        console.log('Schema type:', typeof schema);
        console.log('Schema length:', schema ? schema.length : 'null/undefined');
        
        // Test the query directly
        console.log('\nTesting CURRENT_SCHEMA query directly...');
        const result = await dbClass.execSQL(`SELECT CURRENT_SCHEMA "CURRENT_SCHEMA" FROM DUMMY`);
        console.log('Direct query result:', result);
        
        await dbClass.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

testSchema();