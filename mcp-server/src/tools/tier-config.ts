export const TIER_1_COMMANDS: string[] = [
  'querySimple',
  'tables',
  'inspectTable',
  'views',
  'status',
];

export const ROUTER_TOOL_NAME = 'hana_execute';

export const MAX_DYNAMIC_TOOLS = 50;

export function sanitizeToolName(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');
}

export const PROJECT_CONTEXT_SCHEMA = {
  type: 'object',
  description: 'Project-specific connection context (optional). Use this to connect to a project-specific database instead of the default.',
  properties: {
    connectionFile: { type: 'string', description: 'Connection file name relative to projectPath (e.g., ".env", "default-env.json").' },
    database: { type: 'string', description: 'Database name (default "SYSTEMDB").' },
    host: { type: 'string', description: 'Database host (for direct connection).' },
    password: { type: 'string', description: 'Database password. SECURITY WARNING: Prefer connection files instead.' },
    port: { type: 'number', description: 'Database port (default 30013).' },
    projectPath: { type: 'string', description: 'Absolute path to the project directory.' },
    user: { type: 'string', description: 'Database user.' },
  },
} as const;

export function isTier1Command(name: string): boolean {
  return TIER_1_COMMANDS.includes(name);
}

export function isRouterTool(name: string): boolean {
  return name === ROUTER_TOOL_NAME;
}
