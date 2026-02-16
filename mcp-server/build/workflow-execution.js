/**
 * Workflow execution system
 * Executes multi-step workflows with parameter substitution
 */
import { getWorkflowById } from './command-metadata.js';
/**
 * Substitute parameters in workflow steps
 */
function substituteParameters(parameters, parameterTemplate) {
    const result = {};
    for (const [key, value] of Object.entries(parameterTemplate)) {
        if (typeof value === 'string' && value.startsWith('<') && value.endsWith('>')) {
            // Extract parameter name from <param-name> format
            const paramName = value.slice(1, -1);
            if (parameters[paramName]) {
                result[key] = parameters[paramName];
            }
            else {
                // Keep placeholder if no value provided
                result[key] = value;
            }
        }
        else {
            result[key] = value;
        }
    }
    return result;
}
/**
 * Validate that all required parameters are provided
 */
export function validateWorkflowParameters(workflow, parameters) {
    const required = new Set();
    // Extract all required parameters from workflow steps
    for (const step of workflow.steps) {
        if (step.keyParameters) {
            for (const value of Object.values(step.keyParameters)) {
                if (typeof value === 'string' && value.startsWith('<') && value.endsWith('>')) {
                    const paramName = value.slice(1, -1);
                    required.add(paramName);
                }
            }
        }
    }
    const missing = [];
    for (const param of required) {
        if (!parameters[param]) {
            missing.push(param);
        }
    }
    return {
        valid: missing.length === 0,
        missing,
    };
}
/**
 * Simulate workflow execution (dry run)
 * In production, this would call executeCommand for each step
 */
export async function executeWorkflow(workflowId, parameters, stopOnError = true) {
    const workflow = getWorkflowById(workflowId);
    if (!workflow) {
        return {
            workflowId,
            workflowName: 'Unknown',
            totalSteps: 0,
            completedSteps: 0,
            results: [],
            success: false,
            error: `Workflow not found: ${workflowId}`,
        };
    }
    // Validate parameters
    const validation = validateWorkflowParameters(workflow, parameters);
    if (!validation.valid) {
        return {
            workflowId,
            workflowName: workflow.name,
            totalSteps: workflow.steps.length,
            completedSteps: 0,
            results: [],
            success: false,
            error: `Missing required parameters: ${validation.missing.join(', ')}`,
        };
    }
    const results = [];
    const startTime = Date.now();
    let completedSteps = 0;
    let failedStep;
    for (const step of workflow.steps) {
        const stepStartTime = Date.now();
        const stepParameters = step.keyParameters
            ? substituteParameters(parameters, step.keyParameters)
            : {};
        // Note: In production, this would call executeCommand(step.command, stepParameters)
        // For now, we simulate the execution
        const stepResult = {
            step: step.order,
            command: step.command,
            parameters: stepParameters,
            success: true, // Simulated success
            output: `Successfully executed ${step.command}`,
            duration: Date.now() - stepStartTime,
        };
        results.push(stepResult);
        if (stepResult.success) {
            completedSteps++;
        }
        else {
            failedStep = step.order;
            if (stopOnError) {
                break;
            }
        }
    }
    return {
        workflowId,
        workflowName: workflow.name,
        totalSteps: workflow.steps.length,
        completedSteps,
        failedStep,
        results,
        success: completedSteps === workflow.steps.length,
        duration: Date.now() - startTime,
    };
}
/**
 * Get workflow preview with substituted parameters
 */
export function previewWorkflow(workflowId, parameters) {
    const workflow = getWorkflowById(workflowId);
    if (!workflow) {
        return {
            error: `Workflow not found: ${workflowId}`,
        };
    }
    const validation = validateWorkflowParameters(workflow, parameters);
    return {
        workflowId: workflow.id,
        name: workflow.name,
        description: workflow.description,
        goal: workflow.goal,
        estimatedTime: workflow.estimatedTime,
        validation: {
            valid: validation.valid,
            missingParameters: validation.missing,
        },
        steps: workflow.steps.map(step => ({
            order: step.order,
            command: step.command,
            description: step.description,
            parameters: step.keyParameters
                ? substituteParameters(parameters, step.keyParameters)
                : {},
            expectedOutput: step.expectedOutput,
        })),
    };
}
//# sourceMappingURL=workflow-execution.js.map