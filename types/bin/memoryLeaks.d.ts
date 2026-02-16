/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export function handler(argv: object): Promise<void>;
/**
 * Detect potential memory leaks
 * @param {object} prompts - Input prompts
 * @returns {Promise<void>}
 */
export function detectMemoryLeaks(prompts: object): Promise<void>;
export const command: "memoryLeaks";
export const aliases: string[];
export const describe: string;
export const builder: any;
export namespace inputPrompts {
    namespace component {
        let description: string;
        let type: string;
        let required: boolean;
    }
    namespace threshold {
        let description_1: string;
        export { description_1 as description };
        let type_1: string;
        export { type_1 as type };
        let required_1: boolean;
        export { required_1 as required };
    }
    namespace limit {
        let description_2: string;
        export { description_2 as description };
        let type_2: string;
        export { type_2 as type };
        let required_2: boolean;
        export { required_2 as required };
    }
}
