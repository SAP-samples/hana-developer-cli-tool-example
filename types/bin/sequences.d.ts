/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export function handler(argv: object): Promise<void>;
/**
 * Get list of database sequences
 * @param {object} prompts - Input prompts with schema, sequence pattern, and limit
 * @returns {Promise<Array>} - Array of sequence objects
 */
export function getSequences(prompts: object): Promise<any[]>;
export const command: "sequences [schema] [sequence]";
export const aliases: string[];
export const describe: string;
export const builder: any;
