export function handler(argv: any): void;
export function sysInfo(prompts: any): Promise<void>;
export const command: "systemInfo";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
