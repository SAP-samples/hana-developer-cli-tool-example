# Setup and Configuration

Installation, configuration, and connection setup for the MCP Server.

## Installation

### Prerequisites

- Node.js 14+ (v16 or v18 recommended)
- npm (included with Node.js)
- SAP HANA database instance or SAP BTP HANA Cloud instance

### Step 1: Install Dependencies

Navigate to the mcp-server directory and install dependencies:

```bash
cd mcp-server
npm install
```

The installation includes:
- TypeScript compiler and type definitions
- MCP SDK packages
- Database connection utilities
- All command implementations

### Step 2: Build the Server

Compile TypeScript to JavaScript:

```bash
npm run build
```

This generates:
- `build/index.js` - Main MCP server entry point
- `build/src/` - All TypeScript source files compiled to JavaScript

All dependencies are installed automatically via the `prepare` script.

### Step 3: Verify Installation

Test that the build was successful:

```bash
# Check build output exists
ls -la build/

# Should show:
# - index.js
# - src/ directory with compiled files
```

## Database Connection Setup

The MCP server requires a valid SAP HANA database connection. Choose one of these methods:

### Method 1: SAP BTP Service Key (Recommended)

For SAP BTP HANA Cloud instances:

```bash
hana-cli serviceKey -i <instance-name> -k <key-name>
```

This command:
1. Connects to SAP Cloud Foundry
2. Retrieves the service key
3. Creates `default-env.json` with connection details
4. Validates the connection

### Method 2: Interactive Connection Setup

Prompt-based connection configuration:

```bash
hana-cli connect
```

This will ask for:
- Host/Server address
- Port (default: 30013 or 443 for HANA Cloud)
- Username
- Password
- Schema name (optional)
- SSL/TLS settings

### Method 3: Manual Configuration

Create a `default-env.json` file in your project root:

```json
{
  "VCAP_SERVICES": {
    "hana": [{
      "name": "my-hana-instance",
      "tags": ["hana"],
      "credentials": {
        "host": "your-host.hanacloud.ondemand.com",
        "port": "443",
        "user": "DBADMIN",
        "password": "YourPassword123!",
        "schema": "YOURSCHEMA",
        "encrypt": true,
        "sslValidateCertificate": true
      }
    }]
  }
}
```

**For on-premise HANA:**
```json
{
  "VCAP_SERVICES": {
    "hana": [{
      "credentials": {
        "host": "your-internal-server.com",
        "port": "30013",
        "user": "DBADMIN",
        "password": "YourPassword123!",
        "schema": "SYSTEM",
        "encrypt": false
      }
    }]
  }
}
```

### Method 4: Environment Variables

Set connection details via environment variables:

```bash
export HANA_HOST="your-host.hanacloud.ondemand.com"
export HANA_PORT="443"
export HANA_USER="DBADMIN"
export HANA_PASSWORD="YourPassword123!"
export HANA_SCHEMA="YOURSCHEMA"
export HANA_ENCRYPT="true"

npm run build
```

## IDE Configuration

### VS Code with Claude Dev Extension

Add the following to your Claude Dev MCP settings file:

**Location:** 
`C:\Users\<username>\AppData\Roaming\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`

**Configuration:**
```json
{
  "mcpServers": {
    "hana-cli": {
      "command": "node",
      "args": [
        "D:/projects/hana-developer-cli-tool-example/mcp-server/build/index.js"
      ],
      "env": {}
    }
  }
}
```

**Notes:**
- Replace the path with your actual project location
- Use forward slashes `/` even on Windows
- Connection credentials are read from `default-env.json`

### VS Code with Cline

Similar configuration, but the settings file location may differ. Check Cline documentation for your version.

## Verification and Testing

### Test Connection

Verify your connection is working:

```bash
hana-cli status
```

Expected output:
```
Connected to: hanacloud.ondemand.com:443
User: DBADMIN
Current Schema: YOURSCHEMA
Version: 2.0.0
```

### Common Connection Issues

#### Issue: "Connection refused"
- **Cause:** HANA instance not accessible or firewall blocking
- **Solution:** 
  1. Verify host address and port
  2. Check firewall rules
  3. Ensure HANA instance is running
  4. Test network connectivity: `ping your-host.com`

#### Issue: "Authentication failed"
- **Cause:** Invalid username or password
- **Solution:**
  1. Verify credentials in `default-env.json`
  2. Ensure user account exists and is active
  3. Check user privileges (needs SELECT, INSERT, UPDATE, DELETE)
  4. Try resetting password in SAP HANA or SAP BTP

#### Issue: "Unknown host"
- **Cause:** Invalid hostname or DNS resolution failure
- **Solution:**
  1. Verify hostname spelling
  2. Check DNS/network configuration
  3. Try IP address instead of hostname
  4. Check SAP BTP service instance name

#### Issue: "SSL certificate error"
- **Cause:** Certificate validation failure (usually for HANA Cloud)
- **Solution:**
  1. **Temporary:** Set `sslValidateCertificate: false` (development only)
  2. **Permanent:** Install proper SSL certificates
  3. Update Node.js to latest version
  4. Check system clock for correct time

