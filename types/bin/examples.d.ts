export function handler(argv: any): Promise<void>;
export function showExamples(argv: any): Promise<void>;
export const command: "examples [command] [query...]";
export const aliases: string[];
export const describe: string;
export function builder(yargs: any): any;
