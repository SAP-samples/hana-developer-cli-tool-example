export function handler(argv: any): void;
export function functionInspect(prompts: any): Promise<void>;
export const command: "inspectFunction [schema] [function]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
