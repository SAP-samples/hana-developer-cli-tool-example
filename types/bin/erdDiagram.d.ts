/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export function handler(argv: object): Promise<void>;
/**
 * Generate ER diagrams from database schema
 * @param {object} prompts - User prompts
 * @returns {Promise<void>}
 */
export function erdDiagramMain(prompts: object): Promise<void>;
export const command: "erdDiagram";
export const aliases: string[];
export const describe: string;
export const builder: any;
export namespace inputPrompts {
    namespace schema {
        let description: string;
        let type: string;
        let required: boolean;
        function ask(): boolean;
    }
    namespace tables {
        let description_1: string;
        export { description_1 as description };
        let type_1: string;
        export { type_1 as type };
        let required_1: boolean;
        export { required_1 as required };
        export function ask_1(): boolean;
        export { ask_1 as ask };
    }
    namespace output {
        let description_2: string;
        export { description_2 as description };
        let type_2: string;
        export { type_2 as type };
        let required_2: boolean;
        export { required_2 as required };
        export function ask_2(): boolean;
        export { ask_2 as ask };
    }
    namespace format {
        let description_3: string;
        export { description_3 as description };
        let type_3: string;
        export { type_3 as type };
        let required_3: boolean;
        export { required_3 as required };
        export function ask_3(): boolean;
        export { ask_3 as ask };
    }
    namespace profile {
        let description_4: string;
        export { description_4 as description };
        let type_4: string;
        export { type_4 as type };
        let required_4: boolean;
        export { required_4 as required };
        export function ask_4(): void;
        export { ask_4 as ask };
    }
}
declare namespace _default {
    export { command };
    export { aliases };
    export { describe };
    export { builder };
    export { handler };
}
export default _default;
