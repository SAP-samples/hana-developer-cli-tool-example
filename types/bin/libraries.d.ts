/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export function handler(argv: object): Promise<void>;
/**
 * Get list of libraries from database
 * @param {object} prompts - Input prompts with schema, library pattern, and limit
 * @returns {Promise<Array>} - Array of library objects
 */
export function getLibraries(prompts: object): Promise<any[]>;
export const command: "libraries [schema] [library]";
export const aliases: string[];
export const describe: string;
export const builder: any;
