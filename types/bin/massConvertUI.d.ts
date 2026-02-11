export function handler(argv: any): Promise<void>;
export const command: "massConvertUI [schema] [table]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
