# MCP Prompts and Resources Implementation Guide

## Overview

The Model Context Protocol supports three types of primitives for agent interaction:

1. **Tools** ✅ (Currently implemented - 150+ tools)
2. **Resources** ❌ (Not implemented - would improve discoverability)
3. **Prompts** ❌ (Not implemented - would guide agent workflows)

This document proposes implementing MCP Resources and Prompts to make the hana-cli MCP server more discoverable and agent-friendly.

---

## 1. MCP Resources

Resources are named, readable content that agents can discover and access. They're perfect for documentation, configuration guides, and reference material.

### Proposed Resources

```typescript
// Documentation Resources
hana://docs/overview              → Project README and overview
hana://docs/getting-started       → Installation and setup guide
hana://docs/connection-guide      → 7-step connection resolution
hana://docs/security              → Security best practices
hana://docs/parameters            → Standard parameter conventions
hana://docs/architecture          → Project structure and design

// Command Documentation
hana://docs/commands/import       → Import command detailed docs
hana://docs/commands/export       → Export command detailed docs
hana://docs/commands/dataValidator → Data validator docs
hana://docs/commands/[command]    → Any command's documentation

// Category Guides
hana://docs/categories/data-quality     → Data quality commands overview
hana://docs/categories/performance      → Performance analysis guide
hana://docs/categories/security         → Security commands
hana://docs/categories/troubleshooting  → Troubleshooting guide

// Examples and Templates
hana://examples/import           → Import examples
hana://examples/data-migration   → Migration workflow examples
hana://presets/safe-import       → Safe import parameter preset
hana://presets/quick-export      → Quick export preset

// Project Resources
hana://project/structure         → Project folder organization
hana://project/setup             → Development setup guide
hana://project/contributing      → Contribution guidelines
```

### Implementation Example

```typescript
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// In HanaCliMcpServer constructor, add to capabilities:
this.server = new Server(
  { /* ... */ },
  {
    capabilities: {
      tools: {},
      resources: {},  // ← Add this
    },
  }
);

// Add resource handlers
this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'hana://docs/overview',
        name: 'Project Overview',
        description: 'What is hana-cli? Complete overview and introduction',
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
        uri: 'hana://prompts',
        name: 'Available Prompts',
        description: 'List of guided workflows and templates',
        mimeType: 'text/plain',
      },
      // ... more resources
    ],
  };
});

this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;
  
  if (uri === 'hana://docs/overview') {
    const readmePath = join(__dirname, '../../README.md');
    const content = await fs.readFile(readmePath, 'utf-8');
    return {
      contents: [{
        uri,
        mimeType: 'text/markdown',
        text: content,
      }],
    };
  }
  
  if (uri === 'hana://docs/connection-guide') {
    const kb = new ReadmeKnowledgeBase();
    const guide = kb.getConnectionGuide();
    return {
      contents: [{
        uri,
        mimeType: 'text/markdown',
        text: guide,
      }],
    };
  }
  
  if (uri.startsWith('hana://docs/commands/')) {
    const command = uri.replace('hana://docs/commands/', '');
    const docs = await docsSearch({ keywords: command, category: 'commands' });
    return {
      contents: [{
        uri,
        mimeType: 'text/markdown',
        text: formatCommandDocs(docs),
      }],
    };
  }
  
  throw new Error(`Unknown resource: ${uri}`);
});
```

### Benefits of Resources

1. **Natural Discovery**: Agents can browse `hana://docs/` like humans browse `/docs`
2. **Reduced Tool Calls**: Read documentation without calling search tools
3. **Contextual Learning**: Get full context before attempting commands
4. **Better UX**: MCP clients can show resources in a sidebar or tree view

---

## 2. MCP Prompts

Prompts are reusable templates that guide agents through multi-step workflows. They're like "quick start" buttons for common tasks.

### Proposed Prompts

