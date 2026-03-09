import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(
  defineConfig({
    base: '/hana-developer-cli-tool-example/',
    title: 'SAP HANA Developer CLI',
    description: 'Complete documentation for the SAP HANA Developer CLI tool',
    lang: 'en-US',
    cleanUrls: true,
    ignoreDeadLinks: true,
    appearance: 'dark',
    lastUpdated: true,
  
  markdown: {
    // Map CDS to TypeScript for syntax highlighting
    // CDS entity definitions are structurally similar (entity keyword, type annotations)
    languageAlias: {
      cds: 'typescript'
    }
  },

  // Mermaid plugin configuration for improved diagram readability
  mermaid: {
    theme: 'dark',
    startOnLoad: true,
    securityLevel: 'antiscript',
    flowchart: {
      useMaxWidth: true,
      htmlLabels: true,
      // Encourage vertical arrangement of nodes
      nodeSpacing: 50,
      rankSpacing: 60,
      curve: 'basis',
    },
    logLevel: 'error',
  },
  
  head: [
    ['link', { rel: 'icon', href: '/hana-developer-cli-tool-example/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#0092d1' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:image', content: '/logo.svg' }],
    ['meta', { name: 'og:site_name', content: 'SAP HANA Developer CLI' }],
    ['meta', { name: 'keywords', content: 'SAP HANA, CLI, developer tools, database, command-line' }],
    ['meta', { name: 'author', content: 'SAP' }],
    ['meta', { name: 'robots', content: 'index, follow' }],
  ],

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'HANA CLI',
    outline: {
      level: [2, 3],
      label: 'On this page'
    },
    
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/01-getting-started/' },
      { text: 'Commands', link: '/02-commands/' },
      { text: 'Features', link: '/03-features/' },
      { text: 'API Reference', link: '/04-api-reference/' },
      { text: 'Development', link: '/05-development/' },
      {
        text: 'References',
        items: [
          { text: 'Overview', link: '/99-reference/' },
          { text: 'Troubleshooting', link: '/troubleshooting/' },
        ]
      },
      {
        text: 'Resources',
        items: [
          { text: 'GitHub', link: 'https://github.com/SAP-samples/hana-developer-cli-tool-example' },
          { text: 'NPM Package', link: 'https://www.npmjs.com/package/hana-cli' },
          { text: 'Changelog', link: '/99-reference/changelog' },
        ]
      }
    ],

    sidebar: {
      '/01-getting-started/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/01-getting-started/' },
            { text: 'Installation', link: '/01-getting-started/installation' },
            { text: 'Troubleshooting', link: '/troubleshooting/' },
            { text: 'Quick Start', link: '/01-getting-started/quick-start' },
            { text: 'Configuration', link: '/01-getting-started/configuration' },
            { text: 'Environments', link: '/01-getting-started/environments' },
          ]
        }
      ],

      '/02-commands/': [
        {
          text: 'Commands Reference',
          collapsed: false,
          items: [
            { text: '📋 All Commands A-Z', link: '/02-commands/all-commands' },
            { text: 'Commands Overview', link: '/02-commands/' },
          ]
        },
        {
          text: 'Analysis Tools',
          collapsed: true,
          items: [
            { text: 'Calc View Analyzer', link: '/02-commands/analysis-tools/calc-view-analyzer' },
            { text: 'Column Stats', link: '/02-commands/analysis-tools/column-stats' },
            { text: 'Data Diff', link: '/02-commands/analysis-tools/data-diff' },
            { text: 'Data Lineage', link: '/02-commands/analysis-tools/data-lineage' },
            { text: 'Data Profile', link: '/02-commands/analysis-tools/data-profile' },
            { text: 'Duplicate Detection', link: '/02-commands/analysis-tools/duplicate-detection' },
            { text: 'ERD Diagram', link: '/02-commands/analysis-tools/erd-diagram' },
            { text: 'Fragmentation Check', link: '/02-commands/analysis-tools/fragmentation-check' },
            { text: 'Referential Check', link: '/02-commands/analysis-tools/referential-check' },
            { text: 'Table Hotspots', link: '/02-commands/analysis-tools/table-hotspots' }
          ]
        },
        {
          text: 'Backup & Recovery',
          collapsed: true,
          items: [
            { text: 'Backup', link: '/02-commands/backup-recovery/backup' },
            { text: 'Backup List', link: '/02-commands/backup-recovery/backup-list' },
            { text: 'Backup Status', link: '/02-commands/backup-recovery/backup-status' },
            { text: 'Reclaim', link: '/02-commands/backup-recovery/reclaim' },
            { text: 'Restore', link: '/02-commands/backup-recovery/restore' }
          ]
        },
        {
          text: 'BTP Integration',
          collapsed: true,
          items: [
            { text: 'BTP', link: '/02-commands/btp-integration/btp' },
            { text: 'BTP Info', link: '/02-commands/btp-integration/btp-info' },
            { text: 'BTP Subscriptions', link: '/02-commands/btp-integration/btp-subs' },
            { text: 'BTP Target', link: '/02-commands/btp-integration/btp-target' },
            { text: 'Open BAS', link: '/02-commands/btp-integration/open-b-a-s' },
            { text: 'Open DB Explorer', link: '/02-commands/btp-integration/open-d-b-explorer' }
          ]
        },
        {
          text: 'Connection & Auth',
          collapsed: true,
          items: [
            { text: 'Connect', link: '/02-commands/connection-auth/connect' },
            { text: 'Connect via Service Key', link: '/02-commands/connection-auth/connect-via-service-key' },
            { text: 'Connections', link: '/02-commands/connection-auth/connections' },
            { text: 'Create JWT', link: '/02-commands/connection-auth/create-j-w-t' },
            { text: 'Inspect JWT', link: '/02-commands/connection-auth/inspect-j-w-t' },
            { text: 'Inspect User', link: '/02-commands/connection-auth/inspect-user' },
            { text: 'Users', link: '/02-commands/connection-auth/users' }
          ]
        },
        {
          text: 'Data Tools',
          collapsed: true,
          items: [
            { text: 'Compare Data', link: '/02-commands/data-tools/compare-data' },
            { text: 'Data Sync', link: '/02-commands/data-tools/data-sync' },
            { text: 'Data Validator', link: '/02-commands/data-tools/data-validator' },
            { text: 'Export', link: '/02-commands/data-tools/export' },
            { text: 'Import', link: '/02-commands/data-tools/import' },
            { text: 'Kafka Connect', link: '/02-commands/data-tools/kafka-connect' }
          ]
        },
        {
          text: 'Developer Tools',
          collapsed: true,
          items: [
            { text: 'Call Procedure', link: '/02-commands/developer-tools/call-procedure' },
            { text: 'CDS', link: '/02-commands/developer-tools/cds' },
            { text: 'Change Log', link: '/02-commands/developer-tools/change-log' },
            { text: 'Code Template', link: '/02-commands/developer-tools/code-template' },
            { text: 'Create Module', link: '/02-commands/developer-tools/create-module' },
            { text: 'Generate Docs', link: '/02-commands/developer-tools/generate-docs' },
            { text: 'Help Documentation', link: '/02-commands/developer-tools/help-docu' },
            { text: 'HDBSQL', link: '/02-commands/developer-tools/hdbsql' },
            { text: 'Issue', link: '/02-commands/developer-tools/issue' },
            { text: 'Open Change Log', link: '/02-commands/developer-tools/open-change-log' },
            { text: 'Open README', link: '/02-commands/developer-tools/open-read-me' },
            { text: 'Query Simple', link: '/02-commands/developer-tools/query-simple' },
            { text: 'README', link: '/02-commands/developer-tools/read-me' }
          ]
        },
        {
          text: 'HANA Cloud',
          collapsed: true,
          items: [
            { text: 'HANA Cloud Instances', link: '/02-commands/hana-cloud/hana-cloud-instances' },
            { text: 'HANA Cloud SBSS Instances', link: '/02-commands/hana-cloud/hana-cloud-s-b-s-s-instances' },
            { text: 'HANA Cloud Schema Instances', link: '/02-commands/hana-cloud/hana-cloud-schema-instances' },
            { text: 'HANA Cloud Secure Store', link: '/02-commands/hana-cloud/hana-cloud-secure-store-instances' },
            { text: 'HANA Cloud Start', link: '/02-commands/hana-cloud/hana-cloud-start' },
            { text: 'HANA Cloud Stop', link: '/02-commands/hana-cloud/hana-cloud-stop' },
            { text: 'HANA Cloud UPS Instances', link: '/02-commands/hana-cloud/hana-cloud-u-p-s-instances' }
          ]
        },
        {
          text: 'HDI Management',
          collapsed: true,
          items: [
            { text: 'Activate HDI', link: '/02-commands/hdi-management/activate-h-d-i' },
            { text: 'Admin HDI', link: '/02-commands/hdi-management/admin-h-d-i' },
            { text: 'Admin HDI Group', link: '/02-commands/hdi-management/admin-h-d-i-group' },
            { text: 'Containers', link: '/02-commands/hdi-management/containers' },
            { text: 'Create Container', link: '/02-commands/hdi-management/create-container' },
            { text: 'Create Container Users', link: '/02-commands/hdi-management/create-container-users' },
            { text: 'Create Group', link: '/02-commands/hdi-management/create-group' },
            { text: 'Drop Container', link: '/02-commands/hdi-management/drop-container' },
            { text: 'Drop Group', link: '/02-commands/hdi-management/drop-group' },
            { text: 'HANA Cloud HDI Instances', link: '/02-commands/hdi-management/hana-cloud-h-d-i-instances' }
          ]
        },
        {
          text: 'Mass Operations',
          collapsed: true,
          items: [
            { text: 'Mass Convert', link: '/02-commands/mass-operations/mass-convert' },
            { text: 'Mass Delete', link: '/02-commands/mass-operations/mass-delete' },
            { text: 'Mass Export', link: '/02-commands/mass-operations/mass-export' },
            { text: 'Mass Grant', link: '/02-commands/mass-operations/mass-grant' },
            { text: 'Mass Rename', link: '/02-commands/mass-operations/mass-rename' },
            { text: 'Mass Update', link: '/02-commands/mass-operations/mass-update' },
            { text: 'Mass Users', link: '/02-commands/mass-operations/mass-users' }
          ]
        },
        {
          text: 'Object Inspection',
          collapsed: true,
          items: [
            { text: 'Functions', link: '/02-commands/object-inspection/functions' },
            { text: 'Indexes', link: '/02-commands/object-inspection/indexes' },
            { text: 'Inspect Function', link: '/02-commands/object-inspection/inspect-function' },
            { text: 'Inspect Library', link: '/02-commands/object-inspection/inspect-library' },
            { text: 'Inspect Library Member', link: '/02-commands/object-inspection/inspect-lib-member' },
            { text: 'Inspect Procedure', link: '/02-commands/object-inspection/inspect-procedure' },
            { text: 'Inspect Table', link: '/02-commands/object-inspection/inspect-table' },
            { text: 'Inspect Trigger', link: '/02-commands/object-inspection/inspect-trigger' },
            { text: 'Inspect View', link: '/02-commands/object-inspection/inspect-view' },
            { text: 'Libraries', link: '/02-commands/object-inspection/libraries' },
            { text: 'Objects', link: '/02-commands/object-inspection/objects' },
            { text: 'Partitions', link: '/02-commands/object-inspection/partitions' },
            { text: 'Procedures', link: '/02-commands/object-inspection/procedures' },
            { text: 'Schemas', link: '/02-commands/object-inspection/schemas' },
            { text: 'Sequences', link: '/02-commands/object-inspection/sequences' },
            { text: 'Tables', link: '/02-commands/object-inspection/tables' },
            { text: 'Tables (PostgreSQL)', link: '/02-commands/object-inspection/tables-p-g' },
            { text: 'Tables (SQLite)', link: '/02-commands/object-inspection/tables-s-q-lite' },
            { text: 'Triggers', link: '/02-commands/object-inspection/triggers' },
            { text: 'Views', link: '/02-commands/object-inspection/views' }
          ]
        },
        {
          text: 'Performance & Monitoring',
          collapsed: true,
          items: [
            { text: 'Alerts', link: '/02-commands/performance-monitoring/alerts' },
            { text: 'Blocking', link: '/02-commands/performance-monitoring/blocking' },
            { text: 'Cache Statistics', link: '/02-commands/performance-monitoring/cache-stats' },
            { text: 'Deadlocks', link: '/02-commands/performance-monitoring/deadlocks' },
            { text: 'Expensive Statements', link: '/02-commands/performance-monitoring/expensive-statements' },
            { text: 'Long Running', link: '/02-commands/performance-monitoring/long-running' },
            { text: 'Memory Analysis', link: '/02-commands/performance-monitoring/memory-analysis' },
            { text: 'Memory Leaks', link: '/02-commands/performance-monitoring/memory-leaks' },
            { text: 'Query Plan', link: '/02-commands/performance-monitoring/query-plan' },
            { text: 'Trace Contents', link: '/02-commands/performance-monitoring/trace-contents' },
            { text: 'Traces', link: '/02-commands/performance-monitoring/traces' },
            { text: 'Workload Management', link: '/02-commands/performance-monitoring/workload-management' }
          ]
        },
        {
          text: 'Schema Tools',
          collapsed: true,
          items: [
            { text: 'Compare Schema', link: '/02-commands/schema-tools/compare-schema' },
            { text: 'Schema Clone', link: '/02-commands/schema-tools/schema-clone' },
            { text: 'Table Copy', link: '/02-commands/schema-tools/table-copy' }
          ]
        },
        {
          text: 'Security',
          collapsed: true,
          items: [
            { text: 'Audit Log', link: '/02-commands/security/audit-log' },
            { text: 'Certificates', link: '/02-commands/security/certificates' },
            { text: 'Encryption Status', link: '/02-commands/security/encryption-status' },
            { text: 'Grant Chains', link: '/02-commands/security/grant-chains' },
            { text: 'Privilege Analysis', link: '/02-commands/security/privilege-analysis' },
            { text: 'Privilege Error', link: '/02-commands/security/privilege-error' },
            { text: 'Create XSA Admin', link: '/02-commands/security/create-x-s-a-admin' },
            { text: 'Password Policy', link: '/02-commands/security/pwd-policy' },
            { text: 'Roles', link: '/02-commands/security/roles' },
            { text: 'Security Scan', link: '/02-commands/security/security-scan' }
          ]
        },
        {
          text: 'System Administration',
          collapsed: true,
          items: [
            { text: 'Cache Contents', link: '/02-commands/system-admin/cache-contents' },
            { text: 'Crash Dumps', link: '/02-commands/system-admin/crash-dumps' },
            { text: 'Data Types', link: '/02-commands/system-admin/data-types' },
            { text: 'Dependencies', link: '/02-commands/system-admin/dependencies' },
            { text: 'Diagnose', link: '/02-commands/system-admin/diagnose' },
            { text: 'Disks', link: '/02-commands/system-admin/disks' },
            { text: 'Feature Usage', link: '/02-commands/system-admin/feature-usage' },
            { text: 'Features', link: '/02-commands/system-admin/features' },
            { text: 'Health Check', link: '/02-commands/system-admin/health-check' },
            { text: 'Host Information', link: '/02-commands/system-admin/host-information' },
            { text: 'INI Contents', link: '/02-commands/system-admin/ini-contents' },
            { text: 'INI Files', link: '/02-commands/system-admin/ini-files' },
            { text: 'Ports', link: '/02-commands/system-admin/ports' },
            { text: 'Recommendations', link: '/02-commands/system-admin/recommendations' },
            { text: 'Status', link: '/02-commands/system-admin/status' },
            { text: 'System Info', link: '/02-commands/system-admin/system-info' }
          ]
        },
        {
          text: 'System Tools',
          collapsed: true,
          items: [
            { text: 'Cache Contents', link: '/02-commands/system-tools/cache-contents' },
            { text: 'CLI (Internal)', link: '/02-commands/system-tools/cli' },
            { text: 'Command Map (Internal)', link: '/02-commands/system-tools/command-map' },
            { text: 'Compare Schema (Legacy Alias)', link: '/02-commands/system-tools/compare-schema' },
            { text: 'Copy2 Default Env', link: '/02-commands/system-tools/copy2-default-env' },
            { text: 'Copy2 Env', link: '/02-commands/system-tools/copy2-env' },
            { text: 'Copy2 Secrets', link: '/02-commands/system-tools/copy2-secrets' },
            { text: 'Data Mask', link: '/02-commands/system-tools/data-mask' },
            { text: 'Data Volumes', link: '/02-commands/system-tools/data-volumes' },
            { text: 'Export (Legacy Alias)', link: '/02-commands/system-tools/export' },
            { text: 'Ft Indexes', link: '/02-commands/system-tools/ft-indexes' },
            { text: 'Generate Test Data', link: '/02-commands/system-tools/generate-test-data' },
            { text: 'Graph Workspaces', link: '/02-commands/system-tools/graph-workspaces' },
            { text: 'Import (Legacy Alias)', link: '/02-commands/system-tools/import' },
            { text: 'Index Test (Legacy Placeholder)', link: '/02-commands/system-tools/index-test' },
            { text: 'Inspect Index', link: '/02-commands/system-tools/inspect-index' },
            { text: 'Kafka Connect (Legacy Alias)', link: '/02-commands/system-tools/kafka-connect' },
            { text: 'Replication Status', link: '/02-commands/system-tools/replication-status' },
            { text: 'RICK', link: '/02-commands/system-tools/rick' },
            { text: 'Schema Clone', link: '/02-commands/system-tools/schema-clone' },
            { text: 'SDI Tasks', link: '/02-commands/system-tools/sdi-tasks' },
            { text: 'Spatial Data', link: '/02-commands/system-tools/spatial-data' },
            { text: 'Synonyms', link: '/02-commands/system-tools/synonyms' },
            { text: 'Table Groups', link: '/02-commands/system-tools/table-groups' },
            { text: 'Test', link: '/02-commands/system-tools/test' },
            { text: 'Timeseries Tools', link: '/02-commands/system-tools/time-series-tools' },
            { text: 'Timeseries Tools (Legacy Alias)', link: '/02-commands/system-tools/timeseries-tools' },
            { text: 'UI', link: '/02-commands/system-tools/u-i' },
            { text: 'Version', link: '/02-commands/system-tools/version' },
            { text: 'XSA Services', link: '/02-commands/system-tools/xsa-services' }
          ]
        }
      ],

      '/03-features/': [
        {
          text: 'Features & Guides',
          items: [
            { text: 'Overview', link: '/03-features/' },
            { text: 'Command Line Interface', link: '/03-features/cli-features' },
            { text: 'API Server', link: '/03-features/api-server' },
            { text: 'Internationalization', link: '/03-features/internationalization' },
            { text: 'Output Formats', link: '/03-features/output-formats' },
            { text: 'Knowledge Base Integration', link: '/03-features/knowledge-base' },
          ]
        },
        {
          text: 'MCP Server & AI',
          items: [
            { text: 'MCP Overview', link: '/03-features/mcp/' },
            { text: 'MCP Integration', link: '/03-features/mcp-integration' },
            { text: 'Architecture', link: '/03-features/mcp/architecture' },
            { text: 'Server Usage', link: '/03-features/mcp/server-usage' },
            { text: 'Connection Guide', link: '/03-features/mcp/connection-guide' },
            { text: 'Knowledge Base', link: '/03-features/mcp/knowledge-base' },
            { text: 'Advanced Features', link: '/03-features/mcp/advanced-features' },
          ]
        },
        {
          text: 'MCP Implementation Details',
          items: [
            { text: 'Implementation Guide', link: '/03-features/mcp/implementation-guide' },
            { text: 'Implementation Complete', link: '/03-features/mcp/implementation-complete' },
            { text: 'Server Implementation', link: '/03-features/mcp/server-implementation-complete' },
            { text: 'Server Updates', link: '/03-features/mcp/server-updates' },
            { text: 'Visual Summary', link: '/03-features/mcp/visual-summary' },
          ]
        },
        {
          text: 'MCP Connection Context',
          items: [
            { text: 'Connection Context Readme', link: '/03-features/mcp/connection-context-readme' },
            { text: 'Context Analysis', link: '/03-features/mcp/connection-context-analysis' },
            { text: 'Context Solution', link: '/03-features/mcp/connection-context-solution' },
          ]
        },
        {
          text: 'Web User Interface',
          items: [
            { text: 'Web UI Overview', link: '/03-features/web-ui/' },
          ]
        },
        {
          text: 'REST API Server',
          items: [
            { text: 'API Server', link: '/03-features/api-server/' },
          ]
        },
        {
          text: 'Cloud Integration',
          items: [
            { text: 'SAP BTP', link: '/03-features/btp-integration' },
          ]
        }
      ],

      '/04-api-reference/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/04-api-reference/' },
            { text: 'Swagger / OpenAPI', link: '/04-api-reference/swagger' },
            { text: 'Swagger Implementation', link: '/04-api-reference/swagger-implementation' },
            { text: 'Command Flows', link: '/04-api-reference/command-flows' },
            { text: 'HTTP Routes', link: '/04-api-reference/http-routes' },
          ]
        }
      ],

      '/05-development/': [
        {
          text: 'Development Guide',
          items: [
            { text: 'Overview', link: '/05-development/' },
            { text: 'Copilot Customization', link: '/05-development/copilot' },
            { text: 'Copilot Workspace Instructions', link: '/05-development/copilot/workspace-instructions' },
            { text: 'Copilot Prompts', link: '/05-development/copilot/prompts' },
            { text: 'Copilot Agents', link: '/05-development/copilot/agents' },
            { text: 'Copilot Skills', link: '/05-development/copilot/skills' },
            { text: 'Copilot Hooks', link: '/05-development/copilot/hooks' },
            { text: 'Testing & QA (E2E + UI)', link: '/05-development/testing' },
            { text: 'Documentation', link: '/05-development/documentation' },
            { text: 'Implementation Guide', link: '/05-development/implementation' },
          ]
        },
        {
          text: 'Architecture',
          items: [
            { text: 'Project Structure', link: '/05-development/architecture/project-structure' },
            { text: 'Codebase Deep Dives', link: '/05-development/architecture/codebase' },
            { text: 'Utilities Reference', link: '/05-development/architecture/utilities' },
          ]
        },
        {
          text: 'Developer Notes',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/developer-notes/' },
            { text: 'Parameter Standards', link: '/developer-notes/parameter-standards' },
            { text: 'Command Consistency', link: '/developer-notes/command-consistency' },
            { text: 'Testing Guide', link: '/developer-notes/testing-guide' },
            { text: 'Test Coverage Summary', link: '/developer-notes/test-coverage-summary' },
            { text: 'Documentation Quick Reference', link: '/developer-notes/documentation-quick-reference' },
            { text: 'Knowledge Base Summary', link: '/developer-notes/knowledge-base-summary' },
          ]
        },
        {
          text: 'MCP Server',
          items: [
            { text: 'Overview', link: '/05-development/mcp-server/' },
            { text: 'Development Overview', link: '/05-development/mcp-server/overview' },
            { text: 'Features', link: '/05-development/mcp-server/features' },
            { text: 'Setup & Configuration', link: '/05-development/mcp-server/setup-and-configuration' },
            { text: 'Troubleshooting', link: '/05-development/mcp-server/troubleshooting' },
            { text: 'Discovery Tools', link: '/05-development/mcp-server/discovery-tools' },
            { text: 'Advanced Features', link: '/05-development/mcp-server/advanced-features' },
            { text: 'Prompts & Resources', link: '/05-development/mcp-server/prompts-and-resources' },
            { text: 'Documentation Search', link: '/05-development/mcp-server/docs-search' },
            { text: 'Implementation Phases', link: '/05-development/mcp-server/implementation-phases' },
          ]
        }
      ],

      '/developer-notes/': [
        {
          text: 'Developer Notes',
          items: [
            { text: 'Overview', link: '/developer-notes/' },
            { text: 'Parameter Standards', link: '/developer-notes/parameter-standards' },
            { text: 'Command Consistency', link: '/developer-notes/command-consistency' },
            { text: 'Testing Guide', link: '/developer-notes/testing-guide' },
          ]
        },
        {
          text: 'Testing & Quality',
          items: [
            { text: 'Test Coverage Summary', link: '/developer-notes/test-coverage-summary' },
            { text: 'Test Coverage Analysis', link: '/developer-notes/test-coverage-analysis' },
            { text: 'Generic Flags Testing', link: '/developer-notes/generic-flags-testing' },
          ]
        },
        {
          text: 'Command Consistency',
          items: [
            { text: 'Consistency Analysis', link: '/developer-notes/command-consistency-analysis' },
            { text: 'Consistency Fixes', link: '/developer-notes/command-consistency-fixes' },
            { text: 'Review Complete', link: '/developer-notes/consistency-review-complete' },
          ]
        },
        {
          text: 'Documentation Process',
          items: [
            { text: 'Quick Reference', link: '/developer-notes/documentation-quick-reference' },
            { text: 'Before & After', link: '/developer-notes/documentation-before-after' },
            { text: 'Documentation Index', link: '/developer-notes/documentation-index' },
            { text: 'Restructuring Complete', link: '/developer-notes/documentation-restructuring' },
            { text: 'Command Updates', link: '/developer-notes/command-documentation-updates' },
          ]
        },
        {
          text: 'Implementation Details',
          items: [
            { text: 'Import Enhancements', link: '/developer-notes/import-enhancements' },
            { text: 'Internationalization', link: '/developer-notes/internationalization' },
            { text: 'Optimization Patterns', link: '/developer-notes/optimization-patterns' },
            { text: 'Knowledge Base Summary', link: '/developer-notes/knowledge-base-summary' },
            { text: 'KB Integration', link: '/developer-notes/knowledge-base-integration' },
            { text: 'Issue Analysis', link: '/developer-notes/issue-analysis' },
          ]
        },
        {
          text: 'Architecture',
          items: [
            { text: 'Application Architecture', link: '/developer-notes/architecture/application' },
          ]
        }
      ],

      '/troubleshooting/': [
        {
          text: 'Troubleshooting',
          items: [
            { text: 'Overview', link: '/troubleshooting/' },
            { text: 'MCP Issues', link: '/troubleshooting/mcp' },
          ]
        }
      ],

      '/99-reference/': [
        {
          text: 'Reference',
          items: [
            { text: 'Overview', link: '/99-reference/' },
            { text: 'Changelog', link: '/99-reference/changelog' },
            { text: 'Command Reference', link: '/99-reference/command-reference' },
            { text: 'FAQ', link: '/99-reference/faq-extended' },
          ]
        }
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/SAP-samples/hana-developer-cli-tool-example' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/hana-cli' }
    ],

    footer: {
      message: 'Released under the Apache License 2.0 | <a href="https://www.sap.com">SAP SE</a>',
      copyright: 'Copyright © 2026 SAP | <a href="https://github.com/SAP-samples/hana-developer-cli-tool-example/blob/Feb2026/CONTRIBUTING.md">Contributing</a> | <a href="https://github.com/SAP-samples/hana-developer-cli-tool-example/blob/Feb2026/LICENSE">License</a> | <a href="https://www.sap.com/about/legal/impressum.html">Legal Disclosure</a>'
    },

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/SAP-samples/hana-developer-cli-tool-example/edit/Feb2026/docs/:path',
      text: 'Edit this page on GitHub'
    },

    lastUpdated: {
      text: 'Last updated',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    }
  },

  vite: {
    build: {
      chunkSizeWarningLimit: 2000, // Increased from default 500KB to 2MB for large documentation pages (changelog, command reference, etc.)
    }
  }
  })
)
