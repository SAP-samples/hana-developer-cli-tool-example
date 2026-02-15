/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export function handler(argv: object): Promise<void>;
/**
 * Identify frequently accessed tables/partitions
 * @param {object} prompts - Input prompts with schema, table, includePartitions, and limit
 * @returns {Promise<{tables: Array, partitions?: Array}>}
 */
export function getTableHotspots(prompts: object): Promise<{
    tables: any[];
    partitions?: any[];
}>;
export const command: "tableHotspots [schema] [table]";
export const aliases: any[];
export const describe: string;
export const builder: any;
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
    namespace includePartitions {
        let description_2: string;
        export { description_2 as description };
        let type_2: string;
        export { type_2 as type };
        let required_2: boolean;
        export { required_2 as required };
    }
    namespace limit {
        let description_3: string;
        export { description_3 as description };
        let type_3: string;
        export { type_3 as type };
        let required_3: boolean;
        export { required_3 as required };
    }
}
