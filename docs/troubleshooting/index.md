# Troubleshooting

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
   hana-cli systemInfo
   ```

3. **Check HANA service is running**
   - Contact HANA administrator
   - Verify service status on HANA administrative web ui

#### SSL Certificate Error

**Error:** `Error: self signed certificate`

**Solutions:**

1. **For development** - SSL certificate validation is disabled by default in hana-cli, so self-signed certificates should work without additional configuration.

2. **For production with trusted certificate** - Use a trust store:

   Via command line when connecting:

   ```bash
   hana-cli connect -n host:port -u USER -p PASSWORD --trustStore /path/to/truststore.pem
   ```

   Or add to your `default-env.json`:

   ```json
   {
     "VCAP_SERVICES": {
       "hana": [{
         "credentials": {
           "host": "hana.example.com",
           "port": 30015,
           "sslTrustStore": "/path/to/truststore.pem",
           "sslValidateCertificate": true
         }
       }]
     }
   }
   ```

#### Connection Configuration Not Found

**Error:** `❌ No Connection Configuration Found`

**Solutions:**

1. **Check the resolution order**
   - `default-env-admin.json` (when `--admin`)
   - `.cdsrc-private.json` (CAP `cds bind`)
   - `.env` with `VCAP_SERVICES`
   - `--conn <file>` (current or parent dirs, then `~/.hana-cli/`)
   - `default-env.json` (current or parent dirs)
   - `~/.hana-cli/default.json` (last resort)

2. **Validate the file you expect hana-cli to use**

   ```bash
   # Check JSON validity
   cat default-env.json | jq '.'
   ```

3. **If using CAP bindings**
   - Ensure `.cdsrc-private.json` exists in the project or a parent directory
   - Run `cds bind` and re-try the command

4. **Verify CDS bind connection**

   Check if `.cdsrc-private.json` exists:

   ```bash
   # Windows
   dir .cdsrc-private.json
   
   # Linux/Mac
   ls -la .cdsrc-private.json
   ```

   Validate the binding configuration:

   ```bash
   # Verify CDS can read the binding
   cds env get requires.db.credentials
   
   # Test the connection with hana-cli
   hana-cli systemInfo --debug
   ```

   If bindings are missing or invalid:

   ```bash
   # Re-create bindings from Cloud Foundry
   cds bind --to <service-instance-name>
   
   # Or bind to a local configuration
   cds bind --to <service-instance-name> --kind hana
   ```

#### Proxy or Corporate TLS Issues

**Symptoms:** TLS handshake failures, intermittent timeouts, or blocked ports

**Solutions:**

1. **Confirm proxy settings**
   - Ensure your shell has proxy environment variables set if required by policy

2. **Test raw connectivity**
   - Ping the host and verify the SQL port is reachable

3. **Use trusted certificates**
   - Install the corporate CA certificate
   - Use the `--trustStore` option when connecting: `hana-cli connect --trustStore /path/to/ca-cert.pem`
   - Or add `sslTrustStore` to your connection configuration file

#### Central Certificate Installation

Instead of adding certificates to each connection configuration, you can install them centrally for your entire environment. This approach is preferred for team/production setups as it avoids certificate duplication and makes onboarding easier.

##### Option 1: Local Environment Setup (Recommended)

Use the `NODE_EXTRA_CA_CERTS` environment variable to point Node.js to your corporate CA certificate bundle.

<ins>**Windows (PowerShell):**</ins>

```powershell
# Set for current session only
$env:NODE_EXTRA_CA_CERTS = "C:\certs\company-ca.pem"
hana-cli systemInfo

# Set permanently (current user)
[Environment]::SetEnvironmentVariable("NODE_EXTRA_CA_CERTS", "C:\certs\company-ca.pem", "User")

# Or in Command Prompt
set NODE_EXTRA_CA_CERTS=C:\certs\company-ca.pem
hana-cli systemInfo
```

<ins>**Linux/Mac:**</ins>

```bash
# Set for current session only
export NODE_EXTRA_CA_CERTS=/etc/ssl/certs/company-ca.pem
hana-cli systemInfo

# Set permanently (add to ~/.bashrc or ~/.zshrc)
echo 'export NODE_EXTRA_CA_CERTS=/etc/ssl/certs/company-ca.pem' >> ~/.bashrc
source ~/.bashrc
```

**Preparing your certificate file:**

If you have multiple certificates or need to convert formats:

```bash
# Combine multiple PEM certificates
cat cert1.pem cert2.pem > company-ca.pem

