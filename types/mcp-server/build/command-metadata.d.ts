/**
 * Get all commands grouped by category
 */
export function getCommandsByCategory(): {};
/**
 * Search commands by tags
 */
export function searchCommandsByTag(tag: any): {
    category: string;
    tags: any;
    useCases: any;
    prerequisites: any;
    relatedCommands: string[];
    command: string;
}[];
/**
 * Get commands in a specific category
 */
export function getCommandsInCategory(category: any): {
    category: string;
    tags: any;
    useCases: any;
    prerequisites: any;
    relatedCommands: string[];
    command: string;
}[];
/**
 * Get all workflows
 */
export function getAllWorkflows(): ({
    id: string;
    name: string;
    description: string;
    goal: string;
    tags: string[];
    estimatedTime: string;
    steps: ({
        order: number;
        command: string;
        description: string;
        keyParameters: {
            table: string;
            schema: string;
            rulesFile?: undefined;
        };
        expectedOutput: string;
    } | {
        order: number;
        command: string;
        description: string;
        keyParameters: {
            table: string;
            schema: string;
            rulesFile: string;
        };
        expectedOutput: string;
    })[];
} | {
    id: string;
    name: string;
    description: string;
    goal: string;
    tags: string[];
    estimatedTime: string;
    steps: {
        order: number;
        command: string;
        description: string;
        keyParameters: {
            table: string;
            schema: string;
            filename: string;
        };
        expectedOutput: string;
    }[];
} | {
    id: string;
    name: string;
    description: string;
    goal: string;
    tags: string[];
    estimatedTime: string;
    steps: {
        order: number;
        command: string;
        description: string;
        keyParameters: {
            sourceSchema: string;
            targetSchema: string;
        };
        expectedOutput: string;
    }[];
} | {
    id: string;
    name: string;
    description: string;
    goal: string;
    tags: string[];
    estimatedTime: string;
    steps: ({
        order: number;
        command: string;
        description: string;
        keyParameters: {
            limit?: undefined;
        };
        expectedOutput: string;
    } | {
        order: number;
        command: string;
        description: string;
        keyParameters: {
            limit: string;
        };
        expectedOutput: string;
    })[];
} | {
    id: string;
    name: string;
    description: string;
    goal: string;
    tags: string[];
    estimatedTime: string;
    steps: {
        order: number;
        command: string;
        description: string;
        keyParameters: {};
        expectedOutput: string;
    }[];
} | {
    id: string;
    name: string;
    description: string;
    goal: string;
    tags: string[];
    estimatedTime: string;
    steps: {
        order: number;
        command: string;
        description: string;
        keyParameters: {};
        expectedOutput: string;
    }[];
} | {
    id: string;
    name: string;
    description: string;
    goal: string;
    tags: string[];
    estimatedTime: string;
    steps: {
        order: number;
        command: string;
        description: string;
        keyParameters: {};
        expectedOutput: string;
    }[];
})[];
/**
 * Search workflows by tag
 */
export function searchWorkflowsByTag(tag: any): ({
    id: string;
    name: string;
    description: string;
    goal: string;
    tags: string[];
    estimatedTime: string;
    steps: ({
        order: number;
        command: string;
        description: string;
        keyParameters: {
            table: string;
            schema: string;
            rulesFile?: undefined;
        };
        expectedOutput: string;
    } | {
        order: number;
        command: string;
        description: string;
        keyParameters: {
            table: string;
            schema: string;
            rulesFile: string;
        };
        expectedOutput: string;
    })[];
} | {
    id: string;
    name: string;
    description: string;
    goal: string;
    tags: string[];
    estimatedTime: string;
    steps: {
        order: number;
        command: string;
        description: string;
        keyParameters: {
            table: string;
            schema: string;
            filename: string;
        };
        expectedOutput: string;
    }[];
} | {
    id: string;
    name: string;
    description: string;
    goal: string;
    tags: string[];
    estimatedTime: string;
    steps: {
        order: number;
        command: string;
        description: string;
        keyParameters: {
            sourceSchema: string;
            targetSchema: string;
        };
        expectedOutput: string;
    }[];
} | {
    id: string;
    name: string;
    description: string;
    goal: string;
    tags: string[];
    estimatedTime: string;
    steps: ({
        order: number;
        command: string;
        description: string;
        keyParameters: {
            limit?: undefined;
        };
        expectedOutput: string;
    } | {
        order: number;
        command: string;
        description: string;
        keyParameters: {
            limit: string;
        };
        expectedOutput: string;
    })[];
} | {
    id: string;
    name: string;
    description: string;
    goal: string;
    tags: string[];
    estimatedTime: string;
    steps: {
        order: number;
        command: string;
        description: string;
        keyParameters: {};
        expectedOutput: string;
    }[];
} | {
    id: string;
    name: string;
    description: string;
    goal: string;
    tags: string[];
    estimatedTime: string;
    steps: {
        order: number;
        command: string;
        description: string;
        keyParameters: {};
        expectedOutput: string;
    }[];
} | {
    id: string;
    name: string;
    description: string;
    goal: string;
    tags: string[];
    estimatedTime: string;
    steps: {
        order: number;
        command: string;
        description: string;
        keyParameters: {};
        expectedOutput: string;
    }[];
})[];
/**
 * Get workflow by ID
 */
