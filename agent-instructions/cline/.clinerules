# hana-cli — AI Coding Assistant Context

## About hana-cli

hana-cli (npm: hana-cli, install: `npm install -g hana-cli`) is a command-line tool for SAP HANA database development. It simplifies complex multi-step database operations into single commands. It is a development tool, not a replacement for hdbsql or production admin tools.

**Version:** 4.202603.2  
**Requirements:** Node.js ≥ 20.19.0  
**Module:** ESM (`"type": "module"`)

## When to Use hana-cli

Use hana-cli when a developer needs to:
- **Explore schemas**: `hana-cli tables`, `hana-cli views`, `hana-cli schemas`
- **Inspect objects**: `hana-cli inspectTable`, `hana-cli inspectView`, `hana-cli inspectProcedure`
- **Import/export data**: `hana-cli import`, `hana-cli export`
- **Run queries**: `hana-cli querySimple --query "SQL"`
- **Check health**: `hana-cli healthCheck`, `hana-cli systemInfo`
- **Manage connections**: `hana-cli connect`, `hana-cli status`
- **Profile data**: `hana-cli dataProfile`, `hana-cli dataValidator`
- **Compare schemas**: `hana-cli compareSchema`, `hana-cli compareData`
- **Monitor performance**: `hana-cli expensiveStatements`, `hana-cli memoryAnalysis`
- **Manage security**: `hana-cli users`, `hana-cli roles`, `hana-cli securityScan`
- **Work with HANA Cloud**: `hana-cli hanaCloudInstances`, `hana-cli hanaCloudStart`
- **Manage HDI**: `hana-cli containers`, `hana-cli adminHDI`

## Key Patterns

1. **Always verify connection first:** `hana-cli status`
2. **Explore before modifying:** Use `tables`, `inspectTable`, `dataProfile` before import/export
3. **Use dry-run for imports:** `hana-cli import --filename data.csv --table X --schema Y --dryRun`
4. **Use --output flag:** Many commands support `--output json|csv|table|excel`
5. **Use --query flag with querySimple:** `hana-cli querySimple --query "SELECT ..."` (not positional args)
6. **Interactive mode:** Run `hana-cli` with no arguments for a menu-driven experience

## Connection Setup

```bash
hana-cli connect                    # Interactive wizard
hana-cli connectViaServiceKey       # Via BTP service key
hana-cli copy2DefaultEnv            # Copy to default-env.json for CAP projects
hana-cli status                     # Verify connection
```

## Reference

For the complete command reference with all parameters, see:
- HANA_CLI_REFERENCE.md (full reference, all commands)
- HANA_CLI_QUICKSTART.md (getting started, top 10 commands)
- HANA_CLI_EXAMPLES.md (real-world scenarios)
- HANA_CLI_WORKFLOWS.md (multi-step workflows)
- categories/*.md (per-category deep dives)

Or run `hana-cli <command> --help` for any specific command.
