#!/usr/bin/env node

// Skip postinstall in CI environments
if (process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true') {
  console.log('Skipping postinstall in CI environment');
  process.exit(0);
}

// Try to link @sap/cds-dk locally for development
import { exec } from 'node:child_process';

exec('npm link @sap/cds-dk --local', (error, stdout, stderr) => {
  if (error) {
    console.log('Note: Could not link @sap/cds-dk (this is optional for development)');
    // Don't fail the install
    process.exit(0);
  } else {
    console.log('Successfully linked @sap/cds-dk');
    process.exit(0);
  }
});
