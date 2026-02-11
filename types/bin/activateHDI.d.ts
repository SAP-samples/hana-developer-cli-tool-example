/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export function handler(argv: object): Promise<void>;
/**
 * Activate HDI (HANA Deployment Infrastructure) diserver on the specified tenant database
 * @param {object} prompts - Input prompts with tenant name
 * @returns {Promise<void>}
 */
export function activate(prompts: object): Promise<void>;
export const command: "activateHDI [tenant]";
export const aliases: string[];
export const describe: string;
export const builder: any;
