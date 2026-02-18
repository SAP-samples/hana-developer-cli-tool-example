# Documentation Search Integration

Access all 279 project documentation pages with full-text search capabilities built directly into the MCP server.

## Overview

The MCP server includes a comprehensive documentation index of all project documentation, enabling AI agents to search and retrieve relevant guides, tutorials, and references without leaving the MCP interface.

### Key Features

- **279 Indexed Pages** - All documentation indexed and searchable
- **Fast Search** - Pre-built index enables instant searches
- **Smart Ranking** - Relevance scoring ensures best matches first
- **Category Filtering** - Browse by category (getting-started, commands, features, etc.)
- **Type Filtering** - Filter by document type (tutorial, command, api, etc.)
- **Full Content Access** - Retrieve complete page content from MCP

## Documentation Index

### Statistics

| Metric | Count |
|--------|-------|
| **Total Documents** | 279 |
| **Categories** | 9 |
| **Keywords Indexed** | 2,285 |
| **Build Time** | ~0.5 seconds |
| **Last Updated** | Automatically on docs changes |

### Categories

1. **Getting Started** (5 docs)
   - Installation
   - Configuration
   - Environments
   - Quick start
   - Troubleshooting

2. **Commands** (80+ docs)
   - Command listings A-Z
   - Analysis tools (9 docs)
   - Backup & recovery (5 docs)
   - BTP integration (6 docs)
   - Connection & auth (7 docs)
   - Data tools (6 docs)
   - Developer tools (13 docs)
   - And more...

3. **Features** (15+ docs)
   - CLI features
   - API server
   - Internationalization
   - Output formats
   - MCP integration

4. **API Reference** (10+ docs)
   - HTTP endpoints
   - REST API
   - Swagger/OpenAPI
   - Command flows

5. **Development** (20+ docs)
   - Testing & QA
   - Implementation guide
   - Architecture
   - Project structure

6. **Troubleshooting** (8 docs)
   - Common issues
   - Connection problems
   - Performance issues
   - Error solutions

7. **Examples** (50+ docs)
   - Import examples
   - Export examples
   - Data migration
   - Performance tuning

8. **Reference** (20+ docs)
   - Changelog
   - License
   - Terminology
   - Glossary

9. **Advanced** (20+ docs)
   - Performance optimization
   - Security deep dive
   - Custom development
   - Integration patterns

## MCP Tools for Documentation Access

### 1. Search Documentation (`hana_search_docs`)

Fast full-text search across all documentation.

**Parameters:**
- `query` (required) - Search keywords (e.g., "import CSV", "connection failed")
- `category` (optional) - Limit to category (getting-started, commands, features, api-reference, development, troubleshooting, examples, reference, advanced)
- `docType` (optional) - Filter by type (tutorial, command, api, feature, troubleshooting, development, example, reference)
- `limit` (optional) - Max results (default: 10, max: 50)

**Returns:**
```json
{
  "results": [
    {
      "title": "Import Command Guide",
      "path": "02-commands/data-tools/import.md",
      "category": "commands",
      "docType": "command",
      "relevance": 99,
      "excerpt": "Import data from CSV, Excel, or TSV files...",
      "keywords": ["import", "csv", "excel", "data", "load"],
      "url": "https://sap-samples.github.io/hana-developer-cli-tool-example/.../import"
    },
    {
      "title": "Data Import Examples",
      "path": "03-features/examples/import-examples.md",
      "category": "examples",
      "docType": "example",
      "relevance": 89,
      "excerpt": "Real-world examples of importing data from various sources...",
      "keywords": ["import", "examples", "csv", "scenarios"],
      "url": "https://..."
    }
  ],
  "total": 12,
  "partial": false
}
```

**Usage Examples:**

```json
// Search all documentation
{
  "query": "import CSV"
}

// Search specific category
{
  "query": "connection failed",
  "category": "troubleshooting"
}

// Search by document type
{
  "query": "how to import",
  "docType": "tutorial"
}

// Limit results
{
  "query": "performance",  
  "limit": 5
}

// Advanced search
{
  "query": "import data validation",
  "category": "commands",
  "docType": "command",
  "limit": 10
}
```

### 2. Get Document Content (`hana_get_doc`)

Retrieve full content of a specific documentation page.

**Parameters:**
- `path` (required) - Document path from search results (e.g., "02-commands/data-tools/import.md")

