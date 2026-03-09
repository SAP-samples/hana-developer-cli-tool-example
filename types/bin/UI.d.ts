export function handler(argv: any): Promise<void>;
export function UI(prompts: any): Promise<void>;
export const command: "UI";
export const aliases: string[];
export const describe: string;
export function builder(yargs: any): any;
export namespace inputPrompts {
    namespace port {
        let description: string;
        let type: string;
        let required: boolean;
        function ask(): void;
    }
    namespace host {
        let description_1: string;
        export { description_1 as description };
        let type_1: string;
        export { type_1 as type };
        let required_1: boolean;
        export { required_1 as required };
        export function ask_1(): void;
        export { ask_1 as ask };
    }
}
