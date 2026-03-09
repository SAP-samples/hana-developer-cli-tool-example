/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export function handler(argv: object): Promise<void>;
/**
 * Monitor system replication status
 * @param {object} prompts - User prompts with replication options
 * @returns {Promise<void>}
 */
export function replicationStatusMain(prompts: object): Promise<void>;
export const command: "replicationStatus";
export const aliases: string[];
export const describe: string;
export function builder(yargs: any): any;
export namespace inputPrompts {
    namespace type {
        export let description: string;
        let type_1: string;
        export { type_1 as type };
        export let required: boolean;
        export function ask(): boolean;
    }
    namespace serviceName {
        let description_1: string;
        export { description_1 as description };
        let type_2: string;
        export { type_2 as type };
        let required_1: boolean;
        export { required_1 as required };
        export function ask_1(): boolean;
        export { ask_1 as ask };
    }
    namespace profile {
        let description_2: string;
        export { description_2 as description };
        let type_3: string;
        export { type_3 as type };
        let required_2: boolean;
        export { required_2 as required };
        export function ask_2(): void;
        export { ask_2 as ask };
    }
}
