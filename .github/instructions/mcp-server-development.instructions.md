---
description: "Use when creating or updating MCP (Model Context Protocol) server components. Enforces TypeScript patterns, JSON-RPC communication rules, tool/resource/prompt registration, and integration with CLI command metadata. Ensures MCP server follows protocol requirements and maintains consistency with the CLI infrastructure."
applyTo: "mcp-server/src/**/*.ts"
---

# MCP Server Development Guidelines

Use this guide when creating or modifying TypeScript files in the `mcp-server/src/` directory.

## Scope and Purpose

This guide applies to all TypeScript files implementing the Model Context Protocol (MCP) server that exposes hana-cli commands as MCP tools, resources, and prompts for LLM consumption.

## Critical Principles

1. **JSON-RPC Protocol Compliance**: MCP communicates via JSON-RPC over STDIO
2. **Logging Discipline**: ONLY use `console.error()` for logging, NEVER `console.log()`
3. **Tool Naming**: Sanitize tool names to `[a-z0-9_-]` character set only
4. **Schema Generation**: Convert yargs builders to JSON Schema accurately
5. **Error Enrichment**: Provide actionable error analysis and suggestions
6. **Type Safety**: Use TypeScript interfaces and explicit typing throughout
7. **CLI Integration**: Maintain consistency with CLI command metadata and structure

## CRITICAL: Logging Rules

**NEVER write to stdout using `console.log()`** - it will break the JSON-RPC protocol.

```typescript
// ❌ WRONG - Breaks MCP protocol
console.log('Debug info:', data);
console.log(JSON.stringify(result));

// ✅ CORRECT - Write to stderr
console.error('[MCP Debug]', data);
console.error('[MCP Info]', JSON.stringify(result));
```

**Why**: MCP clients expect ONLY JSON-RPC messages on stdout. Any other output causes parsing failures like `"Failed to parse message: ..."`.

**Apply to**:
- The main `index.ts` file header comment documents this
- All imported modules that might log (`executor.ts`, `command-parser.ts`, etc.)
- Error handling and debugging code

## File Structure and Organization

### Main Entry Point: `index.ts`

```typescript
#!/usr/bin/env node

/**
 * MCP Server for SAP HANA CLI
 * 
 * CRITICAL: This file implements the Model Context Protocol (MCP) server.
 * MCP communicates via JSON-RPC over STDIO. All logging MUST use console.error()
 * to write to stderr, never console.log() which writes to stdout.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
// ... more imports

class HanaCliMcpServer {
  private server: Server;
  private commands: Map<string, any> = new Map();

  constructor() {
    this.server = new Server(
      {
        name: 'hana-cli-mcp-server',
        version: '1.0.0',
        icons: [/* icon configuration */],
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
      }
    );

    this.setupHandlers();
    this.setupErrorHandling();
  }

  private setupHandlers(): void {
    // Register handlers for tools, resources, prompts
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('[MCP Server] Running on stdio');
  }
}

const server = new HanaCliMcpServer();
server.run().catch(console.error);
```

### Module Organization Pattern

```
mcp-server/src/
├── index.ts                      # Main server entry point
├── command-metadata.ts           # Command categorization and metadata
├── command-parser.ts             # Extract command info from modules
├── executor.ts                   # Execute CLI commands via spawn
├── output-formatter.ts           # Format command output for LLMs
├── result-interpretation.ts      # Analyze and interpret results
├── next-steps.ts                 # Suggest follow-up actions
├── examples-presets.ts           # Command examples and presets
├── recommendation.ts             # Recommend commands for user goals
├── workflow-execution.ts         # Multi-command workflow orchestration
├── smart-search.ts               # Intelligent command search
├── conversation-templates.ts     # Guided conversation templates
├── docs-search.ts                # Search documentation
├── readme-knowledge-base.ts      # README parsing and search
├── connection-context.ts         # Project connection management
├── resources.ts                  # MCP resource handlers
└── prompts.ts                    # MCP prompt handlers
```

## Tool Registration Pattern

### Sanitize Tool Names

```typescript
/**
 * Sanitize tool name to conform to MCP naming rules [a-z0-9_-]
 */
function sanitizeToolName(name: string): string {
  return name.replace(/[^a-z0-9_-]/g, '_');
}

// Usage
const toolName = sanitizeToolName('hana-cli:inspectTable'); // 'hana-cli_inspecttable'
```

### Register Tools from CLI Commands

