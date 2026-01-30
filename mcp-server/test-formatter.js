/**
 * Test script to demonstrate output formatting improvements
 */

const sampleTableOutput = `Using Connection Configuration loaded via .cdsrc-private.json

╭──────────────────────────────────────────────┬──────────────────────────────────────────────────────┬─────────────┬───────────╮
│SCHEMA_NAME│TABLE_NAME│TABLE_OID    │COMMENTS   │
├──────────────────────────────────────────────┼──────────────────────────────────────────────────────┼─────────────┼───────────┤
│14DA6AFA0FF948D7BC914D8DF43B1E67│CDS_OUTBOX_MESSAGES│277219       │           │
├──────────────────────────────────────────────┼──────────────────────────────────────────────────────┼─────────────┼───────────┤
│14DA6AFA0FF948D7BC914D8DF43B1E67│DATASERVICE_DATA│276850       │           │
├──────────────────────────────────────────────┼──────────────────────────────────────────────────────┼─────────────┼───────────┤
│14DA6AFA0FF948D7BC914D8DF43B1E67│STAR_WARS_FILM│277418       │           │
├──────────────────────────────────────────────┼──────────────────────────────────────────────────────┼─────────────┼───────────┤
│14DA6AFA0FF948D7BC914D8DF43B1E67│STAR_WARS_PEOPLE│277296       │           │
├──────────────────────────────────────────────┼──────────────────────────────────────────────────────┼─────────────┼───────────┤
│14DA6AFA0FF948D7BC914D8DF43B1E67│STAR_WARS_PLANET│277324       │           │
╰──────────────────────────────────────────────┴──────────────────────────────────────────────────────┴─────────────┴───────────╯`;

const { formatOutput } = require('./build/output-formatter.js');

console.log('=== ORIGINAL OUTPUT ===');
console.log(sampleTableOutput);
console.log('\n\n=== FORMATTED OUTPUT ===');
console.log(formatOutput('hana-cli tables', sampleTableOutput));