**Returns:**
```json
{
  "path": "02-commands/data-tools/import.md",
  "title": "Import Command",
  "category": "commands",
  "docType": "command",
  "content": "# Import Command\n\n[Full markdown content...]",
  "headings": [
    { "level": 1, "text": "Import Command" },
    { "level": 2, "text": "Overview" },
    { "level": 2, "text": "Parameters" },
    { "level": 2, "text": "Examples" },
    { "level": 2, "text": "Error Handling" }
  ],
  "links": [
    { "text": "Data Tools", "url": "../data-tools/" },
    { "text": "Examples", "url": "./import-examples.md" }
  ],
  "url": "https://sap-samples.github.io/hana-developer-cli-tool-example/.../import"
}
```

**Usage:**

```json
// Get full documentation
{
  "path": "02-commands/data-tools/import.md"
}
```

### 3. List Documentation Categories (`hana_list_doc_categories`)

Browse available documentation categories with sample documents.

**Parameters:** None

**Returns:**
```json
{
  "categories": [
    {
      "name": "Getting Started",
      "path": "01-getting-started",
      "documentCount": 5,
      "description": "Installation, setup, and quick start guides",
      "samples": [
        { "title": "Installation", "path": "01-getting-started/installation.md" },
        { "title": "Configuration", "path": "01-getting-started/configuration.md" }
      ]
    },
    {
      "name": "Commands",
      "path": "02-commands",
      "documentCount": 82,
      "description": "Complete command reference and guides",
      "samples": [
        { "title": "All Commands", "path": "02-commands/all-commands.md" },
        { "title": "Import", "path": "02-commands/data-tools/import.md" }
      ]
    }
  ],
  "total": 9,
  "documentCount": 279
}
```

### 4. Get Documentation Statistics (`hana_docs_stats`)

Overview of documentation status and metrics.

**Parameters:** None

**Returns:**
```json
{
  "totalDocuments": 279,
  "categories": 9,
  "keywordsIndexed": 2285,
  "categories": [
    { "name": "Getting Started", "count": 5 },
    { "name": "Commands", "count": 82 },
    { "name": "Features", "count": 15 },
    { "name": "API Reference", "count": 10 },
    { "name": "Development", "count": 20 },
    { "name": "Troubleshooting", "count": 8 },
    { "name": "Examples", "count": 52 },
    { "name": "Reference", "count": 22 },
    { "name": "Advanced", "count": 25 }
  ],
  "lastIndexed": "2024-02-18T10:30:00Z",
  "indexSize": "3.2 MB",
  "website": "https://sap-samples.github.io/hana-developer-cli-tool-example/"
}
```

## Search Algorithm

### Ranking Scores

Results are ranked by relevance using this scoring:

1. **Exact Title Match** - 100 points
2. **Title Contains Query** - 50 points
3. **Title Word Match** - 20 points per word
4. **Keyword Match** - 15 points per keyword
5. **Exact Keyword Match** - 30 points
6. **Excerpt Contains Word** - 5 points per word
7. **Heading Match** - 10 points per heading
8. **Category Match** - 15 points

**Final Score = Sum of all matching scores**

Results are sorted by score (highest first).

### Example Ranking

```
Query: "import CSV"

Document 1: "Import Command"
- Title contains "import" (+20)
- Keywords include "import", "csv" (+30)
- Excerpt mentions both (+10)
- Total: 60 ← Ranked #1

Document 2: "Data Import Examples"  
- Title contains "import" (+20)
- Keywords include "import" (+15)
- Excerpt matches (+5)
- Total: 40 ← Ranked #2

Document 3: "CSV File Format"
- Title contains "csv" (+20)
- Keywords include "csv" (+15)
- Total: 35 ← Ranked #3
```

## Usage Patterns

### Pattern 1: Search and Read

```typescript
// Step 1: Search
const results = await mcpTool('hana_search_docs', {
  query: 'how to connect to HANA database',
  limit: 5
});

// Step 2: Read best result
const fullDoc = await mcpTool('hana_get_doc', {
  path: results[0].path
});

// Step 3: Extract relevant sections
const setup = fullDoc.content.match(/## Setup/i);
const params = fullDoc.content.match(/## Parameters/i);
```

### Pattern 2: Browse by Category

```typescript
// Step 1: List categories
const categories = await mcpTool('hana_list_doc_categories');

// Step 2: Find category of interest
const commands = categories.find(c => c.name === 'Commands');

// Step 3: Search within category
const results = await mcpTool('hana_search_docs', {
  query: 'data validation',
  category: 'commands'
});

// Step 4: Read relevant docs
for (const result of results) {
  const doc = await mcpTool('hana_get_doc', { path: result.path });
}
```

