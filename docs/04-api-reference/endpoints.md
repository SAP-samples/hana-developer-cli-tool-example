# REST Endpoints Reference

Complete reference for all REST API endpoints.

## Base URL

```
http://localhost:3000/api/v1
```

## Endpoint Categories

### Database Information

#### Get Database Info
```
GET /dbInfo
```

Response:
```json
{
  "database": "HDB",
  "version": "2.00.050",
  "platform": "SAP HANA"
}
```

#### Get Alerts
```
GET /alerts
```

#### Replication Status
```
GET /replicationStatus
```

---

### Schema & Tables

#### List Tables
```
GET /tables?schema=MYSCHEMA
```

Query Parameters:
- `schema` (required): Schema name
- `pattern` (optional): Table name pattern

#### List Views
```
GET /views?schema=MYSCHEMA
```

#### List Schemas
```
GET /schemas
```

---

### Data Export/Import

#### Export Data
```
POST /export
```

Request Body:
```json
{
  "schema": "HR",
  "table": "EMPLOYEES",
  "format": "json",
  "columns": "ID,NAME",
  "where": "SALARY > 50000",
  "limit": 1000
}
```

#### Import Data
```
POST /import
```

Request Body:
```json
{
  "schema": "HR",
  "table": "EMPLOYEES",
  "file": "data.csv",
  "matchMode": "auto",
  "truncate": false
}
```

---

### Data Analysis

#### Profile Data
```
POST /dataProfile
```

Request:
```json
{
  "schema": "HR",
  "table": "EMPLOYEES"
}
```

#### Compare Data
```
POST /compareData
```

Request:
```json
{
  "schema1": "DEV",
  "table1": "EMPLOYEES",
  "schema2": "PROD",
  "table2": "EMPLOYEES"
}
```

#### Data Diff
```
POST /dataDiff
```

#### Data Validator
```
POST /dataValidator
```

#### Duplicate Detection
```
POST /duplicateDetection
```

Request:
```json
{
  "schema": "HR",
  "table": "EMPLOYEES",
  "columns": "FIRST_NAME,LAST_NAME"
}
```

#### Data Lineage
```
POST /dataLineage
```

#### Referential Check
```
POST /referentialCheck
```

---

### Schema Operations

#### Compare Schemas
```
POST /compareSchema
```

Request:
```json
{
  "schema1": "DEV_SCHEMA",
  "schema2": "PROD_SCHEMA"
}
```

#### Clone Schema
```
POST /schemaClone
```

Request:
```json
{
  "source": "PROD_SCHEMA",
  "target": "DEV_SCHEMA",
  "includeData": false
}
```

#### Copy Table
```
POST /tableCopy
```

Request:
```json
{
  "sourceSchema": "PROD",
  "sourceTable": "CUSTOMERS",
  "targetSchema": "DEV",
  "targetTable": "CUSTOMERS",
  "includeData": true
}
```

---

### System Operations

#### List SDI Tasks
```
GET /sdiTasks
```

#### XSA Services
```
GET /xsaServices
```

#### Timeseries Tools
```
POST /timeseriesTools
```

---

## HTTP Status Codes

| Code | Meaning |
| ---- | ------- |
| 200 | Success |
| 400 | Bad request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 500 | Server error |

## Error Response

```json
{
  "success": false,
  "error": "Table not found",
  "code": "TABLE_NOT_FOUND",
  "details": "Schema 'INVALID' not found",
  "timestamp": "2024-02-16T10:30:45Z"
}
```

## Authentication

### Basic Authentication

```bash
curl -u username:password http://localhost:3000/api/v1/dbInfo
```

### Bearer Token

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/dbInfo
```

## Rate Limiting

Headers in response:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1708062645
```

## See Also

- [Swagger Documentation](./swagger.md)
- [API Server Guide](../03-features/api-server.md)
