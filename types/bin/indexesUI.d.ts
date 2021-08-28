export function handler(argv: any): void;
export function getIndexes(prompts: any): Promise<void>;
export const command: "indexesUI [schema] [indexes]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
