export function handler(argv: any): Promise<void>;
export function getBTPInfo(prompts: any): Promise<void>;
export const command: "btpInfo";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
