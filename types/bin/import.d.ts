/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export function handler(argv: object): Promise<void>;
/**
 * Import data from file into database table
 * @param {object} prompts - Input prompts with filename, table, output format, etc
 * @returns {Promise<object>} Import result summary
 */
export function importData(prompts: object): Promise<object>;
export const command: "import";
export const aliases: string[];
export const describe: string;
export function builder(yargs: any): any;
export namespace inputPrompts {
    namespace filename {
        let description: string;
        let type: string;
        let required: boolean;
    }
    namespace table {
        let description_1: string;
        export { description_1 as description };
        let type_1: string;
        export { type_1 as type };
        let required_1: boolean;
        export { required_1 as required };
    }
    namespace schema {
        let description_2: string;
        export { description_2 as description };
        let type_2: string;
        export { type_2 as type };
        let required_2: boolean;
        export { required_2 as required };
    }
    namespace output {
        let description_3: string;
        export { description_3 as description };
        let type_3: string;
        export { type_3 as type };
        let required_3: boolean;
        export { required_3 as required };
    }
    namespace matchMode {
        let description_4: string;
        export { description_4 as description };
        let type_4: string;
        export { type_4 as type };
        let required_4: boolean;
        export { required_4 as required };
    }
    namespace truncate {
        let description_5: string;
        export { description_5 as description };
        let type_5: string;
        export { type_5 as type };
        let required_5: boolean;
        export { required_5 as required };
        export function ask(): boolean;
    }
    namespace batchSize {
        let description_6: string;
        export { description_6 as description };
        let type_6: string;
        export { type_6 as type };
        let required_6: boolean;
        export { required_6 as required };
        export function ask_1(): boolean;
        export { ask_1 as ask };
    }
    namespace worksheet {
        let description_7: string;
        export { description_7 as description };
        let type_7: string;
        export { type_7 as type };
        let required_7: boolean;
        export { required_7 as required };
        export function ask_2(): boolean;
        export { ask_2 as ask };
    }
    namespace startRow {
        let description_8: string;
        export { description_8 as description };
        let type_8: string;
        export { type_8 as type };
        let required_8: boolean;
        export { required_8 as required };
        export function ask_3(): boolean;
        export { ask_3 as ask };
    }
    namespace skipEmptyRows {
        let description_9: string;
        export { description_9 as description };
        let type_9: string;
        export { type_9 as type };
        let required_9: boolean;
        export { required_9 as required };
        export function ask_4(): boolean;
        export { ask_4 as ask };
    }
    namespace excelCacheMode {
        let description_10: string;
        export { description_10 as description };
        let type_10: string;
        export { type_10 as type };
        let required_10: boolean;
        export { required_10 as required };
        export function ask_5(): boolean;
        export { ask_5 as ask };
    }
    namespace dryRun {
        let description_11: string;
        export { description_11 as description };
        let type_11: string;
        export { type_11 as type };
        let required_11: boolean;
        export { required_11 as required };
        export function ask_6(): boolean;
        export { ask_6 as ask };
    }
    namespace maxFileSizeMB {
        let description_12: string;
        export { description_12 as description };
        let type_12: string;
        export { type_12 as type };
        let required_12: boolean;
        export { required_12 as required };
        export function ask_7(): boolean;
        export { ask_7 as ask };
    }
    namespace timeoutSeconds {
        let description_13: string;
        export { description_13 as description };
        let type_13: string;
        export { type_13 as type };
        let required_13: boolean;
        export { required_13 as required };
        export function ask_8(): boolean;
        export { ask_8 as ask };
    }
    namespace nullValues {
        let description_14: string;
        export { description_14 as description };
        let type_14: string;
        export { type_14 as type };
        let required_14: boolean;
        export { required_14 as required };
        export function ask_9(): boolean;
        export { ask_9 as ask };
    }
    namespace skipWithErrors {
        let description_15: string;
        export { description_15 as description };
        let type_15: string;
        export { type_15 as type };
        let required_15: boolean;
        export { required_15 as required };
        export function ask_10(): boolean;
        export { ask_10 as ask };
    }
    namespace maxErrorsAllowed {
        let description_16: string;
        export { description_16 as description };
        let type_16: string;
        export { type_16 as type };
        let required_16: boolean;
        export { required_16 as required };
        export function ask_11(): boolean;
        export { ask_11 as ask };
    }
    namespace profile {
        let description_17: string;
        export { description_17 as description };
        let type_17: string;
        export { type_17 as type };
        let required_17: boolean;
        export { required_17 as required };
        export function ask_12(): void;
        export { ask_12 as ask };
    }
}
