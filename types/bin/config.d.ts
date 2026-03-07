export function handler(argv: any): Promise<void>;
export function configOutput(argv: any): Promise<any>;
export const command: "config [action]";
export const aliases: string[];
export const describe: string;
export function builder(yargs: any): any;
