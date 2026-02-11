/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export function handler(argv: object): Promise<void>;
/**
 * Get list of procedures from database
 * @param {object} prompts - Input prompts with schema, procedure, and limit
 * @returns {Promise<Array>} - Array of procedure objects
 */
export function getProcedures(prompts: object): Promise<any[]>;
export const command: "procedures [schema] [procedure]";
export const aliases: string[];
export const describe: string;
export const builder: any;
