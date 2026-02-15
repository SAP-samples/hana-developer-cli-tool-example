/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export function handler(argv: object): Promise<void>;
/**
 * Get expensive SQL statements
 * @param {object} prompts - Input prompts with limit and orderBy
 * @returns {Promise<Array>} - Array of expensive statement objects
 */
export function getExpensiveStatements(prompts: object): Promise<any[]>;
export const command: "expensiveStatements";
export const aliases: any[];
export const describe: string;
export const builder: any;
export namespace inputPrompts {
    namespace limit {
        let description: string;
        let type: string;
        let required: boolean;
    }
    namespace orderBy {
        let description_1: string;
        export { description_1 as description };
        let type_1: string;
        export { type_1 as type };
        let required_1: boolean;
        export { required_1 as required };
    }
}
