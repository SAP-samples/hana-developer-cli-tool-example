# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/).

## [3.202304.1] - 2023-04-07

**Changed**

- Update [CAP to March 2023](https://cap.cloud.sap/docs/releases/march23) and [SAPUI5 to 1.112.1](https://sapui5.hana.ondemand.com/#/topic/34afc69bf9194d43a9f49042825bb199)

## [3.202303.3] - 2023-03-16

**Changed**

- Issue [#105](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/105) hc, hcstart, and hcstop commands only work with installed btp cli - fixed by [HP Seitz](https://github.com/6of5)

## [3.202303.2] - 2023-03-13

**Changed**

- Issue [#104](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/104) noColons option in inspectTable
- Issue [#104](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/104) massConvert include user defined types

## [3.202303.1] - 2023-03-03

**Changed**

- External Dependency Updates - CDS to 6.6.0 (Feb 2023 Update) and SAPUI5 to 1.111.0
- Switch to Glob 9.x
- Fix CDS Exit Handler

## [3.202302.5] - 2023-02-17

**Changed**

- Complete Feature Request [Issue 100](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/100) Add Views to massConvert
- Equalize the interface and parameters between inspectTable and inspectView
- Add new parameters to massConvert to allow logging errors and continue processing rather than stopping on error
- Add list Views to the Web UI
- Add inspectView to the Web UI
- Add link between Views and inspectView in the Web UI
- External Dependency Updates - CDS-DK to 6.5.2 and SAPUI5 to 1.110.1
- Add progress bar to the massConvert command in the terminal
- Add new fancy table output based upon terminal-kit

## [3.202302.4] - 2023-02-14

**Changed**

- Fix [Issue 102](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/102) cds compile to sqlite no longer supports quoted

## [3.202302.3] - 2023-02-10

**Changed**

- Change CDS DEFAULT delimited identifier [Issue 98](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/98)

## [3.202302.1] - 2023-02-03

**Changed**

- Lazy Load dependent modules to reduce initial command processor boot time - 10x performance improvement
- CAP Upgrade to Jan 2023 - 6.5.0 version
- Switch to @json2csv/node as json2csv is abandoned
- New 'sub' command to list all active BTP Subscriptions and their URLs
- New 'btpInfo' command to list detailed information about th btp CLI target
- New 'issue' command to create GitHub issue preloaded with technical details
- version command now returns information about @sap/cds-dk, the cf cli, and the btp cli

## [3.202301.1] - 2023-01-17

**Changed**

- Add support for using btp CLI
- Allows managing HANA Cloud instances that are multi-environment (not managed by Cloud Foundry) - hc, start, stop commands
- New command: bas - Allows launch the Business Application Studio from the hana-cli
- New command: btp - Add helper to target BTP Sub Account
- Improved HANA Cloud Information Formatting
- Use BTP CLient Config Environment Variable
- Parallel Loading of all cli commands for performance improvements
- Updated devcontainer configuration
- Proper handling if btp CLI is not installed on target machine
- Fix btp CLI config lookup on Linux

## [3.202212.2] - 2022-12-19

**Changed**

- CAP December 2022 Release
- Switch to @cap-js/graphql [Open Source GraphQL Adapter](https://cap.cloud.sap/docs/releases/dec22#open-source-graphql-adapter)
- SAPUI5 to version 109.3

## [3.202212.1] - 2022-12-01

**Changed**

- Remove the quoted naming as the default and instead put it behind an optional parameter [Issue #90](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/90)
- CAP October 2022 Release
- SAPUI5 to version 109.0
- New Node.js minimal version is 14.18

## [3.202210.2] - 2022-10-17

**Changed**

- CAP September 2022 Release
- SAPUI5 to version 107.0
- Support New CAP Integer Types - TINYINT UInt8 and SMALLINT Int16
- Support for Postgres in Inspect Table and View
- Default Values Support [Issue #87](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/87)

## [3.202209.3] - 2022-09-26

**Changed**

- [Fix for Calculation Views when Non-Qualified Name - / instead of ::](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/83)
- Add support for useExists default to true. Allows you choose during inspect and massConvert if you want the persistence exists annotations on the output. [Issue 84](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/84)

## [3.202209.2] - 2022-09-23

**Changed**

- [Improved support for Repository based Calculation Views](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/83)

## [3.202209.1] - 2022-09-19

**Changed**

- Update Dependencies
- [First version of support for Calculation View metadata in inpsectView - no input parameters yet](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/83)
- Update to SAPUI5 1.106

## [3.202208.1] - 2022-08-15

**Changed**

- Update to SAP Cloud Application Programming Model 6.1
- Adjust cds command read exit logic for [changes in 6.1](https://cap.cloud.sap/docs/releases/aug22#changes-in-node-js)
- Update to SAPUI5 1.105

## [3.202207.1] - 2022-07-05

**Changed**

- Update to SAP Cloud Application Programming Model 6.0 (including switch to GraphQL GA version as well as other technical optimizations)

## [3.202205.4] - 2022-05-20

**Changed**

- Add connection support for [`cds bind`](https://cap.cloud.sap/docs/advanced/hybrid-testing#bind-to-cloud-services) and the resulting `.cdsrc-private.json`. Note this will make each command take a few seconds longer as credentials are no longer stored locally but looked up from cf or k8s dynamically with each command

## [3.202205.3] - 2022-05-12

**Changed**

- [Issue 74 fixed](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/74) by [Meyer-J](https://github.com/Meyer-J)
- [Issue 75 fixed](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/75) by [Meyer-J](https://github.com/Meyer-J)
- Initial support for Node.js 18. Technically some of the inner modules don't support 18. We've tested many scenarios of this tool with 18. Use at your own risk.
- Minor dependency updates

## [3.202205.1] - 2022-05-09

**Changed**

- [Add support for container groups](https://github.com/SAP-samples/hana-developer-cli-tool-example/pull/73) by [Meyer-J](https://github.com/Meyer-J)
- Remove support for Node.js 12 as it is End of Life as of the end of April 2022
- Minor dependency updates

## [3.202203.3] - 2022-03-31

**Changed**

- Update to [CAP March 2022 5.9](https://cap.cloud.sap/docs/releases/mar22)
- Update to [SAPUI5 1.100](https://sapui5.hana.ondemand.com/1.100.0/#/topic/5deb78f36022473487be44cb3a71140a)
- Web UI now uses OS setting and adjusts to dark theme - new sap_horizon_dark

## [3.202203.2] - 2022-03-22

**Changed**

- Fix for connect and incorrect options format for hdb module
- CDS output escape quotes within comments

## [3.202203.1] - 2022-03-11

**Changed**

- Various minor dependency updates in used packages
- SAPUI5 update to 1.99.0

## [3.202202.1] - 2022-02-04

**Changed**

- Update @sap/cds to Feb 2022 release - 5.8.0
- inspectTable and inspectView now support graphQL output (CDS Experimental Option)
- systemInfo new output options - env (display environment connection as JSON) or dbx (display connection details ready to input in the new Database Explorer VSCode Extension)

## [3.202201.1] - 2022-01-25

**Changed**

- Major New Version: Remove dependency upon @sap/hdbext and @sap/hana-client. Replaced with smaller footprint hdb module.

## [2.202201.9] - 2022-01-11

**Changed**

- Update the Web UI Web Assistant feature to work with the experimental SAP Horizon theme
- GraphQL option of cds command now fully works and cross references entity name in the exit correctly

## [2.202201.8] - 2022-01-10

**Changed**

- Fix [Issue #66](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/66) - account for different return JSON in cf service-key depending upon if the cf cli is ver 7 or ver 8

## [2.202201.7] - 2022-01-10

**Changed**

- Replace Node.js module colors with chalk [https://www.bleepingcomputer.com/news/security/dev-corrupts-npm-libs-colors-and-faker-breaking-thousands-of-apps/](https://www.bleepingcomputer.com/news/security/dev-corrupts-npm-libs-colors-and-faker-breaking-thousands-of-apps/)

## [2.202201.1] - 2022-01-07

**Changed**

- Updates to support SAP BTP Free Tier and the hana-free service plan
- createModule command update package.json it produces to support newer versions of Node.js
- Version dependency updates @sap/hdbext 7.5, @sap/hana-client 2.11.14, @sap/cds to 5.7.4 and SAPUI5 to 1.97.1

## [2.202112.1] - 2021-12-01

**Changed**

- Upgrade dependencies @sap/hdbext 7.4.1, @sap/hana-client 2.10.20, @sap/cds to 5.6.4 and SAPUI5 to 1.96.1
- Add first support for GraphQL Experimental (queries don't exit and cross reference table name yet)
- Switch to SAP_HORIZON new visual theme
- Support for Node.js 16.x although you might see some warnings for inner packages upon install

## [2.202110.1] - 2021-10-25

**Changed**

- Upgrade dependencies @sap/hdbext 7.4, @sap/hana-client 2.10.x, @sap/cds to 5.5.5 and SAPUI5 to 1.95.0

## [2.202109.2] - 2021-09-10

**Changed**

- Tested and made fixes for upcomming Node.js 16.x support. Tested under Node.js 16.9.0. You can use with Node.js 16, but will receive installation warnings and a warning on each command as the inner SAP supplied modules are technically not validated or supported yet on Node.js 16. However my local tests have been sucessful after some minor code changes. We will offically support Node.js 16 as soon as key SAP inner modules do as well
- Upgrade dependencies @sap/cds to 5.4.4 and SAPUI5 to 1.94.0
- New Command querySimpleUI - browser based UI for executing single SQL Statements

## [2.202109.1] - 2021-09-03

**Changed**

- Added status of hana cloud instance to output of command hc by [sbarzaghialteaup](https://github.com/sbarzaghialteaup) [Pull Request 64](https://github.com/SAP-samples/hana-developer-cli-tool-example/pull/64)
- Optimize performance for the inspectTable feature in the Browser based UI
- Switch to the UI5 CodeEditor for output in the inspectTable command in the Browser

## [2.202108.4] - 2021-08-25

**Changed**

- querySimple Export to CSV Format feature added by [sbarzaghialteaup](https://github.com/sbarzaghialteaup)
- Update Dependencies - especially HANA Client to 2.9.28
- Update to SAPUI5 1.93.0
- Convert entire project to ECMAScript Modules (ESM) - this is a massive internal change and we appologize in advance if it results in any instablity. If you hit any issues please report then you can target specifically the last version until they are resolved

## [2.202108.1] - 2021-08-06

**Changed**

- Update dependencies - especially SAP Cloud Application Programming Model to 5.4.1
- Trimmed several unused dependencies in an effort to keep hana-cli as slim as possible
- Remove @sap/cds-dk as a direct dependency. To use the openAPI features in commands like inspectTable, inspectView or cds; you must have @sap/cds-dk globally. But most development environments where this option would be used should already have @sap/cds-dk installed this way.  Remove many unneded depenencies and duplicated modules from hana-cli most importantly removing the sqlite3 depenency that was never used but caused lots of install issues.
- New Browser UI for indexesUI and inspectTableUI

## [2.202107.6] - 2021-07-30

**Changed**

- Add a devcontainer configuration to allow contributors or testers of this project to start in a remote container or CodeSpaces with all necessary tools (like cf, @sap/cds-dk, etc) and VSCode extensions preinstalled. [https://code.visualstudio.com/docs/remote/containers](https://code.visualstudio.com/docs/remote/containers) and [https://docs.github.com/en/codespaces/customizing-your-codespace/configuring-codespaces-for-your-project](https://docs.github.com/en/codespaces/customizing-your-codespace/configuring-codespaces-for-your-project)
- Improved error handling in the Browser Based UI especially during start up scenarios where a default-env.json or equivelant is missing.
- Add Web Assistant embedded help and changelog
- Add full in-app assistance for massConvert command

## [2.202107.5] - 2021-07-27

**Changed**

- Add node.js engines version check on startup and output a warning if there is a mismatch based upon the engines specification in package.json
- Add busy indicator in browser based UI
- massConvert to HDBTABLE or HDBMIGRATIONTABLE with the useCatalogPure option now removes CS_* Types from the output for compatibility with target SAP HANA Cloud systems
- massConvert to HDBTABLE or HDBMIGRATIONTABLE without the useCatalogPure option also includes associations now. However when coming from HDBCDS based sources the column names contain dots which are incompatible with CAP CDS. The associations will still have the old column names while the rest of the table defition must replace the dot with underscore or recieve CDS Compiler errors.  I will leave this functionality in place, although imperfect. If you have associations in your source system, strongly consider using the useCatalogPure option instead. 
- Added new commands featuresUI, featureUsageUI, functionsUI, hdiUI, sbssUI, schemaInstancesUI, schemaInstancesUI, securestoreUI, and upsUI

## [2.202107.4] - 2021-07-27

**Changed**

- version command returned error due to change in latest-version. Reverted to old version of the module
- Rebuilt npm shrinkwrap due to some install errors with Sqlite3 - errors can be ignored as they don't impact hana-cli but still rather not show errors if possible

## [2.202107.3] - 2021-07-26

**Changed**

- Allow quoted names in massConvert when the target is HDBTABLE
- UI theme (light or dark) will now adjust automatically to user's OS setting
- New commands: containersUI, dataTypesUI, schemasUI, and tablesUI
- Refactored list operations (like schemas, tables, etc) to allow them to be reused in the new Browser UI

## [2.202107.2] - 2021-07-21

**Changed**

- Upgrade to @sap/cds 5.3.1, @sap/hana-client 2.9.23, @sap/hdbext 7.3.0, and sap-hdbext-promisifed 2.202107.1
- Major addition of new browser based UIs for certain complex commands.  First focus is on the massConvert command. No new external depencencies.  We launch Express web server from the CLI and then open the web browser.  You can complete the command with visual options, value help and extended documentation. Command is still executed in the CLI and the output is piped to the web broswer using web sockets.
- New commands: massConvertUI, systemInfoUI, changesUI, readMeUI, and UI (last one opens a LaunchPad with tiles for all the other commands)

## [2.202107.1] - 2021-07-13

**Changed**

- Upgrade to [@sap/cds 5.3.0](https://cap.cloud.sap/docs/releases/july21) and [@sap/xsenv 3.1.1](https://www.npmjs.com/package/@sap/xsenv/v/3.1.1)
- Upgrade SAPUI5 version to [1.91.1](https://sapui5.hana.ondemand.com/1.91.1/)
- Change cds command READ exit to req.reply instead of returning the query itself

## [2.202106.3] - 2021-06-30

**Changed**

- massConvert - change `require('fs/promises')` to `require('fs').promises` for compatibility with Node 12.x - see [Update fs.md #35740](https://github.com/nodejs/node/issues/35740)

## [2.202106.2] - 2021-06-25

**Changed**

- New commands schemaInstances, securestore, and sbss to list cf/xs services instances of these plan types

## [2.202106.1] - 2021-06-18

**Changed**

- Merge [mass rename](https://gist.github.com/ThePlenkov/2fc31e05a43a4ec395c9a4d8f6c8276a#gistcomment-3759807) from [@ThePlenkov](https://github.com/ThePlenkov) 
- Fix [Issue with connecting to XS Advance Database #53](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/53)
- Remove warning during HDI deploy from db module created with createModule due to reference to afllangprocedure in the generated .hdiconfig

## [2.202105.9] - 2021-05-27

**Changed**

- New functionality for massConvert command to also generate hdbsynonyms. [Generate hdbsynonyms along with CDS for massConvert operation #48](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/48) - thanks to [@ThePlenkov](https://github.com/ThePlenkov)
- Add no colons mode for massConvert. This is an option to remove :: from namespaces which would complicate usage from CAP CDS. :: will be replaced by dot. [no colons mode for massConvert #50](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/50) - thanks to [@ThePlenkov](https://github.com/ThePlenkov)
- [Exclude user defined types from generated CDS](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/51) in massConvert - thanks to [@ThePlenkov](https://github.com/ThePlenkov)
- cds command wasn't using the new connection information lookup logic

## [2.202105.8] - 2021-05-25

**Changed**

- Added hana client disconnect at error and normal end conditions to avoid segmentation fault in WSL and slightly older versions of Node.js - thanks to [sbarzaghialteaup](https://github.com/sbarzaghialteaup)
- First round of TypeScript types inclusion - more to come. Will mostly help project maintainers

## [2.202105.6] - 2021-05-21

**Changed**

- Missing npm shrinkwrap in last release
- Improved details in thrown errors and added debug info from util/cf and util/xs
- hana-cli version now reports latest avaialble version on npm and propmpts users to upgrade if they are outdated

## [2.202105.5] - 2021-05-20

**Changed**

- @cds dependency updated to May 2021 release 5.1.4
- Update cds preview to UI5 1.89.0
- cds preview new parameter to allow use to choose HTTP port (and validate that input)
- [Issue #42 Optional namespace for generated cds](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/42) - thanks to [@ThePlenkov](https://github.com/ThePlenkov)
- serviceKey command no longer requires to pre-create the service key. If the key you specify doesn't exist it will call cf/xs create-service-key for you automatically [Issue #41](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/41)
- Increase the page size for the xs/cf services commands (ups and hdi) [Issue #40](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/40)

## [2.202105.4] - 2021-05-11

**Changed**

- [Issue #39 - Add support for HANA XSA in the UPS and HDI commands](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/39)
- [Issue #38 - Add support for hdbmigrationtable in massConvert and inspectTable](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/38)
- Add option useCatalogPure to massConvert command. Defaults to false and uses the cds.compile api to produce its hdbtable or hdbmigrationtable output. When set to true it will instead use the HANA SYS.GET_OBJECT_DEFINITION which includes more metadata but might produce results which are incompatible with HDI
- Remove the Schema from output of massConvert commands

## [2.202105.3] - 2021-05-10

**Changed**

- Upgraded dependencies @sap/cds to 5.1, @sap/hana-client to 2.8.20, and @sap/hdbext to 7.2.0
- Add User Admin and Role Admin grants to the adminHDI and adminHDIGroup commands for XSA

## [2.202105.2] - 2021-05-06

**Changed**

- quiet output added to most commands allowing for a wide range of scripted usage of the tool overall

## [2.202105.1] - 2021-05-05

**Changed**

- copy2DefaultEnv fix to support hanatrial (old HaaS offering) but produce a warning that people should consider using SAP HANA Cloud trial instead
- Fix not a function error in inspectView with output option of openapi
- swagger-jsdoc output format, which is actually commented YAML version of openAPI, added to inspectTable and inspectView

## [2.202104.2] - 2021-04-23

**Changed**

- Match the @sap/hdbext and @sap/hana-client versions exactly to remove duplicate copies of the HANA Client in node_modules removing about 135Mb from the footprint of this tool overall
- Major internal refactoring to streamline the code and reduce duplication. Reusable base code for basic handling of Yargs and Prompts. Consistent error handling and other general stability improvments
- The default-env*.json file no longer needs to be in the same directory in which you are running the command.  If not found in the current directory, the tool will search in up to 5 parent directories to find it
- New parameter --conn added to most commands that allow you specify any filename you want to override the default-env.json. conn can specify a file in the current directory, up to 5 parent directories or in your ${homedir}/.hana-cli/ folder
- New parameter --quiet that disables extra output and human readable formatting for when you want to script commands and get pure results output
- New parameter --debug - for troubleshooting of the hana-cli tool itself. It will produce a LOT of detailed output. Nice if you are curious what queries are being sent to SAP to fullfill a command
- Options in the help are now grouped by Conneciton Parameters, Troubleshooting, and Options
- New order of processing for making connections as follows: 
- First we look for the Admin option and use a default-env-admin.json - this overrides all other parameters
- If no admin option or if there was an admin option but no default-env-admin.json could be found in this directory or 5 parent directories then look for a .env file in this directory or up to 5 parent directories
- No .env file found or it doesn't contain a VCAP_SERVICES section, then check to see if the --conn parameter was specified. If so check for that file in the current directory or up to 5 parent directories
- If the file specified via the --conn parameter wasn't found locally then check for it in the ${homedir}/.hana-cli/ folder
- If no specific configuration file was was found then look for a file named default-env.json in the current directory or up to 5 parent directories
- Last resort if nothing has been found up to this point - look for a file named default.json in the ${homedir}/.hana-cli/ folder
- Add Syntax Highlighting to various command outputs

## [2.202104.1] - 2021-04-15

**Changed**

- New Inspect* output options for sqlite, hdbtable, hdbview and hdbcds
- Upgrade to @sap/cds 5.x
- Drop support for Node.js version 10
- cds preview updated to SAPUI5 1.88.1
- connect command now prompts for Encyrypt setting

## [2.202103.4] - 2021-03-26

**Changed**

- New command copy2Secrets to rewrite default-env.json as K8S Secrets format expected by @sap/xsenv - Pull Request [35](https://github.com/SAP-samples/hana-developer-cli-tool-example/pull/35)
- thanks to [@ThePlenkov](https://github.com/ThePlenkov)

## [2.202103.3] - 2021-03-26

**Changed**

- querySimple now allows output to a file and supports table, json, and Excel output formats Issue [#30](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/30)
- README.md was reorganized to list all commands alphabetical Issue [#31](https: //github.com/SAP-samples/hana-developer-cli-tool-example/issues/31)

## [2.202103.2] - 2021-03-25

**Changed**

- Option to massConvert, inspectTable, inspectView, and cds to use HANA native data types if no CAP CDS direct conversion can be made. Issue [#27](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/27) - thanks to [@ThePlenkov](https://github.com/ThePlenkov)
- Decimal types without decismals generates CDS Error. Issue [#29](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/29) - thanks to [@ThePlenkov](https://github.com/ThePlenkov)

## [2.202103.1] - 2021-03-24

**Changed**

- New commands: changes & readme - output the CHANGELOG.md and README.md to the CLI
- Issue [#25](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/25) - Add filename option to massConvertion Operation - thanks to [@ThePlenkov](https://github.com/ThePlenkov)
- Updated several dependent modules including hana-client
- Put hana-cli on a diet and removed some old module dependencies no longer used. Especially the openAPI related ones which had functionality now offered by CAP directly
- help command now lists all commands in alphabetical order

## [2.202102.4] - 2021-02-27

**Changed**

- HANA 1.0 Support - Issue [#22](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/22)

## [2.202102.3] - 2021-02-14

**Changed**

- Updated @sap/textbundle
- Add readme command that opens ReadMe Documentation in your browser
- Add changelog command that opens Change Log in your browser
- Formatting of output copy2DefaultEnv improved for compatibility to CAP cds run 
- New command copy2Env - copy default-env.json to .env and reformat contents
- Support for HANA Cloud Instance Administration - requires cf cli to be installed and you must be logged into cf with a target org and space
- Added Command: hdi to list all SAP HANA Cloud HDI container instances in your target space
- Added Command: ups to list all Cloud Foundry user provided service instances in your target space
- Switch to the standard CAP Compile to openAPI in inspectTable, inspectView and cds commands. Now supports entity diagrams in the Swagger UI

## [2.202102.2] - 2021-02-10

**Changed**

- Updated @sap/cds to 4.5.x
- Support for HANA Cloud Instance Administration - requires cf cli to be installed and you must be logged into cf with a target org and space
- Added Command: hc to list all SAP HANA Cloud instances in your target space
- Added Command: hcStart to Start SAP HANA Cloud instance
- Added Command: hcStop to Stop SAP HANA Cloud instance

## [2.202102.1] - 2021-02-01

**Changed**

- serviceKey cf default was incorrect

## [2.202101.3] - 2021-01-20

**Changed**

- Renaming to match new SAP Business Technology Platform branding
- Minor dependent package version updates

## [2.202101.2] - 2021-01-13

**Changed**

- Default value on createModule command changed to SAP HANA Cloud
- Remove postinstall build script from SAP HANA Cloud option - only needed in SAP Web IDE

## [2.202101.1] - 2021-01-01

**Changed**

- Update *@sap/hana-client* to v2.7.16, *@sap/cds* to 4.4.7 and *sap-hdbext-promisfied* to 2.202101
- Correct dump if you run *hana-cli* with no commmand, no defaults to *help* command
- Correct error when using .env for connections and there are multiple SAP HANA and User Provided Services both in the configuration
- Correct openDBX command in SAP Business Application Studio when using .env for connections
- Node.js 14.x support
- New command copy2DefaultEnv - which copies a .env file to default-env.json and reformats the content. Designed for SAP Business Application Studio and the HANA tooling where a .env file is generated by a binding but CAP still requires a default-env.json for testing
