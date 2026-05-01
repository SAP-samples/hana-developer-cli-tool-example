export function handler(argv: any): Promise<void>;
export function mcpStatus(): Promise<void>;
export const command: "mcpServerStatus";
export const aliases: string[];
export const describe: string;
export function builder(yargs: any): any;
