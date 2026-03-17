# HANA Cloud

Manage SAP HANA Cloud instances and related services

| Command | Aliases | Description |
|---------|---------|-------------|
| `hanaCloudHDIInstances` | `hdiInstances`, `hdiinstances`, `hdiServices`, `listhdi`, `hdiservices`, `hdis` | List HANA Cloud HDI instances |
| `hanaCloudHDIInstancesUI` | `hdiInstancesUI`, `hdiinstancesui`, `hdiServicesUI`, `listhdiui`, `hdiservicesui`, `hdisui` | - |
| `hanaCloudInstances` | `hcInstances`, `instances`, `listHC`, `listhc`, `hcinstances` | List HANA Cloud instances |
| `hanaCloudSBSSInstances` | `sbssInstances`, `sbssinstances`, `sbssServices`, `listsbss`, `sbssservices`, `sbsss` | List HANA Cloud SBSS instances |
| `hanaCloudSBSSInstancesUI` | `sbssInstancesUI`, `sbssinstancesui`, `sbssServicesUI`, `listsbssui`, `sbssservicesui`, `sbsssui` | - |
| `hanaCloudSchemaInstances` | `schemainstances`, `schemaServices`, `listschemas`, `schemaservices` | List HANA Cloud schema instances |
| `hanaCloudSchemaInstancesUI` | `schemainstancesui`, `schemaServicesUI`, `listschemasui`, `schemaservicesui` | - |
| `hanaCloudSecureStoreInstances` | `secureStoreInstances`, `securestoreinstances`, `secureStoreServices`, `listSecureStore`, `securestoreservices`, `securestores` | List HANA Cloud Secure Store instances |
| `hanaCloudSecureStoreInstancesUI` | `secureStoreInstancesUI`, `secureStoreUI`, `securestoreinstancesui`, `secureStoreServicesUI`, `listSecureStoreUI`, `securestoreservicesui`, `securestoresui` | - |
| `hanaCloudStart` | `hcstart`, `hc_start`, `start` | Start HANA Cloud instance |
| `hanaCloudStop` | `hcstop`, `hc_stop`, `stop` | Stop HANA Cloud instance |
| `hanaCloudUPSInstances` | `upsInstances`, `upsinstances`, `upServices`, `listups`, `upsservices` | List HANA Cloud UPS instances |
| `hanaCloudUPSInstancesUI` | `upsInstancesUI`, `upsinstancesui`, `upServicesUI`, `listupsui`, `upsservicesui` | - |

## `hanaCloudHDIInstances`

```bash
hana-cli hdi
```

**Aliases:** `hdiInstances`, `hdiinstances`, `hdiServices`, `listhdi`, `hdiservices`, `hdis`
**Tags:** cloud, hdi, instance
- List HANA Cloud HDI instances

**Related:** `hanaCloudInstances`, `adminHDI`

---

## `hanaCloudHDIInstancesUI`

```bash
hana-cli hdiUI
```

**Aliases:** `hdiInstancesUI`, `hdiinstancesui`, `hdiServicesUI`, `listhdiui`, `hdiservicesui`, `hdisui`

**Related:** `hanaCloudHDIInstances`

---

## `hanaCloudInstances`

```bash
hana-cli hc [name]
```

**Aliases:** `hcInstances`, `instances`, `listHC`, `listhc`, `hcinstances`
**Tags:** cloud, instance, management
- List HANA Cloud instances
- View cloud databases

**Related:** `hanaCloudStart`, `hanaCloudStop`, `hanaCloudHDIInstances`

---

## `hanaCloudSBSSInstances`

```bash
hana-cli sbss
```

**Aliases:** `sbssInstances`, `sbssinstances`, `sbssServices`, `listsbss`, `sbssservices`, `sbsss`
**Tags:** cloud, sbss, instance
- List HANA Cloud SBSS instances

**Related:** `hanaCloudInstances`

---

## `hanaCloudSBSSInstancesUI`

```bash
hana-cli sbssUI
```

**Aliases:** `sbssInstancesUI`, `sbssinstancesui`, `sbssServicesUI`, `listsbssui`, `sbssservicesui`, `sbsssui`

**Related:** `hanaCloudSBSSInstances`

---

## `hanaCloudSchemaInstances`

```bash
hana-cli schemaInstances
```

**Aliases:** `schemainstances`, `schemaServices`, `listschemas`, `schemaservices`
**Tags:** cloud, schema, instance
- List HANA Cloud schema instances

**Related:** `hanaCloudInstances`, `schemas`

---

## `hanaCloudSchemaInstancesUI`

```bash
hana-cli schemaInstancesUI
```

**Aliases:** `schemainstancesui`, `schemaServicesUI`, `listschemasui`, `schemaservicesui`

**Related:** `hanaCloudSchemaInstances`

---

## `hanaCloudSecureStoreInstances`

```bash
hana-cli securestore
```

**Aliases:** `secureStoreInstances`, `securestoreinstances`, `secureStoreServices`, `listSecureStore`, `securestoreservices`, `securestores`
**Tags:** cloud, secure-store, instance
- List HANA Cloud Secure Store instances

**Related:** `hanaCloudInstances`, `certificates`

---

## `hanaCloudSecureStoreInstancesUI`

```bash
hana-cli securestoreUI
```

**Aliases:** `secureStoreInstancesUI`, `secureStoreUI`, `securestoreinstancesui`, `secureStoreServicesUI`, `listSecureStoreUI`, `securestoreservicesui`, `securestoresui`

**Related:** `hanaCloudSecureStoreInstances`

---

## `hanaCloudStart`

```bash
hana-cli hcStart [name]
```

**Aliases:** `hcstart`, `hc_start`, `start`
**Tags:** cloud, start, instance
- Start HANA Cloud instance

**Related:** `hanaCloudStop`, `hanaCloudInstances`

---

## `hanaCloudStop`

```bash
hana-cli hcStop [name]
```

**Aliases:** `hcstop`, `hc_stop`, `stop`
**Tags:** cloud, stop, instance
- Stop HANA Cloud instance

**Related:** `hanaCloudStart`, `hanaCloudInstances`

---

## `hanaCloudUPSInstances`

```bash
hana-cli ups
```

**Aliases:** `upsInstances`, `upsinstances`, `upServices`, `listups`, `upsservices`
**Tags:** cloud, ups, instance
- List HANA Cloud UPS instances

**Related:** `hanaCloudInstances`

---

## `hanaCloudUPSInstancesUI`

```bash
hana-cli upsUI
```

**Aliases:** `upsInstancesUI`, `upsinstancesui`, `upServicesUI`, `listupsui`, `upsservicesui`

**Related:** `hanaCloudUPSInstances`

---
