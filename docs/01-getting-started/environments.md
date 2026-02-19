# Supported Environments

HANA CLI works in diverse development environments.

## Local Development

### SAP HANA Express Edition

Perfect for local development:

```bash
# Connect to local HANA Express
export HANA_HOST=localhost
export HANA_PORT=30013
export HANA_USER=SYSTEM
export HANA_PASSWORD=password

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
export HANA_HOST=your-hana-server
export HANA_USER=dbuser
export HANA_PASSWORD=password

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
hana-cli compareSchema -s SCHEMA1 -s SCHEMA2
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
export HANA_HOST=xxxxxxxx.hanacloud.ondemand.com
export HANA_USER=DBADMIN

hana-cli dataProfile -s SCHEMA -t TABLE
```

## Development Containers

### Docker

Containerized development environment:

```dockerfile
FROM node:24

# Install HANA CLI
RUN npm install -g hana-cli

# Set working directory
WORKDIR /app

# Your commands
CMD ["hana-cli", "--help"]
```

Run:

```bash
docker run -e HANA_HOST=my-hana -e HANA_USER=user \
  my-hana-cli-image hana-cli systemInfo
```

### VS Code Dev Containers

`.devcontainer/devcontainer.json`:

```json
{
  "name": "HANA CLI Development",
  "image": "mcr.microsoft.com/devcontainers/javascript-node:16",
  "postCreateCommand": "npm install -g hana-cli",
  "forwardPorts": [3000],
  "remoteEnv": {
    "HANA_HOST": "your-hana-server"
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
        image: node:24
        command: ["npm", "install", "-g", "hana-cli"]
        env:
        - name: HANA_HOST
          value: "hana-service:30013"
        - name: HANA_USER
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
          node-version: '24'
      - run: npm install -g hana-cli
      - run: hana-cli dataSync -s1 DEV -t1 TABLE -s2 PROD -t2 TABLE
        env:
          HANA_HOST: ${{ secrets.HANA_HOST }}
          HANA_USER: ${{ secrets.HANA_USER }}
          HANA_PASSWORD: ${{ secrets.HANA_PASSWORD }}
```

### GitLab CI

`.gitlab-ci.yml`:

```yaml
import-data:
  image: node:24
  script:
    - npm install -g hana-cli
    - hana-cli import -n data.csv -t EMPLOYEES
  variables:
    HANA_HOST: $HANA_HOST
    HANA_USER: $HANA_USER
    HANA_PASSWORD: $HANA_PASSWORD
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

## Operating Systems

### Windows

```bash
# Install globally
npm install -g hana-cli

# Use in PowerShell, CMD, or WSL
hana-cli systemInfo
```

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

### Bastion Host / Jump Server

```bash
# SSH tunnel through bastion to HANA
# Then use HANA CLI with forwarded port
export HANA_HOST=localhost
export HANA_PORT=3306  # tunneled port
hana-cli systemInfo
```

## Compatibility

| Environment | Status | Notes |
| ----------- | ------ | ----- |
| Local Dev | ✅ Supported | Works great |
| BAS | ✅ Supported | Recommended |
| Cloud Shell | ✅ Supported | All platforms |
| BTP | ✅ Supported | Native integration |
| HANA Cloud | ✅ Supported | Recommended |
| Docker | ✅ Supported | Containerized |
| Kubernetes | ✅ Supported | Pod/job agent |
| Windows | ✅ Supported | Full support |
| macOS | ✅ Supported | Full support |
| Linux | ✅ Supported | Full support |

## See Also

- [Installation Guide](./installation.md)
- [Configuration Guide](./configuration.md)
- [Quick Start](./quick-start.md)
