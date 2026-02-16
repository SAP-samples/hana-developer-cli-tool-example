/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export function handler(argv: object): Promise<void>;
/**
 * Comprehensive database health assessment
 * @param {object} prompts - Input prompts with check types
 * @returns {Promise<void>}
 */
export function performHealthCheck(prompts: object): Promise<void>;
export const command: "healthCheck";
export const aliases: string[];
export const describe: string;
export const builder: any;
export namespace inputPrompts {
    namespace checks {
        let description: string;
        let type: string;
        let required: boolean;
    }
}
