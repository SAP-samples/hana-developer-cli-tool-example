/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {void}
 */
export function handler(argv: object): void;
/**
 * Get list of database triggers
 * @param {object} prompts - Input prompts with schema, trigger pattern, target, and limit
 * @returns {Promise<Array>} - Array of trigger objects
 */
export function getTriggers(prompts: object): Promise<any[]>;
export const command: "triggers [schema] [trigger] [target]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
