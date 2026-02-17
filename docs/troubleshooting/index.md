# Troubleshooting

Solutions for common issues and problems with hana-cli.

## Quick Links

- [Connection issues](#connection-issues)
- [Command execution issues](#command-execution-issues)
- [Data import issues](#data-import-issues)
- [Output & format issues](#output--format-issues)
- [Performance issues](#performance-issues)
- [Language & localization](#language--localization)
- [Getting help](#getting-help)
- [Tips & tricks](#tips--tricks)
- [MCP server issues](./mcp.md)

## Common Issues & Solutions

### Connection Issues

#### Cannot Connect to Database

**Error:** `Error: Cannot connect to database`

Solutions:

Verify credentials:

```bash
# Check default-env.json exists and is valid JSON
cat default-env.json | jq '.'

# Or check environment variables
echo $HANA_HOST $HANA_PORT $HANA_USER
```

Test network connectivity:

```bash
# Windows
ping hana.example.com

# Linux/Mac
ping -c 3 hana.example.com
```

Verify port is correct:

Standard SQL port is 30013 (or 30015 for cloud). Check with HANA administrators.

Check firewall:

Ensure the port is open to your machine. Test with telnet: `telnet hana.example.com 30013`.

#### Connection Timeout

**Error:** `Error: Connection timeout after 30000ms`

Solutions:

Check network connectivity:

Ping the HANA server, check firewall rules, and verify proxy settings if behind a corporate proxy.

Increase timeout:

```bash
export HANA_CONNECTION_TIMEOUT=60000  # 60 seconds
hana-cli dbInfo
```

Check HANA service is running:

Contact your HANA administrator and verify service status on the HANA web console.

#### SSL Certificate Error

**Error:** `Error: self signed certificate`

Solutions:

For development only (use CA certificate for production):

```bash
export HANA_SSL_VERIFY=false
hana-cli dbInfo
```

Use certificate file:

```bash
export HANA_SSL_CERT=/path/to/certificate.pem
hana-cli dbInfo
```

#### Connection Configuration Not Found

**Error:** `❌ No Connection Configuration Found`

Solutions:

Check the resolution order:

Resolution order is: `default-env-admin.json` (when `--admin`), `.cdsrc-private.json` (CAP `cds bind`), `.env` with `VCAP_SERVICES`, `--conn <file>` (current or parent dirs, then `~/.hana-cli/`), `default-env.json` (current or parent dirs), and `~/.hana-cli/default.json` (last resort).

Validate the file you expect hana-cli to use:

```bash
# Check JSON validity
cat default-env.json | jq '.'
```

If using CAP bindings:

Ensure `.cdsrc-private.json` exists in the project or a parent directory. Run `cds bind` and re-try the command.

#### Proxy or Corporate TLS Issues

**Symptoms:** TLS handshake failures, intermittent timeouts, or blocked ports

Solutions:

Confirm proxy settings:

Ensure your shell has proxy environment variables set if required by policy.

Test raw connectivity:

Ping the host and verify the SQL port is reachable.

Use trusted certificates:

Prefer installing the corporate CA certificate and pointing `HANA_SSL_CERT` to it.

---

### Command Execution Issues

#### Command Not Found

**Error:** `hana-cli: command not found`

Solutions:

Reinstall globally:

```bash
npm install -g hana-cli --force
```

Check npm prefix:

```bash
npm config get prefix
# Add this directory to PATH
```

Verify installation:

```bash
npm list -g hana-cli
```

#### Permission Denied

**Error:** `EACCES: permission denied`

Solutions:

Linux/Mac - Fix npm permissions:

```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
npm install -g hana-cli
```

Windows - Run as Administrator:

Right-click PowerShell/CMD → Run as Administrator.

Use sudo (not recommended):

```bash
sudo npm install -g hana-cli
```

#### @sap/cds-dk Not Installed (CAP Bind / CDS Features)

**Symptoms:** CAP binding errors, CDS preview failures, or messages indicating `@sap/cds-dk` is required

Solutions:

Install the CDS Development Kit globally:

```bash
npm install -g @sap/cds-dk
```

Verify availability:

```bash
cds --version
```

Re-run CAP binding:

From your CAP project root, run `cds bind`, then retry your hana-cli command.

#### BTP CLI Missing or Not Logged In

**Symptoms:** BTP-related commands fail or return no target/global account

Solutions:

Verify CLI is installed:

```bash
btp --version
```

Login and target:

Run `btp login`, then set the global account and subaccount.

Confirm target:

```bash
hana-cli btp
```

#### Cloud Foundry CLI Missing or Not Logged In

**Symptoms:** HANA Cloud instance queries return empty results or login errors

Solutions:

Verify CLI is installed:

```bash
cf --version
```

Login and target space:

Run `cf login` and target the correct org/space.

Re-run the hana-cli command:

Commands like `hana-cli hc` and `hana-cli hdi` depend on CF context.

#### hdbsql Not Found

**Symptoms:** `hana-cli hdbsql` fails or `hdbsql` is not recognized

Solutions:

Install SAP HANA Client:

Ensure the HANA client package is installed for your OS.

Verify PATH:

```bash
hdbsql -version
```

Restart your terminal:

PATH changes often require a new shell session.

#### Node.js Version Mismatch

**Symptoms:** startup failures, dependency install errors, or `engines` warnings

Solutions:

Verify your Node.js version:

```bash
node --version
```

Upgrade to the required version:

hana-cli requires Node.js 20.19.0 or later.

#### Insufficient Privileges

**Error:** `Error: Insufficient privileges for operation`

Solutions:

Check user permissions:

User must have SELECT privilege on tables. For admin operations, use --admin flag.

Use admin credentials:

```bash
hana-cli schemaClone -s SOURCE -t TARGET --admin
```

Request permissions from DBA:

Contact your SAP HANA administrator and ask for specific schema/table privileges.

---

### Data Import Issues

#### File Not Found

**Error:** `Error: File not found: data.csv`

Solutions:

Use absolute path:

```bash
hana-cli import -n /full/path/to/data.csv -t TABLE
```

Check file exists:

```bash
# Windows
dir data.csv

# Linux/Mac
ls -la data.csv
```

Check working directory:

```bash
# Show current directory
pwd  # Linux/Mac
cd   # Windows
```

#### CSV Encoding Issues

**Error:** `Error: Invalid character encoding`

Solutions:

```bash
# Specify encoding
hana-cli import -n data.csv -t TABLE --encoding utf-8

# Convert file encoding
iconv -f ISO-8859-1 -t UTF-8 input.csv > output.csv
hana-cli import -n output.csv -t TABLE
```

#### Column Mismatch

**Error:** `Error: Column mismatch at row X`

Solutions:

Use name matching:

```bash
hana-cli import -n data.csv -t TABLE -m name
```

Check column names:

```bash
hana-cli tables -s SCHEMA -t TABLE
```

Prepare data file:

Ensure headers match table columns. Use --truncate if starting fresh.

---

### Output & Format Issues

#### Output Format Error

**Error:** `Error: Invalid output format`

Solutions:

```bash
# Use supported formats
hana-cli export -s SCHEMA -t TABLE --output json
hana-cli export -s SCHEMA -t TABLE --output csv
hana-cli export -s SCHEMA -t TABLE --output text
```

#### Large Export Timeout

**Error:** `Error: Operation timeout - export too large`

Solutions:

Export in batches:

```bash
# Limit rows
hana-cli export -s SCHEMA -t TABLE --limit 10000 -o part1.csv
```

Use pagination:

```bash
# Export first 1000 rows
hana-cli export -s SCHEMA -t TABLE --offset 0 --limit 1000

# Export next 1000 rows
hana-cli export -s SCHEMA -t TABLE --offset 1000 --limit 1000
```

Filter data:

```bash
hana-cli export -s SCHEMA -t TABLE -w "STATUS='ACTIVE'" -o active.csv
```

---

### Performance Issues

#### Slow Command Execution

Solutions:

Enable debug to see timing:

```bash
hana-cli dataProfile -s SCHEMA -t TABLE --debug
```

Check table size:

```bash
hana-cli dbInfo -t TABLE
```

Use limit for large tables:

```bash
hana-cli export -s SCHEMA -t TABLE --limit 1000
```

#### High Memory Usage

Solutions:

Process in chunks:

```bash
hana-cli export -s SCHEMA -t TABLE --batch-size 500
```

Increase Node.js heap:

```bash
node --max-old-space-size=4096 $(which hana-cli) export ...
```

---

### Language & Localization

#### Wrong Language Output

Solutions:

```bash
# Set language
export HANA_LANG=en
hana-cli dbInfo

# Or per command
HANA_LANG=de hana-cli dbInfo
```

---

## Getting Help

### Check Documentation

Command help:

```bash
hana-cli <command> --help
```

Search documentation:

See [Documentation Hub](/docs/).

Knowledge base:

```bash
hana-cli kb search "your topic"
```

### Enable Debug Output

```bash
hana-cli <command> --debug --verbose
```

### Check Logs

```bash
# Set log level
export HANA_LOG_LEVEL=debug

# View logs
cat $HANA_LOG_FILE
```

### Report Issues

Report issues at [GitHub Issues](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues). Include the error message, command executed, and environment details.

## Tips & Tricks

### Test Your Connection

```bash
# Simple connectivity test
hana-cli dbInfo

# More detailed diagnostics
hana-cli dbInfo --debug
```

### Dry Run

```bash
# Most write operations support --dry-run
hana-cli import -n data.csv -t TABLE --dry-run
```

### Batch Operations Script

```bash
#!/bin/bash
set -e  # Exit on error

for file in data/*.csv; do
  echo "Processing $file..."
  hana-cli import -n "$file" -t TABLE || echo "Failed: $file"
done
```

## See Also

- [MCP Server Issues](./mcp.md)
- [Getting Started Installation](/01-getting-started/installation)
- [Configuration Guide](/01-getting-started/configuration)
- [GitHub Repository](https://github.com/SAP-samples/hana-developer-cli-tool-example)
