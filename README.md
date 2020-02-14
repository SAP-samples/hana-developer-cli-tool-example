# hana-developer-cli-tool-example
HANA Developer Command Line Interface

## Description
This sample is intended to shown how one could build a developer centric HANA command line tool, particularly  designed to be used when performing local HANA development in non-SAP tooling (like VSCode).  It utilizes the default-env.json that is often used in local development for connectivity to a remote HANA DB (although it can of course be used with a local HANA Express instance as well). There is no intention to replacing the hdbsql tool as a generic SQL console. Instead this sample will focus on simplifying and grouping common and complex commands that otherwise might a lot of separate scripts. 

Introduction Video: [https://www.youtube.com/watch?v=FWOo_mm0sfQ](https://www.youtube.com/watch?v=FWOo_mm0sfQ)

## Requirements / Download and Installation
[![asciicast](https://asciinema.org/a/301560.svg)](https://asciinema.org/a/301560)
* Install Node.js version 10.x or 12.x on your development machine [https://nodejs.org/en/download/](https://nodejs.org/en/download/)

* Add the SAP Registry to your NPM configuration
```
npm config set @sap:registry=https://npm.sap.com
```
* Clone the repositry from [https://github.com/SAP-samples/hana-developer-cli-tool-example](https://github.com/SAP-samples/hana-developer-cli-tool-example)
```
git clone https://github.com/SAP-samples/hana-developer-cli-tool-example
```
* Run NPM install from the root of the hana-developer-cli-tool-example project you just cloned to download dependencies
```
npm install
```
* Run NPM link from the cloned project root to make the hana-cli command available from everywhere [https://docs.npmjs.com/cli/link](https://docs.npmjs.com/cli/link)
```
npm link
```

## Security
This appplication primarily uses the default-env.json that is often used in local development for connectivity to a remote HANA DB (although it can of course be used with a local HANA Express instance as well). For more details on how the default-env.json works, see the readme.md of the @sap/xsenv package or the @sap/hdi-deploy package.

## Examples
A lot of the functionaltiy of this tool revolves around typical tasks you face while doing HANA database development. 
For example you might want to get a list of all views in your current schema/container:
```
C:\github\hana-xsa-opensap-hana7\user_db>hana-cli views
Schema: OPENSAP_HANA_USER, View: *
SCHEMA_NAME        VIEW_NAME                                    VIEW_OID  COMMENTS
-----------------  -------------------------------------------  --------  ------------
OPENSAP_HANA_USER  user.models::USER_DETAILS                    171133    USER_DETAILS
OPENSAP_HANA_USER  user.models::USER_DETAILS/hier/USER_DETAILS  171139    null
```
Then perhaps you want to insepect a view to see the columns and their data types:
```
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
But there are multiple output options for inspection. Perhaps you are using Cloud Applciation Programming Model and need to create a proxy entity in CDS for a view. This tool will read the catalog metadata and convert it to CDS:
```
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
```
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
This tool will even create a temporary OData V4 service for any existing table, view or Calcuation View and launch a test Fiori Ui locally.
![Fioir Example](images/ex1.png)
## Commands
### version
```
hana-cli version
Version details
```
### connect
```
hana-cli connect [user] [password]

Connects to a HANA DB and writes connection information to a default-env-admin.json

Options:
  --connection, -n                    Connection String  <host>[:<port>]
  --user, -u, --User                  User
  --password, -p, --Password          Password
  --userstorekey, -U, --UserStoreKey  Optional: HDB User Store Key - Overrides
                                      all other Connection Parameters
  --save, -s, --Save                  Save Credentials to default-env-admin.json
                                                       [boolean] [default: true]
```
### status
```
hana-cli status

Get Connection Status

Options:
  --admin, -a, --Admin  Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
```
### hdbsql
```
hana-cli hdbsql

Launch the hdbsql tool (if installed separately) using the locally persisted
credentials default-env*.json

Options:
  --admin, -a, --Admin  Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
```
### activateHDI
```
hana-cli activateHDI [tenant]

Activate the HDI service in a particluar HANA Tenant (Must be ran in the
SYSTEMDB)

Options:
  --admin, -a, --Admin    Connect via admin (default-env-admin.json)
                                                       [boolean] [default: true]
  --tenant, -t, --Tenant  HANA Tenant                                   [string]
```
### adminHDI
```
hana-cli adminHDI [user] [password]

Create an Admin User for HDI

Options:
  --admin, -a, --Admin        Connect via admin (default-env-admin.json)
                                                       [boolean] [default: true]
  --user, -u, --User          User
  --password, -p, --Password  Password
```
### adminHDIGroup
```
hana-cli adminHDIGroup [user] [group]

Add a User as an HDI Group Admin

Options:
  --admin, -a, --Admin  Connect via admin (default-env-admin.json)
                                                       [boolean] [default: true]
  --user, -u, --User    User
  --group, -g, --Group  HDI Group       [string] [default: "SYS_XS_HANA_BROKER"]
```
### createXSAAdmin
```
hana-cli createXSAAdmin [user] [password]

Create a HANA DB User which is also an XSA Admin

Options:
  --admin, -a, --Admin        Connect via admin (default-env-admin.json)
                                                       [boolean] [default: true]
  --user, -u, --User          User
  --password, -p, --Password  Password
```
### createContainer
```
hana-cli createContainer [container]

Create an HDI Container and populate connection details into default-env.json

Options:
  --admin, -a, --Admin          Connect via admin (default-env-admin.json)
                                                       [boolean] [default: true]
  --container, -c, --Container  HDI Container Name                      [string]
  --save, -s, --Save            Save Credentials to default-env.json
                                                       [boolean] [default: true]
```
### dropContainer
```
hana-cli dropContainer [container]

Drop HDI container and clean up HDI Container users

Options:
  --admin, -a, --Admin          Connect via admin (default-env-admin.json)
                                                       [boolean] [default: true]
  --container, -c, --Container  HDI Container Name                      [string]
```    
### reclaim
```
hana-cli reclaim

Reclaim LOB, Log, and Data Volume space

Options:
  --admin, -a, --Admin  Connect via admin (default-env-admin.json)
                                                       [boolean] [default: true]
```
### massUsers
```
hana-cli massUsers [user] [password]

Mass Create 50 Developer Users (for workshops)

Options:
  --admin, -a, --Admin        Connect via admin (default-env-admin.json)
                                                       [boolean] [default: true]
  --user, -u, --User          User
  --password, -p, --Password  Password
```
### inspectTable
```
hana-cli inspectTable [schema] [table]

Return metadata about a DB table

Options:
  --admin, -a, --Admin    Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --table, -t, --Table    Database Table                                [string]
  --schema, -s, --Schema  schema        [string] [default: "**CURRENT_SCHEMA**"]
  --output, -o, --Output  Output Format for inspection
   [string] [choices: "tbl", "sql", "cds", "json", "yaml", "cdl", "edm", "edmx",
                                                        "swgr"] [default: "tbl"]
```
### inspectView
```
hana-cli inspectView [schema] [view]

Return metadata about a DB view

Options:
  --admin, -a, --Admin    Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --view, -v, --View      Database View                                 [string]
  --schema, -s, --Schema  schema        [string] [default: "**CURRENT_SCHEMA**"]
  --output, -o, --Output  Output Format for inspection
   [string] [choices: "tbl", "sql", "cds", "json", "yaml", "cdl", "edm", "edmx",
                                                        "swgr"] [default: "tbl"]
```
### systemInfo
```
hana-cli systemInfo

General System Details

Options:
  --admin, -a, --Admin  Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
```                                                      
### schemas
```
hana-cli schemas [schema]

Get a list of all schemas

Options:
  --admin, -a, --Admin       Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --schema, -s, --schemas    schema                      [string] [default: "*"]
  --limit, -l                Limit results               [number] [default: 200]
  --all, --al, --allSchemas  allSchemas               [boolean] [default: false]
```
### tables
```
hana-cli tables [schema] [table]

Get a list of all tables

Options:
  --admin, -a, --Admin    Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --table, -t, --Table    Database Table                 [string] [default: "*"]
  --schema, -s, --Schema  schema        [string] [default: "**CURRENT_SCHEMA**"]
  --limit, -l             Limit results                  [number] [default: 200]
```
### views
```
hana-cli views [schema] [view]

Get a list of all views

Options:
  --admin, -a, --Admin    Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --view, -v, --View      Database View                  [string] [default: "*"]
  --schema, -s, --Schema  schema        [string] [default: "**CURRENT_SCHEMA**"]
  --limit, -l             Limit results                  [number] [default: 200]
```
### objects
```
hana-cli objects [schema] [object]

Search across all object types

Options:
  --admin, -a, --Admin    Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --object, -o, --Object  DB Object                      [string] [default: "*"]
  --schema, -s, --Schema  schema        [string] [default: "**CURRENT_SCHEMA**"]
  --limit, -l             Limit results                  [number] [default: 200]
```
### procedures
```
hana-cli procedures [schema] [procedure]

Get a list of all stored procedures

Options:
  --admin, -a, --Admin          Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --procedure, -p, --Procedure  Stored Procedure         [string] [default: "*"]
  --schema, -s, --Schema        schema  [string] [default: "**CURRENT_SCHEMA**"]
  --limit, -l                   Limit results            [number] [default: 200]
```
### inspectProcedure
```
hana-cli inspectProcedure [schema] [procedure]

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
### callProcedure
```
hana-cli callProcedure [schema] [procedure]

Call a stored procedure and display the results

Options:
  --admin, -a, --Admin                Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --procedure, -p, --Procedure, --sp  Stored Procedure                  [string]
  --schema, -s, --Schema              schema
                                        [string] [default: "**CURRENT_SCHEMA**"]
```
### functions
```
hana-cli functions [schema] [function]

Get a list of all functions

Options:
  --admin, -a, --Admin        Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --function, -f, --Function  Function                   [string] [default: "*"]
  --schema, -s, --Schema      schema    [string] [default: "**CURRENT_SCHEMA**"]
  --limit, -l                 Limit results              [number] [default: 200]
```  
### inspectFunction
```
hana-cli inspectFunction [schema] [function]

Return metadata about a Function

Options:
  --admin, -a, --Admin        Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --function, -f, --Function  Function                                  [string]
  --schema, -s, --Schema      schema    [string] [default: "**CURRENT_SCHEMA**"]
  --output, -o, --Output      Output Format for inspection
                               [string] [choices: "tbl", "sql"] [default: "tbl"]
``` 
### libraries
```
hana-cli libraries [schema] [library]

Get a list of all libraries

Options:
  --admin, -a, --Admin         Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --library, --lib, --Library  Library                   [string] [default: "*"]
  --schema, -s, --Schema       schema   [string] [default: "**CURRENT_SCHEMA**"]
  --limit, -l                  Limit results             [number] [default: 200]
```
### inspectLibrary
```
hana-cli inspectLibrary [schema] [library]

Return metadata about a Library

Options:
  --admin, -a, --Admin         Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --library, --lib, --Library  Library                                  [string]
  --schema, -s, --Schema       schema   [string] [default: "**CURRENT_SCHEMA**"]
  --output, -o, --Output       Output Format for inspection
                               [string] [choices: "tbl", "sql"] [default: "tbl"]
```
### inspectLibMember
```
hana-cli inspectLibMember [schema] [library] [libraryMem]

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
### triggers
```
hana-cli triggers [schema] [trigger] [target]

List of all triggers

Options:
  --admin, -a, --Admin      Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --trigger, -t, --Trigger  Sequence                     [string] [default: "*"]
  --target, --to, --Target  Target object                [string] [default: "*"]
  --schema, -s, --Schema    schema      [string] [default: "**CURRENT_SCHEMA**"]
  --limit, -l               Limit results                [number] [default: 200]
```
### inspectTrigger
```
hana-cli inspectTrigger [schema] [trigger]

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
```
hana-cli indexes [schema] [indexes]

Get a list of indexes

Options:
  --admin, -a, --Admin      Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --indexes, -i, --Indexes  Function                     [string] [default: "*"]
  --schema, -s, --Schema    schema      [string] [default: "**CURRENT_SCHEMA**"]
  --limit, -l               Limit results                [number] [default: 200]
```
### inspectIndex
```
hana-cli inspectIndex [schema] [index]

Return metadata about an Index

Options:
  --admin, -a, --Admin    Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --index, -i, --Index    DB Table Index                                [string]
  --schema, -s, --Schema  schema        [string] [default: "**CURRENT_SCHEMA**"]
```  
### synonyms
```
hana-cli synonyms [schema] [synonym] [target]

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
### privilegeError
```
hana-cli privilegeError [guid]

Get Insufficient Privilege Error Details

Options:
  --admin, -a, --Admin  Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --guid, -g, --error   GUID from original error message                [string]
```
### certificates
```
hana-cli certificates

List System Certificates

Options:
  --admin, -a, --Admin  Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
```
### dataTypes
```
hana-cli dataTypes

List of HANA Data Types and their technical details

Options:
  --admin, -a, --Admin  Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
```
### users
```
hana-cli users [user]

Get a list of all users

Options:
  --admin, -a, --Admin  Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --user, -u, --User    User                             [string] [default: "*"]
  --limit, -l           Limit results                    [number] [default: 200]
```
### inspectUser
```
hana-cli inspectUser [user]

Return metadata about a User

Options:
  --admin, -a, --Admin  Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --user, -u, --User    User                                            [string]
```
### dataVolumes
```
hana-cli dataVolumes

Details about the HANA Data Volumes

Options:
  --admin, -a, --Admin  Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
```
### disks
```
hana-cli disks

Details about disk devices used by HANA

Options:
  --admin, -a, --Admin  Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
```    
### features
```
hana-cli features

HANA Features and Version

Options:
  --admin, -a, --Admin  Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
``` 
### featureUsage 
```
hana-cli featureUsage

Usage Statistics by Feature

Options:
  --admin, -a, --Admin  Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
```
### hostInformation
```
hana-cli hostInformation

Host technical details

Options:
  --admin, -a, --Admin  Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
```
### iniFiles
```
hana-cli iniFiles

iniFiles

Options:
  --admin, -a, --Admin  Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
```
### iniContents
```
hana-cli iniContents [file] [section]

Contents of INI Configuration (filtered by File Name)

Options:
  --admin, -a, --Admin      Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --file, -f, --File        File Name                    [string] [default: "*"]
  --section, -s, --Section  Section                      [string] [default: "*"]
  --limit, -l               Limit results                [number] [default: 200]
```
### sequences
```
hana-cli sequences [schema] [sequence]

Get a list of all squences

Options:
  --admin, -a, --Admin           Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --sequence, --seq, --Sequence  Sequence                [string] [default: "*"]
  --schema, -s, --Schema         schema [string] [default: "**CURRENT_SCHEMA**"]
  --limit, -l                    Limit results           [number] [default: 200]
```
### traces
```
hana-cli traces

List all trace files

Options:
  --admin, -a, --Admin  Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
```     
### traceContents
```
hana-cli traceContents [host] [file]

Contents of a selected trace file - Reading from the end of the file backwards

Options:
  --admin, -a, --Admin  Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --host, --ho, --Host  Hostname                                        [string]
  --file, -f, --File    File Name                                       [string]
  --limit, -l           Limit results                   [number] [default: 2000]
```      
### roles
```
hana-cli roles [schema] [role]

Get a list of roles

Options:
  --admin, -a, --Admin    Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --role, -r, --Role      Database Role                  [string] [default: "*"]
  --schema, -s, --Schema  schema        [string] [default: "**CURRENT_SCHEMA**"]
  --limit, -l             Limit results                  [number] [default: 200]
```
### querySimple
```
hana-cli querySimple

Execute single SQL command and output results

Options:
  --admin, -a, --Admin  Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --query, -q, --Query  SQL Statement                                   [string]
```
### cds
```
hana-cli cds [schema] [table]

Display a DB object via CDS

Options:
  --admin, -a, --Admin    Connect via admin (default-env-admin.json)
                                                      [boolean] [default: false]
  --table, -t, --Table    Database Table                                [string]
  --schema, -s, --Schema  schema        [string] [default: "**CURRENT_SCHEMA**"]
  --view, -v, --View      CDS processing for View instead of Table
                                                      [boolean] [default: false]
```  
## How to obtain support
This project is provided "as-is": there is no guarantee that raised issues will be answered or addressed in future releases.

## License

Copyright (c) 2019 SAP SE or an SAP affiliate company. All rights reserved.
This project is licensed under the SAP Sample Code License except as noted otherwise in the [LICENSE](LICENSE) file.
