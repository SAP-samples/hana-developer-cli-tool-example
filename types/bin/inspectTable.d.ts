export function handler(argv: any): void;
export function tableInspect(prompts: any): Promise<{
    basic: any;
    fields: any;
    constraints: any;
    sql: string;
    cds: string;
    hdbtable: string | {
        file: string;
    };
}>;
export const command: "inspectTable [schema] [table]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
export namespace inputPrompts {
    namespace table {
        const description: string;
        const type: string;
        const required: boolean;
    }
    namespace schema {
        const description_1: string;
        export { description_1 as description };
        const type_1: string;
        export { type_1 as type };
        const required_1: boolean;
        export { required_1 as required };
    }
    namespace output {
        const description_2: string;
        export { description_2 as description };
        const type_2: string;
        export { type_2 as type };
        const required_2: boolean;
        export { required_2 as required };
    }
    namespace useHanaTypes {
        const description_3: string;
        export { description_3 as description };
        const type_3: string;
        export { type_3 as type };
    }
    namespace useExists {
        const description_4: string;
        export { description_4 as description };
        const type_4: string;
        export { type_4 as type };
    }
    namespace useQuoted {
        const description_5: string;
        export { description_5 as description };
        const type_5: string;
        export { type_5 as type };
    }
}
