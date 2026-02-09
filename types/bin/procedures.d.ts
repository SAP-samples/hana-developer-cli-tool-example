/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {void}
 */
export function handler(argv: object): void;
/**
 * Get list of procedures from database
 * @param {object} prompts - Input prompts with schema, procedure, and limit
 * @returns {Promise<Array>} - Array of procedure objects
 */
export function getProcedures(prompts: object): Promise<any[]>;
export const command: "procedures [schema] [procedure]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
