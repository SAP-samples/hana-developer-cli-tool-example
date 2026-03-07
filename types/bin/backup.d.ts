/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export function handler(argv: object): Promise<void>;
/**
 * Create backup of database object(s)
 * @param {object} prompts - Input prompts with backup configuration
 * @returns {Promise<object>} - Backup metadata
 */
export function createBackup(prompts: object): Promise<object>;
export const command: "backup [target] [name]";
export const aliases: string[];
export const describe: string;
export function builder(yargs: any): any;
export namespace inputPrompts {
    namespace target {
        let description: string;
        let type: string;
        let required: boolean;
    }
    namespace name {
        let description_1: string;
        export { description_1 as description };
        let type_1: string;
        export { type_1 as type };
        let required_1: boolean;
        export { required_1 as required };
    }
    namespace backupType {
        let description_2: string;
        export { description_2 as description };
        let type_2: string;
        export { type_2 as type };
        let required_2: boolean;
        export { required_2 as required };
    }
    namespace format {
        let description_3: string;
        export { description_3 as description };
        let type_3: string;
        export { type_3 as type };
        let required_3: boolean;
        export { required_3 as required };
    }
    namespace destination {
        let description_4: string;
        export { description_4 as description };
        let type_4: string;
        export { type_4 as type };
        let required_4: boolean;
        export { required_4 as required };
    }
    namespace compress {
        let description_5: string;
        export { description_5 as description };
        let type_5: string;
        export { type_5 as type };
        let required_5: boolean;
        export { required_5 as required };
    }
    namespace schema {
        let description_6: string;
        export { description_6 as description };
        let type_6: string;
        export { type_6 as type };
        let required_6: boolean;
        export { required_6 as required };
    }
    namespace withData {
        let description_7: string;
        export { description_7 as description };
        let type_7: string;
        export { type_7 as type };
        let required_7: boolean;
        export { required_7 as required };
    }
    namespace overwrite {
        let description_8: string;
        export { description_8 as description };
        let type_8: string;
        export { type_8 as type };
        let required_8: boolean;
        export { required_8 as required };
    }
}
