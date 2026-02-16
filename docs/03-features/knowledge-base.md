# Knowledge Base Integration

Built-in knowledge base for quick help and learning.

## Accessing Help

### Command Help

```bash
# Show all commands
hana-cli --help

# Command-specific help
hana-cli import --help
hana-cli export --help
hana-cli dataProfile --help
```

### Search Knowledge Base

```bash
# Search for help topic
hana-cli kb search "import csv"
hana-cli kb search "data validation"
hana-cli help "compare schemas"
```

## Knowledge Base Topics

### Getting Started

- Installation and setup
- Configuration
- First steps
- System requirements

### Commands

- Command reference for all 20+ commands
- Option descriptions
- Examples and use cases
- Tips and tricks

### Troubleshooting

- Common errors
- Connection issues
- Performance optimization
- FAQ

### Best Practices

- Data import strategies
- Schema management
- Query optimization
- Security considerations

## Inline Documentation

### Example Help

```bash
$ hana-cli import --help

Usage: hana-cli import [options]

Description:
  Import data from CSV or Excel files into database tables.

Options:
  -n, --filename <path>   Input file path (required)
  -t, --table <name>      Target table (required)
  -m, --matchMode <mode>  Column matching: auto|name|order
  --truncate              Clear table before import

Examples:
  # Import CSV with auto column matching
  $ hana-cli import -n data.csv -t HR.EMPLOYEES

  # Import Excel with name matching
  $ hana-cli import -n data.xlsx -o excel -t SALES -m name

  # Import and truncate
  $ hana-cli import -n data.csv -t EMPLOYEES --truncate

See also:
  hana-cli export --help
  Documentation: https://docs...
```

## Examples Library

Built-in examples for common tasks:

```bash
# Show examples
hana-cli examples

# Find examples for a command
hana-cli example import
hana-cli example dataProfile

# Search for example
hana-cli examples search "duplicate"
```

## Interactive Mode

```bash
# Start interactive help
hana-cli interactive

# Interactive step-by-step import
> import
? File path: data.csv
? Target table: HR.EMPLOYEES
? Column matching mode: (auto) name / order
? Truncate table first? (no) yes / no
...
```

## Offline Documentation

Full documentation available locally:

```bash
# View documentation index
hana-cli docs

# View specific doc
hana-cli docs --topic "import"
hana-cli docs --topic "troubleshooting"
```

## Online Resources

- [Full Documentation](https://github.com/SAP-samples/hana-developer-cli-tool-example/tree/main/docs)
- [GitHub Repository](https://github.com/SAP-samples/hana-developer-cli-tool-example)
- [NPM Package](https://www.npmjs.com/package/hana-cli)

## See Also

- [CLI Features](./cli-features.md)
- [Complete Commands Reference](/02-commands/)
