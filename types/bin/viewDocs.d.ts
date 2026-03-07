export function handler(argv: any): Promise<void>;
export function viewDocumentation(argv: any): Promise<void>;
export const command: "viewDocs [topic]";
export const aliases: string[];
export const describe: string;
export function builder(yargs: any): any;
