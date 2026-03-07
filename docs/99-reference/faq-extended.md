# FAQ - Frequently Asked Questions

Answers for common questions from users and contributors.

## Installation & Setup

### Q: Do I need SAP HANA installed locally?

**A:** No. You only need network access to a SAP HANA database instance. This can be:

- Remote SAP HANA server
- SAP HANA Express Edition (local or remote)
- SAP BTP HANA service
- SAP HANA Cloud

### Q: What's the minimum Node.js version required?

**A:** Node.js 20.19.0 or higher.

```bash
node --version
```

### Q: Can I use HANA CLI in the cloud?

**A:** Yes! HANA CLI works great in cloud environments:

- SAP Business Application Studio
- Google Cloud Shell
- AWS Cloud9
- GitHub Codespaces
- Azure Cloud Shell

### Q: How do I specify my database connection?

**A:** Three methods (in order of preference):

1. **default-env.json** (recommended for local development)
2. **Environment variables** (recommended for cloud/CI-CD)
3. **Command-line arguments** (for one-off commands)

See [Configuration Guide](../01-getting-started/configuration.md)

---

## Command Usage

### Q: What's the difference between `export` and `querySimple`?

**A:** They are two different commands:

- **`export`**: Exports table data to a file (CSV, Excel, or JSON). Use WHERE clauses to filter rows.

```bash
hana-cli export -s SCHEMA -t TABLE -o output.csv
```

- **`querySimple`**: Executes SQL queries and displays results in various formats.

```bash
hana-cli querySimple --query "SELECT * FROM SCHEMA.TABLE" --output csv
```

### Q: How do I import data from JSON?

**A:** Currently CSV and Excel formats are supported. To import JSON:

```bash
# Convert JSON to CSV first
# Or request enhancement: https://github.com/SAP-samples/hana-developer-cli-tool-example/issues
```

### Q: Can I import without creating the table first?

**A:** No, the table must exist. You can create it using SAP HANA Web IDE or SQL:

```sql
CREATE TABLE HR.EMPLOYEES (
  ID INT,
  NAME VARCHAR(255),
  SALARY DECIMAL(10,2)
);
```

### Q: How do I handle large CSV files?

**A:** HANA CLI processes files line-by-line, so size isn't an issue. For optimal performance:

```bash
# Monitor import
hana-cli import -n large-file.csv -t TABLE --verbose

# Or batch into smaller files and import separately
```

### Q: Can I update existing records during import?

**A:** No, `import` inserts only. For updates, use `dataSync`:

```bash
hana-cli dataSync -s1 STAGING -t1 DATA -s2 PROD -t2 DATA --mode upsert
```

---

## Data Operations

### Q: How do I compare schemas between two systems?

**A:** Use the `compareSchema` command:

```bash
hana-cli compareSchema -s1 DEV_SCHEMA -s2 PROD_SCHEMA
```

### Q: Can I clone a table with data to another schema?

**A:** Yes, use `tableCopy` with --data flag:

```bash
hana-cli tableCopy -s1 PROD -t1 CUSTOMERS -s2 DEV -t2 CUSTOMERS --data
```

### Q: How do I find duplicate records?

**A:** Use `duplicateDetection`:

```bash
hana-cli duplicateDetection -s SCHEMA -t TABLE -c "FIRST_NAME,LAST_NAME"
```

### Q: What's the difference between `dataProfile` and `dataValidator`?

**A:**

- **dataProfile**: Shows statistics (counts, nulls, distinct values)
- **dataValidator**: Checks data quality (constraints, types, rules)

### Q: How do I export only rows that match a condition?

**A:** Use the WHERE clause:

```bash
hana-cli export -s SCHEMA -t TABLE -w "STATUS='ACTIVE'" -o active.csv
```

### Q: Can I import different file formats?

**A:** Currently supported:

- CSV (comma-separated values)
- Excel (.xlsx files)

Use `-o excel` for Excel files when importing from Excel format.

### Q: What if my data types don't match?

**A:** The import command has improved data type handling:

- Auto-detects common types
- Reports mismatches with clear errors
- Suggests corrections
- Use `--debug` flag for detailed type information

---

## Performance & Troubleshooting

### Q: Why did startup time improve so much?

**A:** The 60-77% improvement comes from:

