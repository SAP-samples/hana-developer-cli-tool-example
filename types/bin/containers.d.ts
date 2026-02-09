/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {void}
 */
export function handler(argv: object): void;
/**
 * Get list of HDI containers from database
 * @param {object} prompts - Input prompts with container group, container name, and limit
 * @returns {Promise<Array>} - Array of container objects
 */
export function getContainers(prompts: object): Promise<any[]>;
export function getContainersInt(containerGroup: any, container: any, client: any, limit: any): Promise<any>;
export const command: "containers [containerGroup] [container]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
export namespace inputPrompts {
    namespace container {
        let description: string;
        let type: string;
        let required: boolean;
    }
    namespace containerGroup {
        let description_1: string;
        export { description_1 as description };
        let type_1: string;
        export { type_1 as type };
        let required_1: boolean;
        export { required_1 as required };
    }
    namespace limit {
        let description_2: string;
        export { description_2 as description };
        let type_2: string;
        export { type_2 as type };
        let required_2: boolean;
        export { required_2 as required };
    }
}