### Pattern 3: Troubleshooting

```typescript
// Step 1: Search troubleshooting docs
const issues = await mcpTool('hana_search_docs', {
  query: 'connection timeout',
  category: 'troubleshooting',
  limit: 5
});

// Step 2: Read troubleshooting guide
const guide = await mcpTool('hana_get_doc', {
  path: issues[0].path
});

// Step 3: Extract solutions
const solutions = guide.content.match(/## Solution/gi);
```

### Pattern 4: Learn Command Usage

```typescript
// Step 1: Get command examples
const examples = await mcpTool('hana_search_docs', {
  query: 'import command',
  docType: 'command',
  limit: 1
});

// Step 2: Read full command guide
const commandDoc = await mcpTool('hana_get_doc', {
  path: examples[0].path
});

// Step 3: Extract parameters and examples
const paramSection = commandDoc.content.match(/## Parameters([\s\S]*?)##/);
const examplesSection = commandDoc.content.match(/## Examples([\s\S]*?)##/);
```

## Building and Updating the Index

### Automatic Index Building

The documentation index is built automatically from all markdown files in the `docs/` directory.

**Build on demand:**
```bash
npm run build:docs-index
```

**Build generates:**
- `mcp-server/docs-index.json` - Pre-built searchable index
- Metadata for all 279 pages
- Keywords and headings extracted
- Relevance weights calculated

### Manual Index Maintenance

If you add or update documentation:

```bash
# Rebuild the index
npm run build:docs-index

# Rebuild MCP server
cd mcp-server
npm run build

# Restart MCP in your client
# Test with hana_search_docs
```

### Index Structure

```json
{
  "version": "1.0.0",
  "lastIndexed": "2024-02-18T10:30:00Z",
  "documents": [
    {
      "path": "02-commands/data-tools/import.md",
      "title": "Import Command",
      "category": "commands",
      "docType": "command",
      "keywords": ["import", "csv", "data", "load", "etl"],
      "excerpt": "Import data from CSV, Excel...",
      "headings": [
        { "level": 1, "text": "Import Command" },
        { "level": 2, "text": "Overview" }
      ],
      "content": "Full markdown content here..."
    }
  ]
}
```

## Integration with MCP

### How Agents Use Documentation

```
User: "How do I import data?"

Agent: Calls hana_search_docs("import data")

System: Returns top 5 results with excerpts

Agent: Reads most relevant result

Agent: Confidence in usage

Agent: Calls hana_import with correct parameters

Success!
```

### Documentation-First Workflow

```
1. **Discover** - Search documentation
2. **Learn** - Read full guides
3. **Understand** - Get examples and parameters
4. **Execute** - Run commands correctly
5. **Validate** - Verify results with interpretation
```

## Benefits

### For Agents

✅ **Self-contained knowledge** - All docs available in MCP
✅ **No external lookups** - No need to leave MCP interface
✅ **Fast search** - Pre-built index for instant results
✅ **Context-aware** - Relevance ranking ensures best matches
✅ **Complete content** - Full documentation pages available

### For Users

✅ **Comprehensive help** - 279 pages at your fingertips
✅ **Quick reference** - Search and read without leaving IDE
✅ **Always current** - Documentation stays in sync
✅ **Offline accessible** - Works without internet
✅ **Integrated learning** - Learn while using commands

## Troubleshooting Documentation Search

### Issue: No Results

**Cause:** Search keywords don't match documents

**Solution:**
1. Try different keywords
2. Browse categories first
3. Use general terms
4. Check documentation exists

### Issue: Too Many Results

**Cause:** Search terms too general

**Solution:**
1. Add more keywords
2. Use category filter
3. Use docType filter
4. Increase relevance threshold

### Issue: Wrong Results

**Cause:** Relevance scoring doesn't match intent

**Solution:**
1. Add more specific keywords
2. Use category/type filters
3. Review top 3-5 results
4. Try alternative search terms

## Next Steps

- **[Features Overview](./features.md)** - All MCP capabilities
- **[Discovery Tools](./discovery-tools.md)** - Finding commands
- **[Advanced Features](./advanced-features.md)** - Workflows and interpretation
- **[Main Documentation Index](./index.md)** - Overview of all features