```typescript
// Exploration Prompts
explore-database         → Step-by-step database exploration
discover-data-quality    → Find data quality issues
analyze-performance      → Performance analysis workflow

// Setup Prompts
setup-connection         → Help user configure database connection
verify-installation      → Test that everything is installed correctly
quickstart              → Beginner's first 6 commands

// Task-Specific Prompts
import-data             → Guided data import with validation
export-data             → Safe data export workflow
migrate-data            → Full data migration process
validate-data-quality   → Comprehensive data quality check
troubleshoot-connection → Fix connection problems
optimize-performance    → Performance tuning workflow

// Advanced Prompts
setup-ci-pipeline       → Configure CI/CD with hana-cli
bulk-operations         → Handle large-scale operations
security-audit          → Perform security review
```

### Implementation Example

```typescript
import {
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// In HanaCliMcpServer constructor, add to capabilities:
this.server = new Server(
  { /* ... */ },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},  // ← Add this
    },
  }
);

// Add prompt handlers
this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: 'explore-database',
        description: 'Step-by-step guide to explore an SAP HANA database',
        arguments: [
          {
            name: 'schema',
            description: 'Specific schema to explore (optional)',
            required: false,
          },
        ],
      },
      {
        name: 'import-data',
        description: 'Guided workflow for importing data with validation and error handling',
        arguments: [
          {
            name: 'filename',
            description: 'Path to the file to import',
            required: true,
          },
          {
            name: 'table',
            description: 'Target table name',
            required: false,
          },
        ],
      },
      {
        name: 'troubleshoot-connection',
        description: 'Help diagnose and fix database connection problems',
        arguments: [],
      },
      {
        name: 'validate-data-quality',
        description: 'Comprehensive data quality validation workflow',
        arguments: [
          {
            name: 'table',
            description: 'Table to validate',
            required: true,
          },
        ],
      },
      // ... more prompts
    ],
  };
});

this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  if (name === 'explore-database') {
    const schema = args?.schema || '[SCHEMA_NAME]';
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `I want to explore the SAP HANA database${schema !== '[SCHEMA_NAME]' ? ` focusing on schema ${schema}` : ''}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `I'll guide you through exploring the database. Here's the workflow:

**Step 1: Verify Connection**
First, let's confirm we can connect to the database.
→ I'll use \`hana_status\` to check the connection.

**Step 2: Understand the Environment**
Next, let's gather basic information about the database.
→ I'll use \`hana_version\` to see the HANA version.
→ I'll use \`hana_systemInfo\` for system details.

**Step 3: Discover Schemas**
Now let's see what data is available.
${schema !== '[SCHEMA_NAME]' ? `→ We'll focus on schema: ${schema}` : '→ I\'ll use `hana_schemas` to list all schemas.'}

**Step 4: Explore Tables**
→ I'll use \`hana_tables\` to see tables in ${schema !== '[SCHEMA_NAME]' ? schema : 'interesting schemas'}.
→ I'll use \`hana_inspectTable\` for detailed table information.