# Convert .crt to PEM
openssl x509 -inform DER -in certificate.crt -out certificate.pem

# Extract certificate from .p12/.pfx
openssl pkcs12 -in certificate.p12 -cacerts -nokeys -out certificate.pem
```

##### Option 2: Docker/Container Deployment

When deploying hana-cli or the included UI5 app in containers:

<ins>**Dockerfile example:**</ins>

```dockerfile
FROM node:18

# Copy your company CA certificate
COPY company-ca.pem /etc/ssl/certs/company-ca.pem

# Set Node.js to use the certificate
ENV NODE_EXTRA_CA_CERTS=/etc/ssl/certs/company-ca.pem

# Install hana-cli
RUN npm install -g hana-cli

# Your application setup
WORKDIR /app
COPY . .
RUN npm install

# Your command here
CMD ["hana-cli", "systemInfo"]
```

<ins>**Docker Compose example:**</ins>

```yaml
version: '3.8'
services:
  hana-cli:
    image: node:18
    environment:
      NODE_EXTRA_CA_CERTS: /etc/ssl/certs/company-ca.pem
      HANA_CLI_HOST: hana.example.com
      HANA_CLI_PORT: 30015
      HANA_CLI_USER: admin
      HANA_CLI_PASSWORD: password
    volumes:
      - ./company-ca.pem:/etc/ssl/certs/company-ca.pem:ro
    command: npx hana-cli systemInfo
```

##### Option 3: Corporate/Proxy Environment

If your organization uses a corporate proxy or firewall with certificate inspection:

```bash
# 1. Get the corporate CA certificate from your IT team
# 2. Set it for Node.js (see Option 1 above)

# 3. Also configure npm if you need to install packages
npm config set cafile /path/to/company-ca.pem

# 4. Verify npm can reach the registry
npm ping
```

If you're behind a proxy that requires authentication:

```bash
# Configure npm proxy
npm config set proxy http://username:password@proxy.company.com:8080
npm config set https-proxy http://username:password@proxy.company.com:8080

