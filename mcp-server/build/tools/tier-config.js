export const TIER_1_COMMANDS = [
    'querySimple',
    'tables',
    'inspectTable',
    'views',
    'status',
];
export const ROUTER_TOOL_NAME = 'hana_execute';
export const MAX_DYNAMIC_TOOLS = 50;
export function isTier1Command(name) {
    return TIER_1_COMMANDS.includes(name);
}
export function isRouterTool(name) {
    return name === ROUTER_TOOL_NAME;
}
//# sourceMappingURL=tier-config.js.map