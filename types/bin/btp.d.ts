export function handler(argv: any): Promise<void>;
export function callBTP(prompts: any): Promise<void>;
export const command: "btp [directory] [subaccount]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
