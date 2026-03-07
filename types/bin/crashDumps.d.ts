/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export function handler(argv: object): Promise<void>;
/**
 * List and analyze crash dump files
 * @param {object} prompts - Input prompts
 * @returns {Promise<void>}
 */
export function listCrashDumps(prompts: object): Promise<void>;
export const command: "crashDumps";
export const aliases: string[];
export const describe: string;
export function builder(yargs: any): any;
export namespace inputPrompts {
    export namespace days {
        let description: string;
        let type: string;
        let required: boolean;
    }
    export namespace type_1 {
        let description_1: string;
        export { description_1 as description };
        let type_2: string;
        export { type_2 as type };
        let required_1: boolean;
        export { required_1 as required };
    }
    export { type_1 as type };
    export namespace limit {
        let description_2: string;
        export { description_2 as description };
        let type_3: string;
        export { type_3 as type };
        let required_2: boolean;
        export { required_2 as required };
    }
}
