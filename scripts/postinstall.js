#!/usr/bin/env node

import pkg from '@sap/textbundle';
const { TextBundle } = pkg;
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

// Note: @sap/cds-dk should be installed globally
// The CLI will resolve it from global installation at runtime
console.log('Note: For CDS binding features, ensure @sap/cds-dk is installed globally: npm install -g @sap/cds-dk');
process.exit(0);
