# CLI Features Guide

## Command Syntax

All hana-cli commands follow this pattern:

```bash
hana-cli <command> [options]
```

## Common Options

These options work with all commands:

| Option | Type | Description |
| ------ | ---- | ----------- |
| `-h, --help` | boolean | Show command help |
| `--verbose` | boolean | Detailed output |
| `--debug` | boolean | Debug information |
| `--output` | string | Output format |
| `--profile` | string | CDS profile |
| `--admin` | boolean | Admin credentials |

## Output Formats

Most commands support multiple output formats:

```bash
# Table format (default)
hana-cli dataProfile -s SCHEMA -t TABLE

# JSON format
hana-cli dataProfile -s SCHEMA -t TABLE --output json

# CSV format
hana-cli dataProfile -s SCHEMA -t TABLE --output csv

# Export to file
hana-cli dataProfile -s SCHEMA -t TABLE -o report.json
```

## Command Aliases

Commands support short aliases for faster typing:

```bash
# These are equivalent:
hana-cli import -n file.csv -t TABLE
hana-cli imp -n file.csv -t TABLE

hana-cli export -s SCHEMA -t TABLE -o file.csv
hana-cli exp -s SCHEMA -t TABLE -o file.csv
```

## Global Flags

### Help

```bash
# Show all commands
hana-cli --help

# Get command help
hana-cli <command> --help
hana-cli import --help
```

### Version

```bash
hana-cli --version
```

### Verbose Output

```bash
hana-cli dataProfile -s HR -t EMPLOYEES --verbose
```

### Debug Mode

```bash
hana-cli import -n data.csv -t TABLE --debug
```

## Connection Configuration

### Using default-env.json

Create file in working directory:

```json
{
  "VCAP_SERVICES": {
    "hana": [{
      "credentials": {
        "host": "your-hana-server.com",
        "port": 30013,
        "user": "DBUSER",
        "password": "password"
      }
    }]
  }
}
```

### Using Environment Variables

```bash
export HANA_HOST=your-hana-server.com
export HANA_PORT=30013
export HANA_USER=DBUSER
export HANA_PASSWORD=password
```

## Tips & Tricks

### Piping Output

```bash
# Export to file and open in editor
hana-cli export -s SCHEMA -t TABLE --output json | jq '.'
```

### Conditional Execution

```bash
# Only proceed if command succeeds
hana-cli dataValidator -s SCHEMA -t TABLE && echo "Validation passed!"
```

### Batch Operations

```bash
# Run multiple commands
hana-cli alerts
hana-cli dbInfo
hana-cli tables -s SCHEMA
```

### Using with Scripts

```bash
#!/bin/bash
SCHEMA="MySchema"
TABLE="MyTable"

# Profile table
hana-cli dataProfile -s $SCHEMA -t $TABLE

# Export data
hana-cli export -s $SCHEMA -t $TABLE -o backup.csv
```

## See Also

- [API Server](./api-server.md)
- [All Commands](/02-commands/)
