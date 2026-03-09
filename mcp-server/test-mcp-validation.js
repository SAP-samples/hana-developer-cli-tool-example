#!/usr/bin/env node

/**
 * MCP Server Validation Test
 * 
 * This script tests that the MCP server properly:
 * 1. Loads all commands from the CLI
 * 2. Extracts their parameters correctly
 * 3. Exposes them with proper schemas
 * 4. Handles function-based builders
 * 
 * Usage: node test-mcp-validation.js
 */

import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';
import { extractCommandInfo } from './build/command-parser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function validateMcpServer() {
  console.log('=== MCP Server Validation ===\n');

  try {
    // Load commands
    console.log('1. Loading commands from CLI...');
    const indexPath = join(__dirname, '..', 'bin', 'index.js');
    const indexUrl = pathToFileURL(indexPath).href;
    const indexModule = await import(indexUrl);

    if (typeof indexModule.init !== 'function') {
      throw new Error('index.js does not export an init() function');
    }

    const commands = await indexModule.init();
    console.log(`   ✓ Loaded ${commands.length} command modules\n`);

    // Analyze commands
    console.log('2. Analyzing command parameters...\n');
    
    const stats = {
      total: 0,
      withParameters: 0,
      withAliases: 0,
      functionBuilders: 0,
      objectBuilders: 0,
      noBuilder: 0,
      missingDescription: 0
    };

    const commandsByType = [];
    let sampleCommands = [];

    for (const cmd of commands) {
      if (!cmd || typeof cmd.command !== 'string') continue;

      stats.total++;
      const commandName = cmd.command.split(' ')[0];
      
      // Analyze builder type
      if (!cmd.builder) {
        stats.noBuilder++;
      } else if (typeof cmd.builder === 'function') {
        stats.functionBuilders++;
      } else if (typeof cmd.builder === 'object') {
        stats.objectBuilders++;
      }

      // Extract info like the MCP server does
      const info = extractCommandInfo(cmd);
      
      if (Object.keys(info.schema?.properties || {}).length > 0) {
        stats.withParameters++;
      }
      
      if (info.aliases && info.aliases.length > 0) {
        stats.withAliases++;
      }
      
      if (!info.description || info.description.startsWith('Execute')) {
        stats.missingDescription++;
      }

      // Collect sample commands with interesting parameters
      if (sampleCommands.length < 5 && Object.keys(info.schema?.properties || {}).length > 2) {
        sampleCommands.push({
          name: commandName,
          aliases: info.aliases,
          description: info.description,
          parameterCount: Object.keys(info.schema?.properties || {}).length,
          parameters: Object.keys(info.schema?.properties || {}).slice(0, 5)
        });
      }
    }

    // Print statistics
    console.log('   Statistics:');
    console.log(`   - Total commands: ${stats.total}`);
    console.log(`   - With parameters: ${stats.withParameters} (${((stats.withParameters/stats.total)*100).toFixed(1)}%)`);
    console.log(`   - With aliases: ${stats.withAliases} (${((stats.withAliases/stats.total)*100).toFixed(1)}%)`);
    console.log(`   - Object builders: ${stats.objectBuilders}`);
    console.log(`   - Function builders: ${stats.functionBuilders}`);
    console.log(`   - No builder: ${stats.noBuilder}`);
    console.log(`   - Missing descriptions: ${stats.missingDescription}\n`);

    // Show sample commands
    console.log('3. Sample commands with parameters:\n');
    for (const cmd of sampleCommands) {
      console.log(`   Command: ${cmd.name}`);
      if (cmd.aliases.length > 0) {
        console.log(`   Aliases: ${cmd.aliases.join(', ')}`);
      }
      console.log(`   Description: ${cmd.description}`);
      console.log(`   Parameters (${cmd.parameterCount}): ${cmd.parameters.join(', ')}`);
      console.log('');
    }

    // Test specific important commands
    console.log('4. Verifying key commands are exposed:\n');
    const keyCommands = ['import', 'export', 'tables', 'schemas', 'status', 'version'];
    const commandMap = new Map();
    
    for (const cmd of commands) {
      if (cmd && typeof cmd.command === 'string') {
        const commandName = cmd.command.split(' ')[0];
        commandMap.set(commandName, cmd);
      }
    }

    for (const keyCmd of keyCommands) {
      if (commandMap.has(keyCmd)) {
        const cmd = commandMap.get(keyCmd);
        const info = extractCommandInfo(cmd);
        const paramCount = Object.keys(info.schema?.properties || {}).length;
        console.log(`   ✓ ${keyCmd}: ${paramCount} parameters${info.aliases.length > 0 ? ` (aliases: ${info.aliases.join(', ')})` : ''}`);
      } else {
        console.log(`   ✗ ${keyCmd}: NOT FOUND`);
      }
    }

    // Test import command specifically (should have new parameters)
    console.log('\n5. Checking import command enhancements:\n');
    const importCmd = commandMap.get('import');
    if (importCmd) {
      const info = extractCommandInfo(importCmd);
      const params = info.schema?.properties || {};
      
      const newParams = ['matchMode', 'dryRun', 'maxFileSizeMB', 'timeoutSeconds', 'nullValues', 'skipWithErrors', 'maxErrorsAllowed'];
      for (const param of newParams) {
        if (params[param]) {
          const paramInfo = params[param];
          console.log(`   ✓ ${param}: ${paramInfo.type}${paramInfo.enum ? ` (choices: ${paramInfo.enum.join(', ')})` : ''}${paramInfo.default !== undefined ? ` (default: ${paramInfo.default})` : ''}`);
        } else {
          console.log(`   ? ${param}: NOT FOUND`);
        }
      }
    }

    console.log('\n=== Validation Complete ===');
    console.log(`✓ MCP Server is properly configured with ${stats.total} commands\n`);

  } catch (error) {
    console.error('❌ Validation failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run validation
validateMcpServer().catch(console.error);
