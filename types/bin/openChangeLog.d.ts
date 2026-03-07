export function handler(argv: any): Promise<void>;
export function getChangeLog(): Promise<void>;
export const command: "changelog";
export const aliases: string[];
export const describe: string;
export function builder(yargs: any): any;