```typescript
this.server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools = [];

  for (const [name, commandModule] of this.commands) {
    const info = extractCommandInfo(commandModule);
    
    // Build rich description with metadata
    let fullDescription = info.description;
    
    if (info.category) {
      fullDescription += ` [Category: ${info.category}]`;
    }
    if (info.tags && info.tags.length > 0) {
      fullDescription += ` [Tags: ${info.tags.join(', ')}]`;
    }
    
    // Add use cases
    if (info.useCases && info.useCases.length > 0) {
      fullDescription += `\n\n**Common Use Cases:**\n${info.useCases.map(uc => `- ${uc}`).join('\n')}`;
    }
    
    // Add tips about examples/presets
    if (hasExamples(name)) {
      fullDescription += `\n\n💡 **Tip:** Use \`hana_examples\` with command="${name}" to see usage examples.`;
    }

    tools.push({
      name: sanitizeToolName(`hana_${name}`),
      description: fullDescription,
      inputSchema: info.schema,
    });
  }

  return { tools };
});
```

## JSON Schema Conversion from Yargs

### Pattern: Convert Yargs Builder to JSON Schema

```typescript
export function yargsBuilderToJsonSchema(builder: any): JSONSchema {
  if (!builder || typeof builder !== 'object') {
    return {
      type: 'object',
      properties: {},
      required: []
    };
  }

  const properties: Record<string, JSONSchema> = {};
  const required: string[] = [];

  for (const [key, value] of Object.entries(builder)) {
    if (!value || typeof value !== 'object') continue;

    const option = value as any;
    const property: JSONSchema = {};

    // Map yargs types to JSON Schema types
    if (option.type === 'string') {
      property.type = 'string';
    } else if (option.type === 'number') {
      property.type = 'number';
    } else if (option.type === 'boolean') {
      property.type = 'boolean';
    } else if (option.type === 'array') {
      property.type = 'array';
      property.items = { type: 'string' };
    } else {
      property.type = 'string'; // Default
    }

    // Add description from yargs desc field
    if (option.desc || option.describe) {
      property.description = option.desc || option.describe;
    }

    // Add default value
    if (option.default !== undefined) {
      property.default = option.default;
    }

    // Add choices as enum
    if (option.choices && Array.isArray(option.choices)) {
      property.enum = option.choices;
    }

    properties[key] = property;

    // Mark as required if demandOption is true
    if (option.demandOption || option.required) {
      required.push(key);
    }
  }

  return {
    type: 'object',
    properties,
    required: required.length > 0 ? required : undefined
  };
}
```

## Command Execution Pattern

### Execute CLI Commands via Child Process

```typescript
export async function executeCommand(
  commandName: string,
  args: Record<string, any>,
  context?: ConnectionContext
): Promise<ExecutionResult> {
  const cliPath = findCliPath();
  const cmdArgs = buildCommandArgs(commandName, args, context);

  return new Promise((resolve) => {
    const child = spawn('node', [cliPath, ...cmdArgs], {
      env: { ...process.env, FORCE_COLOR: '0' },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({
          success: true,
          output: stdout
        });
      } else {
        resolve({
          success: false,
          output: stdout,
          error: stderr
        });
      }
    });
  });
}
```

### Build Command Arguments

```typescript
function buildCommandArgs(
  commandName: string,
  args: Record<string, any>,
  context?: ConnectionContext
): string[] {
  const cmdArgs: string[] = [commandName];

  for (const [key, value] of Object.entries(args)) {
    if (value === undefined || value === null) continue;
    if (key.startsWith('_')) continue; // Skip private context fields

    if (typeof value === 'boolean') {
      if (value) {
        cmdArgs.push(`--${key}`);
      }
    } else if (Array.isArray(value)) {
      value.forEach(v => {
        cmdArgs.push(`--${key}`);
        cmdArgs.push(String(v));
      });
    } else {
      cmdArgs.push(`--${key}`);
      cmdArgs.push(String(value));
    }
  }

  // Apply connection context if provided
  if (context) {
    cmdArgs.push('--connection', context.connection);
    if (context.user) cmdArgs.push('--user', context.user);
    // Don't pass password in args for security
  }

  return cmdArgs;
}
```

## Error Analysis and Suggestions

### Pattern: Analyze Errors and Provide Actionable Suggestions

```typescript
interface ErrorAnalysis {
  errorType: string;
  originalError: string;
  possibleCauses: string[];
  suggestions: Array<{
    action: string;
    command?: string;
    parameters?: Record<string, any>;
  }>;
}

