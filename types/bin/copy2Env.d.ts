export function handler(argv: any): void;
export function copy(prompts: any): Promise<void>;
export const command: "copy2Env";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
