export const TIER_1_COMMANDS: string[] = [
  'querySimple',
  'tables',
  'inspectTable',
  'views',
  'status',
];

export const ROUTER_TOOL_NAME = 'hana_execute';

export const MAX_DYNAMIC_TOOLS = 50;

const DISCOVERY_TOOL_NAMES = new Set([
  'hana_discover_categories',
  'hana_discover_by_category',
  'hana_discover_by_tag',
  'hana_workflows',
  'hana_workflow_by_id',
  'hana_search_workflows',
]);

const CONTENT_TOOL_NAMES = new Set([
  'hana_recommend',
  'hana_search',
  'hana_get_doc',
  'hana_examples',
  'hana_parameter_presets',
  'hana_get_template',
  'hana_quickstart',
  'hana_conversation_templates',
  'hana_interpret_result',
  'hana_troubleshoot',
  'hana_view_docs',
]);

export function isTier1Command(name: string): boolean {
  return TIER_1_COMMANDS.includes(name);
}

export function isDiscoveryTool(name: string): boolean {
  return DISCOVERY_TOOL_NAMES.has(name);
}

export function isRouterTool(name: string): boolean {
  return name === ROUTER_TOOL_NAME;
}

export function isContentTool(name: string): boolean {
  return CONTENT_TOOL_NAMES.has(name);
}
