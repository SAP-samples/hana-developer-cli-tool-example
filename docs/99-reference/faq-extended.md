# Extended FAQ

Additional frequently asked questions beyond the main FAQ.

## Development & Architecture

### Q: How is the project structure organized?

**A:** The project is organized as:
```
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

## Performance

### Q: Why did startup time improve so much?

**A:** The 60-77% improvement comes from:
- Lazy-loading command modules (only load what's needed)
- Ultra-fast path for `--version` flag
- Deferred yargs loading
- Conditional debug module loading
- Eliminated completion overhead

Startup went from ~2,200ms to ~700ms for most commands.

## Database Operations

### Q: Can I import different file formats?

**A:** Currently supported:
- CSV (comma-separated values)
- Excel (.xlsx files)

Use `-o excel` for Excel files.

### Q: What if my data types don't match?

**A:** The import command has improved data type handling:
- Auto-detects common types
- Reports mismatches with clear errors
- Suggests corrections
- Use `--debug` flag for detailed type information

## Internationalization

### Q: What languages are supported?

**A:** 
- **English** (en) - Complete
- **German** (de) - First version complete

Contributing translations for other languages is welcome!

### Q: How do I use German localization?

```bash
export HANA_LANG=de
hana-cli dbInfo
```

## MCP Server

### Q: What is the MCP Server for?

**A:** Model Context Protocol enables AI assistants to interact with HANA CLI. It allows:
- AI-assisted database queries
- Automated schema analysis
- Code generation for data operations
- Integration with Claude, ChatGPT, etc.

### Q: Where is MCP Server documentation?

**A:** See [Development Guide - MCP Server](../05-development/mcp-server/) section.

## API Server

### Q: Can I run HANA CLI as a server?

**A:** Yes! Start with:
```bash
hana-cli server --port 3000
```

Swagger UI available at: `http://localhost:3000/api-docs`

## Upgrades & Compatibility

### Q: Which Node.js version should I use?

**A:** Latest stable is recommended. Current requirement: Node.js 22 or higher.

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

## Custom Builds

### Q: Can I customize HANA CLI?

**A:** Yes, you can:
1. Fork the repository
2. Modify source code in `app/`, `utils/`, `routes/`
3. Run tests: `npm test`
4. Build: `npm run build`
5. Install locally: `npm link`

## More Information

- [Main FAQ](../faq.md)
- [Troubleshooting](../troubleshooting.md)
- [Development Guide](../05-development/)
- [GitHub Repository](https://github.com/SAP-samples/hana-developer-cli-tool-example)
