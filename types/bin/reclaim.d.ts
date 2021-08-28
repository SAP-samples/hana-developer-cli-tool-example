export function handler(argv: any): void;
export function reclaim(prompts: any): Promise<void>;
export const command: "reclaim";
export const aliases: "re";
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
