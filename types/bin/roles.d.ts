/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {void}
 */
export function handler(argv: object): void;
/**
 * Get list of database roles
 * @param {object} prompts - Input prompts with schema, role pattern, and limit
 * @returns {Promise<Array>} - Array of role objects
 */
export function getRoles(prompts: object): Promise<any[]>;
export const command: "roles [schema] [role]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
