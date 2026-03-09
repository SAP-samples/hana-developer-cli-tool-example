/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export function handler(argv: object): Promise<void>;
/**
 * Copy table structure and/or data
 * @param {object} prompts - User prompts with copy options
 * @returns {Promise<void>}
 */
export function tableCopyMain(prompts: object): Promise<void>;
export const command: "tableCopy";
export const aliases: string[];
export const describe: string;
export function builder(yargs: any): any;
export namespace inputPrompts {
    namespace sourceTable {
        let description: string;
        let type: string;
        let required: boolean;
    }
    namespace targetTable {
        let description_1: string;
        export { description_1 as description };
        let type_1: string;
        export { type_1 as type };
        let required_1: boolean;
        export { required_1 as required };
    }
    namespace sourceSchema {
        let description_2: string;
        export { description_2 as description };
        let type_2: string;
        export { type_2 as type };
        let required_2: boolean;
        export { required_2 as required };
    }
    namespace targetSchema {
        let description_3: string;
        export { description_3 as description };
        let type_3: string;
        export { type_3 as type };
        let required_3: boolean;
        export { required_3 as required };
    }
    namespace structureOnly {
        let description_4: string;
        export { description_4 as description };
        let type_4: string;
        export { type_4 as type };
        let required_4: boolean;
        export { required_4 as required };
        export function ask(): boolean;
    }
    namespace dataOnly {
        let description_5: string;
        export { description_5 as description };
        let type_5: string;
        export { type_5 as type };
        let required_5: boolean;
        export { required_5 as required };
        export function ask_1(): boolean;
        export { ask_1 as ask };
    }
    namespace limit {
        let description_6: string;
        export { description_6 as description };
        let type_6: string;
        export { type_6 as type };
        let required_6: boolean;
        export { required_6 as required };
        export function ask_2(): boolean;
        export { ask_2 as ask };
    }
    namespace timeout {
        let description_7: string;
        export { description_7 as description };
        let type_7: string;
        export { type_7 as type };
        let required_7: boolean;
        export { required_7 as required };
        let _default: number;
        export { _default as default };
        export function ask_3(): boolean;
        export { ask_3 as ask };
    }
    namespace profile {
        let description_8: string;
        export { description_8 as description };
        let type_8: string;
        export { type_8 as type };
        let required_8: boolean;
        export { required_8 as required };
        export function ask_4(): void;
        export { ask_4 as ask };
    }
    namespace dryRun {
        let description_9: string;
        export { description_9 as description };
        let type_9: string;
        export { type_9 as type };
        let required_9: boolean;
        export { required_9 as required };
        export function ask_5(): boolean;
        export { ask_5 as ask };
    }
}
