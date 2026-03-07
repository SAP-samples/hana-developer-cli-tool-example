# Getting Started

Welcome to HANA CLI! This section guides you through installation, initial configuration, and your first commands. Whether you're working locally with SAP HANA Express, in SAP Business Application Studio, or with SAP HANA Cloud, you'll find everything you need to get productive quickly.

## Installation

HANA CLI is a command-line tool that works on Windows, macOS, and Linux. Installation is straightforward through npm or by building from source.

**Quick install via npm:**

```bash
npm install -g hana-cli
```

**Or build from source:**

```bash
git clone https://github.com/SAP-samples/hana-developer-cli-tool-example
cd hana-developer-cli-tool-example
npm install
npm link
```

**Requirements:**

- [Node.js 20.19.0 or later](https://nodejs.org/)
- Access to a SAP HANA database instance

[Full Installation Guide →](./installation.md)

## Quick Start

Get up and running in 5 minutes with basic commands:

```bash
# Verify installation
hana-cli --version

# Show available commands
hana-cli --help

# Check database connection
hana-cli systemInfo
```

This quick tutorial walks you through essential first steps including data import, schema comparison, and common operations.

[Quick Start Tutorial →](./quick-start.md)

## Configuration

Before running commands, configure your database credentials. The recommended approach is to create a `default-env.json` file in your project directory:

```json
{
  "VCAP_SERVICES": {
    "hana": [{
      "credentials": {
        "host": "your-hana-server.com",
        "port": 30013,
        "user": "DBUSER",
        "password": "****"
      }
    }]
  }
}
```

This file can be created manually or via the `hana-cli connect` command. Other options include environment variables and command-line arguments.

[Configuration Guide →](./configuration.md)

## Supported Environments

HANA CLI runs on any system with Node.js, from your local machine to cloud environments:

- **Local Development**: VSCode, SAP HANA Express, Remote HANA servers
- **Cloud IDEs**: SAP Business Application Studio, Google Cloud Shell, AWS Cloud9, GitHub Codespaces
- **Services**: SAP BTP HANA, SAP HANA Cloud

[Environments Guide →](./environments.md)

## See Also

- [Command Reference](/02-commands/) - All 170+ commands
- [Features & Guides](/03-features/)
- [API Reference](/04-api-reference/)
- [Troubleshooting](../troubleshooting.md)
