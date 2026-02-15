/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export function handler(argv: object): Promise<void>;
/**
 * Get backup and recovery status from database
 * @param {object} prompts - Input prompts with status query configuration
 * @returns {Promise<object>} - Backup status information
 */
export function getBackupStatus(prompts: object): Promise<object>;
export const command: "backupStatus";
export const aliases: string[];
export const describe: string;
export const builder: any;
export namespace inputPrompts {
    namespace catalogOnly {
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
    namespace backupType {
        let description_2: string;
        export { description_2 as description };
        let type_2: string;
        export { type_2 as type };
        let required_2: boolean;
        export { required_2 as required };
    }
    namespace status {
        let description_3: string;
        export { description_3 as description };
        let type_3: string;
        export { type_3 as type };
        let required_3: boolean;
        export { required_3 as required };
    }
    namespace days {
        let description_4: string;
        export { description_4 as description };
        let type_4: string;
        export { type_4 as type };
        let required_4: boolean;
        export { required_4 as required };
    }
}
