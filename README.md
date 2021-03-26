# SAP HANA Developer Command Line Interface

[![REUSE status](https://api.reuse.software/badge/github.com/SAP-samples/hana-developer-cli-tool-example)](https://api.reuse.software/info/github.com/SAP-samples/hana-developer-cli-tool-example)

The [change log](CHANGELOG.md) describes notable changes in this package.

## Description

This sample is intended to shown how one could build a developer-centric SAP HANA command line tool, particularly designed to be used when performing local SAP HANA development in non-SAP tooling (like VSCode). It utilizes the default-env.json that is often used in local development for connectivity to a remote SAP HANA DB (although it can of course be used with a local SAP HANA, express edition instance as well). There is no intention to replacing the hdbsql tool as a generic SQL console. Instead this sample will focus on simplifying and grouping common and complex commands that otherwise might a lot of separate scripts.

Introduction Video: [https://youtu.be/dvVQfi9Qgog](https://youtu.be/dvVQfi9Qgog)

However the tool isn't limited to only local development. It also works well when developing in the cloud. The hana-cli tool can also run well from a cloud shell in the SAP Business Application Studio, Google Cloud Shell, AWS Cloud9, etc. We can also run against a SAP HANA service for SAP BTP or SAP HANA Cloud instance. This demonstrates that the tool can run just about anywhere you can get a command line that has access to the Node.js Runtime.  We can also connect to a remote HANA instance even if it isn't running in the same cloud environment in which we are performing our development tasks.

Running in Cloud Shells Video: [https://youtu.be/L7QyVLvAIIQ](https://youtu.be/L7QyVLvAIIQ)

## Requirements / Download and Installation

* Install Node.js version 10.x, 12.x, or 14.x on your development machine [https://nodejs.org/en/download/](https://nodejs.org/en/download/)

* @sap Node.js packages have moved from https://npm.sap.com to the default registry https://registry.npmjs.org. As future versions of @sap modules are going to be published only there, please make sure to adjust your registry with:

```shell
npm config delete @sap:registry
```

* Clone the repository from [https://github.com/SAP-samples/hana-developer-cli-tool-example](https://github.com/SAP-samples/hana-developer-cli-tool-example)

```shell
git clone https://github.com/SAP-samples/hana-developer-cli-tool-example
```

* Run NPM install from the root of the hana-developer-cli-tool-example project you just cloned to download dependencies

```shell
npm install
```

* Run NPM link from the cloned project root to make the hana-cli command available from everywhere [https://docs.npmjs.com/cli/link](https://docs.npmjs.com/cli/link)

```shell
npm link
```

[![asciicast](https://asciinema.org/a/301560.svg)](https://asciinema.org/a/301560)

Or if you would rather just access the tool directly, it is now available in npm directly. You can install via:

```shell
npm install -g hana-cli
```

## Security

This application primarily uses the default-env.json that is often used in local development for connectivity to a remote HANA DB (although it can of course be used with a local SAP HANA, express edition instance as well). For more details on how the default-env.json works, see the readme.md of the @sap/xsenv package or the @sap/hdi-deploy package.

## Examples

A lot of the functionality of this tool revolves around typical tasks you face while doing HANA database development.
For example you might want to get a list of all views in your current schema/container:

```shell
C:\github\hana-xsa-opensap-hana7\user_db>hana-cli views
Schema: OPENSAP_HANA_USER, View: *
SCHEMA_NAME        VIEW_NAME                                    VIEW_OID  COMMENTS
-----------------  -------------------------------------------  --------  ------------
OPENSAP_HANA_USER  user.models::USER_DETAILS                    171133    USER_DETAILS
OPENSAP_HANA_USER  user.models::USER_DETAILS/hier/USER_DETAILS  171139    null
```

Then perhaps you want to inspect a view to see the columns and their data types:

```shell
C:\github\hana-xsa-opensap-hana7\user_db>hana-cli view * user.models::USER_DETAILS
Schema: %, View: user.models::USER_DETAILS
{ SCHEMA_NAME: 'OPENSAP_HANA_USER',
  VIEW_NAME: 'user.models::USER_DETAILS',
  VIEW_OID: 171133,
  COMMENTS: 'USER_DETAILS',
  IS_COLUMN_VIEW: 'TRUE',
  VIEW_TYPE: 'CALC',
  HAS_STRUCTURED_PRIVILEGE_CHECK: 'TRUE',
  HAS_PARAMETERS: 'TRUE',
  HAS_CACHE: 'NONE',
  CREATE_TIME: '2019-07-30 13:14:15.594000000' }


SCHEMA_NAME        VIEW_NAME                  VIEW_OID  COLUMN_NAME  POSITION  DATA_TYPE_NAME  OFFSET  LENGTH  SCALE  IS_NULLABLE  DEFAULT_VALUE  CS_DATA_TYPE_NAME  COLUMN_ID  COMMENTS
-----------------  -------------------------  --------  -----------  --------  --------------  ------  ------  -----  -----------  -------------  -----------------  ---------  ---------
OPENSAP_HANA_USER  user.models::USER_DETAILS  171133    EMAIL        1         NVARCHAR        0       255     null   TRUE         null           STRING             171135     Email
OPENSAP_HANA_USER  user.models::USER_DETAILS  171133    FIRSTNAME    2         NVARCHAR        0       40      null   TRUE         null           STRING             171136     FirstName
OPENSAP_HANA_USER  user.models::USER_DETAILS  171133    LASTNAME     3         NVARCHAR        0       40      null   TRUE         null           STRING             171137     LastName
OPENSAP_HANA_USER  user.models::USER_DETAILS  171133    USERID       4         INTEGER         0       10      0      TRUE         null           INT                171138     UserId
```

But there are multiple output options for inspection. Perhaps you are using Cloud Application Programming Model and need to create a proxy entity in CDS for a view. This tool will read the catalog metadata and convert it to CDS:

```shell
C:\github\hana-xsa-opensap-hana7\user_db>hana-cli view OPENSAP_HANA_USER user.models::USER_DETAILS -o cds
Schema: OPENSAP_HANA_USER, View: user.models::USER_DETAILS
@cds.persistence.exists
Entity user_modelsUSER_DETAILS {
 key    "EMAIL": String(255) null  @title: 'EMAIL: Email' ;
key     "FIRSTNAME": String(40) null  @title: 'FIRSTNAME: FirstName' ;
key     "LASTNAME": String(40) null  @title: 'LASTNAME: LastName' ;
key     "USERID": Integer null  @title: 'USERID: UserId' ;
}
```

Or maybe you are service enabling this view and you want to see it converted to EDMX:

```shell
C:\github\hana-xsa-opensap-hana7\user_db>hana-cli view OPENSAP_HANA_USER user.models::USER_DETAILS -o edmx
Schema: OPENSAP_HANA_USER, View: user.models::USER_DETAILS
<?xml version="1.0" encoding="utf-8"?>
<edmx:Edmx Version="1.0" xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns:sap="http://www.sap.com/Protocols/SAPData">
  <edmx:Reference Uri="https://wiki.scn.sap.com/wiki/download/attachments/448470974/Common.xml?api=v2" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx">
    <edmx:Include Alias="Common" Namespace="com.sap.vocabularies.Common.v1"/>
  </edmx:Reference>
  <edmx:DataServices m:DataServiceVersion="2.0">
    <Schema Namespace="HanaCli" xmlns="http://schemas.microsoft.com/ado/2008/09/edm">
      <EntityContainer Name="EntityContainer" m:IsDefaultEntityContainer="true">
        <EntitySet Name="user_modelsUSER_DETAILS" EntityType="HanaCli.user_modelsUSER_DETAILS"/>
      </EntityContainer>
      <EntityType Name="user_modelsUSER_DETAILS">
        <Key>
          <PropertyRef Name="EMAIL"/>
          <PropertyRef Name="FIRSTNAME"/>
          <PropertyRef Name="LASTNAME"/>
          <PropertyRef Name="USERID"/>
        </Key>
        <Property Name="EMAIL" Type="Edm.String" MaxLength="255"/>
        <Property Name="FIRSTNAME" Type="Edm.String" MaxLength="40"/>
        <Property Name="LASTNAME" Type="Edm.String" MaxLength="40"/>
        <Property Name="USERID" Type="Edm.Int32"/>
      </EntityType>
      <Annotations Target="HanaCli.user_modelsUSER_DETAILS/EMAIL" xmlns="http://docs.oasis-open.org/odata/ns/edm">
        <Annotation Term="Common.Label" String="EMAIL: Email"/>
      </Annotations>
      <Annotations Target="HanaCli.user_modelsUSER_DETAILS/FIRSTNAME" xmlns="http://docs.oasis-open.org/odata/ns/edm">
        <Annotation Term="Common.Label" String="FIRSTNAME: FirstName"/>
      </Annotations>
      <Annotations Target="HanaCli.user_modelsUSER_DETAILS/LASTNAME" xmlns="http://docs.oasis-open.org/odata/ns/edm">
        <Annotation Term="Common.Label" String="LASTNAME: LastName"/>
      </Annotations>
      <Annotations Target="HanaCli.user_modelsUSER_DETAILS/USERID" xmlns="http://docs.oasis-open.org/odata/ns/edm">
        <Annotation Term="Common.Label" String="USERID: UserId"/>
      </Annotations>
    </Schema>
  </edmx:DataServices>
</edmx:Edmx>
```

This tool will even create a temporary OData V4 service for any existing table, view or Calculation View and launch a test Fiori Ui locally.
![Fioir Example](images/ex1.png)

## Commands

### version

```shell
hana-cli version
[aliases: ver]
Version details
```

![version example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/version.gif)

### help

```shell
hana-cli help
List all Commands and their Aliases
```

### connect

```shell
hana-cli connect [user] [password]
[aliases: c, login]
Connects to a HANA DB and writes connection information to a default-env-admin.json

Options:
  --connection, -n                    Connection String  <host>[:<port>]
  --user, -u, --User                  User
  --password, -p, --Password          Password
  --userstorekey, -U, --UserStoreKey  Optional: HDB User Store Key - Overrides
                                      all other Connection Parameters
  --save, -s, --Save                  Save Credentials to default-env-admin.json
                                                       [boolean] [default: true]
  --encrypt, -e, --Encrypt, --ssl           Encrypt connections (required for
                                            HANA As A Service)
                                                      [boolean] [default: false]
  --trustStore, -t, --Trust, --trust,       SSL Trust Store
  --truststore                                                       
```

![connect example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/connect.gif)

### status

```shell
hana-cli status
[aliases: s, whoami]
Get Connection Status

Options:
  --admin, -a, --Admin  Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
```

![status example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/status.gif)

### hdbsql

```shell
hana-cli hdbsql

Launch the hdbsql tool (if installed separately) using the locally persisted
credentials default-env*.json

Options:
  --admin, -a, --Admin  Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
```

![hdbsql example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/hdbsql.gif)

### activateHDI

```shell
hana-cli activateHDI [tenant]
[aliases: ahdi, ah]
Activate the HDI service in a particluar HANA Tenant (Must be ran in the
SYSTEMDB)

Options:
  --admin, -a, --Admin    Connect via admin (default-env-admin.json)
                                                       [boolean] [default: true]
  --tenant, -t, --Tenant  HANA Tenant                                   [string]
```

### adminHDI

```shell
hana-cli adminHDI [user] [password]
[aliases: adHDI, adhdi]
Create an Admin User for HDI

Options:
  --admin, -a, --Admin        Connect via admin (default-env-admin.json)
                                                       [boolean] [default: true]
  --user, -u, --User          User
  --password, -p, --Password  Password
```

![adminHDI example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/adminHDI.gif)

### adminHDIGroup

```shell
hana-cli adminHDIGroup [user] [group]
[aliases: adHDIG, adhdig]
Add a User as an HDI Group Admin

Options:
  --admin, -a, --Admin  Connect via admin (default-env-admin.json)
                                                       [boolean] [default: true]
  --user, -u, --User    User
  --group, -g, --Group  HDI Group       [string] [default: "SYS_XS_HANA_BROKER"]
```

![adminHDIGroup example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/adminHDIGroup.gif)

### createXSAAdmin

```shell
hana-cli createXSAAdmin [user] [password]
[aliases: cXSAAdmin, cXSAA, cxsaadmin, cxsaa]
Create a HANA DB User which is also an XSA Admin

Options:
  --admin, -a, --Admin        Connect via admin (default-env-admin.json)
                                                       [boolean] [default: true]
  --user, -u, --User          User
  --password, -p, --Password  Password
```

![createXSAAdmin example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/createXSAAdmin.gif)

### createContainer

```shell
hana-cli createContainer [container]
[aliases: cc, cCont]
Create an HDI Container and populate connection details into default-env.json

Options:
  --admin, -a, --Admin          Connect via admin (default-env-admin.json)
                                                       [boolean] [default: true]
  --container, -c, --Container  HDI Container Name                      [string]
  --save, -s, --Save            Save Credentials to default-env.json
                                                       [boolean] [default: true]
```

![createContainer example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/createContainer.gif)

### createContainerUsers

```shell
hana-cli createContainerUsers [container]

Create new HDI Container technical users for an existing container and populates connection details into
default-env.json

Options:
  --admin, -a, --Admin             Connect via admin (default-env-admin.json)
                                                       [boolean] [default: true]
  --container, -c, --Container     HDI Container Name                   [string]
  --save, -s, --Save               Save Credentials to default-env.json
                                                       [boolean] [default: true]
  --encrypt, -e, --Encrypt, --ssl  Encrypt connections (required for HANA As A
                                   Service or HANA Cloud)
                                                      [boolean] [default: false]
```

### containers

```shell
hana-cli containers [containerGroup] [container]

List all HDI Containers

Options:
  --admin, -a, --Admin                      Connect via admin
                                            (default-env-admin.json)
                                                       [boolean] [default: true]
  --container, -c, --Container              Container Name
                                                         [string] [default: "*"]
  --containerGroup, -g, --Group, --group,   Container Group
  --containergroup                                       [string] [default: "*"]
  --limit, -l                               Limit results[number] [default: 200]
```

### dropContainer

```shell
hana-cli dropContainer [container]
[aliases: dc, dropC]
Drop HDI container and clean up HDI Container users

Options:
  --admin, -a, --Admin          Connect via admin (default-env-admin.json)
                                                       [boolean] [default: true]
  --container, -c, --Container  HDI Container Name                      [string]
```

![dropContainer example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/dropContainer.gif)

### createModule

```shell
hana-cli createModule

Create or adjust DB Module in your local project structure. If the folder already exists the files .build.js and package.json will be replaced with updated content designed to allow for local hdi-deploy run.

Options:
  --folder, -f, --Folder  DB Module Folder Name         [string] [default: "db"]
```

### reclaim

```shell
hana-cli reclaim
[aliases: re]
Reclaim LOB, Log, and Data Volume space

Options:
  --admin, -a, --Admin  Connect via admin (default-env-admin.json)
                                                       [boolean] [default: true]
```

![reclaim example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/reclaim.gif)

### massUsers

```shell
hana-cli massUsers [user] [password]
[aliases: massUser, mUsers, mUser, mu]
Mass Create 50 Developer Users (for workshops)

Options:
  --admin, -a, --Admin        Connect via admin (default-env-admin.json)
                                                       [boolean] [default: true]
  --user, -u, --User          User
  --password, -p, --Password  Password
```

![massUsers example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/massUsers.gif)

### inspectTable

```shell
hana-cli inspectTable [schema] [table]

Return metadata about a DB table

Options:
  -a, --admin, --Admin        Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  -t, --table, --Table        Database Table                            [string]
  -s, --schema, --Schema      schema    [string] [default: "**CURRENT_SCHEMA**"]
  -o, --output, --Output      Output Format for inspection
  [string] [choices: "tbl", "sql", "cds", "json", "yaml", "cdl", "annos", "edm",
                                     "edmx", "swgr", "openapi"] [default: "tbl"]
      --useHanaTypes, --hana  Use SAP HANA-Specific Data Types See (https://cap.
                              cloud.sap/docs/cds/cdl#predefined-types)
                                                      [boolean] [default: false]
```

![inspectTable example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/inspectTable.gif)

### inspectView

```shell
hana-cli inspectView [schema] [view]

Return metadata about a DB view

Options:
  -a, --admin, --Admin        Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  -v, --view, --View          Database View                             [string]
  -s, --schema, --Schema      schema    [string] [default: "**CURRENT_SCHEMA**"]
  -o, --output, --Output      Output Format for inspection
  [string] [choices: "tbl", "sql", "cds", "json", "yaml", "cdl", "annos", "edm",
                                     "edmx", "swgr", "openapi"] [default: "tbl"]
      --useHanaTypes, --hana  Use SAP HANA-Specific Data Types See (https://cap.
                              cloud.sap/docs/cds/cdl#predefined-types)
                                                      [boolean] [default: false]
```

![inspectView example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/inspectView.gif)

### inspectJWT

```shell
hana-cli inspectJWT

Inspect JWT Token Configuration

Options:
  --admin, -a, --Admin  Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
```

### createJWT

```shell
hana-cli createJWT [name]

Create JWT Token and Import Certificate (To obtain the certificate and issuer
used in the SQL you need to use the xsuaa service key credentials.url element
which should look like this:
https://<subdomain>.authentication.<region>.hana.ondemand.com then add
/sap/trust/jwt path to it in a browser)

Options:
  --admin, -a, --Admin              Connect via admin (default-env-admin.json)
                                                       [boolean] [default: true]
  --name, -c, --Name                JWT Provider Name (Any descriptive Value)
                                                                        [string]
  --certificate, -c, --Certificate  certificate                         [string]
  --issuer, -i, --Issuer            Certificate Issuer [boolean] [default: true]
```

### systemInfo

```shell
hana-cli systemInfo
[aliases: sys, sysinfo, sysInfo, systeminfo]
General System Details

Options:
  --admin, -a, --Admin  Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
```

![systemInfo example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/systemInfo.gif)

### ports

```shell
hana-cli ports

Display port assignments for internal HANA services
```

### schemas

```shell
hana-cli schemas [schema]
[aliases: sch, getSchemas, listSchemas]
Get a list of all schemas

Options:
  --admin, -a, --Admin       Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --schema, -s, --schemas    schema                      [string] [default: "*"]
  --limit, -l                Limit results               [number] [default: 200]
  --all, --al, --allSchemas  allSchemas               [boolean] [default: false]
```

![schemas example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/schemas.gif)

### tables

```shell
hana-cli tables [schema] [table]
[aliases: t, listTables, listtables]
Get a list of all tables

Options:
  --admin, -a, --Admin    Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --table, -t, --Table    Database Table                 [string] [default: "*"]
  --schema, -s, --Schema  schema        [string] [default: "**CURRENT_SCHEMA**"]
  --limit, -l             Limit results                  [number] [default: 200]
```

![tables example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/tables.gif)
  
### views

```shell
hana-cli views [schema] [view]
[aliases: v, listViews, listviews]
Get a list of all views

Options:
  --admin, -a, --Admin    Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --view, -v, --View      Database View                  [string] [default: "*"]
  --schema, -s, --Schema  schema        [string] [default: "**CURRENT_SCHEMA**"]
  --limit, -l             Limit results                  [number] [default: 200]
```

![views example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/views.gif)

### objects

```shell
hana-cli objects [schema] [object]
[aliases: o, listObjects, listobjects]
Search across all object types

Options:
  --admin, -a, --Admin    Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --object, -o, --Object  DB Object                      [string] [default: "*"]
  --schema, -s, --Schema  schema        [string] [default: "**CURRENT_SCHEMA**"]
  --limit, -l             Limit results                  [number] [default: 200]
```

![objects example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/objects.gif)

### procedures

```shell
hana-cli procedures [schema] [procedure]
[aliases: p, listProcs, ListProc, listprocs, Listproc, listProcedures,
                                                                 listprocedures]
Get a list of all stored procedures

Options:
  --admin, -a, --Admin          Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --procedure, -p, --Procedure  Stored Procedure         [string] [default: "*"]
  --schema, -s, --Schema        schema  [string] [default: "**CURRENT_SCHEMA**"]
  --limit, -l                   Limit results            [number] [default: 200]
```

![procedures example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/procedures.gif)

### inspectProcedure

```shell
hana-cli inspectProcedure [schema] [procedure]
 [aliases: ip, procedure, insProc, inspectprocedure, inspectsp]
Return metadata about a Stored Procedure

Options:
  --admin, -a, --Admin                Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --procedure, -p, --Procedure, --sp  Stored Procedure                  [string]
  --schema, -s, --Schema              schema
                                        [string] [default: "**CURRENT_SCHEMA**"]
  --output, -o, --Output              Output Format for inspection
                               [string] [choices: "tbl", "sql"] [default: "tbl"]
```

![inspectProcedure example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/inspectProcedure.gif)

### callProcedure

```shell
hana-cli callProcedure [schema] [procedure]
[aliases: cp, callprocedure, callProc, callproc, callSP, callsp]
Call a stored procedure and display the results

Options:
  --admin, -a, --Admin                Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --procedure, -p, --Procedure, --sp  Stored Procedure                  [string]
  --schema, -s, --Schema              schema
                                        [string] [default: "**CURRENT_SCHEMA**"]
```

![callProcedure example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/callProcedure.gif)

### functions

```shell
hana-cli functions [schema] [function]
[aliases: f, listFuncs, ListFunc, listfuncs, Listfunc, listFunctions,
                                                                  listfunctions]
Get a list of all functions

Options:
  --admin, -a, --Admin        Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --function, -f, --Function  Function                   [string] [default: "*"]
  --schema, -s, --Schema      schema    [string] [default: "**CURRENT_SCHEMA**"]
  --limit, -l                 Limit results              [number] [default: 200]
```

![functions example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/functions.gif)

### inspectFunction

```shell
hana-cli inspectFunction [schema] [function]
[aliases: if, function, insFunc, inspectfunction]
Return metadata about a Function

Options:
  --admin, -a, --Admin        Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --function, -f, --Function  Function                                  [string]
  --schema, -s, --Schema      schema    [string] [default: "**CURRENT_SCHEMA**"]
  --output, -o, --Output      Output Format for inspection
                               [string] [choices: "tbl", "sql"] [default: "tbl"]
```

![inspectFunction example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/inspectFunction.gif)

### libraries

```shell
hana-cli libraries [schema] [library]
[aliases: l, listLibs, ListLibs, listlibs, ListLib, listLibraries,
                                                                  listlibraries]
Get a list of all libraries

Options:
  --admin, -a, --Admin         Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --library, --lib, --Library  Library                   [string] [default: "*"]
  --schema, -s, --Schema       schema   [string] [default: "**CURRENT_SCHEMA**"]
  --limit, -l                  Limit results             [number] [default: 200]
```

![libraries example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/libraries.gif)

### inspectLibrary

```shell
hana-cli inspectLibrary [schema] [library]
[aliases: il, library, insLib, inspectlibrary]
Return metadata about a Library

Options:
  --admin, -a, --Admin         Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --library, --lib, --Library  Library                                  [string]
  --schema, -s, --Schema       schema   [string] [default: "**CURRENT_SCHEMA**"]
  --output, -o, --Output       Output Format for inspection
                               [string] [choices: "tbl", "sql"] [default: "tbl"]
```

![inspectLibrary example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/inspectLibrary.gif)

### inspectLibMember

```shell
hana-cli inspectLibMember [schema] [library] [libraryMem]
[aliases: ilm, libraryMember, librarymember, insLibMem, inspectlibrarymember]
Return metata about a Library Member

Options:
  --admin, -a, --Admin                      Connect via admin
                                            (default-env-admin.json)
                                                      [boolean] [default: false]
  --library, --lib, --Library               Library                     [string]
  --libraryMem, -m, --libMem,               Library Member
  --LibraryMember                                                       [string]
  --schema, -s, --Schema                    schema
                                        [string] [default: "**CURRENT_SCHEMA**"]
  --output, -o, --Output                    Output Format for inspection
                               [string] [choices: "tbl", "sql"] [default: "tbl"]
```

![inspectLibMember example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/inspectLibMember.gif)

### triggers

```shell
hana-cli triggers [schema] [trigger] [target]
[aliases: trig, listTriggers, ListTrigs, listtrigs, Listtrig, listrig]
List of all triggers

Options:
  --admin, -a, --Admin      Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --trigger, -t, --Trigger  Sequence                     [string] [default: "*"]
  --target, --to, --Target  Target object                [string] [default: "*"]
  --schema, -s, --Schema    schema      [string] [default: "**CURRENT_SCHEMA**"]
  --limit, -l               Limit results                [number] [default: 200]
```

![triggers example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/triggers.gif)

### inspectTrigger

```shell
hana-cli inspectTrigger [schema] [trigger]
[aliases: itrig, trigger, insTrig, inspecttrigger, inspectrigger]
inspectTrigger

Options:
  --admin, -a, --Admin      Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --trigger, -t, --Trigger  Sequence                     [string] [default: "*"]
  --schema, -s, --Schema    schema      [string] [default: "**CURRENT_SCHEMA**"]
  --output, -o, --Output    Output Format for inspection
                               [string] [choices: "tbl", "sql"] [default: "tbl"]
```

### indexes

```shell
hana-cli indexes [schema] [indexes]
[aliases: ind, listIndexes, ListInd, listind, Listind, listfindexes]
Get a list of indexes

Options:
  --admin, -a, --Admin      Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --indexes, -i, --Indexes  Function                     [string] [default: "*"]
  --schema, -s, --Schema    schema      [string] [default: "**CURRENT_SCHEMA**"]
  --limit, -l               Limit results                [number] [default: 200]
```

![indexes example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/indexes.gif)

### inspectIndex

```shell
hana-cli inspectIndex [schema] [index]
[aliases: ii, index, insIndex, inspectindex]
Return metadata about an Index

Options:
  --admin, -a, --Admin    Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --index, -i, --Index    DB Table Index                                [string]
  --schema, -s, --Schema  schema        [string] [default: "**CURRENT_SCHEMA**"]
```

![inspectIndex example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/inspectIndex.gif)

### synonyms

```shell
hana-cli synonyms [schema] [synonym] [target]
[aliases: syn, listSynonyms, listsynonyms]
List of all synonyms

Options:
  --admin, -a, --Admin         Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --synonym, --syn, --Synonym  Database Synonym          [string] [default: "*"]
  --target, -t, --Target       Target object of the Synonym
                                                         [string] [default: "*"]
  --schema, -s, --Schema       schema   [string] [default: "**CURRENT_SCHEMA**"]
  --limit, -l                  Limit results             [number] [default: 200]
```

![synonyms example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/synonyms.gif)

### privilegeError

```shell
hana-cli privilegeError [guid]
[aliases: pe, privilegeerror, privilegerror,
                                          getInsuffficientPrivilegeErrorDetails]
Get Insufficient Privilege Error Details

Options:
  --admin, -a, --Admin  Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --guid, -g, --error   GUID from original error message                [string]
```

![privilegeError example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/privilegeError.gif)

### certificates

```shell
hana-cli certificates
[aliases: cert, certs]
List System Certificates

Options:
  --admin, -a, --Admin  Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
```

![certificates example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/certificates.gif)

### dataTypes

```shell
hana-cli dataTypes
[aliases: dt, datatypes, dataType, datatype]
List of HANA Data Types and their technical details

Options:
  --admin, -a, --Admin  Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
```

![dataTypes example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/dataTypes.gif)

### users

```shell
hana-cli users [user]
[aliases: u, listUsers, listusers]
Get a list of all users

Options:
  --admin, -a, --Admin  Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --user, -u, --User    User                             [string] [default: "*"]
  --limit, -l           Limit results                    [number] [default: 200]
```

![users example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/users.gif)

### inspectUser

```shell
hana-cli inspectUser [user]
[aliases: iu, user, insUser, inspectuser]
Return metadata about a User

Options:
  --admin, -a, --Admin  Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --user, -u, --User    User                                            [string]
```

![inspectUser example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/inspectUser.gif)

### dataVolumes

```shell
hana-cli dataVolumes
[aliases: dv, datavolumes]
Details about the HANA Data Volumes

Options:
  --admin, -a, --Admin  Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
```

![dataVolumes example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/dataVolumes.gif)

### disks

```shell
hana-cli disks
[aliases: di, Disks]
Details about disk devices used by HANA

Options:
  --admin, -a, --Admin  Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
```

![disks example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/disks.gif)

### features

```shell
hana-cli features
[aliases: fe, Features]
HANA Features and Version

Options:
  --admin, -a, --Admin  Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
```

![features example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/features.gif)

### featureUsage

```shell
hana-cli featureUsage
[aliases: fu, FeaturesUsage]
Usage Statistics by Feature

Options:
  --admin, -a, --Admin  Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
```

![featureUsage example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/featureUsage.gif)

### hostInformation

```shell
hana-cli hostInformation
[aliases: hi, HostInformation, hostInfo, hostinfo]
Host technical details

Options:
  --admin, -a, --Admin  Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
```

![hostInformation example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/hostInformation.gif)

### iniFiles

```shell
hana-cli iniFiles
[aliases: if, inifiles, ini]
iniFiles

Options:
  --admin, -a, --Admin  Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
```

![iniFiles example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/iniFiles.gif)

### iniContents

```shell
hana-cli iniContents [file] [section]
[aliases: if, inifiles, ini]
Contents of INI Configuration (filtered by File Name)

Options:
  --admin, -a, --Admin      Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --file, -f, --File        File Name                    [string] [default: "*"]
  --section, -s, --Section  Section                      [string] [default: "*"]
  --limit, -l               Limit results                [number] [default: 200]
```

![iniContents example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/iniContents.gif)

### sequences

```shell
hana-cli sequences [schema] [sequence]
[aliases: seq, listSeqs, ListSeqs, listseqs, Listseq, listSequences]
Get a list of all squences

Options:
  --admin, -a, --Admin           Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --sequence, --seq, --Sequence  Sequence                [string] [default: "*"]
  --schema, -s, --Schema         schema [string] [default: "**CURRENT_SCHEMA**"]
  --limit, -l                    Limit results           [number] [default: 200]
```

![sequences example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/sequences.gif)

### traces

```shell
hana-cli traces
[aliases: tf, Traces]
List all trace files

Options:
  --admin, -a, --Admin  Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
```

![traces example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/traces.gif)

### traceContents

```shell
hana-cli traceContents [host] [file]

Contents of a selected trace file - Reading from the end of the file backwards

Options:
  --admin, -a, --Admin  Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --host, --ho, --Host  Hostname                                        [string]
  --file, -f, --File    File Name                                       [string]
  --limit, -l           Limit results                   [number] [default: 2000]
```

![traceContents example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/traceContents.gif)

### roles

```shell
hana-cli roles [schema] [role]
[aliases: tc, traceContents, traceContent, tracecontent]
Get a list of roles

Options:
  --admin, -a, --Admin    Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --role, -r, --Role      Database Role                  [string] [default: "*"]
  --schema, -s, --Schema  schema        [string] [default: "**CURRENT_SCHEMA**"]
  --limit, -l             Limit results                  [number] [default: 200]
```

![roles example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/roles.gif)

### querySimple

```shell
hana-cli querySimple

Execute single SQL command and output results

Options:
  -a, --admin, --Admin        Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  -q, --query, --Query        SQL Statement                             [string]
  -f, --folder, --Folder      DB Module Folder Name     [string] [default: "./"]
  -n, --filename, --Filename  File name                                 [string]
  -o, --output, --Output      Output Type for Query Results
                 [string] [choices: "table", "json", "excel"] [default: "table"]
```

![querySimple example](https://raw.githubusercontent.com/wiki/SAP-samples/hana-developer-cli-tool-example/images/querySimple.gif)

### cds

```shell
hana-cli cds [schema] [table]

Display a DB object via CDS

Options:
  -a, --admin, --Admin        Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  -t, --table, --Table        Database Table                            [string]
  -s, --schema, --Schema      schema    [string] [default: "**CURRENT_SCHEMA**"]
  -v, --view, --View          CDS processing for View instead of Table
                                                      [boolean] [default: false]
      --useHanaTypes, --hana  Use SAP HANA-Specific Data Types See (https://cap.
                              cloud.sap/docs/cds/cdl#predefined-types)
                                                      [boolean] [default: false]
```

### massConvert

```shell
hana-cli massConvert [schema] [table]

Convert a group of tables to CDS or HDBTable format

Options:
  -a, --admin, --Admin        Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  -t, --table, --Table        Database Table             [string] [default: "*"]
  -s, --schema, --Schema      schema    [string] [default: "**CURRENT_SCHEMA**"]
  -l, --limit                 Limit results              [number] [default: 200]
  -f, --folder, --Folder      DB Module Folder Name     [string] [default: "./"]
  -n, --filename, --Filename  File name                                 [string]
  -o, --output, --Output      Output Format for inspection
                          [string] [choices: "hdbtable", "cds"] [default: "cds"]
      --useHanaTypes, --hana  Use SAP HANA-Specific Data Types See (https://cap.
                              cloud.sap/docs/cds/cdl#predefined-types)
                                                      [boolean] [default: false]
```

### serviceKey

```shell
hana-cli serviceKey [instance] [key]

Connect and write default-env.json via cf/xs service key

Options:
  --instance, -i, --Instance                CF/XS Service Instance Name
  --encrypt, -e, --Encrypt, --ssl           Encrypt connections (required for
                                            SAP HANA Cloud and SAP HANA service for SAP BTP)
                                                      [boolean] [default: true]
  --validate, -v, --Validate,               Validate Certificate
  --validateCertificate                               [boolean] [default: false]
  --cf, --cmd                               Cloud Foundry?
                                                      [boolean] [default: true]
  --save, -s, --Save                        Save Credentials to
                                            default-env.json
                                                       [boolean] [default: true]
```

### openDBX

```shell
hana-cli opendbx

Open DB Explorer

Options:
  --admin, -a, --Admin  Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
```

### readme

```shell
hana-cli readme

Open Readme Documentation in browser
```

### changelog

```shell
hana-cli changelog

Open Change Log in browser
```

### copy2DefaultEnv

```shell
hana-cli copy2DefaultEnv                  Copy .env contents to
                                          default-env.json and reformat
     [aliases: copyDefaultEnv, copyDefault-Env, copy2defaultenv, copydefaultenv,
                                                                copydefault-env]
```

### copy2Env

```shell
hana-cli copy2Env

Copy default-env.json contents to .env and reformat

Options:
  -a, --admin, --Admin  Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
```

### completion

```shell
hana-cli completion
generate completion script for bash shell
```

### hc

```shell
  hana-cli hc [name]                        List all SAP HANA Cloud instances in
                                            your target Space
                  [aliases: hcInstances, instances, listHC, listhc, hcinstances]
```

### hdi

```shell
hana-cli hdi

List all SAP HANA Cloud HDI service instances in your target Space
```

### ups

```shell
hana-cli ups

List all Cloud Foundry user provided service instances in your target Space
```

### hcStart

```shell
  hana-cli hcStart [name]                   Start SAP HANA Cloud instance
                                             [aliases: hcstart, hc_start, start]
```

### hcStop

```shell
  hana-cli hcStop [name]                    Stop SAP HANA Cloud instance
                                                [aliases: hcstop, hc_stop, stop]
```

## How to obtain support

This project is provided "as-is": there is no guarantee that raised issues will be answered or addressed in future releases.

## License

Copyright (c) 2020 SAP SE or an SAP affiliate company. All rights reserved.
This project is licensed under the Apache Software License, v. 2 except as noted otherwise in the [LICENSE](LICENSES/Apache-2.0.txt) file.
