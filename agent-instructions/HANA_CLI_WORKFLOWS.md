# hana-cli — Multi-Step Workflows

> Pre-defined sequences of hana-cli commands for common development tasks.

## Validate and Profile Data

Complete data quality assessment: profile table data, then validate against rules

**Goal:** Understand data quality and identify issues
**Estimated time:** 5-10 minutes
**Tags:** data-quality, analysis, validation

### Step 1: dataProfile

Profile the table to understand distributions and patterns

```bash
hana-cli dataProfile --table <table_name> --schema <schema>
```

Expected output: Data distribution statistics for all columns

### Step 2: duplicateDetection

Find duplicate records in the table

```bash
hana-cli duplicateDetection --table <table_name> --schema <schema>
```

Expected output: Count and details of duplicate records

### Step 3: dataValidator

Apply validation rules to data

```bash
hana-cli dataValidator --table <table_name> --schema <schema> --rulesFile <rules.json>
```

Expected output: List of invalid records and validation failures

---

## Export and Import Data

Export data from source table and import to target table

**Goal:** Transfer data between tables or systems
**Estimated time:** 10-30 minutes
**Tags:** data-operations, migration, copy

### Step 1: export

Export data from source table to file

```bash
hana-cli export --table <source_table> --schema <source_schema> --filename <export.csv>
```

Expected output: CSV/Excel file with exported data

### Step 2: import

Import the exported file to target table

```bash
hana-cli import --filename <export.csv> --table <target_table> --schema <target_schema>
```

Expected output: Success confirmation with row count

---

## Compare and Clone Schema

Compare two schemas for differences, then clone one to another location

**Goal:** Replicate and synchronize schema structures
**Estimated time:** 15-45 minutes
**Tags:** schema-management, migration, comparison

### Step 1: compareSchema

Compare source and target schemas

```bash
hana-cli compareSchema --sourceSchema <source> --targetSchema <target>
```

Expected output: Detailed list of differences (added, modified, deleted objects)

### Step 2: schemaClone

Clone schema structure to new location

```bash
hana-cli schemaClone --sourceSchema <source> --targetSchema <new_target>
```

Expected output: New schema with identical structure

---

## Analyze System Performance

Comprehensive performance diagnostic: memory, expensive queries, hotspots

**Goal:** Identify performance bottlenecks and optimization opportunities
**Estimated time:** 15-30 minutes
**Tags:** performance, diagnostics, optimization

### Step 1: memoryAnalysis

Analyze memory consumption by tables

```bash
hana-cli memoryAnalysis
```

Expected output: List of tables with memory usage statistics

### Step 2: expensiveStatements

Find expensive SQL statements

```bash
hana-cli expensiveStatements --limit 10
```

Expected output: Top expensive operations with execution metrics

### Step 3: tableHotspots

Identify heavily accessed tables

```bash
hana-cli tableHotspots
```

Expected output: Tables with high access rates

---

## Security Audit

Complete security check: scan for issues, analyze privileges, check encryption

**Goal:** Verify security posture and identify vulnerabilities
**Estimated time:** 20-40 minutes
**Tags:** security, compliance, audit

### Step 1: securityScan

Run comprehensive security scan

```bash
hana-cli securityScan
```

Expected output: List of security issues and recommendations

### Step 2: privilegeAnalysis

Analyze privilege distribution

```bash
hana-cli privilegeAnalysis
```

Expected output: Over-privileged users and role analysis

### Step 3: encryptionStatus

Check encryption status

```bash
hana-cli encryptionStatus
```

Expected output: Encryption configuration and status

---

## Backup and Verify

Create backup and verify its status

**Goal:** Ensure reliable backup availability
**Estimated time:** 30-120 minutes
**Tags:** backup, recovery, maintenance

### Step 1: backup

Create database backup

```bash
hana-cli backup
```

Expected output: Backup process initiated

### Step 2: backupStatus

Monitor backup progress

```bash
hana-cli backupStatus
```

Expected output: Current backup status and progress percentage

### Step 3: backupList

Verify backup in catalog

```bash
hana-cli backupList
```

Expected output: List of backups including newly created one

---

## Troubleshoot System Issues

Diagnose and investigate system problems

**Goal:** Identify root cause of issues
**Estimated time:** 10-30 minutes
**Tags:** diagnostics, troubleshooting, monitoring

### Step 1: healthCheck

Perform system health check

```bash
hana-cli healthCheck
```

Expected output: Health check results with any issues

### Step 2: diagnose

Run system diagnostics

```bash
hana-cli diagnose
```

Expected output: Diagnostic report with identified issues

### Step 3: alerts

View active system alerts

```bash
hana-cli alerts
```

Expected output: List of alerts with severity levels

---
