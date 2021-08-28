export function handler(argv: any): void;
export function makeSecrets({ envFile, secretsFolder, filter }: {
    envFile: any;
    secretsFolder: any;
    filter: any;
}): Promise<void>;
export const command: "copy2Secrets";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
