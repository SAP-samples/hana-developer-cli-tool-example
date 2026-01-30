// Simple test to verify connection logic
const { createRequire } = require('module');
const require = createRequire(import.meta.url);

async function testConnection() {
  try {
    const baseModule = require('../utils/base.js');
    
    console.log('Testing connection auto-detection...');
    
    // Try to create a DB connection using CLI logic
    const dbClass = await baseModule.createDBConnection({
      conn: undefined,
      admin: false,
    });
    
    if (dbClass && dbClass.options) {
      console.log('✓ Successfully detected connection from CLI configuration');
      console.log('  Host:', dbClass.options.host);
      console.log('  Port:', dbClass.options.port);
      console.log('  User:', dbClass.options.user);
      console.log('  Schema:', dbClass.options.schema || dbClass.options.currentSchema || '(not specified)');
      return true;
    } else {
      console.log('✗ Could not detect connection from CLI configuration');
      return false;
    }
  } catch (error) {
    console.error('✗ Error testing connection:', error.message);
    return false;
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1);
});