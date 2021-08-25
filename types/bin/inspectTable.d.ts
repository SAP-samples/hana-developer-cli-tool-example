export var command: string;
export var aliases: string[];
export var describe: any;
export var builder: any;
export function handler(argv: any): void;
export namespace inputPrompts {
    namespace table {
        const description: any;
        const type: string;
        const required: boolean;
    }
    namespace schema {
        const description_1: any;
        export { description_1 as description };
        const type_1: string;
        export { type_1 as type };
        const required_1: boolean;
        export { required_1 as required };
    }
    namespace output {
        const description_2: any;
        export { description_2 as description };
        const type_2: string;
        export { type_2 as type };
        const required_2: boolean;
        export { required_2 as required };
    }
    namespace useHanaTypes {
        const description_3: any;
        export { description_3 as description };
        const type_3: string;
        export { type_3 as type };
    }
}
export function tableInspect(prompts: any): Promise<{
    basic: any;
    fields: any;
    constraints: any;
    sql: string;
    cds: string;
    hdbtable: any;
}>;
