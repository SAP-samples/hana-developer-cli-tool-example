# SAP BTP Integration

Integration with SAP Business Technology Platform for cloud database management.

## Overview

HANA CLI includes commands to manage SAP HANA on SAP BTP and SAP Business Technology Platform resources.

## BTP CLI Requirement

All BTP-related functionality requires the [SAP BTP Command Line Interface](https://help.sap.com/docs/btp/btp-cli-command-reference/btp-cli-command-reference?locale=en-US&version=LATEST) to be installed.

### Installation

**Linux / macOS:**

```bash
# Use provided script
./install-btp.sh

# Or manual
# Download the btp CLI from https://tools.hana.ondemand.com/#cloud-btpcli
# Extract the archive and move the btp binary into your PATH
chmod +x ./btp
sudo mv ./btp /usr/local/bin/
btp --version
```

**Windows:**

Download from [SAP Development Tools](https://tools.hana.ondemand.com/#cloud-btpcli) and run the installer.

## BTP Commands

### BTP Account Management

```bash
# Set BTP target (directory and subaccount) interactively
hana-cli btp

# Set BTP target with specific subaccount
hana-cli btp --subaccount mySubaccount

# Display BTP configuration (global account, directory, subaccount)
hana-cli btpInfo

# Display BTP configuration as JSON
hana-cli btpInfo --output json

# List BTP subscriptions
hana-cli sub
```

### HANA Cloud Instance Management

```bash
# List HANA Cloud instances
hana-cli hc

# Get specific instance details
hana-cli hc --name my-hana

# Start a HANA Cloud instance
hana-cli hcStart --name my-hana

# Stop a HANA Cloud instance
hana-cli hcStop --name my-hana

# List HDI service instances
hana-cli hdi
```

## Integration Workflows

### Connect to BTP HANA Cloud Service

1. **Set BTP target:**

   ```bash
   hana-cli btp
   ```

2. **List available HANA Cloud instances:**

   ```bash
   hana-cli hc
   ```

3. **Connect to instance:**

   ```bash
   hana-cli connect -d <host> -u <user> -p <password> -s
   ```

4. **Use HANA CLI normally:**

   ```bash
   hana-cli tables
   ```

### Manage HANA Cloud Instances

1. **List your HANA Cloud instances:**

   ```bash
   hana-cli hc
   ```

2. **Start an instance:**

   ```bash
   hana-cli hcStart --name my-hana
   ```

3. **Stop an instance:**

   ```bash
   hana-cli hcStop --name my-hana
   ```

4. **Check instance status:**

   ```bash
   hana-cli hc --name my-hana
   ```

## See Also

- [Installation Guide](../01-getting-started/installation.md)
- [Configuration](../01-getting-started/configuration.md)
- [SAP BTP Documentation](https://help.sap.com/docs/btp)
- [SAP HANA Cloud Documentation](https://help.sap.com/docs/hana-cloud)
