export function handler(argv: any): void;
export function createIssue(): Promise<void>;
export const command: "issue";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
