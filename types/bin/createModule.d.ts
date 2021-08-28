export function handler(argv: any): void;
export function save(prompts: any): Promise<void>;
export const command: "createModule";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
