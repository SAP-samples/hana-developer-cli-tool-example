export function handler(argv: any): Promise<void>;
export function setKeyDetails(input: any): Promise<void>;
export function saveEnv(options: any, input: any): Promise<void>;
export const command: "serviceKey [instance] [key]";
export const aliases: string[];
export const describe: string;
export function builder(yargs: any): any;
