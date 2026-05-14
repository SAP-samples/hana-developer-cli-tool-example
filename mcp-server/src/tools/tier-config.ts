export const TIER_1_COMMANDS: string[] = [
  'querySimple',
  'tables',
  'inspectTable',
  'views',
  'status',
];

export const ROUTER_TOOL_NAME = 'hana_execute';

export const MAX_DYNAMIC_TOOLS = 50;

export function isTier1Command(name: string): boolean {
  return TIER_1_COMMANDS.includes(name);
}

export function isRouterTool(name: string): boolean {
  return name === ROUTER_TOOL_NAME;
}
