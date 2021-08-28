export function handler(argv: any): void;
export function getSynonyms(prompts: any): Promise<any>;
export const command: "synonyms [schema] [synonym] [target]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
