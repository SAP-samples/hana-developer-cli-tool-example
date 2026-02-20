# Troubleshooting Guide

Common issues and solutions for the MCP Server.

## Connection Issues

### Zero Results from List Commands

**Symptom:** Commands like `hana_tables`, `hana_schemas`, `hana_inspectTable` return empty results.

**Root Cause:** Missing or invalid database connection configuration.

**Solution:**

1. **Verify Connection Status**

   ```bash
   hana-cli status
   ```

   Should display your connection details, current schema, and HANA version.

2. **Check default-env.json Exists**

   ```bash
   ls -la default-env.json
   ```

   If missing, create it using:

   ```bash
   hana-cli connect
   # or
   hana-cli serviceKey -i <instance-name> -k <key-name>
   ```

3. **Validate Connection Credentials**

   ```json
   {
     "VCAP_SERVICES": {
       "hana": [{
         "name": "my-hana-instance",
         "tags": ["hana"],
         "credentials": {
           "host": "your-host.hanacloud.ondemand.com",
           "port": "443",
           "user": "DBADMIN",
           "password": "YourPassword123!",
           "encrypt": true,
           "sslValidateCertificate": true
         }
       }]
     }
   }
   ```

4. **Enable Debug Mode**

   ```bash
   hana-cli tables --debug
   ```

   Shows connection details, query execution, and timing.

5. **Test Basic Connectivity**

   ```bash
   # For HANA Cloud
   ping your-host.hanacloud.ondemand.com
   
   # Check port accessibility
   telnet your-host.hanacloud.ondemand.com 443
   ```

### Connection Timeout

**Symptom:** Commands fail with "Connection timeout" error after waiting.

**Causes:**

- Network connectivity issues
- Firewall blocking the connection
- Database instance not running or unresponsive
- Query too large or complex

**Solutions:**

1. **Verify Network Connectivity**

   ```bash
   ping your-host.com
   telnet your-host.com 443
   ```

2. **Check Database is Running**

   ```bash
   hana-cli status
   ```

   If this fails, the database instance is not running.

3. **Increase Timeout Value**

   ```bash
   hana-cli tables --timeout 600
   ```

   Increases timeout to 10 minutes (default 5 minutes).

4. **Filter Large Result Sets**

   ```bash
   # Instead of listing all tables
   hana-cli tables --table MY_* --schema SALES
   
   # Instead of loading entire table
   hana-cli sql "SELECT * FROM MY_TABLE LIMIT 1000"
   ```

5. **Check System Health**

   ```bash
   hana-cli healthCheck
   hana-cli memoryAnalysis
   ```

### Authentication Failed

**Symptom:** "Authentication failed" or "Invalid credentials" error.

**Causes:**

- Wrong username or password
- User account disabled or expired
- Insufficient database privileges

**Solutions:**

1. **Verify Credentials**

   ```bash
   hana-cli status --user DBADMIN --password YourPassword
   ```

2. **Check User Account**
   - Log in to SAP HANA database directly
   - Verify user account exists and is active
   - Check user privileges (SELECT, INSERT, UPDATE, DELETE)

3. **Reset Password**
   - In SAP HANA Studio: User → Change Password
   - Or via SQL: `ALTER USER <username> PASSWORD <newpassword> FORCE PASSWORD CHANGE`

4. **For SAP BTP**
   - Get fresh service key: `hana-cli serviceKey -i <instance> -k <key>`
   - Credentials may have expired after service key rotation

### SSL Certificate Errors

**Symptom:** "DEPTH_ZERO_SELF_SIGNED_CERT" or "Certificate verification failed"

**Causes:**

- Self-signed certificates (common in development)
- Expired certificates
- Certificate not trusted by system

**Solutions:**

1. **Temporary Fix (Development Only)**

   ```json
   {
     "sslValidateCertificate": false
   }
   ```

   ⚠️ Never do this in production!

2. **Permanent Fix**
   - Update Node.js to latest version
   - Install proper SSL certificates
   - Contact database administrator

3. **System Time Issues**
   - Incorrect system clock causes certificate validation failure
   - Verify system time: `date`
   - Sync time if needed

## Command Execution Issues

### Table Not Found Error

**Symptom:** `Error: Table 'MY_TABLE' not found` or `Table does not exist`

**Causes:**

