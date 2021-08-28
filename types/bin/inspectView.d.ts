export function handler(argv: any): void;
export function viewInspect(prompts: any): Promise<void>;
export const command: "inspectView [schema] [view]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
