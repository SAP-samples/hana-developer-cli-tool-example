#!/usr/bin/env node
import('./bin/index.js').then(async () => {
  const base = await import('./utils/base.js');
  const db = await base.createDBConnection();
  
  const query = 'SELECT COLUMN_NAME FROM SYS.TABLE_COLUMNS WHERE TABLE_NAME = \'TABLES\' AND SCHEMA_NAME = \'SYS\' ORDER BY COLUMN_NAME';
  
  const result = await db.statementExecPromisified(
    await db.preparePromisified(query), 
    []
  );
  
  console.log('\nAvailable columns in SYS.TABLES:');
  result.forEach(row => console.log('  -', row.COLUMN_NAME));
  
  // Now check for partition-related ones
  const partRelated = result.filter(row => 
    row.COLUMN_NAME.includes('PART') || 
    row.COLUMN_NAME.includes('PARTITION')
  );
  
  console.log('\nPartition-related columns:');
  if (partRelated.length === 0) {
    console.log('  (none found)');
  } else {
    partRelated.forEach(row => console.log('  -', row.COLUMN_NAME));
  }
  
  process.exit(0);
}).catch(e => { console.error('Error:', e.message); process.exit(1); })
