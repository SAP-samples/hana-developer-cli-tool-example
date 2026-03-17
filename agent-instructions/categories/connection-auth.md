# Connection & Auth

Connection setup, authentication helpers, and configuration tools

| Command | Aliases | Description |
|---------|---------|-------------|
| `config` | `cfg` | - |
| `connect` | `c`, `login` | Configure database connection |
| `connections` | `conn`, `c` | Manage saved connections |
| `connectViaServiceKey` | `key`, `servicekey`, `service-key` | Connect using service key |
| `copy2DefaultEnv` | `copyDefaultEnv`, `copyDefault-Env`, `copy2defaultenv`, `copydefaultenv`, `copydefault-env` | Copy settings to default environment |
| `copy2Env` | `copyEnv`, `copyenv`, `copy2env` | Copy settings to environment file |
| `copy2Secrets` | `secrets`, `make:secrets` | Copy settings to secrets file |
| `createJWT` | `cJWT`, `cjwt`, `cJwt` | Create JWT token |

## `config`

```bash
hana-cli config [action]
```

**Aliases:** `cfg`

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--edit` (`-e`) | boolean | `false` | edit |
| `--global` (`-g`) | boolean | `false` | global |
| `--path` (`-p`) | boolean | `false` | path |
| `--reset` | boolean | `false` | reset |

**Related:** `connect`, `connections`

---

## `connect`

```bash
hana-cli connect [user] [password]
```

**Aliases:** `c`, `login`
**Tags:** connect, connection, configuration
- Configure database connection

**Related:** `connections`, `connectViaServiceKey`, `config`

---

## `connections`

**Aliases:** `conn`, `c`
**Tags:** connection, configuration, management
- Manage saved connections

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--limit` (`-l`) | number | `100` | limit |
| `--user` (`-u`) | string | - | user |
| `--application` (`-a`) | string | - | applicationName |
| `--idle` (`-i`) | boolean | `false` | Include idle connections |

**Related:** `connect`, `connectViaServiceKey`, `status`

---

## `connectViaServiceKey`

```bash
hana-cli serviceKey [instance] [key]
```

**Aliases:** `key`, `servicekey`, `service-key`
**Tags:** connect, service-key, configuration
- Connect using service key

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--instance` | string | - | instance |
| `--key` | string | - | key |
| `--encrypt` | boolean | `true` | encrypt |
| `--validate` | boolean | `false` | validate |
| `--cf` | boolean | `true` | cf |
| `--save` | boolean | - | save |

**Related:** `connect`, `connections`, `config`

---

## `copy2DefaultEnv`

**Aliases:** `copyDefaultEnv`, `copyDefault-Env`, `copy2defaultenv`, `copydefaultenv`, `copydefault-env`
**Tags:** configuration, environment
- Copy settings to default environment

**Related:** `connect`, `config`, `copy2Env`

---

## `copy2Env`

**Aliases:** `copyEnv`, `copyenv`, `copy2env`
**Tags:** configuration, environment
- Copy settings to environment file

**Related:** `connect`, `config`, `copy2Secrets`

---

## `copy2Secrets`

**Aliases:** `secrets`, `make:secrets`
**Tags:** configuration, secrets
- Copy settings to secrets file

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--envJson` (`--from-file`) | string | `"default-env.json"` | envJson |
| `--secretsFolder` (`--to-folder`) | string | `"secrets"` | secretsFolder |
| `--filter` | string | - | secretsFilter |

**Related:** `connect`, `copy2Env`

---

## `createJWT`

```bash
hana-cli createJWT [name]
```

**Aliases:** `cJWT`, `cjwt`, `cJwt`
**Tags:** jwt, token, authentication
- Create JWT token

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--name` (`-c`) | string | - | jwtName |
| `--certificate` (`--cert`) | string | - | certificate |
| `--issuer` (`-i`) | string | - | issuer |

**Related:** `inspectJWT`, `connectViaServiceKey`

---
