/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export function handler(argv: object): Promise<void>;
/**
 * Clone entire schema with/without data
 * @param {object} prompts - User prompts with clone options
 * @returns {Promise<void>}
 */
export function schemaCloneMain(prompts: object): Promise<void>;
export const command: "schemaClone";
export const aliases: string[];
export const describe: string;
export function builder(yargs: any): any;
export namespace inputPrompts {
    namespace sourceSchema {
        let description: string;
        let type: string;
        let required: boolean;
    }
    namespace targetSchema {
        let description_1: string;
        export { description_1 as description };
        let type_1: string;
        export { type_1 as type };
        let required_1: boolean;
        export { required_1 as required };
    }
    namespace includeData {
        let description_2: string;
        export { description_2 as description };
        let type_2: string;
        export { type_2 as type };
        let required_2: boolean;
        export { required_2 as required };
        export function ask(): boolean;
    }
    namespace timeout {
        let description_3: string;
        export { description_3 as description };
        let type_3: string;
        export { type_3 as type };
        let required_3: boolean;
        export { required_3 as required };
        let _default: number;
        export { _default as default };
        export function ask_1(): boolean;
        export { ask_1 as ask };
    }
    namespace profile {
        let description_4: string;
        export { description_4 as description };
        let type_4: string;
        export { type_4 as type };
        let required_4: boolean;
        export { required_4 as required };
        export function ask_2(): void;
        export { ask_2 as ask };
    }
    namespace dryRun {
        let description_5: string;
        export { description_5 as description };
        let type_5: string;
        export { type_5 as type };
        let required_5: boolean;
        export { required_5 as required };
        export function ask_3(): boolean;
        export { ask_3 as ask };
    }
}
