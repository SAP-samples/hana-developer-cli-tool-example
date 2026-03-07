/**
 * Validate that all required parameters are provided
 */
export function validateWorkflowParameters(workflow: any, parameters: any): {
    valid: boolean;
    missing: any[];
};
/**
 * Simulate workflow execution (dry run)
 * In production, this would call executeCommand for each step
 */
export function executeWorkflow(workflowId: any, parameters: any, stopOnError?: boolean): Promise<{
    workflowId: any;
    workflowName: string;
    totalSteps: number;
    completedSteps: number;
    results: any[];
    success: boolean;
    error: string;
    failedStep?: undefined;
    duration?: undefined;
} | {
    workflowId: any;
    workflowName: string;
    totalSteps: number;
    completedSteps: number;
    failedStep: number;
    results: {
        step: number;
        command: string;
        parameters: {};
        success: boolean;
        output: string;
        duration: number;
    }[];
    success: boolean;
    duration: number;
    error?: undefined;
}>;
/**
 * Get workflow preview with substituted parameters
 */
export function previewWorkflow(workflowId: any, parameters: any): {
    error: string;
    workflowId?: undefined;
    name?: undefined;
    description?: undefined;
    goal?: undefined;
    estimatedTime?: undefined;
    validation?: undefined;
    steps?: undefined;
} | {
    workflowId: string;
    name: string;
    description: string;
    goal: string;
    estimatedTime: string;
    validation: {
        valid: boolean;
        missingParameters: any[];
    };
    steps: {
        order: number;
        command: string;
        description: string;
        parameters: {};
        expectedOutput: string;
    }[];
    error?: undefined;
};
