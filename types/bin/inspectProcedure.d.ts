export function handler(argv: any): void;
export function procedureInspect(prompts: any): Promise<void>;
export const command: "inspectProcedure [schema] [procedure]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
