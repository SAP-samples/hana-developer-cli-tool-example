export function handler(argv: any): void;
export function test(result: any): Promise<void>;
export const command: "test";
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
