/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export function handler(argv: object): Promise<void>;
/**
 * Get list of database users
 * @param {object} prompts - Input prompts with user pattern and limit
 * @returns {Promise<Array>} - Array of user objects
 */
export function getUsers(prompts: object): Promise<any[]>;
export const command: "users [user]";
export const aliases: string[];
export const describe: string;
export const builder: any;
