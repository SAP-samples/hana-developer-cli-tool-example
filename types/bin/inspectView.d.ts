/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export function handler(argv: object): Promise<void>;
/**
 * Inspect a view and display its metadata, columns, and definition in various formats
 * @param {object} prompts - Input prompts with schema, view name, and output format
 * @returns {Promise<any>}
 */
export function viewInspect(prompts: object): Promise<any>;
export const command: "inspectView [schema] [view]";
export const aliases: string[];
export const describe: string;
export const builder: any;
export namespace inputPrompts {
    namespace view {
        let description: string;
        let type: string;
        let required: boolean;
    }
    namespace schema {
        let description_1: string;
        export { description_1 as description };
        let type_1: string;
        export { type_1 as type };
        let required_1: boolean;
        export { required_1 as required };
    }
    namespace output {
        let description_2: string;
        export { description_2 as description };
        let type_2: string;
        export { type_2 as type };
        let required_2: boolean;
        export { required_2 as required };
    }
    namespace useHanaTypes {
        let description_3: string;
        export { description_3 as description };
        let type_3: string;
        export { type_3 as type };
    }
    namespace useExists {
        let description_4: string;
        export { description_4 as description };
        let type_4: string;
        export { type_4 as type };
    }
    namespace useQuoted {
        let description_5: string;
        export { description_5 as description };
        let type_5: string;
        export { type_5 as type };
    }
    namespace noColons {
        let type_6: string;
        export { type_6 as type };
        let description_6: string;
        export { description_6 as description };
    }
}
