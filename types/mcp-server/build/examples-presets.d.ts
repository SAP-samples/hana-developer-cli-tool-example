/**
 * Get examples for a command
 */
export function getCommandExamples(command: any): any;
/**
 * Get presets for a command
 */
export function getCommandPresets(command: any): any;
/**
 * Check if command has examples
 */
export function hasExamples(command: any): boolean;
/**
 * Check if command has presets
 */
export function hasPresets(command: any): boolean;
/**
 * Get all commands with examples
 */
export function getCommandsWithExamples(): string[];
/**
 * Get all commands with presets
 */
export function getCommandsWithPresets(): string[];
export namespace COMMAND_EXAMPLES {
    let _import: ({
        scenario: string;
        description: string;
        parameters: {
            filename: string;
            table: string;
            schema: string;
            dryRun?: undefined;
            skipWithErrors?: undefined;
            maxErrorsAllowed?: undefined;
            maxFileSizeMB?: undefined;
            timeoutSeconds?: undefined;
            matchMode?: undefined;
        };
        notes: string;
        expectedOutput: string;
    } | {
        scenario: string;
        description: string;
        parameters: {
            filename: string;
            table: string;
            schema: string;
            dryRun: boolean;
            skipWithErrors?: undefined;
            maxErrorsAllowed?: undefined;
            maxFileSizeMB?: undefined;
            timeoutSeconds?: undefined;
            matchMode?: undefined;
        };
        notes: string;
        expectedOutput: string;
    } | {
        scenario: string;
        description: string;
        parameters: {
            filename: string;
            table: string;
            schema: string;
            skipWithErrors: boolean;
            maxErrorsAllowed: number;
            dryRun?: undefined;
            maxFileSizeMB?: undefined;
            timeoutSeconds?: undefined;
            matchMode?: undefined;
        };
        notes: string;
        expectedOutput: string;
    } | {
        scenario: string;
        description: string;
        parameters: {
            filename: string;
            table: string;
            schema: string;
            maxFileSizeMB: number;
            timeoutSeconds: number;
            dryRun?: undefined;
            skipWithErrors?: undefined;
            maxErrorsAllowed?: undefined;
            matchMode?: undefined;
        };
        notes: string;
        expectedOutput: string;
    } | {
        scenario: string;
        description: string;
        parameters: {
            filename: string;
            table: string;
            schema: string;
            matchMode: string;
            dryRun?: undefined;
            skipWithErrors?: undefined;
            maxErrorsAllowed?: undefined;
            maxFileSizeMB?: undefined;
            timeoutSeconds?: undefined;
        };
        notes: string;
        expectedOutput: string;
    })[];
    export { _import as import };
    let _export: ({
        scenario: string;
        description: string;
        parameters: {
            table: string;
            schema: string;
            filename: string;
            where?: undefined;
        };
        expectedOutput: string;
        notes?: undefined;
    } | {
        scenario: string;
        description: string;
        parameters: {
            table: string;
            schema: string;
            filename: string;
            where: string;
        };
        notes: string;
        expectedOutput: string;
    } | {
        scenario: string;
        description: string;
        parameters: {
            table: string;
            schema: string;
            filename: string;
            where?: undefined;
        };
        notes: string;
        expectedOutput: string;
    })[];
    export { _export as export };
    export let tables: ({
        scenario: string;
        description: string;
        parameters: {
            schema: string;
            table?: undefined;
        };
        expectedOutput: string;
        notes?: undefined;
    } | {
        scenario: string;
        description: string;
        parameters: {
            schema: string;
            table: string;
        };
        notes: string;
        expectedOutput: string;
    })[];
    export let inspectTable: {
        scenario: string;
        description: string;
        parameters: {
            table: string;
            schema: string;
        };
        expectedOutput: string;
    }[];
    export let dataProfile: ({
        scenario: string;
        description: string;
        parameters: {
            table: string;
            schema: string;
            columns?: undefined;
        };
        notes: string;
        expectedOutput: string;
    } | {
        scenario: string;
        description: string;
        parameters: {
            table: string;
            schema: string;
            columns: string[];
        };
        notes: string;
        expectedOutput: string;
    })[];
    export let dataValidator: {
        scenario: string;
        description: string;
        parameters: {
            table: string;
            schema: string;
            rulesFile: string;
        };
        notes: string;
        expectedOutput: string;
    }[];
    export let duplicateDetection: ({
        scenario: string;
        description: string;
        parameters: {
            table: string;
            schema: string;
            keyColumns?: undefined;
        };
        expectedOutput: string;
        notes?: undefined;
    } | {
        scenario: string;
        description: string;
        parameters: {
            table: string;
            schema: string;
            keyColumns: string[];
        };
        notes: string;
        expectedOutput: string;
    })[];
    export let compareSchema: {
        scenario: string;
        description: string;
        parameters: {
            sourceSchema: string;
            targetSchema: string;
        };
        expectedOutput: string;
    }[];
    export let schemaClone: {
        scenario: string;
        description: string;
        parameters: {
            sourceSchema: string;
            targetSchema: string;
        };
        notes: string;
        expectedOutput: string;
    }[];
    export let tableCopy: {
        scenario: string;
        description: string;
        parameters: {
            sourceTable: string;
            sourceSchema: string;
            targetTable: string;
            targetSchema: string;
        };
        expectedOutput: string;
    }[];
    export let status: {
        scenario: string;
        description: string;
        parameters: {};
        notes: string;
        expectedOutput: string;
    }[];
    export let healthCheck: {
        scenario: string;
        description: string;
        parameters: {};
        expectedOutput: string;
    }[];
    export let memoryAnalysis: {
        scenario: string;
        description: string;
        parameters: {};
        notes: string;
        expectedOutput: string;
    }[];
    export let expensiveStatements: {
        scenario: string;
        description: string;
        parameters: {
            limit: number;
        };
        notes: string;
        expectedOutput: string;
    }[];
}
export namespace COMMAND_PRESETS {
    let _import_1: ({
        name: string;
        description: string;
        parameters: {
            filename: string;
            table: string;
            schema: string;
            dryRun?: undefined;
            skipWithErrors?: undefined;
            maxErrorsAllowed?: undefined;
            maxFileSizeMB?: undefined;
            timeoutSeconds?: undefined;
            matchMode?: undefined;
        };
        whenToUse: string;
        notes?: undefined;
    } | {
        name: string;
        description: string;
        parameters: {
            filename: string;
            table: string;
            schema: string;
            dryRun: boolean;
            skipWithErrors: boolean;
            maxErrorsAllowed: number;
            maxFileSizeMB?: undefined;
            timeoutSeconds?: undefined;
            matchMode?: undefined;
        };
        notes: string;
        whenToUse: string;
    } | {
        name: string;
        description: string;
        parameters: {
            filename: string;
            table: string;
            schema: string;
            maxFileSizeMB: number;
            timeoutSeconds: number;
            dryRun?: undefined;
            skipWithErrors?: undefined;
            maxErrorsAllowed?: undefined;
            matchMode?: undefined;
        };
        whenToUse: string;
        notes?: undefined;
    } | {
        name: string;
        description: string;
        parameters: {
            filename: string;
            table: string;
            schema: string;
            matchMode: string;
            dryRun?: undefined;
            skipWithErrors?: undefined;
            maxErrorsAllowed?: undefined;
            maxFileSizeMB?: undefined;
            timeoutSeconds?: undefined;
        };
        whenToUse: string;
        notes?: undefined;
    })[];
    export { _import_1 as import };
    let _export_1: ({
        name: string;
        description: string;
        parameters: {
            table: string;
            schema: string;
            filename: string;
            where?: undefined;
        };
        whenToUse: string;
    } | {
        name: string;
        description: string;
        parameters: {
            table: string;
            schema: string;
            filename: string;
            where: string;
        };
        whenToUse: string;
    })[];
    export { _export_1 as export };
    let dataProfile_1: ({
        name: string;
        description: string;
        parameters: {
            table: string;
            schema: string;
            columns?: undefined;
        };
        whenToUse: string;
    } | {
        name: string;
        description: string;
        parameters: {
            table: string;
            schema: string;
            columns: string[];
        };
        whenToUse: string;
    })[];
    export { dataProfile_1 as dataProfile };
    let duplicateDetection_1: ({
        name: string;
        description: string;
        parameters: {
            table: string;
            schema: string;
            keyColumns?: undefined;
        };
        whenToUse: string;
    } | {
        name: string;
        description: string;
        parameters: {
            table: string;
            schema: string;
            keyColumns: string[];
        };
        whenToUse: string;
    })[];
    export { duplicateDetection_1 as duplicateDetection };
    let compareSchema_1: {
        name: string;
        description: string;
        parameters: {
            sourceSchema: string;
            targetSchema: string;
        };
        whenToUse: string;
    }[];
    export { compareSchema_1 as compareSchema };
    let schemaClone_1: {
        name: string;
        description: string;
        parameters: {
            sourceSchema: string;
            targetSchema: string;
        };
        whenToUse: string;
    }[];
    export { schemaClone_1 as schemaClone };
}
