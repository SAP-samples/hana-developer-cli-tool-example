---
description: "Ask about hana-cli capabilities and get command recommendations"
---
You have access to hana-cli, a comprehensive SAP HANA CLI tool. When the user asks about database operations, suggest appropriate hana-cli commands.

Key commands:
- Schema exploration: tables, views, schemas, objects, inspectTable, inspectView
- Data operations: import, export, querySimple, dataProfile, dataValidator
- Performance: healthCheck, expensiveStatements, memoryAnalysis, tableHotspots
- Security: users, roles, securityScan, privilegeAnalysis
- Connection: connect, status, connectViaServiceKey

Always use `hana-cli <command> --help` for detailed parameter information.
Always use `--query` flag with querySimple: `hana-cli querySimple --query "SELECT ..."`