- Table name is case-sensitive (usually uppercase in HANA)
- Table in different schema than expected
- Table doesn't exist yet
- User doesn't have permission to access table

**Solutions:**

1. **Check Table Name (Case-Sensitive)**

   ```bash
   # These are different
   MY_TABLE    # Case as stored
   my_table    # Lowercase not found
   My_Table    # Different case
   ```

2. **List Available Tables**

   ```bash
   hana-cli tables
   # or for specific schema
   hana-cli tables --schema SALES
   ```

3. **Verify Schema**

   ```bash
   # Check current schema
   hana-cli status
   
   # List all schemas
   hana-cli schemas
   
   # Use fully qualified name
   hana-cli inspectTable --table MY_TABLE --schema SALES
   ```

4. **Check User Permissions**

   ```bash
   # See current user
   hana-cli inspectUser
   
   # Request table access from database administrator
   ```

### Schema Not Found or Not Accessible

**Symptom:** `Error: Schema '<schema>' does not exist` or permission denied

**Causes:**

- Schema name typo or wrong case
- User doesn't have access to schema
- Schema doesn't exist

**Solutions:**

1. **List Available Schemas**

   ```bash
   hana-cli schemas
   ```

2. **Check Schema Permissions**

   ```bash
   hana-cli status
   # Shows user and roles
   ```

3. **Request Access**
   - Contact database administrator
   - Ask to grant SELECT privilege on schema
   - May need role assignment

### File Not Found (Import/Export)

**Symptom:** `Error: File not found` or `Cannot read file`

**Causes:**

- File path doesn't exist
- Relative path not working as expected
- File permissions issue
- Wrong file format

**Solutions:**

1. **Verify File Path**

   ```bash
   # Use absolute path
   hana-cli import --file /absolute/path/to/data.csv
   
   # or in current directory
   ls -la data.csv
   ```

2. **Check File Exists and is Readable**

   ```bash
   # Verify file exists
   test -f data.csv && echo "File exists" || echo "Not found"
   
   # Check permissions
   ls -la data.csv
   # Should show -rw- (readable)
   ```

3. **Verify File Format**

   ```bash
   # CSV file
   file -b data.csv
   # Should show: ASCII text
   
   # Excel file
   file -b data.xlsx
   # Should show: Microsoft Excel
   ```

4. **Check File Contents**

   ```bash
   # Show first few lines
   head -5 data.csv
   
   # Check for encoding issues
   file data.csv
   ```

### Import Errors and Data Issues

**Symptom:** Import partially succeeds with some rows having errors.

**Causes:**

- Data type mismatches
- Invalid values for columns
- Constraint violations (primary key, foreign key)
- File format issues

**Solutions:**

1. **Preview Before Importing**

   ```bash
   hana-cli import --file data.csv --table MY_TABLE --dryRun true
   ```

   Shows what would be imported without actually importing.

2. **Skip Errors and Continue**

   ```bash
   hana-cli import \
     --file data.csv \
     --table MY_TABLE \
     --skipWithErrors true \
     --errorLimit 100
   ```

3. **Enable Error Logging**

   ```bash
   hana-cli import \
     --file data.csv \
     --table MY_TABLE \
     --saveErrors true \
     --errorFile error.log
   ```

4. **Validate Data Quality**

   ```bash
   # After import
   hana-cli dataValidator --table MY_TABLE
   
   # Check for duplicates
   hana-cli duplicateDetection --table MY_TABLE
   
   # Profile the data
   hana-cli dataProfile --table MY_TABLE
   ```

5. **Fix Data Issues**
   - Correct invalid data in source file
   - Verify column mappings
   - Check data types match table definition
   - Review constraints

## Performance Issues

### Commands Running Slow

**Symptom:** Commands take longer than expected to complete.

**Causes:**

- Large datasets being processed
- Complex queries
- Network latency
- Database load/contention
- Missing indexes

**Solutions:**

1. **Check System Health**

   ```bash
   hana-cli healthCheck
   hana-cli memoryAnalysis
   ```

2. **Filter Large Results**

   ```bash
   # Instead of full table
   hana-cli dataProfile --table BIG_TABLE --limit 10000
   
   # Use schema filter
   hana-cli tables --schema SALES
   ```

