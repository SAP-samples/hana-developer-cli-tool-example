# Configuration Guide

Configure HANA CLI for your development environment.

## Connection Configuration

:::info Recommended for CAP projects
If you are working in a SAP CAP project, use the CDS bind approach first. It is the most secure option because credentials are resolved dynamically from your Cloud Foundry or Kubernetes environment instead of being stored locally.
:::

### Method 1: CAP CDS bind (Recommended)

When a `.cdsrc-private.json` file exists (created by `cds bind`), hana-cli automatically detects it in the current directory or parent directories and reuses those credentials.

```bash
# From your CAP project root
cds bind --to <service-instance-name>

# Run any hana-cli command after binding
hana-cli alerts
```

If you already have a `.cdsrc-private.json` file, you can skip `cds bind` and just run hana-cli commands from within the project directory.

For setup details, see [Installation Guide](./installation.md#cap-cds-bindings-recommended-for-cap-projects).

### Method 2: default-env.json

Create a `default-env.json` file in your working directory manually or via `hana-cli connect` command.

```json
{
  "VCAP_SERVICES": {
    "hana": [{
      "credentials": {
        "host": "hana.example.com",
        "port": 30013,
        "user": "DBADMIN",
        "password": "YourPassword123!",
        "database": "HDB"
      }
    }]
  }
}
```

**Key Parameters:**

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `host` | string | Yes | HANA server hostname or IP |
| `port` | number | Yes | HANA service port (usually 30013) |
| `user` | string | Yes | Database username |
| `password` | string | Yes | Database password |
| `database` | string | No | Database name (default: HDB) |

### Method 3: Environment Variables

```bash
export HANA_CLI_HOST=your-hana-server.com
export HANA_CLI_PORT=30013
export HANA_CLI_USER=DBADMIN
export HANA_CLI_PASSWORD=yourpassword
export HANA_CLI_DATABASE=HDB
```

### Method 4: Command Line Arguments

Pass connection details with each command:

```bash
hana-cli systemInfo \
  --host hana.example.com \
  --port 30013 \
  --user DBADMIN \
  --password password
```

## Named Profiles

Use named profiles when you want multiple connection presets stored in a configuration file. These are not CDS bindings; they are explicit profile entries you define under `profiles` in your config.

```bash
# Use a specific named profile from your config
hana-cli tables -s SCHEMA --profile production
```

## Admin Credentials

For admin operations, use separate credentials:

Create `default-env-admin.json` manually or via `hana-cli connect` command.

```json
{
  "VCAP_SERVICES": {
    "hana": [{
      "credentials": {
        "host": "hana.example.com",
        "port": 30013,
        "user": "DBADMIN",
        "password": "AdminPassword123!"
      }
    }]
  }
}
```

Use with commands:

```bash
hana-cli schemaClone --sourceSchema SOURCE --targetSchema TARGET --admin
```

## Connection Options

### SSL/TLS

```json
{
  "VCAP_SERVICES": {
    "hana": [{
      "credentials": {
        "host": "hana.example.com",
        "port": 30013,
        "user": "DBUSER",
        "password": "password",
        "encrypt": true,
        "sslTrustStore": "/path/to/truststore.pem",
        "sslValidateCertificate": true
      }
    }]
  }
}
```

### Connection Pooling

```bash
# Set pool size
export HANA_CONNECTION_POOL_SIZE=10

# Connection timeout (ms)
export HANA_CONNECTION_TIMEOUT=30000
```

## Proxy Configuration

For connections through proxy:

```bash
export http_proxy=http://proxy.company.com:8080
export https_proxy=https://proxy.company.com:8080
export no_proxy=localhost,127.0.0.1
```

Or in `default-env.json`:

```json
{
  "VCAP_SERVICES": {
    "hana": [{
      "credentials": {
        "host": "hana.example.com",
        "port": 30013,
        "user": "DBUSER",
        "password": "password",
        "proxy": "http://proxy.company.com:8080"
      }
    }]
  }
}
```

## Logging Configuration

### Log Level

```bash
# Available levels: error, warn, info, debug, trace
export HANA_LOG_LEVEL=debug

# Or in command
hana-cli import -n data.csv -t TABLE --debug
```

### Log Output

```bash
# Log to file
export HANA_LOG_FILE=/path/to/hana-cli.log

# JSON logging
export HANA_LOG_FORMAT=json
```

## Profile Configuration

Create a `.hana-cli-config` or `hana-cli.config.js` file to set defaults for all commands.

This configuration file is **automatically loaded** at startup and overrides built-in defaults for connection settings, output format, logging, and more.

**Configuration file locations (searched in order):**

1. Current working directory (project-specific): `.hana-cli-config` or `hana-cli.config.js`
2. User home directory (global): `~/.hana-cli-config` or `~/hana-cli.config.js`

The first configuration file found is used. Project-level config takes priority over global user config.

### JSON Configuration (.hana-cli-config)

```json
{
  "defaultSchema": "MYSCHEMA",
  "defaultProfile": "development",
  "outputFormat": "json",
  "language": "en",
  "logLevel": "info",
  "timeout": 30000,
  "admin": false,
  "debug": false,
  "disableVerbose": false
}
```

### JavaScript Configuration (hana-cli.config.js)

```javascript
module.exports = {
  defaultSchema: process.env.HANA_SCHEMA || 'MYSCHEMA',
  defaultProfile: 'development',
  outputFormat: 'json',
  language: 'en',
  logLevel: 'info',
  timeout: 30000,
  profiles: {
    development: {
      host: 'localhost',
      port: 30013,
      user: 'DBADMIN',
      password: 'password'
    },
    production: {
      host: 'prod-hana.company.com',
      port: 30013,
      user: 'prod_user',
      password: process.env.HANA_CLI_PASSWORD
    }
  }
};
```

### Configuration Priority

Configuration priority (highest to lowest):

1. Command-line arguments (override everything)
2. Project-level config (`.hana-cli-config` or `hana-cli.config.js` in current directory)
3. User global config (`~/.hana-cli-config` or `~/hana-cli.config.js`)
4. Built-in defaults

Example:

```bash
# Config file sets defaultSchema to MYSCHEMA
# But this command uses a different schema
hana-cli tables -s OTHERSCHEMA
```

## Viewing and Managing Configuration

Use the `hana-cli config` command to view and manage configuration files:

```bash
# Display current configuration values
hana-cli config

# Show configuration file paths
hana-cli config --path

# Open config in default editor (creates template if not exists)
hana-cli config -e

# Reset configuration (delete config file)
hana-cli config --reset

# Use global config instead of project config
hana-cli config --global
```

### Config Command Options

| Option | Short | Description |
| ------ | ----- | ----------- |
| `--edit` | `-e` | Open configuration file in your default editor |
| `--global` | `-g` | Use global config (home directory) instead of project config |
| `--path` | `-p` | Show configuration file paths |
| `--reset` | | Remove configuration file and reset to defaults |

The `config` command automatically:

- Displays both project-level and global configuration if they exist
- Shows helpful hints for creating or editing config
- Creates a configuration template when you open a file that doesn't exist yet

### Supported Configuration Options

| Option | Type | Description |
| ------ | ---- | ----------- |
| `defaultSchema` | string | Default schema for commands (e.g., `tables -s SCHEMA`) |
| `defaultProfile` | string | Default named profile for commands (e.g., `tables --profile production`) |
| `outputFormat` | string | Default output format (e.g., `json`, `csv`, `table`) |
| `language` | string | UI language (e.g., `en`, `de`, `fr`) |
| `logLevel` | string | Logging level (`error`, `warn`, `info`, `debug`, `trace`) |
| `timeout` | number | Command timeout in milliseconds |
| `admin` | boolean | Default for admin operations |
| `debug` | boolean | Enable debug output by default |
| `disableVerbose` | boolean | Disable verbose output by default |
| `conn` | string | Default connection file path |
| `profiles` | object | Named connection profiles (for `--profile` option) |

## Environment-Specific Configurations

### Development

```bash
# Enable debug output
export HANA_LOG_LEVEL=debug

# Use local HANA instance
export HANA_CLI_HOST=localhost
export HANA_CLI_PORT=30013
```

### Production

```bash
# Set production profile
export NODE_ENV=production

# Production HANA instance
export HANA_CLI_HOST=prod-hana.company.com
export HANA_CLI_USER=prod_user

# Enable encryption
export HANA_ENCRYPT=true
```

### Testing

```bash
# Use test database
export HANA_CLI_DATABASE=TEST_HDB

# Test credentials
export HANA_CLI_USER=test_user
export HANA_CLI_PASSWORD=test_password
```

## Troubleshooting Configuration

### Cannot Connect

1. Verify host and port: `ping hana.example.com`
2. Check credentials are correct
3. Ensure database user has required privileges
4. Check firewall/network access

### SSL Certificate Issues

SSL validation is disabled by default in hana-cli. To enable it with a trusted certificate:

```bash
# Connect with a trust store
hana-cli connect -n host:port -u USER -p PASSWORD --trustStore /path/to/cert.pem
```

Or configure in `default-env.json`:

```json
{
  "VCAP_SERVICES": {
    "hana": [{
      "credentials": {
        "host": "hana.example.com",
        "port": 30015,
        "sslTrustStore": "/path/to/cert.pem",
        "sslValidateCertificate": true
      }
    }]
  }
}
```

### Proxy Issues

```bash
# Test proxy connection
curl -x http://proxy.company.com:8080 https://www.google.com

# Enable proxy debug
export http_proxy_debug=true
```

## See Also

- [Installation Guide](./installation.md)
- [Quick Start](./quick-start.md)
- [Environments](./environments.md)
