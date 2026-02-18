/**
 * MCP Resources for SAP HANA CLI
 * 
 * Resources are named, readable content that agents can discover and access.
 * They provide documentation, guides, and reference material.
 */

import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { ReadmeKnowledgeBase } from './readme-knowledge-base.js';
import { docsSearch } from './docs-search.js';
import { getCommandExamples, getCommandPresets } from './examples-presets.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface Resource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

/**
 * List all available resources
 */
export function listResources(): Resource[] {
  return [
    // Core Documentation
    {
      uri: 'hana://docs/overview',
      name: 'Project Overview',
      description: 'What is hana-cli? Complete overview, introduction, and capabilities',
      mimeType: 'text/markdown',
    },
    {
      uri: 'hana://docs/getting-started',
      name: 'Getting Started Guide',
      description: 'Installation, configuration, and first commands',
      mimeType: 'text/markdown',
    },
    {
      uri: 'hana://docs/connection-guide',
      name: 'Connection Resolution Guide',
      description: '7-step guide to how hana-cli finds database credentials',
      mimeType: 'text/markdown',
    },
    {
      uri: 'hana://docs/security',
      name: 'Security Best Practices',
      description: 'Comprehensive security guidelines for connection, SQL injection prevention, and parameter handling',
      mimeType: 'text/markdown',
    },
    {
      uri: 'hana://docs/parameters',
      name: 'Standard Parameters Guide',
      description: 'Standardized parameter conventions by command category with aliases and examples',
      mimeType: 'text/markdown',
    },
    {
      uri: 'hana://docs/best-practices',
      name: 'Best Practices & Patterns',
      description: 'Naming conventions, usage patterns, and real-world command examples',
      mimeType: 'text/markdown',
    },
    {
      uri: 'hana://docs/project-structure',
      name: 'Project Structure',
      description: 'Overview of project folders, their purposes, and key resources',
      mimeType: 'text/markdown',
    },
    
    // Category Guides
    {
      uri: 'hana://docs/categories/data-quality',
      name: 'Data Quality Commands',
      description: 'Commands for data validation, profiling, duplicate detection, and quality checks',
      mimeType: 'text/markdown',
    },
    {
      uri: 'hana://docs/categories/performance',
      name: 'Performance Analysis Commands',
      description: 'Commands for analyzing memory, performance, and system health',
      mimeType: 'text/markdown',
    },
    {
      uri: 'hana://docs/categories/data-operations',
      name: 'Data Operations Commands',
      description: 'Commands for import, export, copy, sync, and data manipulation',
      mimeType: 'text/markdown',
    },
    {
      uri: 'hana://docs/categories/inspection',
      name: 'Inspection & Discovery Commands',
      description: 'Commands for exploring schemas, tables, views, functions, and database objects',
      mimeType: 'text/markdown',
    },
    
    // Popular Command Documentation
    {
      uri: 'hana://docs/commands/import',
      name: 'Import Command Documentation',
      description: 'Detailed guide for importing data from CSV/Excel/TSV files',
      mimeType: 'text/markdown',
    },
    {
      uri: 'hana://docs/commands/export',
      name: 'Export Command Documentation',
      description: 'Detailed guide for exporting data to CSV/Excel/TSV files',
      mimeType: 'text/markdown',
    },
    {
      uri: 'hana://docs/commands/dataValidator',
      name: 'Data Validator Command Documentation',
      description: 'Detailed guide for validating data quality',
      mimeType: 'text/markdown',
    },
    {
      uri: 'hana://docs/commands/dataProfile',
      name: 'Data Profile Command Documentation',
      description: 'Detailed guide for profiling data and analyzing patterns',
      mimeType: 'text/markdown',
    },
    {
      uri: 'hana://docs/commands/duplicateDetection',
      name: 'Duplicate Detection Command Documentation',
      description: 'Detailed guide for finding duplicate rows',
      mimeType: 'text/markdown',
    },
    
    // Prompts
    {
      uri: 'hana://prompts',
      name: 'Available Prompts',
      description: 'List of guided workflows and templates for common tasks',
      mimeType: 'text/plain',
    },
  ];
}

