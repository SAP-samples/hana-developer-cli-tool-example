/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export function handler(argv: object): Promise<void>;
/**
 * Scan for common security vulnerabilities
 * @param {object} prompts - Input prompts
 * @returns {Promise<void>}
 */
export function scanForVulnerabilities(prompts: object): Promise<void>;
export const command: "securityScan";
export const aliases: string[];
export const describe: string;
export function builder(yargs: any): any;
export const securityScanBuilderOptions: any;
export namespace inputPrompts {
    namespace category {
        let description: string;
        let type: string;
        let required: boolean;
    }
    namespace detailed {
        let description_1: string;
        export { description_1 as description };
        let type_1: string;
        export { type_1 as type };
        let required_1: boolean;
        export { required_1 as required };
    }
}
