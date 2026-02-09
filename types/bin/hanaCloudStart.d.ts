/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {void}
 */
export function handler(argv: object): void;
/**
 * Start HANA Cloud instance
 * @param {object} prompts - Input prompts with instance name
 * @returns {Promise<void>}
 */
export function hcStart(prompts: object): Promise<void>;
export const command: "hcStart [name]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
