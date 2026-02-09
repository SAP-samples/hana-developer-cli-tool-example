/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {void}
 */
export function handler(argv: object): void;
/**
 * Inspect a stored procedure and display its metadata, parameters, and definition
 * @param {object} prompts - Input prompts with schema, procedure name, and output format
 * @returns {Promise<void>}
 */
export function procedureInspect(prompts: object): Promise<void>;
export const command: "inspectProcedure [schema] [procedure]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
