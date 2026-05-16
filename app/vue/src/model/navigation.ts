export interface NavItem {
  key: string
  title: string
  icon?: string
  route?: string
  external?: string
}

export interface NavGroup {
  key: string
  title: string
  icon: string
  expanded?: boolean
  items: NavItem[]
}

export const navigation: NavGroup[] = [
  {
    key: 'admin',
    title: 'Administration',
    icon: 'technical-object',
    expanded: true,
    items: [
      { key: 'systemInfo', title: 'System Info', route: 'systemInfo' },
      { key: 'users', title: 'Users', route: 'users' },
      { key: 'features', title: 'Features', route: 'features' },
      { key: 'featureUsage', title: 'Feature Usage', route: 'featureUsage' },
      { key: 'dataTypes', title: 'Data Types', route: 'dataTypes' },
      { key: 'certificates', title: 'Certificates', route: 'certificates' }
    ]
  },
  {
    key: 'db-objects',
    title: 'Database Objects',
    icon: 'database',
    expanded: true,
    items: [
      { key: 'tables', title: 'Tables', route: 'tables' },
      { key: 'views', title: 'Views', route: 'views' },
      { key: 'procedures', title: 'Procedures', route: 'procedures' },
      { key: 'functions', title: 'Functions', route: 'functions' },
      { key: 'schemas', title: 'Schemas', route: 'schemas' },
      { key: 'indexes', title: 'Indexes', route: 'indexes' }
    ]
  },
  {
    key: 'inspection',
    title: 'Inspection',
    icon: 'inspect',
    items: [
      { key: 'inspectTable', title: 'Inspect Table', route: 'inspectTable' },
      { key: 'inspectView', title: 'Inspect View', route: 'inspectView' },
      { key: 'inspectFunction', title: 'Inspect Function', route: 'inspectFunction' },
      { key: 'callProcedure', title: 'Call Procedure', route: 'callProcedure' },
      { key: 'querySimple', title: 'SQL Query', route: 'querySimple' }
    ]
  },
  {
    key: 'tools',
    title: 'Import / Convert',
    icon: 'upload',
    items: [
      { key: 'import', title: 'Import', route: 'import' },
      { key: 'massConvert', title: 'Mass Convert', route: 'massConvert' }
    ]
  },
  {
    key: 'cloud',
    title: 'Cloud',
    icon: 'cloud',
    items: [
      { key: 'cfLogin', title: 'CF Login', route: 'cfLogin' },
      { key: 'hdi', title: 'HDI Instances', route: 'hdi' },
      { key: 'sbss', title: 'SBSS', route: 'sbss' },
      { key: 'schemaInstances', title: 'Schema Instances', route: 'schemaInstances' },
      { key: 'securestore', title: 'Secure Store', route: 'securestore' },
      { key: 'ups', title: 'User Provided Services', route: 'ups' },
      { key: 'containers', title: 'Containers', route: 'containers' }
    ]
  },
  {
    key: 'btp',
    title: 'BTP',
    icon: 'it-host',
    items: [
      { key: 'btpLogin', title: 'BTP Login', route: 'btpLogin' },
      { key: 'btpInfo', title: 'BTP Info', route: 'btpInfo' },
      { key: 'btpSubs', title: 'Subscriptions', route: 'btpSubs' },
      { key: 'btpTarget', title: 'Subaccount Target', route: 'btpTarget' }
    ]
  },
  {
    key: 'dev-tools',
    title: 'Developer Tools',
    icon: 'developer-settings',
    items: [
      { key: 'swagger', title: 'Swagger API', external: '/api-docs' },
      { key: 'version', title: 'Version', route: 'version' }
    ]
  }
]
