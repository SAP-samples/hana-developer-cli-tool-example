export function handler(argv: any): Promise<void>;
export function verOutput(): Promise<void>;
export function version4(pkgPath: string | undefined, info: {} | undefined, parentPath: any): {} | undefined;
export function getVersion(): Promise<{} | undefined>;
export function getVersionUI(): Promise<{} | undefined>;
export const command: "version";
export const aliases: "ver";
export const describe: string;
export function builder(yargs: any): any;
