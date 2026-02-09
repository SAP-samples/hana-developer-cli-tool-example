/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {void}
 */
export function handler(argv: object): void;
/**
 * Add a user as an HDI group admin
 * @param {object} prompts - Input prompts with user and group
 * @returns {Promise<void>}
 */
export function activate(prompts: object): Promise<void>;
export const command: "adminHDIGroup [user] [group]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
