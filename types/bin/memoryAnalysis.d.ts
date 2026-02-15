/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export function handler(argv: object): Promise<void>;
/**
 * Memory consumption breakdown by component
 * @param {object} prompts - Input prompts with component and limit
 * @returns {Promise<Array>} - Array of memory objects
 */
export function getMemoryAnalysis(prompts: object): Promise<any[]>;
export const command: "memoryAnalysis";
export const aliases: any[];
export const describe: string;
export const builder: any;
export namespace inputPrompts {
    namespace component {
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