export function getWorkflowById(id: any): any;
/**
 * Category definitions with descriptions
 */
export const CATEGORIES: {
    'data-tools': {
        name: string;
        description: string;
    };
    'schema-tools': {
        name: string;
        description: string;
    };
    'object-inspection': {
        name: string;
        description: string;
    };
    'analysis-tools': {
        name: string;
        description: string;
    };
    'performance-monitoring': {
        name: string;
        description: string;
    };
    'backup-recovery': {
        name: string;
        description: string;
    };
    'system-admin': {
        name: string;
        description: string;
    };
    'system-tools': {
        name: string;
        description: string;
    };
    security: {
        name: string;
        description: string;
    };
    'mass-operations': {
        name: string;
        description: string;
    };
    'connection-auth': {
        name: string;
        description: string;
    };
    'btp-integration': {
        name: string;
        description: string;
    };
    'hana-cloud': {
        name: string;
        description: string;
    };
    'hdi-management': {
        name: string;
        description: string;
    };
    'developer-tools': {
        name: string;
        description: string;
    };
};
export const COMMAND_METADATA_MAP: {
    [k: string]: {
        category: string;
        tags: any;
        useCases: any;
        prerequisites: any;
        relatedCommands: string[];
    };
};
/**
 * Workflow registry - common multi-step tasks
 */
export const WORKFLOWS: {
    'validate-and-profile': {
        id: string;
        name: string;
        description: string;
        goal: string;
        tags: string[];
        estimatedTime: string;
        steps: ({
            order: number;
            command: string;
            description: string;
            keyParameters: {
                table: string;
                schema: string;
                rulesFile?: undefined;
            };
            expectedOutput: string;
        } | {
            order: number;
            command: string;
            description: string;
            keyParameters: {
                table: string;
                schema: string;
                rulesFile: string;
            };
            expectedOutput: string;
        })[];
    };
    'export-and-import': {
        id: string;
        name: string;
        description: string;
        goal: string;
        tags: string[];
        estimatedTime: string;
        steps: {
            order: number;
            command: string;
            description: string;
            keyParameters: {
                table: string;
                schema: string;
                filename: string;
            };
            expectedOutput: string;
        }[];
    };
    'compare-and-clone-schema': {
        id: string;
        name: string;
        description: string;
        goal: string;
        tags: string[];
        estimatedTime: string;
        steps: {
            order: number;
            command: string;
            description: string;
            keyParameters: {
                sourceSchema: string;
                targetSchema: string;
            };
            expectedOutput: string;
        }[];
    };
    'performance-analysis': {
        id: string;
        name: string;
        description: string;
        goal: string;
        tags: string[];
        estimatedTime: string;
        steps: ({
            order: number;
            command: string;
            description: string;
            keyParameters: {
                limit?: undefined;
            };
            expectedOutput: string;
        } | {
            order: number;
            command: string;
            description: string;
            keyParameters: {
                limit: string;
            };
            expectedOutput: string;
        })[];
    };
    'security-audit': {
        id: string;
        name: string;
        description: string;
        goal: string;
        tags: string[];
        estimatedTime: string;
        steps: {
            order: number;
            command: string;
            description: string;
            keyParameters: {};
            expectedOutput: string;
        }[];
    };
    'backup-and-verify': {
        id: string;
        name: string;
        description: string;
        goal: string;
        tags: string[];
        estimatedTime: string;
        steps: {
            order: number;
            command: string;
            description: string;
            keyParameters: {};
            expectedOutput: string;
        }[];
    };
    'troubleshoot-issues': {
        id: string;
        name: string;
        description: string;
        goal: string;
        tags: string[];
        estimatedTime: string;
        steps: {
            order: number;
            command: string;
            description: string;
            keyParameters: {};
            expectedOutput: string;
        }[];
    };
};
