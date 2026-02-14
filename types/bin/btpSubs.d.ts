export function handler(argv: any): Promise<void>;
export function getSubs(prompts: any): Promise<void>;
export function getSubsUI(prompts: any): Promise<any>;
export const command: "sub";
export const aliases: string[];
export const describe: string;
export const builder: any;
