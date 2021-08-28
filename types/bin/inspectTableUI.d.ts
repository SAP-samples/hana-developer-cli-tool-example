export function handler(argv: any): void;
export function tableInspect(prompts: any): Promise<void>;
export const command: "inspectTableUI [schema] [table]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
