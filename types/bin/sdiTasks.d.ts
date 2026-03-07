/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export function handler(argv: object): Promise<void>;
/**
 * Manage Smart Data Integration tasks
 * @param {object} prompts - User prompts with SDI task options
 * @returns {Promise<void>}
 */
export function sdiTasksMain(prompts: object): Promise<void>;
export const command: "sdiTasks";
export const aliases: string[];
export const describe: string;
export function builder(yargs: any): any;
export namespace inputPrompts {
    namespace action {
        let description: string;
        let type: string;
        let required: boolean;
        function ask(): boolean;
    }
    namespace taskName {
        let description_1: string;
        export { description_1 as description };
        let type_1: string;
        export { type_1 as type };
        let required_1: boolean;
        export { required_1 as required };
    }
    namespace flowgraph {
        let description_2: string;
        export { description_2 as description };
        let type_2: string;
        export { type_2 as type };
        let required_2: boolean;
        export { required_2 as required };
        export function ask_1(): boolean;
        export { ask_1 as ask };
    }
    namespace agentName {
        let description_3: string;
        export { description_3 as description };
        let type_3: string;
        export { type_3 as type };
        let required_3: boolean;
        export { required_3 as required };
        export function ask_2(): boolean;
        export { ask_2 as ask };
    }
    namespace schema {
        let description_4: string;
        export { description_4 as description };
        let type_4: string;
        export { type_4 as type };
        let required_4: boolean;
        export { required_4 as required };
    }
    namespace profile {
        let description_5: string;
        export { description_5 as description };
        let type_5: string;
        export { type_5 as type };
        let required_5: boolean;
        export { required_5 as required };
        export function ask_3(): void;
        export { ask_3 as ask };
    }
}