**Step 5: Profile Data** (optional)
→ I can use \`hana_dataProfile\` to analyze data quality and patterns.

**Step 6: Follow Up**
Based on what we find, I can:
- Check for duplicates with \`hana_duplicateDetection\`
- Validate data with \`hana_dataValidator\`
- Analyze performance with \`hana_memoryAnalysis\`

Let's start! Should I begin with the connection check?`,
          },
        },
      ],
    };
  }
  
  if (name === 'import-data') {
    const filename = args?.filename || '[FILE_PATH]';
    const table = args?.table || '[TABLE_NAME]';
    
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `I want to import data from ${filename}${table !== '[TABLE_NAME]' ? ` into table ${table}` : ''}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `I'll help you import the data safely with validation. Here's the recommended workflow:

**Step 1: Preview with Dry Run** (CRITICAL)
Before importing anything, let's validate the file and see what will happen.
→ I'll use \`hana_import\` with \`dryRun: true\` to preview the import.
→ This shows column mappings and any potential issues WITHOUT modifying the database.

**Step 2: Review the Preview**
We'll check:
- ✓ Column mappings are correct
- ✓ Data types are compatible  
- ✓ No validation errors
- ✓ Row count is as expected

**Step 3: Actual Import** (with safety measures)
Once the preview looks good, I'll import with error handling:
→ \`skipWithErrors: true\` - Continue even if some rows fail
→ \`maxErrorsAllowed: 100\` - Abort if too many errors
→ Save error report for review

**Step 4: Validate Imported Data**
After import, let's verify data quality:
→ \`hana_dataValidator\` - Check for data issues
→ \`hana_dataProfile\` - Get statistics and patterns

**Step 5: Handle Any Issues**
If problems are found:
→ \`hana_duplicateDetection\` - Find duplicate rows
→ Error log review - Fix and re-import failed rows

${filename === '[FILE_PATH]' ? '\n⚠️  Please provide the filename to start.' : ''}
${table === '[TABLE_NAME]' ? '⚠️  Please provide the target table name.' : ''}

Ready to start with the dry run preview?`,
          },
        },
      ],
    };
  }
  
  if (name === 'troubleshoot-connection') {
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: 'I\'m having trouble connecting to the SAP HANA database.',
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `I'll help you diagnose the connection issue. Let's go through the troubleshooting steps:

**Step 1: Check Current Status**
→ I'll use \`hana_status\` to see the current connection state and any error messages.

**Step 2: Review Connection Resolution**
The hana-cli looks for credentials in this order:
1. --admin flag (for HDI container admin)
2. @sap/cds bind (for CAP projects)
3. .env file in current directory
4. --conn parameter
5. default-env.json in home directory  
6. default-env.json in current directory
7. Fallback environment variables

**Step 3: Verify Configuration**
I'll help you check if your connection file exists and has the right format.

**Step 4: Test Connection Details**
We'll verify:
- ✓ Hostname and port are correct
- ✓ Credentials are valid
- ✓ Network access is available
- ✓ SSL settings if needed

**Step 5: Check Required Information**
For connection, you need:
- \`host\` - Database hostname
- \`port\` - Database port (usually 443 for cloud, 30015+ for on-premise)
- Either:
  - \`user\` + \`password\`
  - Or certificate-based authentication

**Common Issues:**
1. **Missing connection file** - Create default-env.json with credentials
2. **Wrong credentials** - Verify username/password
3. **Network issues** - Check firewall, VPN, network connectivity
4. **HDI container** - Use --admin flag for admin credentials
5. **Environment variables** - May need to set HANA_HOST, HANA_USER, etc.

Let me start by checking the status. Then I'll guide you through the specific issue.`,
          },
        },
      ],
    };
  }
  
  throw new Error(`Unknown prompt: ${name}`);
});
```

### Benefits of Prompts

1. **Guided Workflows**: Agents get step-by-step instructions for complex tasks
2. **Conversation Starters**: Clear entry points for users ("Use the import-data prompt")
3. **Context Preservation**: Multi-turn conversations with built-in context
4. **Reduced Errors**: Prompts encode best practices and validation steps
5. **Learning Tool**: Agents learn by following well-structured prompts

---

## 3. Implementation Priority

### High Priority (Immediate Impact)

1. **Add 5-10 Core Resources**
   - `hana://docs/overview` (README)
   - `hana://docs/getting-started`
   - `hana://docs/connection-guide`
   - `hana://docs/commands/[top-10-commands]`
   - `hana://prompts` (list of available prompts)

2. **Add 3-5 Core Prompts**
   - `explore-database` (most common first task)
   - `import-data` (complex workflow that benefits from guidance)
   - `troubleshoot-connection` (common pain point)
   - `quickstart` (beginner entry point)

### Medium Priority (Enhanced Discovery)

3. **Category-Based Resources**
   - `hana://docs/categories/[category]` for each category
   - `hana://examples/[command]` for command examples

4. **Task-Specific Prompts**
   - `export-data`
   - `validate-data-quality`
   - `migrate-data`
   - `optimize-performance`

### Lower Priority (Advanced Features)

5. **Dynamic Resources**
   - `hana://schema/[name]` - Live schema information
   - `hana://table/[schema]/[table]` - Live table details

6. **Advanced Prompts**
   - `setup-ci-pipeline`
   - `security-audit`
   - `bulk-operations`

---

## 4. Agent Behavior Changes

### Current Behavior (Tools Only)
```
Agent: "What is hana-cli?"
→ Must know to search README or call hana_docs_search
→ Or just answers from training data (may be outdated)
```

