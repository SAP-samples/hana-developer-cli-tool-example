/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export function handler(argv: object): Promise<void>;
/**
 * Manage XSA (Extended Services Architecture) services
 * @param {object} prompts - Input prompts with action and service name
 * @returns {Promise<void>}
 */
export function manageXSAServices(prompts: object): Promise<void>;
export const command: "xsaServices [action]";
export const aliases: string[];
export const describe: string;
export const builder: any;
export namespace inputPrompts {
    namespace action {
        let description: string;
        let type: string;
        let required: boolean;
    }
    namespace service {
        let description_1: string;
        export { description_1 as description };
        let type_1: string;
        export { type_1 as type };
        let required_1: boolean;
        export { required_1 as required };
    }
    namespace details {
        let description_2: string;
        export { description_2 as description };
        let type_2: string;
        export { type_2 as type };
        let required_2: boolean;
        export { required_2 as required };
    }
}
