export function handler(argv: any): void;
export function drop(prompts: any): Promise<void>;
export const command: "dropGroup [group]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
