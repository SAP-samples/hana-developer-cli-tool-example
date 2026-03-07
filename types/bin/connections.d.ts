/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export function handler(argv: object): Promise<void>;
/**
 * Active connection details and statistics
 * @param {object} prompts - Input prompts
 * @returns {Promise<void>}
 */
export function getConnectionDetails(prompts: object): Promise<void>;
export const command: "connections";
export const aliases: string[];
export const describe: string;
export function builder(yargs: any): any;
export namespace inputPrompts {
    namespace limit {
        let description: string;
        let type: string;
        let required: boolean;
    }
}
