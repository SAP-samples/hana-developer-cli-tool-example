/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export function handler(argv: object): Promise<void>;
/**
 * List long-running queries with ability to cancel
 * @param {object} prompts - Input prompts
 * @returns {Promise<void>}
 */
export function getLongRunningQueries(prompts: object): Promise<void>;
/**
 * Cancel a long-running query by statement hash
 * @param {string} statementHash - Statement hash to cancel
 * @returns {Promise<void>}
 */
export function cancelLongRunningQuery(statementHash: string): Promise<void>;
export const command: "longRunning";
export const aliases: string[];
export const describe: string;
export function builder(yargs: any): any;
export namespace inputPrompts {
    namespace limit {
        let description: string;
        let type: string;
        let required: boolean;
    }
    namespace duration {
        let description_1: string;
        export { description_1 as description };
        let type_1: string;
        export { type_1 as type };
        let required_1: boolean;
        export { required_1 as required };
    }
    namespace includeIdle {
        let description_2: string;
        export { description_2 as description };
        let type_2: string;
        export { type_2 as type };
        let required_2: boolean;
        export { required_2 as required };
    }
}
