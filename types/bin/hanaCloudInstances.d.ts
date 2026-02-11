/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export function handler(argv: object): Promise<void>;
/**
 * List HANA Cloud instances with status and details
 * @param {object} prompts - Input prompts with instance name filter
 * @returns {Promise<void>}
 */
export function listInstances(prompts: object): Promise<void>;
export const command: "hc [name]";
export const aliases: string[];
export const describe: string;
export const builder: any;
