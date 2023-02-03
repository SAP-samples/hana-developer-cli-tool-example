export function handler(argv: any): Promise<void>;
export function cdsBuild(prompts: any): Promise<void>;
export function getIndex(odataURL: any, entity: any): string;
export function _manifest(odataURL: any, entity: any, table: any): {
    _version: string;
    'sap.app': {
        id: string;
        type: string;
        title: string;
        description: string;
        dataSources: {
            mainService: {
                uri: string;
                type: string;
                settings: {
                    odataVersion: string;
                };
            };
        };
    };
    'sap.ui5': {
        dependencies: {
            libs: {
                'sap.fe.templates': {};
            };
        };
        models: {
            '': {
                dataSource: string;
                settings: {
                    synchronizationMode: string;
                    operationMode: string;
                    autoExpandSelect: boolean;
                    earlyRequests: boolean;
                    groupProperties: {
                        default: {
                            submit: string;
                        };
                    };
                };
            };
        };
        routing: {
            routes: {
                name: string;
                target: string;
                pattern: string;
            }[];
            targets: {
                [x: string]: {
                    type: string;
                    id: string;
                    name: string;
                    options: {
                        settings: {
                            entitySet: string;
                            initialLoad: boolean;
                            navigation: {
                                [x: string]: {
                                    detail: {
                                        route: string;
                                    };
                                };
                            };
                        };
                    };
                } | {
                    type: string;
                    id: string;
                    name: string;
                    options: {
                        settings: {
                            entitySet: string;
                            navigation: {};
                            initialLoad?: undefined;
                        };
                    };
                };
            };
        };
    };
    contentDensities: {
        compact: boolean;
        cozy: boolean;
    };
    'sap.ui': {
        technology: string;
        fullWidth: boolean;
    };
    'sap.fiori': {
        registrationIds: any[];
        archeType: string;
    };
};
export function fiori(manifest: any, odataURL: any, entity: any): string;
export const command: "cds [schema] [table]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
