export function handler(argv: any): void;
export function getSequences(prompts: any): Promise<any>;
export const command: "sequences [schema] [sequence]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
