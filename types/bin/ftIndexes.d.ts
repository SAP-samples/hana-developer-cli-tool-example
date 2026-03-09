/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export function handler(argv: object): Promise<void>;
/**
 * Get full-text indexes from database
 * @param {object} prompts - Input prompts with schema, index, and table
 * @returns {Promise<Array>} - Array of full-text index objects
 */
export function getFullTextIndexes(prompts: object): Promise<any[]>;
export const command: "ftIndexes [schema] [index]";
export const aliases: string[];
export const describe: string;
export function builder(yargs: any): any;
export namespace inputPrompts {
    namespace index {
        let description: string;
        let type: string;
        let required: boolean;
    }
    namespace schema {
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
    namespace details {
        let description_3: string;
        export { description_3 as description };
        let type_3: string;
        export { type_3 as type };
        let required_3: boolean;
        export { required_3 as required };
    }
}
