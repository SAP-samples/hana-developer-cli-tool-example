/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export function handler(argv: object): Promise<void>;
/**
 * View SQL plan cache and result cache statistics
 * @param {object} prompts - Input prompts with cacheType and limit
 * @returns {Promise<{planCache?: Array, resultCache?: Array}>}
 */
export function getCacheStats(prompts: object): Promise<{
    planCache?: any[];
    resultCache?: any[];
}>;
export const command: "cacheStats";
export const aliases: any[];
export const describe: string;
export function builder(yargs: any): any;
export namespace inputPrompts {
    namespace cacheType {
        let description: string;
        let type: string;
        let required: boolean;
    }
    namespace limit {
        let description_1: string;
        export { description_1 as description };
        let type_1: string;
        export { type_1 as type };
        let required_1: boolean;
        export { required_1 as required };
    }
}
