# Installation Guide

## Prerequisites

- **Node.js**: Version 14.x or 16.x
  - Download from [nodejs.org](https://nodejs.org/en/download/)
  - Verify: `node --version`

- **SAP HANA Database**: One of these options
  - Local SAP HANA Express instance
  - Remote SAP HANA server
  - SAP BTP HANA service
  - SAP HANA Cloud

- **Database Connectivity**
  - Network access to HANA server
  - Valid database user credentials

## Installation Methods

### Method 1: NPM Package (Recommended)

The quickest way to install HANA CLI globally:

```bash
npm install -g hana-cli
```

Verify the installation:

```bash
hana-cli --version
```

### Method 2: From Source

Clone and build from the repository:

```bash
# Clone the repository
git clone https://github.com/SAP-samples/hana-developer-cli-tool-example.git
cd hana-developer-cli-tool-example

# Install dependencies
npm install

# Link globally
npm link
```

### Method 3: Local Development

For development or local use:

```bash
# In project directory
npm install

# Run with npx or use directly
node bin/hana-cli
```

## Configuration

### 1. Create connection file (`default-env.json`)

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

### 2. Environment Variables (Alternative)

Set these environment variables:

```bash
export HANA_HOST=your-hana-server.com
export HANA_PORT=30013
export HANA_USER=DBUSER
export HANA_PASSWORD=yourpassword
```

### 3. Cloud Environments

For SAP BTP or SAP HANA Cloud, the credentials are typically auto-configured.

## Verify Installation

Test your setup:

```bash
# Show version
hana-cli --version

# List all commands
hana-cli --help

# Test database connection
hana-cli alerts -h
```

## Troubleshooting

### Connection Failed

```
Error: Cannot connect to database
```

**Solution**: Verify your `default-env.json` file contains correct host, port, and credentials.

### Command Not Found

```
hana-cli: command not found
```

**Solution**: Ensure global installation succeeded. Run:

```bash
npm install -g hana-cli --force
```

### Permission Issues

If you get permission errors on Linux/Mac:

```bash
# Try with sudo (not recommended, but can work)
sudo npm install -g hana-cli

# Or fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

## Next Steps

- [Quick Start Guide](./quick-start.md)
- [Command Reference](/02-commands/)
- [Configuration Details](./configuration.md)