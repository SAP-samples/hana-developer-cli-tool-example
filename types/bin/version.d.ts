export function verOutput(): Promise<void>;
export function version4(pkgPath: string, info: {}, parentPath: any): {};
export function getVersion(): Promise<{}>;
export const command: "version";
export const aliases: "ver";
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
export function handler(argv: any): void;