# Then set CA certificate
npm config set cafile /path/to/company-ca.pem
```

##### Reference: Certificate Configuration Options

| Method | Use Case | Scope |
| --- | --- | --- |
| `NODE_EXTRA_CA_CERTS` env var | System-wide, all Node.js apps | All commands, all connections |
| `--trustStore` flag | Single connection, one-off use | Current command only |
| `sslTrustStore` in config | Persistent per connection | Stored in configuration file |
| Docker/Container volume mount | Containerized deployments | Container environment |
| `npm config set cafile` | npm registry access | npm operations only |

**See also:**

- [SSL Certificate Error](#ssl-certificate-error) - Per-connection certificate setup
- [Proxy or Corporate TLS Issues](#proxy-or-corporate-tls-issues) - Troubleshooting TLS problems

---

### Command Execution Issues

#### Command Not Found

**Error:** `hana-cli: command not found`

**Solutions:**

1. **Check available commands**

   ```bash
   # View all available commands
   hana-cli --help
   ```

2. **Review the Commands documentation**
   - Visit the [Commands documentation](/docs/) for a complete list of available commands and their usage

3. **Verify command spelling**
   - Ensure you're using the correct command name (case-sensitive)
   - Check for typos in the command name

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

#### @sap/cds-dk Not Installed (CAP Bind / CDS Features)

**Symptoms:** CAP binding errors, CDS preview failures, or messages indicating `@sap/cds-dk` is required

**Solutions:**

1. **Install the CDS Development Kit globally**

   ```bash
   npm install -g @sap/cds-dk
   ```

2. **Verify availability**

   ```bash
   cds --version
   ```

3. **Re-run CAP binding**
   - From your CAP project root: `cds bind`
   - Then retry your hana-cli command

#### BTP CLI Missing or Not Logged In

**Symptoms:** BTP-related commands fail or return no target/global account

**Solutions:**

1. **Verify CLI is installed**

   ```bash
   btp --version
   ```

2. **Login and target**
   - Run `btp login`, then set the global account and subaccount

3. **Confirm target**

   ```bash
   hana-cli btp
   ```

#### Cloud Foundry CLI Missing or Not Logged In

**Symptoms:** HANA Cloud instance queries return empty results or login errors

**Solutions:**

1. **Verify CLI is installed**

   ```bash
   cf --version
   ```

2. **Login and target space**
   - Run `cf login` and target the correct org/space

3. **Re-run the hana-cli command**
   - Commands like `hana-cli hc` and `hana-cli hdi` depend on CF context

#### hdbsql Not Found

**Symptoms:** `hana-cli hdbsql` fails or `hdbsql` is not recognized

**Solutions:**

1. **Install SAP HANA Client**
   - Ensure the HANA client package is installed for your OS

2. **Verify PATH**

   ```bash
   hdbsql -version
   ```

3. **Restart your terminal**
   - PATH changes often require a new shell session

#### Node.js Version Mismatch

**Symptoms:** startup failures, dependency install errors, or `engines` warnings

**Solutions:**

1. **Verify your Node.js version**

   ```bash
   node --version
   ```

2. **Upgrade to the required version**
   - hana-cli requires Node.js 20.19.0 or later

#### Insufficient Privileges

**Error:** `Error: Insufficient privileges for operation`

**Solutions:**

1. **Check user permissions**
   - User must have SELECT privilege on tables
   - For admin operations, use --admin flag

2. **Diagnose missing privileges**

   Use the SAP HANA system procedure to identify exactly which privileges are missing:

   ```bash
   hana-cli callProcedure -s SYS -p GET_INSUFFICIENT_PRIVILEGE_ERROR_DETAILS
   ```

   This stored procedure will provide detailed information about missing authorizations and help guide your DBA in granting the correct privileges.

   See [SAP HANA Documentation](https://help.sap.com/docs/hana-cloud-database/sap-hana-cloud-sap-hana-database-security-guide/missing-authorization-procedure?locale=en-US&version=LATEST) for more details.

3. **Use admin credentials**

   ```bash
   hana-cli schemaClone -s SOURCE -t TARGET --admin
   ```

4. **Request permissions from DBA**
   - Contact SAP HANA administrator
   - Provide the output from `GET_INSUFFICIENT_PRIVILEGE_ERROR_DETAILS` procedure
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
   hana-cli systemInfo -t TABLE
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

**Solution:** hana-cli uses your system locale settings. Change the locale using the appropriate method for your operating system.

<ins>**Windows (PowerShell):**</ins>

```powershell
# View current locale
[System.Globalization.CultureInfo]::CurrentCulture

# You can also check Windows system language settings
# Settings > Time & Language > Language & region
```

<ins>**Windows (Command Prompt):**</ins>

```cmd
# View current locale
chcp
```

To change the system locale on Windows, use **Settings > Time & Language > Language & region** or adjust regional settings through Control Panel.

<ins>**Linux/Mac:**</ins>

```bash
# Set for current session only
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
hana-cli systemInfo

# Set permanently (add to ~/.bashrc or ~/.zshrc)
echo 'export LANG=en_US.UTF-8' >> ~/.bashrc
echo 'export LC_ALL=en_US.UTF-8' >> ~/.bashrc
source ~/.bashrc
```

**Available locale examples:**

- `en_US.UTF-8` - English (United States)
- `de_DE.UTF-8` - German (Germany)
- `fr_FR.UTF-8` - French (France)
- `es_ES.UTF-8` - Spanish (Spain)

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

<ins>**Windows (PowerShell):**</ins>

```powershell
# Set log level
$env:HANA_LOG_LEVEL = "debug"

# View logs
Get-Content $env:HANA_LOG_FILE
```

<ins>**Windows (Command Prompt):**</ins>

```cmd
# Set log level
set HANA_LOG_LEVEL=debug

# View logs
type %HANA_LOG_FILE%
```

<ins>**Linux/Mac:**</ins>

```bash
# Set log level
export HANA_LOG_LEVEL=debug

# View logs
cat $HANA_LOG_FILE
```

### Report Issues

- [GitHub Issues](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues)
- Include: error message, command executed, environment details - also consider using the command `hana-cli issue` to automatically gather and format information for you.

## Tips & Tricks

### Test Your Connection

```bash
# Simple connectivity test
hana-cli systemInfo

# More detailed diagnostics
hana-cli systemInfo --debug
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
- [Configuration Guide](./configuration.md)
- [Installation Guide](./installation.md)
- [GitHub Repository](https://github.com/SAP-samples/hana-developer-cli-tool-example)