/**
 * Read a specific resource
 */
export async function readResource(uri: string): Promise<{ uri: string; mimeType: string; text: string }> {
  // Core documentation
  if (uri === 'hana://docs/overview') {
    const readmePath = join(__dirname, '../../README.md');
    const content = await readFile(readmePath, 'utf-8');
    return {
      uri,
      mimeType: 'text/markdown',
      text: content,
    };
  }
  
  if (uri === 'hana://docs/getting-started') {
    const gettingStartedPath = join(__dirname, '../../docs/01-getting-started/README.md');
    try {
      const content = await readFile(gettingStartedPath, 'utf-8');
      return {
        uri,
        mimeType: 'text/markdown',
        text: content,
      };
    } catch {
      // Fallback to README sections
      const readmePath = join(__dirname, '../../README.md');
      const content = await readFile(readmePath, 'utf-8');
      const sections = content.split('## ');
      const installSection = sections.find(s => s.startsWith('Requirements') || s.startsWith('Installation'));
      return {
        uri,
        mimeType: 'text/markdown',
        text: `# Getting Started\n\n## ${installSection || 'See README.md for installation instructions'}`,
      };
    }
  }
  
  if (uri === 'hana://docs/connection-guide') {
    const guide = ReadmeKnowledgeBase.getConnectionGuide();
    return {
      uri,
      mimeType: 'text/markdown',
      text: guide,
    };
  }
  
  if (uri === 'hana://docs/security') {
    const guide = ReadmeKnowledgeBase.getSecurityGuidelines();
    return {
      uri,
      mimeType: 'text/markdown',
      text: guide,
    };
  }
  
  if (uri === 'hana://docs/parameters') {
    // Combine parameters from major categories
    let text = '# Standard Parameters Guide\n\n';
    text += 'This guide shows standardized parameter conventions used across hana-cli commands.\n\n';
    text += '## Global Parameters\n\n';
    text += 'Available in all commands:\n\n';
    ReadmeKnowledgeBase.GLOBAL_PARAMETERS.forEach(p => {
      text += `- **${p.name}**${p.alias ? ` (${p.alias})` : ''} - ${p.description}\n`;
    });
    text += '\n## Category-Specific Parameters\n\n';
    Object.keys(ReadmeKnowledgeBase.COMMAND_CATEGORIES).forEach(cat => {
      const category = ReadmeKnowledgeBase.COMMAND_CATEGORIES[cat];
      text += `### ${category.name}\n\n${category.description}\n\n`;
    });
    return {
      uri,
      mimeType: 'text/markdown',
      text,
    };
  }
  
  if (uri === 'hana://docs/best-practices') {
    const guide = ReadmeKnowledgeBase.getBestPractices();
    return {
      uri,
      mimeType: 'text/markdown',
      text: guide,
    };
  }
  
  if (uri === 'hana://docs/project-structure') {
    const structure = ReadmeKnowledgeBase.getProjectStructure();
    return {
      uri,
      mimeType: 'text/markdown',
      text: structure,
    };
  }
  
  // Category guides
  if (uri.startsWith('hana://docs/categories/')) {
    const category = uri.replace('hana://docs/categories/', '');
    const categoryMap: Record<string, string> = {
      'data-quality': 'data-quality',
      'performance': 'performance-analysis',
      'data-operations': 'data-operations',
      'inspection': 'inspection',
    };
    
    const actualCategory = categoryMap[category] || category;
    const results = docsSearch.search(actualCategory, {
      category: 'commands',
      limit: 20,
    });
    
    let text = `# ${category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Commands\n\n`;
    text += `This category includes commands for ${category.replace(/-/g, ' ')}.\n\n`;
    
    if (results && results.length > 0) {
      text += '## Available Commands\n\n';
      const baseUrl = 'https://sap-samples.github.io/hana-developer-cli-tool-example';
      results.forEach((r: any) => {
        text += `### ${r.document.title}\n\n`;
        text += `${r.snippet}\n\n`;
        const docUrl = `${baseUrl}/${r.document.path.replace(/\.md$/, '.html')}`;
        text += `**Documentation:** ${docUrl}\n\n`;
      });
    }
    
    return {
      uri,
      mimeType: 'text/markdown',
      text,
    };
  }
  
  // Command documentation
  if (uri.startsWith('hana://docs/commands/')) {
    const command = uri.replace('hana://docs/commands/', '');
    const results = docsSearch.search(command, {
      category: 'commands',
      limit: 5,
    });
    
    let text = `# ${command} Command\n\n`;
    
    if (results && results.length > 0) {
      const mainDoc = results[0].document;
      text += `${mainDoc.excerpt}\n\n`;
      
      // Build URL from path
      const baseUrl = 'https://sap-samples.github.io/hana-developer-cli-tool-example';
      const docUrl = `${baseUrl}/${mainDoc.path.replace(/\.md$/, '.html')}`;
      text += `**Full Documentation:** ${docUrl}\n\n`;
      
      // Add matched keywords
      if (results[0].matchedKeywords && results[0].matchedKeywords.length > 0) {
        text += `**Related Topics:** ${results[0].matchedKeywords.join(', ')}\n\n`;
      }
    }
    
    // Add examples if available
    try {
      const examples = getCommandExamples(command);
      if (examples && examples.length > 0) {
        text += '## Examples\n\n';
        examples.forEach((ex: any, idx: number) => {
          text += `### ${idx + 1}. ${ex.scenario}\n\n`;
          text += '```json\n';
          text += JSON.stringify(ex.parameters, null, 2);
          text += '\n```\n\n';
          if (ex.notes) {
            text += `*${ex.notes}*\n\n`;
          }
        });
      }
    } catch {
      // Examples not available for this command
    }
    
    // Add presets if available
    try {
      const presets = getCommandPresets(command);
      if (presets && presets.length > 0) {
        text += '## Parameter Presets\n\n';
        presets.forEach((preset: any) => {
          text += `### ${preset.name}\n\n`;
          text += `${preset.description}\n\n`;
          text += '```json\n';
          text += JSON.stringify(preset.parameters, null, 2);
          text += '\n```\n\n';
          if (preset.whenToUse) {
            text += `**When to use:** ${preset.whenToUse}\n\n`;
          }
        });
      }
    } catch {
      // Presets not available for this command
    }
    
    return {
      uri,
      mimeType: 'text/markdown',
      text,
    };
  }
  
  // Prompts list
  if (uri === 'hana://prompts') {
    const text = `# Available Prompts

Prompts are guided workflows for common tasks. Use them to get step-by-step instructions.

## Available Prompts

1. **explore-database** - Step-by-step guide to explore an SAP HANA database
   - Optional argument: schema (specific schema to explore)

2. **import-data** - Guided workflow for importing data with validation
   - Required argument: filename (path to file to import)
   - Optional argument: table (target table name)

3. **troubleshoot-connection** - Help diagnose and fix database connection problems
   - No arguments required

4. **validate-data-quality** - Comprehensive data quality validation workflow
   - Required argument: table (table to validate)
   - Optional argument: schema (schema name)

5. **quickstart** - Beginner's guide with recommended first commands
   - No arguments required

## How to Use Prompts

In MCP-compatible clients, you can invoke prompts to get structured guidance.
Each prompt provides a conversation template with step-by-step instructions.

Example: To explore a database, invoke the "explore-database" prompt.
`;
    
    return {
      uri,
      mimeType: 'text/plain',
      text,
    };
  }
  
  throw new Error(`Unknown resource: ${uri}`);
}
