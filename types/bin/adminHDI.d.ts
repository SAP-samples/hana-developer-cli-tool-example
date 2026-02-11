/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export function handler(argv: object): Promise<void>;
/**
 * Create HDI admin user or assign HDI admin privileges to existing user
 * @param {object} prompts - Input prompts with user, password, and create flag
 * @returns {Promise<void>}
 */
export function activate(prompts: object): Promise<void>;
export const command: "adminHDI [user] [password]";
export const aliases: string[];
export const describe: string;
export const builder: any;
