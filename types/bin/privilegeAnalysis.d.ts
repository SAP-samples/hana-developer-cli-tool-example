/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export function handler(argv: object): Promise<void>;
/**
 * Analyze user privileges and suggest least privilege
 * @param {object} prompts - Input prompts
 * @returns {Promise<void>}
 */
export function analyzePrivileges(prompts: object): Promise<void>;
export const command: "privilegeAnalysis";
export const aliases: string[];
export const describe: string;
export function builder(yargs: any): any;
export const privilegeAnalysisBuilderOptions: any;
export namespace inputPrompts {
    namespace user {
        let description: string;
        let type: string;
        let required: boolean;
    }
}
