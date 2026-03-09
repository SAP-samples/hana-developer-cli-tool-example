/**
 * Build an epilogue with documentation link and related commands
 * @param {string} commandName - The command name (e.g., 'import', 'export', 'inspectTable')
 * @param {string} category - The documentation category path (e.g., 'data-tools', 'schema-tools')
 * @param {string[]} [relatedCommands=[]] - Array of related command names to show in "see also"
 * @returns {string} Formatted epilogue text for yargs
 */
export function buildDocEpilogue(commandName: string, category: string, relatedCommands?: string[]): string;
/**
 * Get documentation URL for a command
 * @param {string} commandName - The command name
 * @param {string} category - The documentation category
 * @returns {string} Full URL to the documentation
 */
export function getDocUrl(commandName: string, category: string): string;
declare namespace _default {
    export { buildDocEpilogue };
    export { getDocUrl };
    export { DOCS_BASE_URL };
}
export default _default;
/**
 * @module doc-linker - Generates documentation links and "see also" sections for CLI help
 */
declare const DOCS_BASE_URL: "https://sap-samples.github.io/hana-developer-cli-tool-example/02-commands";
