export function handler(argv: any): Promise<void>;
export function createIssue(): Promise<void>;
export const command: "issue";
export const aliases: string[];
export const describe: string;
export function builder(yargs: any): any;
