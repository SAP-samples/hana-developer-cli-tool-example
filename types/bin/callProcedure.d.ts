export function handler(argv: any): Promise<void>;
export function callProc(prompts: any): Promise<void>;
export const command: "callProcedure [schema] [procedure]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
