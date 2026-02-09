/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {void}
 */
export function handler(argv: object): void;
/**
 * Get list of schemas from database
 * @param {object} prompts - Input prompts with schema pattern and limit
 * @returns {Promise<Array>} - Array of schema objects
 */
export function getSchemas(prompts: object): Promise<any[]>;
export const command: "schemas [schema]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
export namespace inputPrompts {
    namespace schema {
        let description: string;
        let type: string;
        let required: boolean;
    }
    namespace all {
        let description_1: string;
        export { description_1 as description };
        let type_1: string;
        export { type_1 as type };
        let required_1: boolean;
        export { required_1 as required };
        export function ask(): boolean;
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
