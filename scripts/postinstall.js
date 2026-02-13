#!/usr/bin/env node

import { TextBundle } from '@sap/textbundle';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const bundle = new TextBundle(join(__dirname, '..', '_i18n', 'messages.properties'));

// Skip postinstall in CI environments
if (process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true') {
  console.log(bundle.getText('scripts.postinstall.skippingCI'));
  process.exit(0);
}

// Try to link @sap/cds-dk locally for development
import { exec } from 'node:child_process';

exec('npm link @sap/cds-dk --local', (error, stdout, stderr) => {
  if (error) {
    console.log(bundle.getText('scripts.postinstall.linkFailed'));
    // Don't fail the install
    process.exit(0);
  } else {
    console.log(bundle.getText('scripts.postinstall.linkSuccess'));
    process.exit(0);
  }
});
