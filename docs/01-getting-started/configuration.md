# Configuration Guide

Configure HANA CLI for your development environment.

## Connection Configuration

### Method 1: default-env.json (Recommended)

Create a `default-env.json` file in your working directory:

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

### Method 2: Environment Variables

```bash
export HANA_HOST=your-hana-server.com
export HANA_PORT=30013
export HANA_USER=DBADMIN
export HANA_PASSWORD=yourpassword
export HANA_DATABASE=HDB
```

### Method 3: Command Line Arguments

Pass connection details with each command:

```bash
hana-cli dbInfo \
  --host hana.example.com \
  --port 30013 \
  --user DBADMIN \
  --password password
```

## CDS Profiles

Use CDS profiles for different environments:

```bash
# Use specific profile
hana-cli tables -s SCHEMA --profile production

# List available profiles
hana-cli profiles list
```

## Admin Credentials

For admin operations, use separate credentials:

Create `default-env-admin.json`:

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
```

Use with commands:

```bash
hana-cli schemaClone -s SOURCE -t TARGET --admin
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
        "sslCertificate": "/path/to/cert.pem"
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

Create `.hana-cli-config` or `hana-cli.config.js`:

```json
{
  "defaultSchema": "MYSCHEMA",
  "defaultProfile": "development",
  "outputFormat": "json",
  "language": "en",
  "logLevel": "info",
  "timeout": 30000
}
```

Or as JavaScript:

```javascript
module.exports = {
  defaultSchema: process.env.HANA_SCHEMA || 'MYSCHEMA',
  defaultProfile: 'development',
  outputFormat: 'json',
  language: 'en',
  timeout: 30000,
  profiles: {
    development: {
      host: 'localhost',
      port: 30013
    },
    production: {
      host: 'prod-hana.company.com',
      port: 30013
    }
  }
};
```

## Environment-Specific Configurations

### Development

```bash
# Enable debug output
export HANA_LOG_LEVEL=debug

# Use local HANA instance
export HANA_HOST=localhost
export HANA_PORT=30013
```

### Production

```bash
# Set production profile
export NODE_ENV=production

# Production HANA instance
export HANA_HOST=prod-hana.company.com
export HANA_USER=prod_user

# Enable encryption
export HANA_ENCRYPT=true
```

### Testing

```bash
# Use test database
export HANA_DATABASE=TEST_HDB

# Test credentials
export HANA_USER=test_user
export HANA_PASSWORD=test_password
```

## Troubleshooting Configuration

### Cannot Connect

1. Verify host and port: `ping hana.example.com`
2. Check credentials are correct
3. Ensure database user has required privileges
4. Check firewall/network access

### SSL Certificate Issues

```bash
# Allow self-signed certificates (not recommended for production)
export HANA_SSL_VERIFY=false

# Or use certificate file
export HANA_SSL_CERT=/path/to/cert.pem
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