#### Issue: "Schema not found"
- **Cause:** User doesn't have access to specified schema
- **Solution:**
  1. Verify schema name (case-sensitive)
  2. Check user privileges for schema
  3. Try without specifying schema (uses default)
  4. List available schemas: `hana-cli schemas`

### Debug Mode

Enable detailed diagnostics:

```bash
# Set debug environment variable
export DEBUG=hana-cli:*

# Run commands with debug output
hana-cli tables --debug
```

This outputs:
- Connection details
- Query statements
- Timing information
- Error stack traces

## Connection Parameters Reference

### Required Parameters
| Parameter | Description | Example |
|-----------|-------------|---------|
| `host` | Database server hostname or IP | `hanacloud.ondemand.com` |
| `port` | Database port number | `443` (HANA Cloud), `30013` (On-premise) |
| `user` | Database username | `DBADMIN` |
| `password` | Database password | `SecurePassword123!` |

### Optional Parameters
| Parameter | Description | Default | Example |
|-----------|-------------|---------|---------|
| `schema` | Default schema for queries | `SYSTEM` | `SALES` |
| `encrypt` | Enable SSL/TLS | `true` | `true` or `false` |
| `sslValidateCertificate` | Validate SSL certificates | `true` | `true` or `false` |
| `connections` | Max concurrent connections | `10` | `20` |
| `timeout` | Query timeout in seconds | `300` | `600` |

## Advanced Configuration

### Multiple Database Connections

For working with multiple HANA instances, create separate configuration files:

```bash
# SAP BTP environment
hana-cli serviceKey -i prod-instance -k prod-key --output prod-env.json

# Development environment  
hana-cli serviceKey -i dev-instance -k dev-key --output dev-env.json
```

Then switch between environments:
```bash
export DEFAULT_ENV_FILE="prod-env.json"
hana-cli status
```

### Proxy Configuration

If behind a corporate proxy:

```json
{
  "VCAP_SERVICES": {
    "hana": [{
      "credentials": {
        "host": "your-host.com",
        "port": "443",
        "user": "DBADMIN",
        "password": "password",
        "httpProxy": "http://proxy.company.com:8080",
        "httpsProxy": "https://proxy.company.com:8080"
      }
    }]
  }
}
```

### Connection Pooling

For high-concurrency scenarios:

```json
{
  "VCAP_SERVICES": {
    "hana": [{
      "credentials": {
        "host": "your-host.com",
        "connections": 50,
        "minConnections": 10,
        "maxConnections": 100
      }
    }]
  }
}
```

## Security Best Practices

### Credentials Management

**Never hardcode credentials in code:**

```bash
# ❌ Bad - hardcoded password
export HANA_PASSWORD="SecretPassword123!"

# ✅ Good - read from secure location
export HANA_PASSWORD=$(aws secretsmanager get-secret-value --secret-id hana-password)

# ✅ Good - use default-env.json (git-ignored)
cat default-env.json  # Contains credentials
echo "default-env.json" >> .gitignore
```

### File Permissions

Protect configuration files:

```bash
# Restrict access to default-env.json
chmod 600 default-env.json

# Verify it's not readable by others
ls -la default-env.json
# Should show: -rw------- (600 permissions)
```

### Git Configuration

Never commit credentials:

```bash
# Add to .gitignore
echo "default-env.json" >> .gitignore
echo "*.env" >> .gitignore
echo "secrets/" >> .gitignore

# Verify no credentials in history
git log --all -- default-env.json
```

### SSL/TLS Verification

Always enable in production:

```json
{
  "encrypt": true,
  "sslValidateCertificate": true
}
```

Only disable for development:

```json
{
  "encrypt": true,
  "sslValidateCertificate": false  // Development only!
}
```

## Troubleshooting Connection

### Connection Status Check

Complete diagnostic:

```bash
# 1. Test network connectivity
ping your-host.hanacloud.ondemand.com

# 2. Check configuration
cat default-env.json | grep -E "host|port|user"

# 3. Verify HANA CLI can read config
hana-cli status --debug

# 4. Test with explicit credentials
hana-cli status \
  --host your-host.com \
  --port 443 \
  --user DBADMIN \
  --password YourPassword \
  --debug
```

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `ECONNREFUSED` | Connection refused | Check IP/port, firewall |
| `ENOTFOUND` | DNS resolution failed | Verify hostname, check DNS |
| `ETIMEDOUT` | Connection timeout | Check network, increase timeout |
| `401 Unauthorized` | Invalid credentials | Check username/password |
| `403 Forbidden` | Insufficient permissions | Check user privileges |
| `DEPTH_ZERO_SELF_SIGNED_CERT` | SSL certificate issue | Use sslValidateCertificate: false |

See [Troubleshooting Guide](./troubleshooting.md) for more issues and solutions.

## Next Steps

1. **Verify Connection**
   ```bash
   hana-cli status
   ```

2. **Explore Database**
   ```bash
   hana-cli schemas
   hana-cli tables --schema <name>
   ```

3. **Start Using MCP Server**
   - Configure your IDE with the build/index.js path
   - Test with Claude Dev or your preferred client
   - Try the quick start commands

4. **Learn More**
   - [Features Overview](./features.md) - All available capabilities
   - [Discovery Tools](./discovery-tools.md) - Find the right commands
   - [Troubleshooting](./troubleshooting.md) - Common issues
