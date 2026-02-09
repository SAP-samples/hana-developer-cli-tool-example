/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {void}
 */
export function handler(argv: object): void;
/**
 * Remove newline characters from data row values
 * @param {object} dataRow - Data row object
 * @returns {object} - Cleaned data row
 */
export function removeNewlineCharacter(dataRow: object): object;
/**
 * Execute a simple database query and output results in various formats
 * @param {object} prompts - Input prompts with query, output format, and file options
 * @returns {Promise<any>}
 */
export function dbQuery(prompts: object): Promise<any>;
export const command: "querySimple";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
export namespace inputPrompts {
    namespace query {
        let description: string;
        let type: string;
        let required: boolean;
    }
    namespace folder {
        let description_1: string;
        export { description_1 as description };
        let type_1: string;
        export { type_1 as type };
        let required_1: boolean;
        export { required_1 as required };
    }
    namespace filename {
        let description_2: string;
        export { description_2 as description };
        let type_2: string;
        export { type_2 as type };
        let required_2: boolean;
        export { required_2 as required };
        export function ask(): boolean;
    }
    namespace output {
        let description_3: string;
        export { description_3 as description };
        let type_3: string;
        export { type_3 as type };
        let required_3: boolean;
        export { required_3 as required };
    }
    namespace profile {
        let description_4: string;
        export { description_4 as description };
        let type_4: string;
        export { type_4 as type };
        let required_4: boolean;
        export { required_4 as required };
        export function ask_1(): void;
        export { ask_1 as ask };
    }
}
