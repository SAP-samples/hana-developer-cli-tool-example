/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export function handler(argv: object): Promise<void>;
/**
 * Get query execution plan for a SQL statement
 * @param {object} prompts - Input prompts with SQL statement
 * @returns {Promise<Array>} - Array of plan rows
 */
export function getQueryPlan(prompts: object): Promise<any[]>;
export const command: "queryPlan";
export const aliases: any[];
export const describe: string;
export function builder(yargs: any): any;
export namespace inputPrompts {
    namespace sql {
        let description: string;
        let type: string;
        let required: boolean;
    }
}
