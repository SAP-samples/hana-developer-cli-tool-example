# HDI Management

Manage HDI containers, groups, and deployment operations

| Command | Aliases | Description |
|---------|---------|-------------|
| `activateHDI` | `ahdi`, `ah` | Activate HDI deployment |
| `adminHDI` | `adHDI`, `adhdi` | Administer HDI |
| `adminHDIGroup` | `adHDIG`, `adhdig` | Manage HDI groups |
| `containers` | `cont`, `listContainers`, `listcontainers` | List HDI containers |
| `containersUI` | `containersui`, `contUI`, `listContainersUI`, `listcontainersui` | - |
| `createContainer` | `cc`, `cCont` | Create new HDI container |
| `createContainerUsers` | `ccu`, `cContU` | - |
| `dropContainer` | `dc`, `dropC` | Drop HDI container |

## `activateHDI`

```bash
hana-cli activateHDI [tenant]
```

**Aliases:** `ahdi`, `ah`
**Tags:** hdi, deployment, activation
- Activate HDI deployment
- Deploy HDI changes

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--tenant` (`-t`) | string | - | tenant |

**Related:** `adminHDI`, `adminHDIGroup`, `cds`

---

## `adminHDI`

```bash
hana-cli adminHDI [user] [password]
```

**Aliases:** `adHDI`, `adhdi`
**Tags:** hdi, administration, management
- Administer HDI
- Manage HDI settings

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--user` (`-u`) | string | - | user |
| `--password` (`-p`) | string | - | password |
| `--create` (`-c`) | boolean | `true` | createUser |

**Related:** `adminHDIGroup`, `hanaCloudHDIInstances`

---

## `adminHDIGroup`

```bash
hana-cli adminHDIGroup [user] [group]
```

**Aliases:** `adHDIG`, `adhdig`
**Tags:** hdi, group, administration
- Manage HDI groups
- Administer HDI group

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--user` (`-u`, `--User`) | string | - | user |
| `--group` (`-g`) | string | `'SYS_XS_HANA_BROKER'` | group |

**Related:** `adminHDI`, `activateHDI`

---

## `containers`

```bash
hana-cli containers [containerGroup] [container]
```

**Aliases:** `cont`, `listContainers`, `listcontainers`
**Tags:** container, hdi, deployment
- List HDI containers
- Manage containers

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--container` (`-c`) | string | `"*"` | container |
| `--containerGroup` (`-g`, `--group`, `--containergroup`) | string | `'*'` | containerGroup |
| `--limit` (`-l`) | number | `200` | limit |

**Related:** `createContainer`, `dropContainer`, `containersUI`

---

## `containersUI`

```bash
hana-cli containersUI [containerGroup] [container]
```

**Aliases:** `containersui`, `contUI`, `listContainersUI`, `listcontainersui`

**Related:** `containers`

---

## `createContainer`

```bash
hana-cli createContainer [container] [group]
```

**Aliases:** `cc`, `cCont`
**Tags:** container, create, hdi
- Create new HDI container

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--container` (`-c`) | string | - | container |
| `--group` (`-g`) | string | `''` | group |
| `--save` (`-s`) | boolean | `true` | saveHDI |
| `--encrypt` (`-e`, `--ssl`) | boolean | `false` | encrypt |

**Related:** `dropContainer`, `containers`, `createContainerUsers`

---

## `createContainerUsers`

```bash
hana-cli createContainerUsers [container]
```

**Aliases:** `ccu`, `cContU`

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--container` (`-c`) | string | - | container |
| `--save` (`-s`) | boolean | `true` | saveHDI |
| `--encrypt` (`-e`, `--ssl`) | boolean | `false` | encrypt |

**Related:** `createContainer`, `users`

---

## `dropContainer`

```bash
hana-cli dropContainer [container] [group]
```

**Aliases:** `dc`, `dropC`
**Tags:** container, drop, hdi
- Drop HDI container

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--container` (`-c`) | string | - | container |
| `--group` (`-g`) | string | `''` | group |

**Related:** `createContainer`, `containers`

---
