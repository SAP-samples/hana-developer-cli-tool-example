export function handler(argv: any): Promise<void>;
export const command: "tablesSQLite [table]";
export const aliases: string[];
export const describe: string;
export const builder: any;
export namespace inputPrompts {
    namespace table {
        let description: string;
        let type: string;
        let required: boolean;
    }
    namespace profile {
        let description_1: string;
        export { description_1 as description };
        let type_1: string;
        export { type_1 as type };
        let required_1: boolean;
        export { required_1 as required };
    }
}
