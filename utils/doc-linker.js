// @ts-check
/**
 * @module doc-linker - Generates documentation links and "see also" sections for CLI help
 */

const DOCS_BASE_URL = 'https://sap-samples.github.io/hana-developer-cli-tool-example/02-commands'

/**
 * Convert camelCase to kebab-case (e.g., inspectTable -> inspect-table)
 * @param {string} str - String to convert
 * @returns {string} Kebab-case string
 */
function camelToKebab(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

/**
 * Build an epilogue with documentation link and related commands
 * @param {string} commandName - The command name (e.g., 'import', 'export', 'inspectTable')
 * @param {string} category - The documentation category path (e.g., 'data-tools', 'schema-tools')
 * @param {string[]} [relatedCommands=[]] - Array of related command names to show in "see also"
 * @returns {string} Formatted epilogue text for yargs
 */
export function buildDocEpilogue(commandName, category, relatedCommands = []) {
    const docUrl = `${DOCS_BASE_URL}/${category}/${camelToKebab(commandName)}`
    let epilogue = `\nDocumentation: ${docUrl}`
    
    if (relatedCommands && relatedCommands.length > 0) {
        epilogue += '\n\nSee also:'
        relatedCommands.forEach(cmd => {
            epilogue += `\n  hana-cli ${cmd} --help`
        })
    }
    
    return epilogue
}

/**
 * Get documentation URL for a command
 * @param {string} commandName - The command name
 * @param {string} category - The documentation category
 * @returns {string} Full URL to the documentation
 */
export function getDocUrl(commandName, category) {
    return `${DOCS_BASE_URL}/${category}/${camelToKebab(commandName)}`
}

export default {
    buildDocEpilogue,
    getDocUrl,
    DOCS_BASE_URL
}
