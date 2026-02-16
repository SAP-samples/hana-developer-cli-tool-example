# SAP BTP Integration

Integration with SAP Business Technology Platform for cloud database management.

## Overview

HANA CLI includes commands to manage SAP HANA on SAP BTP and SAP Business Technology Platform resources.

## BTP CLI Requirement

All BTP-related functionality requires the [SAP BTP Command Line Interface](https://help.sap.com/docs/btp/sap-business-technology-platform/btp-cli-command-reference) to be installed.

### Installation

**Linux / macOS:**

```bash
# Use provided script
./install-btp.sh

# Or manual
curl -sL https://github.com/SAP-samples/btp-cli-Linux/releases/latest/download/btp -o ~/btp
chmod +x ~/btp
sudo mv ~/btp /usr/local/bin/
btp --version
```

**Windows:**

Download from [GitHub](https://github.com/SAP-samples/btp-cli-install) and run installer.

## BTP Commands

### Global Account Management

```bash
# List global accounts
hana-cli globalAccounts

# List directories in account
hana-cli directories

# List subaccounts
hana-cli subaccounts
```

### HANA Service Management

```bash
# List HANA service instances
hana-cli hanaServiceInstances

# Get specific instance details
hana-cli hanaServiceInstances -i INSTANCE_ID

# Create new HANA instance
hana-cli createHANAService --name my-hana --plan standard

# Delete HANA instance
hana-cli deleteHANAService --name my-hana
```

### Entitlements & Quotas

```bash
# Check entitlements
hana-cli entitlements

# Request entitlements
hana-cli requestEntitlement --service hana --plan standard --quantity 1

# Assign entitlements
hana-cli assignEntitlement --subaccount SUB_ID --plan standard
```

## Integration Workflows

### Connect to BTP HANA Service

1. **List available services:**
   ```bash
   hana-cli hanaServiceInstances
   ```

2. **Get connection details:**
   ```bash
   hana-cli getServiceBinding --service-instance MY_HANA
   ```

3. **Save credentials locally:**
   ```bash
   hana-cli connect -d <host> -u <user> -p <password> -s
   ```

4. **Use HANA CLI normally:**
   ```bash
   hana-cli tables
   ```

### Deploy with HANA on BTP

1. **Create new HANA service:**
   ```bash
   hana-cli createHANAService --name prod-db --plan standard
   ```

2. **Wait for provisioning:**
   ```bash
   hana-cli hanaServiceInstances -i prod-db
   ```

3. **Get connection info:**
   ```bash
   hana-cli getServiceBinding --service-instance prod-db
   ```

4. **Use in application:**
   - Connection string stored in `VCAP_SERVICES`
   - HANA CLI auto-detects for local development
   - App uses same `default-env.json`

## See Also

- [Installation Guide](../01-getting-started/installation.md)
- [Configuration](../01-getting-started/configuration.md)
- [SAP BTP Documentation](https://help.sap.com/docs/btp)
- [SAP HANA Cloud Documentation](https://help.sap.com/docs/hana-cloud)
