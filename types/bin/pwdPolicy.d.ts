/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export function handler(argv: object): Promise<void>;
/**
 * View and manage password policies
 * @param {object} prompts - Input prompts
 * @returns {Promise<void>}
 */
export function managePasswordPolicies(prompts: object): Promise<void>;
export const command: "pwdPolicy";
export const aliases: string[];
export const describe: string;
export function builder(yargs: any): any;
export const pwdPolicyBuilderOptions: object;
export namespace inputPrompts {
    namespace list {
        let description: string;
        let type: string;
        let required: boolean;
    }
}
