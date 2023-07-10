export function handler(argv: any): void;
export function getFunctions(prompts: any): Promise<any>;
export const command: "functions [schema] [function]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
export namespace inputPrompts {
    export namespace _function {
        let description: string;
        let type: string;
        let required: boolean;
    }
    export { _function as function };
    export namespace schema {
        let description_1: string;
        export { description_1 as description };
        let type_1: string;
        export { type_1 as type };
        let required_1: boolean;
        export { required_1 as required };
    }
    export namespace limit {
        let description_2: string;
        export { description_2 as description };
        let type_2: string;
        export { type_2 as type };
        let required_2: boolean;
        export { required_2 as required };
    }
}
