# Troubleshooting

## Common Issues & Solutions

### Connection Issues

#### Cannot Connect to Database

**Error:** `Error: Cannot connect to database`

**Solutions:**

1. **Verify credentials**
   ```bash
   # Check default-env.json exists and is valid JSON
   cat default-env.json | jq '.'
   
   # Or check environment variables
   echo $HANA_HOST $HANA_PORT $HANA_USER
   ```

2. **Test network connectivity**
   ```bash
   # Windows
   ping hana.example.com
   
   # Linux/Mac
   ping -c 3 hana.example.com
   ```

3. **Verify port is correct**
   - Standard SQL port: 30013 (or 30015 for cloud)
   - Check with HANA administrators

4. **Check firewall**
   - Ensure port is open to your machine
   - Test with telnet: `telnet hana.example.com 30013`

#### Connection Timeout

**Error:** `Error: Connection timeout after 30000ms`

**Solutions:**

1. **Check network connectivity**
   - Ping HANA server
   - Check for firewall rules
   - Verify proxy settings if behind corporate proxy

2. **Increase timeout**
   ```bash
   export HANA_CONNECTION_TIMEOUT=60000  # 60 seconds
   hana-cli dbInfo
   ```

3. **Check HANA service is running**
   - Contact HANA administrator
   - Verify service status on HANA web console

#### SSL Certificate Error

**Error:** `Error: self signed certificate`

**Solutions:**

1. **For development only** (use CA certificate for production):
   ```bash
   export HANA_SSL_VERIFY=false
   hana-cli dbInfo
   ```

2. **Use certificate file**
   ```bash
   export HANA_SSL_CERT=/path/to/certificate.pem
   hana-cli dbInfo
   ```

---

### Command Execution Issues

#### Command Not Found

**Error:** `hana-cli: command not found`

**Solutions:**

1. **Reinstall globally**
   ```bash
   npm install -g hana-cli --force
   ```

2. **Check npm prefix**
   ```bash
   npm config get prefix
   # Add this directory to PATH
   ```

3. **Verify installation**
   ```bash
   npm list -g hana-cli
   ```

#### Permission Denied

**Error:** `EACCES: permission denied`

**Solutions:**

1. **Linux/Mac - Fix npm permissions**
   ```bash
   mkdir ~/.npm-global
   npm config set prefix '~/.npm-global'
   export PATH=~/.npm-global/bin:$PATH
   npm install -g hana-cli
   ```

2. **Windows - Run as Administrator**
   - Right-click PowerShell/CMD → Run as Administrator

3. **Use sudo (not recommended)**
   ```bash
   sudo npm install -g hana-cli
   ```

#### Insufficient Privileges

**Error:** `Error: Insufficient privileges for operation`

**Solutions:**

1. **Check user permissions**
   - User must have SELECT privilege on tables
   - For admin operations, use --admin flag

2. **Use admin credentials**
   ```bash
   hana-cli schemaClone -s SOURCE -t TARGET --admin
   ```

3. **Request permissions from DBA**
   - Contact SAP HANA administrator
   - Ask for specific schema/table privileges

---

### Data Import Issues

#### File Not Found

**Error:** `Error: File not found: data.csv`

**Solutions:**

1. **Use absolute path**
   ```bash
   hana-cli import -n /full/path/to/data.csv -t TABLE
   ```

2. **Check file exists**
   ```bash
   # Windows
   dir data.csv
   
   # Linux/Mac
   ls -la data.csv
   ```

3. **Check working directory**
   ```bash
   # Show current directory
   pwd  # Linux/Mac
   cd   # Windows
   ```

#### CSV Encoding Issues

**Error:** `Error: Invalid character encoding`

**Solutions:**

```bash
# Specify encoding
hana-cli import -n data.csv -t TABLE --encoding utf-8

# Convert file encoding
iconv -f ISO-8859-1 -t UTF-8 input.csv > output.csv
hana-cli import -n output.csv -t TABLE
```

#### Column Mismatch

**Error:** `Error: Column mismatch at row X`

**Solutions:**

1. **Use name matching**
   ```bash
   hana-cli import -n data.csv -t TABLE -m name
   ```

2. **Check column names**
   ```bash
   hana-cli tables -s SCHEMA -t TABLE
   ```

3. **Prepare data file**
   - Ensure headers match table columns
   - Use --truncate if starting fresh

---

### Output & Format Issues

#### Output Format Error

**Error:** `Error: Invalid output format`

**Solutions:**

```bash
# Use supported formats
hana-cli export -s SCHEMA -t TABLE --output json
hana-cli export -s SCHEMA -t TABLE --output csv
hana-cli export -s SCHEMA -t TABLE --output text
```

#### Large Export Timeout

**Error:** `Error: Operation timeout - export too large`

**Solutions:**

1. **Export in batches**
   ```bash
   # Limit rows
   hana-cli export -s SCHEMA -t TABLE --limit 10000 -o part1.csv
   ```

2. **Use pagination**
   ```bash
   # Export first 1000 rows
   hana-cli export -s SCHEMA -t TABLE --offset 0 --limit 1000
   
   # Export next 1000 rows
   hana-cli export -s SCHEMA -t TABLE --offset 1000 --limit 1000
   ```

3. **Filter data**
   ```bash
   hana-cli export -s SCHEMA -t TABLE -w "STATUS='ACTIVE'" -o active.csv
   ```

---

### Performance Issues

#### Slow Command Execution

**Solutions:**

1. **Enable debug to see timing**
   ```bash
   hana-cli dataProfile -s SCHEMA -t TABLE --debug
   ```

2. **Check table size**
   ```bash
   hana-cli dbInfo -t TABLE
   ```

3. **Use limit for large tables**
   ```bash
   hana-cli export -s SCHEMA -t TABLE --limit 1000
   ```

#### High Memory Usage

**Solutions:**

1. **Process in chunks**
   ```bash
   hana-cli export -s SCHEMA -t TABLE --batch-size 500
   ```

2. **Increase Node.js heap**
   ```bash
   node --max-old-space-size=4096 $(which hana-cli) export ...
   ```

---

### Language & Localization

#### Wrong Language Output

**Solutions:**

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

1. **Command help**
   ```bash
   hana-cli <command> --help
   ```

2. **Search documentation**
   - See [Documentation Hub](/docs/)

3. **Knowledge base**
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

- [GitHub Issues](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues)
- Include: error message, command executed, environment details

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

- [Configuration Guide](./configuration.md)
- [Installation Guide](./installation.md)
- [GitHub Repository](https://github.com/SAP-samples/hana-developer-cli-tool-example)
