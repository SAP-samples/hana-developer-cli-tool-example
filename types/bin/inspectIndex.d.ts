export function handler(argv: any): void;
export function indexInspect(prompts: any): Promise<void>;
export const command: "inspectIndex [schema] [index]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
