/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export function handler(argv: object): Promise<void>;
/**
 * Connect to HANA database with provided credentials
 * @param {object} input - Input prompts with connection details
 * @returns {Promise<void>}
 */
export function dbConnect(input: object): Promise<void>;
/**
 * Save connection environment to default-env-admin.json file
 * @param {object} options - Connection options to save
 * @returns {Promise<void>}
 */
export function saveEnv(options: object): Promise<void>;
export const command: "connect [user] [password]";
export const aliases: string[];
export const describe: string;
export const builder: any;
