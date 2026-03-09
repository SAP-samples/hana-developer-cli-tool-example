# Supported Environments

HANA CLI works in diverse development environments.

## Local Development

### SAP HANA Express Edition

Perfect for local development:

```bash
# Connect to local HANA Express
export HANA_CLI_HOST=localhost
export HANA_CLI_PORT=30013
export HANA_CLI_USER=SYSTEM
export HANA_CLI_PASSWORD=password

hana-cli systemInfo
```

### VSCode Integration

1. Install [SAP Tools for VSCode](https://marketplace.visualstudio.com/items?itemName=SAPSE.vscode-hana)
2. Configure connection in VSCode settings
3. Use HANA CLI alongside other tools

### Remote HANA Server

Connect to any remote HANA instance:

```json
{
  "VCAP_SERVICES": {
    "hana": [{
      "credentials": {
        "host": "remote-hana.company.com",
        "port": 30013,
        "user": "DBUSER",
        "password": "password"
      }
    }]
  }
}
```

## Cloud Development

### SAP Business Application Studio

Built-in Node.js runtime - HANA CLI works out of the box:

```bash
# Install in BAS
npm install -g hana-cli

# Use immediately
hana-cli systemInfo
```

**Features:**

- Pre-configured with SAP tools
- Direct access to BTP services
- Integrated terminal

### Google Cloud Shell

Using Cloud Shell with HANA in Google Cloud:

```bash
# Cloud Shell comes with Node.js
npm install -g hana-cli

# Configure credentials
export HANA_CLI_HOST=your-hana-server
export HANA_CLI_USER=dbuser
export HANA_CLI_PASSWORD=password

hana-cli tables 
```

### AWS Cloud9

AWS Cloud9 IDE environment:

```bash
# Cloud9 includes Node.js
npm install -g hana-cli

# Can connect to HANA anywhere (same network, VPN, etc.)
hana-cli import -n data.csv -t TABLE
```

### GitHub Codespaces

Development in the cloud using GitHub Codespaces:

```bash
# Codespaces includes Node.js
npm install -g hana-cli

# Works with HANA across networks
hana-cli compareSchema -s SCHEMA1 -t SCHEMA2
```

## SAP Cloud Environments

### SAP BTP (Business Technology Platform)

Connect to HANA service on BTP:

```bash
# Credentials auto-discovered from VCAP_SERVICES
hana-cli systemInfo

# Works with any BTP HANA instance
hana-cli export -s SCHEMA -t TABLE -o data.csv
```

**Supported Services:**

- SAP HANA Cloud
- SAP HANA service for BTP
- SAP Data Lake
- SAP Business Data Cloud

### SAP HANA Cloud

Native cloud HANA:

```bash
# Connection details provided by SAP HANA Cloud
export HANA_CLI_HOST=xxxxxxxx.hanacloud.ondemand.com
export HANA_CLI_USER=DBADMIN

hana-cli dataProfile -s SCHEMA -t TABLE
```

### Cloud Foundry on SAP BTP

Deploy and use HANA CLI in Cloud Foundry applications:

**package.json for CF app:**

```json
{
  "name": "hana-data-processor",
  "version": "1.0.0",
  "dependencies": {
    "hana-cli": "latest",
    "express": "^4.18.0"
  },
  "scripts": {
    "start": "node server.js"
  }
}
```

**manifest.yml:**

```yaml
applications:
  - name: hana-data-processor
    memory: 256M
    buildpack: nodejs_buildpack
    services:
      - my-hana-service
    env:
      NODE_ENV: production
```

**Usage in app:**

```javascript
// VCAP_SERVICES automatically provides HANA credentials
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Run HANA CLI commands
const { stdout } = await execAsync('hana-cli export -s SCHEMA -t TABLE -o data.csv');
console.log(stdout);
```

**Deploy:**

```bash
# Login to Cloud Foundry
cf login -a https://api.cf.eu10.hana.ondemand.com

# Push application
cf push

# HANA CLI automatically discovers bound service credentials
```

## Development Containers

### Docker

Containerized development environment:

```dockerfile
FROM node:20

# Install HANA CLI
RUN npm install -g hana-cli

# Set working directory
WORKDIR /app

# Your commands
CMD ["hana-cli", "--help"]
```

Run:

```bash
docker run -e HANA_CLI_HOST=my-hana -e HANA_CLI_USER=user \
  my-hana-cli-image hana-cli systemInfo
```

### VS Code Dev Containers

`.devcontainer/devcontainer.json`:

```json
{
  "name": "HANA CLI Development",
  "image": "mcr.microsoft.com/devcontainers/javascript-node:20",
  "postCreateCommand": "npm install -g hana-cli",
  "forwardPorts": [3000],
  "remoteEnv": {
    "HANA_CLI_HOST": "your-hana-server"
  }
}
```

### Kubernetes

Deploy HANA CLI job in Kubernetes:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: hana-cli-import
spec:
  template:
    spec:
      containers:
      - name: hana-cli
        image: node:20
        command: ["npm", "install", "-g", "hana-cli"]
        env:
        - name: HANA_CLI_HOST
          value: "hana-service:30013"
        - name: HANA_CLI_USER
          valueFrom:
            secretKeyRef:
              name: hana-credentials
              key: username
      restartPolicy: Never
```

## CI/CD Pipelines

### GitHub Actions

`.github/workflows/data-sync.yml`:

```yaml
name: Data Sync

on: [push]

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '20'
      - run: npm install -g hana-cli
      - run: hana-cli dataSync --schema MYSCHEMA --table EMPLOYEES --sourceConnection source.json --targetConnection target.json
        env:
          HANA_CLI_HOST: ${{ secrets.HANA_CLI_HOST }}
          HANA_CLI_USER: ${{ secrets.HANA_CLI_USER }}
          HANA_CLI_PASSWORD: ${{ secrets.HANA_CLI_PASSWORD }}
```

### GitLab CI

`.gitlab-ci.yml`:

```yaml
import-data:
  image: node:20
  script:
    - npm install -g hana-cli
    - hana-cli import -n data.csv -t EMPLOYEES
  variables:
    HANA_CLI_HOST: $HANA_CLI_HOST
    HANA_CLI_USER: $HANA_CLI_USER
    HANA_CLI_PASSWORD: $HANA_CLI_PASSWORD
```

### Jenkins

```groovy
pipeline {
    agent any
    
    stages {
        stage('Setup') {
            steps {
                sh 'npm install -g hana-cli'
            }
        }
        stage('Export Data') {
            steps {
                withCredentials([string(credentialsId: 'hana-password', variable: 'PASS')]) {
                    sh 'hana-cli export -s SCHEMA -t TABLE -o backup.csv'
                }
            }
        }
    }
}
```

### Azure DevOps

`azure-pipelines.yml`:

```yaml
trigger:
  - main

pool:
  vmImage: 'ubuntu-latest'

variables:
  - group: hana-credentials  # Variable group with HANA_CLI_* variables

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '20.x'
    displayName: 'Install Node.js'

  - script: |
      npm install -g hana-cli
    displayName: 'Install HANA CLI'

  - script: |
      hana-cli compareSchema -s $(SOURCE_SCHEMA) -t $(TARGET_SCHEMA) -o diff-report.json
    displayName: 'Compare Schemas'
    env:
      HANA_CLI_HOST: $(HANA_CLI_HOST)
      HANA_CLI_USER: $(HANA_CLI_USER)
      HANA_CLI_PASSWORD: $(HANA_CLI_PASSWORD)

  - task: PublishBuildArtifacts@1
    inputs:
      pathToPublish: 'diff-report.json'
      artifactName: 'schema-diff'
    displayName: 'Publish Diff Report'
```

**Features:**

- Integration with Azure Key Vault for credentials
- Variable groups for environment-specific config
- Artifact publishing for reports and exports
- Matrix builds for multi-environment testing

## Operating Systems

### Windows

```bash
# Install globally
npm install -g hana-cli

# Use in PowerShell, CMD, or WSL
hana-cli systemInfo
```

**PowerShell Example:**

```powershell
# Set environment variables
$env:HANA_CLI_HOST = "hana-server.company.com"
$env:HANA_CLI_USER = "DBUSER"
$env:HANA_CLI_PASSWORD = "password"

# Run commands
hana-cli tables -s MYSCHEMA
```

### WSL (Windows Subsystem for Linux)

Run HANA CLI in a Linux environment on Windows:

```bash
# Install in WSL (Ubuntu, Debian, etc.)
sudo apt update
sudo apt install nodejs npm
npm install -g hana-cli

# Configure credentials
export HANA_CLI_HOST=hana-server.company.com
export HANA_CLI_USER=DBUSER
export HANA_CLI_PASSWORD=password

# Use normally
hana-cli systemInfo
hana-cli dataProfile -s SCHEMA -t TABLE
```

**Access Windows files from WSL:**

```bash
# Import data from Windows filesystem
hana-cli import -n /mnt/c/Users/YourName/data.csv -t TARGET_TABLE

# Export to Windows Downloads folder
hana-cli export -s SCHEMA -t TABLE -o /mnt/c/Users/YourName/Downloads/export.csv
```

**Benefits:**

- Native Linux tooling on Windows
- Better shell scripting capabilities
- Consistent with Linux/Mac workflows
- Access to both Windows and Linux filesystems

### macOS

```bash
# Install via npm or Homebrew
npm install -g hana-cli

# Use in Terminal
hana-cli systemInfo
```

### Linux

```bash
# Works on any Linux distribution
npm install -g hana-cli

# Use in shell/terminal
hana-cli systemInfo
```

## Network Scenarios

### Same Network

```bash
hana-cli systemInfo  # Direct connection works
```

### VPN/Tunneling

```bash
# Connect through VPN - works normally
hana-cli export -s SCHEMA -t TABLE -o data.csv
```

### SSH Tunneling

Secure connection through SSH tunnel when direct access is not available:

**Basic SSH Tunnel:**

```bash
# Create SSH tunnel to HANA server
ssh -L 30013:hana-server.internal:30013 user@bastion-host.com

# In another terminal, use tunneled connection
export HANA_CLI_HOST=localhost
export HANA_CLI_PORT=30013
export HANA_CLI_USER=DBUSER
export HANA_CLI_PASSWORD=password

hana-cli systemInfo
```

**Background SSH Tunnel:**

```bash
# Run tunnel in background with key-based auth
ssh -f -N -L 30013:hana-server.internal:30013 user@bastion-host.com -i ~/.ssh/id_rsa

# Use HANA CLI normally
hana-cli tables -s MYSCHEMA

# Close tunnel when done
pkill -f "ssh.*30013:hana-server"
```

**Multi-hop SSH Tunnel:**

```bash
# Jump through multiple hosts
ssh -J jump1.com,jump2.com -L 30013:hana-server:30013 final-host

# Or using ProxyJump in ~/.ssh/config:
# Host hana-tunnel
#   HostName final-host
#   ProxyJump jump1.com,jump2.com
#   LocalForward 30013 hana-server:30013

ssh hana-tunnel
```

**Automated Script:**

```bash
#!/bin/bash
# hana-cli-tunnel.sh

echo "Creating SSH tunnel to HANA..."
ssh -f -N -L 30013:hana-server:30013 user@bastion.com

export HANA_CLI_HOST=localhost
export HANA_CLI_PORT=30013

echo "Running HANA CLI command..."
hana-cli "$@"

echo "Closing tunnel..."
pkill -f "ssh.*30013:hana-server"
```

Usage: `./hana-cli-tunnel.sh systemInfo`

### Bastion Host / Jump Server

Direct access through bastion:

```bash
# SSH to bastion, then run HANA CLI there
ssh user@bastion-host.com

# On bastion host
npm install -g hana-cli
export HANA_CLI_HOST=hana-server.internal
hana-cli systemInfo
```

## Troubleshooting

### Connection Issues

#### Problem: Cannot connect to HANA server

```bash
# Test network connectivity first
ping hana-server.company.com

# Test port accessibility
nc -zv hana-server.company.com 30013
# or
telnet hana-server.company.com 30013
```

**Common causes:**

- Firewall blocking port 30013 (or your HANA port)
- VPN not connected
- Incorrect hostname/IP
- HANA instance not running

#### Problem: Authentication failures

```bash
# Verify credentials are set correctly
echo $HANA_CLI_HOST
echo $HANA_CLI_USER
echo $HANA_CLI_PASSWORD | wc -c  # Check password length without revealing it

# Try with explicit credentials
hana-cli systemInfo --host hana-server --user DBUSER --password "your-password"
```

**Common causes:**

- Expired password
- Account locked after failed login attempts
- Wrong user/password
- Missing VCAP_SERVICES configuration

### Environment-Specific Issues

#### WSL: Node.js not found

```bash
# Install Node.js in WSL
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### Docker: HANA_CLI_* environment variables not passed

```bash
# Use --env-file with docker run
echo "HANA_CLI_HOST=hana-server" > .env
echo "HANA_CLI_USER=DBUSER" >> .env
echo "HANA_CLI_PASSWORD=password" >> .env

docker run --env-file .env my-hana-cli-image hana-cli systemInfo
```

#### Cloud Foundry: VCAP_SERVICES not detected

```bash
# Check if service is bound
cf services
cf env your-app-name

# Bind HANA service if missing
cf bind-service your-app-name my-hana-service
cf restage your-app-name
```

#### CI/CD: npm install -g fails

```yaml
# Use npx instead of global install
steps:
  - run: npx hana-cli systemInfo

# Or use local install
steps:
  - run: npm install hana-cli
  - run: npx hana-cli systemInfo
```

### Certificate and SSL Issues

#### Problem: Self-signed certificate errors

```bash
# For testing only - accept self-signed certificates
export NODE_TLS_REJECT_UNAUTHORIZED=0
hana-cli systemInfo

# Better approach - add certificate to trust store
# Linux:
sudo cp hana-cert.crt /usr/local/share/ca-certificates/
sudo update-ca-certificates

# macOS:
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain hana-cert.crt
```

### Performance Issues

#### Problem: Slow connections or timeouts

```bash
# Increase connection timeout (if supported by underlying driver)
export HANA_CLI_TIMEOUT=60000  # 60 seconds

# For large data exports, use streaming
hana-cli export -s SCHEMA -t LARGE_TABLE -o data.csv --stream

# Test connection latency
time hana-cli systemInfo
```

### Debug Mode

```bash
# Enable verbose logging (if available)
export DEBUG=hana-cli:*
hana-cli systemInfo

# Or use Node.js debugging
NODE_DEBUG=* hana-cli systemInfo 2>&1 | grep -i error
```

### Getting Help

1. Check HANA CLI logs (if available)
2. Verify HANA server logs for connection attempts
3. Test with a simple command first: `hana-cli systemInfo`
4. Check GitHub issues: <https://github.com/SAP-samples/hana-developer-cli-tool-example/issues>
5. Review documentation: [Configuration Guide](./configuration.md)

## Compatibility

| Environment | Status | Notes |
| ----------- | ------ | ----- |
| Local Dev | ✅ Supported | Works great |
| BAS | ✅ Supported | Recommended |
| Cloud Shell | ✅ Supported | All platforms |
| BTP | ✅ Supported | Native integration |
| HANA Cloud | ✅ Supported | Recommended |
| Cloud Foundry | ✅ Supported | VCAP auto-discovery |
| Docker | ✅ Supported | Containerized |
| Kubernetes | ✅ Supported | Pod/job agent |
| Windows | ✅ Supported | Full support |
| WSL | ✅ Supported | Linux on Windows |
| macOS | ✅ Supported | Full support |
| Linux | ✅ Supported | Full support |
| Azure DevOps | ✅ Supported | Full CI/CD support |

## See Also

- [Installation Guide](./installation.md)
- [Configuration Guide](./configuration.md)
- [Quick Start](./quick-start.md)