### With Resources
```
Agent: "What is hana-cli?"
→ Sees hana://docs/overview in resource list
→ Reads it directly for accurate, current information
→ Can show navigation: "See also: hana://docs/getting-started"
```

### With Prompts
```
User: "Help me explore the database"
Agent: "I'll use the explore-database prompt"
→ Gets structured workflow with reasoning
→ Follows best practices automatically
→ Provides progress updates at each step
```

---

## 5. Code Changes Required

### File: `mcp-server/src/index.ts`

```typescript
// Add imports
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Update server capabilities
this.server = new Server(
  { name: 'hana-cli-mcp-server', version: '1.0.0', icons: [...] },
  {
    capabilities: {
      tools: {},
      resources: {},  // ← Add
      prompts: {},    // ← Add
    },
  }
);

// Add in setupHandlers() method
private setupHandlers(): void {
  // ... existing tool handlers ...
  
  // Add resource handlers
  this.setupResourceHandlers();
  
  // Add prompt handlers  
  this.setupPromptHandlers();
}

private setupResourceHandlers(): void {
  this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
    // Return list of available resources
  });
  
  this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    // Return resource content
  });
}

private setupPromptHandlers(): void {
  this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
    // Return list of available prompts
  });
  
  this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    // Return prompt template
  });
}
```

### New Files

- `mcp-server/src/resources.ts` - Resource definitions and handlers
- `mcp-server/src/prompts.ts` - Prompt templates and handlers
- `mcp-server/src/prompt-templates/` - Prompt template files

---

## 6. Testing

```javascript
// Test resources
await mcpClient.request('resources/list');
await mcpClient.request('resources/read', { uri: 'hana://docs/overview' });

// Test prompts
await mcpClient.request('prompts/list');
await mcpClient.request('prompts/get', { name: 'explore-database' });
await mcpClient.request('prompts/get', { 
  name: 'import-data', 
  arguments: { filename: 'data.csv', table: 'MY_TABLE' }
});
```

---

## 7. Benefits Summary

**For AI Agents:**
- ✅ Natural discovery of documentation (resources)
- ✅ Guided workflows for complex tasks (prompts)
- ✅ Reduced need to "guess" which tools to use
- ✅ Learn best practices automatically
- ✅ Better error prevention

**For Users:**
- ✅ Can tell agent "use the import-data prompt"
- ✅ Consistent, high-quality interactions
- ✅ Less need to explain complex workflows
- ✅ Better documentation accessibility

**For Development:**
- ✅ Separate concerns (docs, prompts, tools)
- ✅ Reusable workflow templates
- ✅ Easier to update documentation
- ✅ Standard MCP protocol compliance

---

## Implementation Checklist

- [ ] Add `resources` capability to server
- [ ] Add `prompts` capability to server
- [ ] Implement `ListResourcesRequestSchema` handler
- [ ] Implement `ReadResourceRequestSchema` handler
- [ ] Implement `ListPromptsRequestSchema` handler
- [ ] Implement `GetPromptRequestSchema` handler
- [ ] Create 5-10 core resources
- [ ] Create 3-5 core prompts
- [ ] Add tests for resources
- [ ] Add tests for prompts
- [ ] Update README with resource URIs
- [ ] Update README with prompt names
- [ ] Create navigation guide (resource → prompt → tool)
- [ ] Add resource/prompt examples to documentation

---

## Example: Complete Discovery Flow

### Without Resources/Prompts (Current)
```
User: "What can this do?"
Agent: [Calls hana_discover_categories]
Agent: [Calls hana_quickstart]
Agent: [Maybe calls hana_docs_search]
Agent: "Here's what I found..."
```

### With Resources/Prompts (Proposed)
```
User: "What can this do?"
Agent: [Reads hana://docs/overview resource]
Agent: "This is a HANA CLI tool for... [accurate info]"
Agent: "To get started, I can use the 'quickstart' prompt. Would you like that?"

User: "Yes"
Agent: [Gets quickstart prompt]
Agent: [Follows structured workflow automatically]
Agent: "Step 1: Checking connection..."
```

**Result:** Fewer calls, better UX, more accurate information.
