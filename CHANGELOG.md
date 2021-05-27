# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/).

## 2.202105.10
- Merge [mass rename](https://gist.github.com/ThePlenkov/2fc31e05a43a4ec395c9a4d8f6c8276a#gistcomment-3759807) from [@ThePlenkov](https://github.com/ThePlenkov) 
  
## 2.202105.9

### Added
- New functionality for massConvert command to also generate hdbsynonyms. [Generate hdbsynonyms along with CDS for massConvert operation #48](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/48) - thanks to [@ThePlenkov](https://github.com/ThePlenkov)
- Add "no colons" mode for massConvert. This is an option to remove :: from namespaces which would complicate usage from CAP CDS. :: will be replaced by dot. [no colons mode for massConvert #50](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/50) - thanks to [@ThePlenkov](https://github.com/ThePlenkov)
- [Exclude user defined types from generated CDS](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/51) in massConvert - thanks to [@ThePlenkov](https://github.com/ThePlenkov)
- cds command wasn't using the new connection information lookup logic
  
## 2.202105.8

### Added
- Added hana client disconnect at error and normal end conditions to avoid segmentation fault in WSL and slightly older versions of Node.js - thanks to [sbarzaghialteaup](https://github.com/sbarzaghialteaup)
- First round of TypeScript types inclusion - more to come. Will mostly help project maintainers
  
## 2.202105.6

### Changed
 - Missing npm shrinkwrap in last release
 - Improved details in thrown errors and added debug info from util/cf and util/xs
 - hana-cli version now reports latest avaialble version on npm and propmpts users to upgrade if they are outdated

## 2.202105.5

### Added
- [Issue #42 Optional namespace for generated cds](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/42) - thanks to [@ThePlenkov](https://github.com/ThePlenkov)
- @cds dependency updated to May 2021 release 5.1.4
- Update cds preview to UI5 1.89.0
- cds preview new parameter to allow use to choose HTTP port (and validate that input)
- serviceKey command no longer requires to pre-create the service key. If the key you specify doesn't exist it will call cf/xs create-service-key for you automatically [Issue #41](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/41)
- Increase the page size for the xs/cf services commands (ups and hdi) [Issue #40](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/40)

## 2.202105.4

### Added
- [Issue #39 - Add support for HANA XSA in the UPS and HDI commands](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/39)
- [Issue #38 - Add support for hdbmigrationtable in massConvert and inspectTable](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/38)
- Add option useCatalogPure to massConvert command. Defaults to false and uses the cds.compile api to produce its hdbtable or hdbmigrationtable output. When set to true it will instead use the HANA SYS.GET_OBJECT_DEFINITION which includes more metadata but might produce results which are incompatible with HDI
- Remove the Schema from output of massConvert commands

## 2.202105.3

### Changed
- Upgraded dependencies @sap/cds to 5.1, @sap/hana-client to 2.8.20, and @sap/hdbext to 7.2.0
- Add User Admin and Role Admin grants to the adminHDI and adminHDIGroup commands for XSA
  
## 2.202105.2

### Added
- quiet output added to most commands allowing for a wide range of scripted usage of the tool overall
  
## 2.202105.1

### Fixed
- copy2DefaultEnv fix to support hanatrial (old HaaS offering) but produce a warning that people should consider using SAP HANA Cloud trial instead
- Fix not a function error in inspectView with output option of openapi
  
### Added
- swagger-jsdoc output format, which is actually commented YAML version of openAPI, added to inspectTable and inspectView

## 2.202104.2

### Changed
- Match the @sap/hdbext and @sap/hana-client versions exactly to remove duplicate copies of the HANA Client in node_modules removing about 135Mb from the footprint of this tool overall
- Major internal refactoring to streamline the code and reduce duplication. Reusable base code for basic handling of Yargs and Prompts. Consistent error handling and other general stability improvments
- The default-env*.json file no longer needs to be in the same directory in which you are running the command.  If not found in the current directory, the tool will search in up to 5 parent directories to find it
- New parameter --conn added to most commands that allow you specify any filename you want to override the default-env.json. conn can specify a file in the current directory, up to 5 parent directories or in your ${homedir}/.hana-cli/ folder
- New parameter --quiet that disables extra output and human readable formatting for when you want to script commands and get pure results output
- New parameter --debug - for troubleshooting of the hana-cli tool itself. It will produce a LOT of detailed output. Nice if you are curious what queries are being sent to SAP to fullfill a command
- Options in the help are now grouped by Conneciton Parameters, Troubleshooting, and Options
- New order of processing for making connections.
  - First we look for the Admin option and use a default-env-admin.json - this overrides all other parameters
  - If no admin option or if there was an admin option but no default-env-admin.json could be found in this directory or 5 parent directories then look for a .env file in this directory or up to 5 parent directories
  - No .env file found or it doesn't contain a VCAP_SERVICES section, then check to see if the --conn parameter was specified. If so check for that file in the current directory or up to 5 parent directories
  - If the file specified via the --conn parameter wasn't found locally then check for it in the ${homedir}/.hana-cli/ folder
  - If no specific configuration file was was found then look for a file named default-env.json in the current directory or up to 5 parent directories
  - Last resort if nothing has been found up to this point - look for a file named default.json in the ${homedir}/.hana-cli/ folder
## 1.202104.2
### Added
- Add Syntax Highlighting to various command outputs
  
## 1.202104.1

### Added
- New Inspect* output options for sqlite, hdbtable, hdbview and hdbcds
  
### Changed
- Upgrade to @sap/cds 5.x
- Drop support for Node.js version 10
- cds preview updated to SAPUI5 1.88.1
  
### Fixed
- connect command now prompts for Encyrypt setting
  
## 1.202103.4

### Added
- New command copy2Secrets to rewrite default-env.json as K8S Secrets format expected by @sap/xsenv - Pull Request [35](https://github.com/SAP-samples/hana-developer-cli-tool-example/pull/35) - thanks to [@ThePlenkov](https://github.com/ThePlenkov)
  
## 1.202103.3

### Added
- querySimple now allows output to a file and supports table, json, and Excel output formats Issue [#30](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/30)

### Changed
- README.md was reorganized to list all commands alphabetical Issue [#31](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/31)


## 1.202103.2

### Added
- Option to massConvert, inspectTable, inspectView, and cds to use HANA native data types if no CAP CDS direct conversion can be made. Issue [#27](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/27) - thanks to [@ThePlenkov](https://github.com/ThePlenkov)

### Fixed 
- Decimal types without decismals generates CDS Error. Issue [#29](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/29) - thanks to [@ThePlenkov](https://github.com/ThePlenkov)

## 1.202103.1

### Added
- New commands: changes & readme - output the CHANGELOG.md and README.md to the CLI
- Issue [#25](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/25) - Add filename option to massConvertion Operation - thanks to [@ThePlenkov](https://github.com/ThePlenkov)
  
### Changed
- Updated several dependent modules including hana-client
- Put hana-cli on a diet and removed some old module dependencies no longer used. Especially the openAPI related ones which had functionality now offered by CAP directly
- help command now lists all commands in alphabetical order

## 1.202102.4

### Added
- HANA 1.0 Support - Issue [#22](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/22)
  
## 1.202102.3

### Added

- Updated @sap/textbundle
- Add readme command that opens ReadMe Documentation in your browser
- Add changelog command that opens Change Log in your browser
- Formatting of output copy2DefaultEnv improved for compatibility to CAP cds run 
- New command copy2Env - copy default-env.json to .env and reformat contents
- Support for HANA Cloud Instance Administration - requires cf cli to be installed and you must be logged into cf with a target org and space
  - Added Command: hdi to list all SAP HANA Cloud HDI container instances in your target space
  - Added Command: ups to list all Cloud Foundry user provided service instances in your target space
- Switch to the standard CAP Compile to openAPI in inspectTable, inspectView and cds commands. Now supports entity diagrams in the Swagger UI

## 1.202102.2

### Added

- Updated @sap/cds to 4.5.x
- Support for HANA Cloud Instance Administration - requires cf cli to be installed and you must be logged into cf with a target org and space
  - Added Command: hc to list all SAP HANA Cloud instances in your target space
  - Added Command: hcStart to Start SAP HANA Cloud instance
  - Added Command: hcStop to Stop SAP HANA Cloud instance

## 1.202102.1

### Fixed

- serviceKey cf default was incorrect
  
## 1.202101.3

### Changed

- Renaming to match new SAP Business Technology Platform branding
- Minor dependent package version updates

## 1.202101.2

### Changed

- Default value on createModule command changed to SAP HANA Cloud
- Remove postinstall build script from SAP HANA Cloud option - only needed in SAP Web IDE
  
## 1.202101.1

### Fixed

- Update *@sap/hana-client* to v2.7.16, *@sap/cds* to 4.4.7 and *sap-hdbext-promisfied* to 2.202101
- Correct dump if you run *hana-cli* with no commmand, no defaults to *help* command
- Correct error when using .env for connections and there are multiple SAP HANA and User Provided Services both in the configuration
- Correct openDBX command in SAP Business Application Studio when using .env for connections

### Added

- Node.js 14.x support
- New command copy2DefaultEnv - which copies a .env file to default-env.json and reformats the content. Designed for SAP Business Application Studio and the HANA tooling where a .env file is generated by a binding but CAP still requires a default-env.json for testing
