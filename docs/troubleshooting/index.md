# Troubleshooting

Use this guide to troubleshoot common hana-cli errors, verify fixes, and get back to work quickly. If you are just getting started, see the [Installation Guide](./installation.md) and [Configuration Guide](./configuration.md).

## Quick Links

- [Connection issues](#connection-issues)
- [Command execution issues](#command-execution-issues)
- [Data import issues](#data-import-issues)
- [Output & format issues](#output--format-issues)
- [Performance issues](#performance-issues)
- [Language & localization](#language--localization)
- [Business Application Studio](#business-application-studio-bas)
- [Getting help](#getting-help)
- [Tips & tricks](#tips--tricks)
- [MCP server issues](./mcp.md)

## Common Issues & Solutions

### Connection Issues

If you suspect a connection problem, start with a fast sanity check:

```bash
hana-cli status
hana-cli systemInfo --output basic
```

#### Cannot Connect to Database

**Error:** `Error: Cannot connect to database`

**Solutions:**

1. **Verify credentials**

   ```bash
   # Check default-env.json exists and is valid JSON
   cat default-env.json | jq '.'

   # Or check environment variables
   echo $HANA_CLI_HOST $HANA_CLI_PORT $HANA_CLI_USER
   ```

   On Windows (PowerShell):

   ```powershell
   Get-Content .\default-env.json | ConvertFrom-Json
   "$env:HANA_CLI_HOST $env:HANA_CLI_PORT $env:HANA_CLI_USER"
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

   On Windows (PowerShell):

   ```powershell
   $env:HANA_CONNECTION_TIMEOUT = 60000
   hana-cli systemInfo
   ```

3. **Check HANA service is running**
   - Contact HANA administrator
   - Verify service status on HANA administrative web UI

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
   - Run `cds bind` and retry the command

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

4. **Verify proxy variables**

   Linux/macOS:

   ```bash
   echo $HTTPS_PROXY
   echo $HTTP_PROXY
   ```

   Windows (PowerShell):

   ```powershell
   $env:HTTPS_PROXY
   $env:HTTP_PROXY
   ```

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

If a command fails unexpectedly, re-run it with debug output to capture context:

```bash
hana-cli <command> --debug --verbose
```

On Windows (PowerShell), you can capture output to a file for sharing:

```powershell
hana-cli <command> --debug --verbose | Tee-Object -FilePath hana-cli-debug.log
```

#### Command Not Found

**Error:** `hana-cli: command not found`

**Solutions:**

1. **Check available commands**

   ```bash
   # View all available commands
   hana-cli --help
   ```

2. **Review the Commands documentation**
   - Visit the [Commands documentation](/02-commands/) for a complete list of available commands and their usage

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
   - See the [Installation Guide](./installation.md) for platform-specific steps

#### Insufficient Privileges

**Error:** `Error: Insufficient privileges for operation`

**Solutions:**

1. **Check user permissions**
   - User must have SELECT privilege on tables
   - For admin operations, use --admin flag

2. **Diagnose missing privileges**

   Use the SAP HANA system procedure to identify exactly which privileges are missing:

   ```bash
   hana-cli callProcedure -s SYS -p GET_INSUFFICIENT_PRIVILEGE_ERROR_DETAILS --parameters GUID
   ```

   Replace `GUID` with the value from the original error message.

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
   ```

   Windows (PowerShell):

   ```powershell
   Get-Location
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
   - Use `--truncate` if starting fresh
   - Preview table metadata with `hana-cli inspectTable --schema SCHEMA --table TABLE`

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

2. **Check table size and access patterns**

   ```bash
   hana-cli tableHotspots --schema SCHEMA --table TABLE
   ```

3. **Inspect expensive tables**

   ```bash
   hana-cli inspectTable --schema SCHEMA --table TABLE
   ```

4. **Use limit for large tables**

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

   On Windows (PowerShell):

   ```powershell
   node --max-old-space-size=4096 (Get-Command hana-cli).Source export ...
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
- `es_ES.UTF-8` - Spanish (Spain)
- `fr_FR.UTF-8` - French (France)
- `ja_JP.UTF-8` - Japanese (Japan)
- `ko_KR.UTF-8` - Korean (Korea)
- `pt_PT.UTF-8` - Portuguese (Portugal)
- `zh_CN.UTF-8` - Simplified Chinese (China)
- `hi_IN.UTF-8` - Hindi (India)
- `pl_PL.UTF-8` - Polish (Poland)

---

### Business Application Studio (BAS)

This section covers troubleshooting tips specific to running hana-cli within SAP Business Application Studio (BAS), the cloud-native development environment integrated with SAP BTP.

#### hana-cli Not Found in BAS Terminal

**Symptoms:** Running `hana-cli` in the BAS integrated terminal returns "command not found" or similar error

**Solutions:**

1. **Install hana-cli in the workspace**

   If hana-cli is not pre-installed in your BAS workspace, install it locally:

   ```bash
   npm install hana-cli
   ```

   Then run it via npx:

   ```bash
   npx hana-cli systemInfo
   ```

2. **Install globally in the dev container** (if using a custom dev container)

   Edit your `.devcontainer/devcontainer.json`:

   ```json
   {
     "postCreateCommand": "npm install -g hana-cli"
   }
   ```

   Then rebuild the container in VS Code.

3. **Verify the workspace has Node.js installed**

   ```bash
   node --version
   npm --version
   ```

   If Node.js is not available, request a workspace with the necessary runtime environment from your BAS administrator.

#### CDS Binding Not Found in BAS

**Symptoms:** Error: `❌ No Connection Configuration Found` when running commands in a CAP project

**Solutions:**

1. **Ensure project uses `cds bind`** (recommended)

   In your CAP project root:

   ```bash
   # List available service instances in your BTP subaccount
   cds add hana --ucap
   
   # Bind to a specific HANA instance
   cds bind --to my-hana-service-instance
   ```

   This creates `.cdsrc-private.json` in your workspace with connection credentials.

2. **Verify `.cdsrc-private.json` exists**

   ```bash
   # Check if the binding file exists
   ls -la .cdsrc-private.json
   
   # Validate it contains hana credentials
   cat .cdsrc-private.json | jq '.requires.db.credentials'
   ```

3. **Re-bind if credentials are stale**

   ```bash
   # Remove the old binding
   rm .cdsrc-private.json
   
   # Create a fresh binding
   cds bind --to my-hana-service-instance
   
   # Test the connection
   hana-cli status
   ```

4. **Check BTP service instance is accessible**

   Use BTP CLI to verify the service instance exists in your target subaccount:

   ```bash
   btp login
   btp target --subaccount <subaccount-ID>
   btp list services/instances
   ```

   If the instance is not listed, verify you have the correct subaccount targeted and the service instance hasn't been deleted.

#### Workspace Is Read-Only / Permission Denied Errors

**Symptoms:** `EACCES: permission denied`, `EROFS: read-only file system`, or file modification fails in BAS

**Solutions:**

1. **Check workspace storage quota**

   In BAS, the workspace storage is limited. Run:

   ```bash
   # Check disk usage
   df -h
   
   # Check workspace size
   du -sh ~
   ```

   If you're near quota, contact your BAS administrator to request increased storage.

2. **Verify file permissions on imported data**

   If you imported CSV files or created configuration files outside BAS:

   ```bash
   # Check current permissions
   ls -la data.csv
   
   # Fix if needed (Linux/Mac)
   chmod 644 data.csv
   ```

3. **Workspace might be locked by another session**

   If multiple windows or sessions have the same workspace open:

   - Close all other editor windows/tabs for this workspace
   - Reload the current window: Press `F1` → search for "Reload Window"

4. **Clear BAS cache if issues persist**

   - In BAS UI, go to **File** → **Preferences** → **Settings**
   - Search for "Exclude Patterns" and ensure data directories are not excluded
   - Restart the workspace

#### BAS Workspace Timeout During Long-Running Commands

**Symptoms:** Commands time out, connection drops, or commands don't complete in BAS terminal

**Solutions:**

1. **Increase command timeout for long operations**

   Set environment variables in the BAS terminal:

   ```bash
   # Increase connection timeout to 2 minutes
   export HANA_CONNECTION_TIMEOUT=120000
   
   # For export operations with large datasets
   export HANA_QUERY_TIMEOUT=300000
   
   # Then run your command
   hana-cli export -s SCHEMA -t LARGE_TABLE -o output.csv
   ```

2. **Use pagination for large exports instead of single operations**

   ```bash
   # Export in batches to avoid timeout
   hana-cli export -s SCHEMA -t LARGE_TABLE --offset 0 --limit 100000 -o part1.csv
   hana-cli export -s SCHEMA -t LARGE_TABLE --offset 100000 --limit 100000 -o part2.csv
   ```

3. **Keep BAS workspace active**

   The workspace may suspend idle sessions:

   - Keep the terminal open and active
   - Avoid leaving long-running commands unattended for extended periods
   - Consider running large operations during off-peak hours if the system is heavily used

4. **Check BAS network connectivity**

   If timeouts are frequent:

   ```bash
   # Test network connectivity
   ping hana.example.com
   
   # Test DNS resolution
   nslookup hana.example.com
   ```

   If connectivity is unstable, contact your network/BTP administrator.

#### Environment Variables Not Persisting in BAS Terminal

**Symptoms:** Environment variables set in one terminal session vanish in a new tab or after closing the terminal

**Solutions:**

1. **Set variables persistently in `.bashrc` or `.zshrc`**

   Add variables to your shell profile:

   ```bash
   # Open or create ~/.bashrc
   cat >> ~/.bashrc << 'EOF'
   export HANA_CLI_HOST=hana.example.com
   export HANA_CLI_PORT=30015
   export HANA_CLI_USER=myuser
   EOF
   
   # Source the file in current session
   source ~/.bashrc
   ```

2. **For CAP projects, use `.env` file**

   Create a `.env` file in your project root (this persists across terminal sessions):

   ```bash
   HANA_CLI_HOST=hana.example.com
   HANA_CLI_PORT=30015
   HANA_CLI_USER=myuser
   HANA_CLI_PASSWORD=mypassword
   ```

   Then load it in your terminal:

   ```bash
   source .env
   hana-cli status
   ```

3. **For BAS workspace-wide settings, use workspace settings**

   Edit `.vscode/settings.json` in your workspace root to document environment setup (for team reference):

   ```json
   {
     "terminal.integrated.env.linux": {
       "HANA_CLI_HOST": "hana.example.com",
       "HANA_CLI_PORT": "30015"
     }
   }
   ```

   Then set secrets / passwords separately using BAS Secrets feature.

#### Git / Source Control Issues in BAS when using hana-cli

**Symptoms:** Adding configuration files to Git, credential leaks, or merge conflicts with generated files

**Solutions:**

1. **Protect sensitive configuration files**

   Add connection config files to `.gitignore`:

   ```bash
   # In your .gitignore
   default-env.json
   default-env-admin.json
   .env
   .cdsrc-private.json  # Already done by CAP
   ~/.hana-cli/        # Home directory configs
   ```

   Use `.cdsrc-private.json` for credentials (handled by CAP) or CAP's config management for secrets.

2. **Commit only non-sensitive files**

   ```bash
   # Commit sample/template config without credentials
   git add .cdsrc-template.json
   git commit -m "Add sample CDS config template"
   
   # .cdsrc-private.json with credentials is git-ignored
   ```

3. **Resolve merge conflicts in package-lock.json**

   If two developers run `npm install` and conflict:

   ```bash
   npm install
   git add package-lock.json
   git commit -m "Resolve package-lock merge conflict"
   ```

#### Default HANA Connection Not Detected in CAP Project

**Symptoms:** `hana-cli` works outside a CAP project but fails inside, returning connection not found errors

**Solutions:**

1. **Verify CAP project structure**

   A valid CAP project contains `package.json` with `@sap/cds` dependency and a `db/` or `srv/` folder:

   ```bash
   ls -la package.json db/ srv/
   ```

2. **Check `.cdsrc-private.json` is in the project root**

   ```bash
   # Should be at project root level, not in subdirectories
   ls -la .cdsrc-private.json
   cat .cdsrc-private.json | jq '.requires.db.credentials'
   ```

3. **Ensure CDS finds the binding**

   ```bash
   # Verify CDS can read the binding
   cds env get requires.db
   ```

   If this returns undefined, re-run `cds bind`.

4. **If using a workspace with multiple projects, specify the project**

   Navigate to the correct CAP project directory before running hana-cli:

   ```bash
   cd my-cap-project/
   hana-cli systemInfo
   ```

#### Connection Credentials Exposed in BAS Terminal Output

**Symptoms:** Terminal history shows connection passwords, API tokens, or other credentials

**Solutions:**

1. **Clear terminal history**

   ```bash
   # Clear current terminal output
   clear
   
   # Or use history management
   history -c  # Clear history (bash)
   ```

2. **Use secure environment variable assignments**

   Instead of typing passwords on the command line:

   ```bash
   # Prompt for password (not visible in history)
   read -sp "Enter HANA password: " HANA_CLI_PASSWORD
   export HANA_CLI_PASSWORD
   
   # Use with hana-cli
   hana-cli systemInfo
   ```

3. **Leverage BAS Secrets for credentials**

   BAS provides a secure secrets management feature:

   - Access **Settings** → **Secrets** in BAS
   - Store sensitive values there instead of in files or env vars
   - Reference them in your configuration as needed

4. **Use `.cdsrc-private.json` instead of command-line parameters**

   Credentials in files stay out of shell history:

   ```bash
   # Good - credentials in .cdsrc-private.json (git-ignored)
   cds bind --to my-hana-service-instance
   hana-cli status
   
   # Avoid - passwords visible in command history
   hana-cli status -n myhost -p mypassword
   ```

#### BAS and Docker / Dev Container Issues

**Symptoms:** hana-cli works on local machine but fails in BAS dev container setup, or dev container won't start

**Solutions:**

1. **Ensure dev container includes Node.js**

   In `.devcontainer/devcontainer.json`:

   ```json
   {
     "image": "mcr.microsoft.com/devcontainers/javascript-node:18",
     "postCreateCommand": "npm install -g hana-cli @sap/cds-dk"
   }
   ```

2. **Rebuild dev container after changes**

   - Press `F1` in BAS
   - Search for "Dev Containers: Rebuild and Reopen in Container"
   - Wait for container to rebuild

3. **Check Volume Mounts**

   If workspace files aren't visible in the container:

   ```json
   {
     "mounts": [
       "source=${localEnv:HOME}${localEnv:USERPROFILE}/.hana-cli,target=/root/.hana-cli,type=bind"
     ]
   }
   ```

4. **Forward HANA connection through BAS network**

   If HANA is on a private network, ensure BAS has connectivity:

   ```bash
   # Inside container, test connectivity
   ping hana.example.com
   nc -zv hana.example.com 30015
   ```

#### Performance Issues in BAS

**Symptoms:** Commands run slowly, output is delayed, or UI becomes unresponsive during operations

**Solutions:**

1. **Check available memory and CPU in workspace**

   ```bash
   # Check memory
   free -h
   
   # Check CPU info
   nproc
   ```

2. **Limit output verbosity for large results**

   ```bash
   # Instead of full debug output
   hana-cli export -s SCHEMA -t TABLE -o data.csv
   
   # Avoid excessive logging
   hana-cli export -s SCHEMA -t TABLE -o data.csv  # without --debug
   ```

3. **Use pagination and filters to reduce data transfer**

   ```bash
   # Reduce output size
   hana-cli export -s SCHEMA -t TABLE --limit 1000 -o sample.csv
   ```

4. **Close unused editor tabs and extensions**

   The BAS UI consumes resources; closing unused windows frees memory for CLI operations.

---

## Getting Help

### Check Documentation

1. **Command help**

   ```bash
   hana-cli <command> --help
   ```

2. **Search documentation**
   - See [Documentation Hub](/)

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

---

## MCP Server Issues (Quick Checks)

If you are using the Model Context Protocol (MCP) server integration, run these quick checks first:

1. **Verify the MCP server is installed**

   ```bash
   cd mcp-server
   npm install
   ```

2. **Start the MCP server in debug mode**

   ```bash
   npm run dev -- --debug
   ```

3. **Validate CLI connectivity separately**

   ```bash
   hana-cli status
   hana-cli systemInfo --output basic
   ```

For full MCP troubleshooting, see [MCP Server Issues](./mcp.md).

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
- [Commands documentation](/02-commands/)
- [GitHub Repository](https://github.com/SAP-samples/hana-developer-cli-tool-example)