- Lazy-loading command modules (only load what's needed)
- Ultra-fast path for `--version` flag
- Deferred yargs loading
- Conditional debug module loading
- Eliminated completion overhead

Startup went from ~2,200ms to ~700ms for most commands.

### Q: Why are my queries slow?

**A:** Common causes:

1. Large table - use `--limit` to test first
2. Network latency - check connection quality
3. Database load - check with DBA
4. Missing indexes - HANA optimizer issue

Solutions:

```bash
# Test with limit
hana-cli export -s SCHEMA -t TABLE --limit 100

# Enable debug to see execution time
hana-cli export -s SCHEMA -t TABLE --debug
```

### Q: How do I fix "connection refused" error?

**A:** Check:

1. Host and port are correct
2. HANA service is running
3. Network/firewall allows connection
4. Credentials are valid

```bash
# Verify configuration
cat default-env.json | jq .

# Test connection explicitly
echo "" | nc -zv your-hana-host 30013
```

### Q: Can I use HANA CLI with proxy?

**A:** Yes, via environment variables:

```bash
export http_proxy=http://proxy.company.com:8080
export https_proxy=https://proxy.company.com:8080
export no_proxy=localhost,internalhosts

hana-cli dbInfo
```

### Q: How do I enable verbose logging?

**A:** Use `--debug` flag to enable detailed logging:

```bash
# Debug mode shows execution details
hana-cli import -n data.csv -t TABLE --debug

hana-cli dataProfile -s SCHEMA -t TABLE --debug

# Or set logging level via environment variable
export HANA_LOG_LEVEL=debug
hana-cli dbInfo
```

---

## API & Integration

### Q: How do I use HANA CLI as a REST API server?

**A:** Start the server:

```bash
hana-cli server --port 3000
```

Then access via HTTP:

```bash
curl http://localhost:3000/api/v1/dbInfo
```

Swagger UI available at: `http://localhost:3000/api-docs`

See [API Server Guide](../03-features/api-server.md)

### Q: Can I integrate with my CI/CD pipeline?

**A:** Yes! Works with GitHub Actions, GitLab CI, Jenkins, etc.

```bash
# Install in CI environment
npm install -g hana-cli

# Use in your pipeline
hana-cli export -s SCHEMA -t TABLE -o backup.csv
```

---

## MCP & AI

### Q: What is the MCP Server for?

**A:** Model Context Protocol enables AI assistants to interact with HANA CLI. It allows:

- AI-assisted database queries
- Automated schema analysis
- Code generation for data operations
- Integration with Claude, ChatGPT, etc.

### Q: How do I use HANA CLI with AI coding assistants?

**A:** Set up MCP (Model Context Protocol):

```bash
cd mcp-server
npm install
npm run build
```

See [MCP Integration Guide](../03-features/mcp-integration.md)

### Q: Where is MCP Server documentation?

**A:** See [Development Guide - MCP Server](../05-development/mcp-server/)

---

## Languages & Localization

### Q: In what languages is HANA CLI available?

**A:** English and German are fully supported. Help translate to more languages!

### Q: How do I use German localization?

```bash
export LANG=de
hana-cli dbInfo
```

Alternatively, use standard locale variables: `LC_ALL`, `LC_MESSAGES`, or `LANGUAGE`.

### Q: How do I contribute translations?

**A:** See [Internationalization](../03-features/internationalization.md) guide.

---

## Development & Architecture

### Q: How is the project structure organized?

**A:** The project is organized as:

```text
├── bin/                 # CLI entry points
├── app/                 # Command implementations
├── utils/               # Utility functions
├── routes/              # API routes (REST server)
├── tests/               # Test files
├── types/               # TypeScript type definitions
├── docs/                # This documentation (VitePress)
├── mcp-server/          # Model Context Protocol implementation
└── _i18n/               # Internationalization files
```

### Q: Where do I add a new command?

**A:**

1. Create implementation in `app/[command-name].js`
2. Add builder and handler functions
3. Export from `app/index.js`
4. Add tests in `tests/`
5. Document in `docs/02-commands/`

### Q: How is testing organized?

**A:** Test coverage has expanded from ~40% to ~85% with:

- 317+ new test cases
- 6 dedicated test files
- Focus on critical paths
- Run with: `npm test`

---

## Upgrades & Compatibility

### Q: How do I upgrade HANA CLI?

```bash
npm install -g hana-cli@latest
```

Or from source:

```bash
git clone https://github.com/SAP-samples/hana-developer-cli-tool-example
cd hana-developer-cli-tool-example
npm install
npm link
```

### Q: Is version 4.x backward compatible?

**A:** Mostly yes. Main breaking change:

- Express upgraded from 4.x to 5.x
- May affect REST API integration

See [Changelog](./changelog.md) for details.

---

## Custom Builds

### Q: Can I customize HANA CLI?

**A:** Yes, you can:

1. Fork the repository
2. Modify source code in `app/`, `utils/`, `routes/`
3. Run tests: `npm test`
4. Build: `npm run build`
5. Install locally: `npm link`

---

## Licensing & Community

### Q: Is HANA CLI free?

**A:** Yes! It's open-source under Apache License 2.0.

### Q: Can I modify and redistribute?

**A:** Yes, following Apache License 2.0 terms. See [LICENSE](../../LICENSE)

### Q: Where can I report bugs?

**A:** [GitHub Issues](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues)

### Q: How can I contribute?

**A:** Via pull requests! See CONTRIBUTING.md in the repository.

---

## Getting More Help

- **Documentation**: [Full Docs](/)
- **Troubleshooting**: [Troubleshooting Guide](../troubleshooting/)
- **Development Guide**: [Development Guide](../05-development/)
- **GitHub**: [Repository](https://github.com/SAP-samples/hana-developer-cli-tool-example)
- **Issues**: [Report Problems](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues)
- **Knowledge Base**: Run `hana-cli kb search "topic"`