3. **Check CPU and Memory**

   ```bash
   hana-cli cpuAnalysis
   hana-cli memoryAnalysis --sort used
   ```

4. **Identify Expensive Queries**

   ```bash
   hana-cli expensiveStatements --order executionTime --limit 10
   ```

5. **Review Indexes**

   ```bash
   hana-cli indexTest --table MY_TABLE
   ```

### Out of Memory Error

**Symptom:** `Error: Out of memory` or process crashes.

**Causes:**

- Processing too much data at once
- Memory fragmentation
- Database memory pressure

**Solutions:**

1. **Check Available Memory**

   ```bash
   hana-cli memoryAnalysis
   hana-cli diskSpace
   ```

2. **Process Data in Batches**

   ```bash
   hana-cli import \
     --file large_file.csv \
     --table MY_TABLE \
     --parallel 4 \
     --batchSize 1000
   ```

3. **Increase Available Memory**

   ```bash
   export NODE_OPTIONS="--max-old-space-size=4096"
   hana-cli dataProfile --table BIG_TABLE
   ```

4. **Use Limits and Filters**

   ```bash
   # Profile subset only
   hana-cli dataProfile --table BIG_TABLE --limit 100000
   ```

## MCP Server Issues

### MCP Server Not Starting

**Symptom:** Claude Dev can't connect to MCP server or "Connection refused"

**Causes:**

- Build not updated
- Wrong path in configuration
- Node.js not installed
- Port conflicts

**Solutions:**

1. **Rebuild MCP Server**

   ```bash
   cd mcp-server
   npm run build
   ```

2. **Verify Configuration Path**

   ```json
   {
     "mcpServers": {
       "hana-cli": {
         "command": "node",
         "args": ["D:/projects/hana-developer-cli-tool-example/mcp-server/build/index.js"]
       }
     }
   }
   ```

   Use absolute path with forward slashes.

3. **Test Server Start**

   ```bash
   node mcp-server/build/index.js
   ```

   Should start without errors.

4. **Check Node.js Installation**

   ```bash
   node --version
   # Should be v14 or higher
   ```

### No Commands Available in MCP

**Symptom:** MCP connects but shows no available commands.

**Causes:**

- Build failed silently
- TypeScript compilation errors
- Missing dependencies

**Solutions:**

1. **Check Build Success**

   ```bash
   ls -la mcp-server/build/
   # Should show many files
   ```

2. **Check for Compilation Errors**

   ```bash
   cd mcp-server
   npm run build 2>&1 | tee build.log
   cat build.log | grep -i error
   ```

3. **Reinstall Dependencies**

   ```bash
   cd mcp-server
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

### MCP Commands Time Out

**Symptom:** "Command timeout" when running MCP tools.

**Causes:**

- Database query taking too long
- Network latency
- Default timeout too short

**Solutions:**

1. **Increase Timeout**

   ```bash
   hana-cli tables --timeout 600
   ```

2. **Filter Results**

   ```bash
   hana-cli tables --table MY_* --schema SALES
   ```

3. **Check Database Health**

   ```bash
   hana-cli healthCheck
   ```

## Getting Help

### Enable Debug Output

All commands support debug mode:

```bash
hana-cli <command> --debug
```

### Check Logs

```bash
# View recent logs
tail -100 ~/.hana-cli/logs/latest.log

# Enable verbose logging
export DEBUG=hana-cli:*
hana-cli <command>
```

### Community Support

1. **GitHub Issues**
   - [Report bug or request feature](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues)
   - Include error message, command, and debug output

2. **SAP Community**
   - SAP HANA Cloud forum
   - SAP BTP community

3. **Documentation**
   - [Getting Started Guide](../01-getting-started/)
   - [Features Overview](./features.md)
   - [All Documentation](./docs-search.md)

### Troubleshooting Checklist

When reporting issues, include:

- [ ] Error message (full text)
- [ ] Command that failed
- [ ] Debug output (`--debug` flag)
- [ ] Operating system and Node.js version
- [ ] MCP server version
- [ ] Connection details (host, port, schema)
- [ ] Database version
- [ ] Steps to reproduce

## Next Steps

- **[Setup and Configuration](./setup-and-configuration.md)** - Fix connection issues
- **[Features Overview](./features.md)** - Learn what commands do
- **[Development Guide](../index.md)** - Contribute fixes
