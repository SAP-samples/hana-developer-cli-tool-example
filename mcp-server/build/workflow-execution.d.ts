/**
 * Workflow execution system
 * Executes multi-step workflows with parameter substitution
 */
import { Workflow } from './command-metadata.js';
export interface WorkflowExecutionResult {
    workflowId: string;
    workflowName: string;
    totalSteps: number;
    completedSteps: number;
    failedStep?: number;
    results: StepResult[];
    success: boolean;
    duration?: number;
}
export interface StepResult {
    step: number;
    command: string;
    parameters: Record<string, any>;
    success: boolean;
    output?: string;
    error?: string;
    duration?: number;
}
/**
 * Validate that all required parameters are provided
 */
export declare function validateWorkflowParameters(workflow: Workflow, parameters: Record<string, string>): {
    valid: boolean;
    missing: string[];
};
/**
 * Simulate workflow execution (dry run)
 * In production, this would call executeCommand for each step
 */
export declare function executeWorkflow(workflowId: string, parameters: Record<string, string>, stopOnError?: boolean): Promise<WorkflowExecutionResult>;
/**
 * Get workflow preview with substituted parameters
 */
export declare function previewWorkflow(workflowId: string, parameters: Record<string, string>): any;
//# sourceMappingURL=workflow-execution.d.ts.map