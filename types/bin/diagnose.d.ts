/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export function handler(argv: object): Promise<void>;
/**
 * Run comprehensive system diagnostics
 * @param {object} prompts - Input prompts
 * @returns {Promise<void>}
 */
export function runDiagnostics(prompts: object): Promise<void>;
export const command: "diagnose";
export const aliases: string[];
export const describe: string;
export function builder(yargs: any): any;
export namespace inputPrompts {
    namespace checks {
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
