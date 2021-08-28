export function handler(argv: any): void;
export function launchHdbsql(prompts: any): Promise<void>;
export const command: "hdbsql";
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
