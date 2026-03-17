# Security

User, role, privilege, and security audit management

| Command | Aliases | Description |
|---------|---------|-------------|
| `auditLog` | `audit`, `auditlog` | View audit logs |
| `certificates` | `cert`, `certs` | Manage certificates |
| `certificatesUI` | `certUI`, `certsUI`, `certificatesui`, `listCertificatesUI`, `listcertificatesui` | - |
| `createGroup` | `cg`, `cGrp` | Create HDI group |
| `createXSAAdmin` | `cXSAAdmin`, `cXSAA`, `cxsaadmin`, `cxsaa` | Create XSA admin user |
| `dropGroup` | `dg`, `dropG` | Drop HDI group |
| `encryptionStatus` | `encryption`, `encrypt` | Check encryption status |
| `inspectUser` | `iu`, `user`, `insUser`, `inspectuser` | Inspect user details and privileges |
| `pwdPolicy` | `pwdpolicy`, `passpolicies` | Manage password policies |
| `roles` | `r`, `listRoles`, `listroles` | List database roles |
| `securityScan` | `secscan`, `scan` | Run security scan |
| `users` | `u`, `listUsers`, `listusers` | List database users |

## `auditLog`

**Aliases:** `audit`, `auditlog`
**Tags:** audit, logging, compliance
- View audit logs
- Track changes

**Related:** `systemInfo`, `securityScan`

---

## `certificates`

**Aliases:** `cert`, `certs`
**Tags:** certificate, ssl, encryption
- Manage certificates
- Check SSL certificates

**Related:** `certificatesUI`, `encryptionStatus`

---

## `certificatesUI`

**Aliases:** `certUI`, `certsUI`, `certificatesui`, `listCertificatesUI`, `listcertificatesui`

**Related:** `certificates`

---

## `createGroup`

```bash
hana-cli createGroup [group]
```

**Aliases:** `cg`, `cGrp`
**Tags:** group, create, hdi
- Create HDI group

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--group` (`-g`) | string | - | group |

**Related:** `createXSAAdmin`, `users`, `roles`

---

## `createXSAAdmin`

```bash
hana-cli createXSAAdmin [user] [password]
```

**Aliases:** `cXSAAdmin`, `cXSAA`, `cxsaadmin`, `cxsaa`
**Tags:** xsa, admin, user
- Create XSA admin user

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--user` (`-u`) | string | - | user |
| `--password` (`-p`) | string | - | password |

**Related:** `users`, `roles`, `createGroup`

---

## `dropGroup`

```bash
hana-cli dropGroup [group]
```

**Aliases:** `dg`, `dropG`
**Tags:** group, drop, hdi
- Drop HDI group

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--group` (`-g`) | string | - | group |

**Related:** `createGroup`, `users`, `roles`

---

## `encryptionStatus`

**Aliases:** `encryption`, `encrypt`
**Tags:** encryption, security, diagnostics
- Check encryption status

**Related:** `certificates`, `healthCheck`

---

## `inspectUser`

```bash
hana-cli inspectUser [user]
```

**Aliases:** `iu`, `user`, `insUser`, `inspectuser`
**Tags:** user, inspection
- Inspect user details and privileges

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--user` (`-u`) | string | - | user |

**Related:** `users`, `roles`, `pwdPolicy`

---

## `pwdPolicy`

**Aliases:** `pwdpolicy`, `passpolicies`
**Tags:** password, policy, security
- Manage password policies

**Related:** `users`, `inspectUser`

---

## `roles`

```bash
hana-cli roles [schema] [role]
```

**Aliases:** `r`, `listRoles`, `listroles`
**Tags:** role, access-control, administration
- List database roles
- Manage role assignments

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--role` (`-r`) | string | `"*"` | role |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--limit` (`-l`) | number | `200` | limit |
| `--profile` (`-p`) | string | - | profile |

**Related:** `users`, `inspectUser`, `grantChains`

---

## `securityScan`

**Aliases:** `secscan`, `scan`
**Tags:** security, scan, compliance
- Run security scan
- Check security settings

**Related:** `pwdPolicy`, `users`, `healthCheck`

---

## `users`

```bash
hana-cli users [user]
```

**Aliases:** `u`, `listUsers`, `listusers`
**Tags:** user, access-control, administration
- List database users
- Manage user access

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--user` (`-u`) | string | `"*"` | user |
| `--limit` (`-l`) | number | `200` | limit |

**Related:** `roles`, `inspectUser`, `massUsers`

---
