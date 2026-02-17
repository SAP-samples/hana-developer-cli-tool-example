# Getting Started

Welcome! This section covers everything you need to get started with the SAP HANA Developer CLI.

## Installation

HANA CLI is available through npm for quick installation:

```bash
npm install -g hana-cli
```

Or build from source:

```bash
git clone https://github.com/SAP-samples/hana-developer-cli-tool-example
cd hana-developer-cli-tool-example
npm install
npm link
```

### Requirements

- [Node.js 20.19.0 or later](https://nodejs.org/)
- Access to a SAP HANA database

[Full Installation Guide →](./installation.md)

## Quick Start

Get up and running in 5 minutes:

```bash
# Verify installation
hana-cli --version

# Show available commands
hana-cli --help

# Connect to your HANA instance
hana-cli connect --host your-hana-server.com --port 30013 --user DBUSER --password ****
```

[Quick Start Tutorial →](./quick-start.md)

## Configuration

Set up connection details via `default-env.json`:

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

[Configuration Guide →](./configuration.md)

## Supported Environments

- **Local Development**: VSCode with SAP HANA Express
- **Cloud**: SAP Business Application Studio, Google Cloud Shell, AWS Cloud9
- **Services**: SAP BTP HANA, SAP HANA Cloud

[Environments Guide →](./environments.md)

## Next Steps

- [Explore Commands](/02-commands/)
- [Learn Features](/03-features/)
- [View API Reference](/04-api-reference/)