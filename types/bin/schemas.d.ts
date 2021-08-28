export function handler(argv: any): void;
export function getSchemas(prompts: any): Promise<any>;
export const command: "schemas [schema]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
export namespace inputPrompts {
    namespace schema {
        const description: string;
        const type: string;
        const required: boolean;
    }
    namespace all {
        const description_1: string;
        export { description_1 as description };
        const type_1: string;
        export { type_1 as type };
        const required_1: boolean;
        export { required_1 as required };
        export function ask(): boolean;
    }
    namespace limit {
        const description_2: string;
        export { description_2 as description };
        const type_2: string;
        export { type_2 as type };
        const required_2: boolean;
        export { required_2 as required };
    }
}
