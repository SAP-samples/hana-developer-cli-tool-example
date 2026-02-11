/**
 * Command handler function to set BTP target (directory and subaccount)
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export function handler(argv: object): Promise<void>;
export function callBTP(prompts: any): Promise<void>;
export const command: "btp [directory] [subaccount]";
export const aliases: string[];
export const describe: string;
export const builder: any;
