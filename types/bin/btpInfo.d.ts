export function handler(argv: any): Promise<void>;
export function getBTPInfo(prompts: any): Promise<void>;
export function getBTPInfoUI(prompts: any): Promise<{
    UserName: any;
    ServerURL: any;
    Version: any;
    GlobalAccount: string;
    GlobalAccountID: string;
    Directory: string;
    DirectoryID: string;
    SubAccount: string;
    SubAccountID: string;
}>;
export const command: "btpInfo";
export const aliases: string[];
export const describe: string;
export const builder: any;
