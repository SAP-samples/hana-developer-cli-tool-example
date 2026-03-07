/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export function handler(argv: object): Promise<void>;
/**
 * Check encryption status of tables and backups
 * @param {object} prompts - Input prompts
 * @returns {Promise<void>}
 */
export function checkEncryptionStatus(prompts: object): Promise<void>;
export const command: "encryptionStatus";
export const aliases: string[];
export const describe: string;
export function builder(yargs: any): any;
export const encryptionStatusBuilderOptions: any;
export namespace inputPrompts {
    namespace scope {
        let description: string;
        let type: string;
        let required: boolean;
    }
}
