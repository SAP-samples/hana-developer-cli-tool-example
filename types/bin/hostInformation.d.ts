export function handler(argv: any): void;
export function hostInfo(prompts: any): Promise<void>;
export const command: "hostInformation";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
