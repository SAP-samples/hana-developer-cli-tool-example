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