function analyzeError(commandName: string, error: string, output: string): ErrorAnalysis {
  const errorLower = error.toLowerCase();
  const combined = errorLower + ' ' + output.toLowerCase();

  // Table not found errors
  if (combined.includes('table') && combined.includes('not found')) {
    return {
      errorType: 'TABLE_NOT_FOUND',
      originalError: error,
      possibleCauses: [
        'Table name is case-sensitive - check capitalization',
        'Table may be in a different schema',
        'User may not have permission to see the table',
      ],
      suggestions: [
        {
          action: 'List tables in the schema to verify the table name',
          command: 'hana_tables',
          parameters: { schema: '<schema-name>' },
        },
        {
          action: 'Check current user and permissions',
          command: 'hana_status',
        },
      ],
    };
  }

  // Connection errors
  if (combined.includes('connection') && (combined.includes('refused') || combined.includes('timeout'))) {
    return {
      errorType: 'CONNECTION_ERROR',
      originalError: error,
      possibleCauses: [
        'Database server is not running',
        'Incorrect host or port',
        'Network connectivity issues',
        'Firewall blocking connection',
      ],
      suggestions: [
        {
          action: 'Verify connection parameters',
          command: 'hana_connections',
        },
        {
          action: 'Test basic connectivity with status command',
          command: 'hana_status',
        },
      ],
    };
  }

  // Generic fallback
  return {
    errorType: 'UNKNOWN',
    originalError: error,
    possibleCauses: ['Command execution failed'],
    suggestions: [
      {
        action: 'Check command syntax and parameters',
      },
    ],
  };
}
```

## Resource and Prompt Handlers

### Register Resources

```typescript
private setupResourceHandlers(): void {
  // List available resources
  this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: [
        {
          uri: 'hana-cli://docs/search',
          name: 'Documentation Search',
          description: 'Search HANA CLI documentation',
          mimeType: 'text/plain'
        },
        {
          uri: 'hana-cli://readme',
          name: 'README Knowledge Base',
          description: 'Query the CLI README for information',
          mimeType: 'text/plain'
        }
      ]
    };
  });

  // Read resource content
  this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri;
    
    if (uri.startsWith('hana-cli://docs/search')) {
      const query = new URL(uri).searchParams.get('q') || '';
      const results = await docsSearch(query);
      return {
        contents: [{
          uri,
          mimeType: 'text/plain',
          text: formatSearchResults(results)
        }]
      };
    }
    
    throw new Error(`Unknown resource: ${uri}`);
  });
}
```

### Register Prompts

```typescript
private setupPromptHandlers(): void {
  this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return {
      prompts: [
        {
          name: 'analyze-table',
          description: 'Guide through comprehensive table analysis',
          arguments: [
            { name: 'table', description: 'Table name', required: true },
            { name: 'schema', description: 'Schema name', required: false }
          ]
        }
      ]
    };
  });

  this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    if (name === 'analyze-table') {
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Analyze table ${args.table} with these steps:\n1. Inspect structure\n2. Check row count\n3. Profile data...`
            }
          }
        ]
      };
    }
    
    throw new Error(`Unknown prompt: ${name}`);
  });
}
```

## Type Safety and Interfaces

### Define Strong Types

```typescript
export interface CommandInfo {
  command: string;
  description: string;
  category?: string;
  tags?: string[];
  useCases?: string[];
  relatedCommands?: string[];
  schema: JSONSchema;
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  exitCode?: number;
}

export interface ConnectionContext {
  connection: string;
  user?: string;
  schema?: string;
  projectPath?: string;
}
```

## Testing and Validation

### Test Individual Tools

```typescript
// test-tables-tool.js
import { executeCommand } from './executor.js';

async function testTables() {
  console.error('Testing hana_tables tool...');
  
  const result = await executeCommand('tables', {
    schema: 'SYSTEM',
    limit: 10
  });
  
  console.error('Success:', result.success);
  console.error('Output length:', result.output.length);
  
  if (!result.success) {
    console.error('Error:', result.error);
  }
}

testTables().catch(console.error);
```

## Common Mistakes to Avoid

❌ **Using console.log() anywhere in MCP server code** → Breaks JSON-RPC protocol

❌ **Not sanitizing tool names** → MCP clients reject invalid tool names

❌ **Missing error analysis** → Users get raw errors without actionable guidance

❌ **Hardcoding file paths** → Use `fileURLToPath()` and `dirname()` for portability

❌ **Not handling SIGINT** → Server doesn't cleanup properly on interrupt

❌ **Incomplete JSON Schema** → LLMs can't properly invoke tools

❌ **Ignoring connection context** → Commands can't target specific projects

## Build and Package Configuration

### TypeScript Configuration (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./build",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "build"]
}
```

### Package Configuration

```json
{
  "type": "module",
  "main": "build/index.js",
  "bin": {
    "hana-cli-mcp-server": "./build/index.js"
  },
  "scripts": {
    "build": "tsc",
    "prepare": "npm run build"
  }
}
```

## Integration with CLI Command Infrastructure

- **Read command metadata** from `COMMAND_METADATA_MAP` in `command-metadata.ts`
- **Import command modules** dynamically from `../../bin/*.js`
- **Extract command info** using patterns from `command-parser.ts`
- **Respect CLI conventions** for parameter naming, defaults, and validation
- **Maintain consistency** with CLI output formats and error messages

## Documentation Requirements

Every MCP tool, resource, and prompt should have:
- Clear description of purpose and use cases
- Complete parameter documentation with types and defaults
- Examples of typical usage patterns
- Related commands or resources
- Common error scenarios and solutions

## Reference Examples in This Repository

- `mcp-server/src/index.ts` - Main server structure
- `mcp-server/src/executor.ts` - Command execution patterns
- `mcp-server/src/command-parser.ts` - Metadata extraction
- `mcp-server/src/output-formatter.ts` - Result formatting for LLMs
