import { ToolDefinition, ToolResponse, jsonResponse, errorResponse } from './types.js';
import {
  getCommandExamples, getCommandPresets,
  hasExamples, hasPresets,
  getCommandsWithExamples, getCommandsWithPresets,
} from '../examples-presets.js';
import { recommendCommands, getQuickStartGuide } from '../recommendation.js';
import { getTroubleshootingGuide } from '../next-steps.js';
import { interpretResult } from '../result-interpretation.js';
import { getConversationTemplate, listConversationTemplates } from '../conversation-templates.js';

export function getContentToolDefinitions(): ToolDefinition[] {
  return [
    {
      name: 'hana_examples',
      description: 'Get real-world usage examples for a specific command with parameter combinations, scenarios, and expected outputs. Essential for understanding how to use commands correctly.',
      inputSchema: {
        type: 'object',
        properties: {
          command: { type: 'string', description: 'Command name (without hana_ prefix, e.g., "import", "export", "dataProfile")' },
        },
        required: ['command'],
      },
    },
    {
      name: 'hana_parameter_presets',
      description: 'Get parameter presets/templates for common use cases of a command. Shows pre-configured parameter combinations for scenarios like "quick-import", "safe-import", "large-file" etc.',
      inputSchema: {
        type: 'object',
        properties: {
          command: { type: 'string', description: 'Command name (without hana_ prefix)' },
        },
        required: ['command'],
      },
    },
    {
      name: 'hana_recommend',
      description: 'Get command recommendations based on natural language intent. Tell me what you want to do, and I\'ll suggest the best commands. Example: "find duplicate rows", "check database version", "export table to CSV".',
      inputSchema: {
        type: 'object',
        properties: {
          intent: { type: 'string', description: 'What you want to accomplish in natural language (e.g., "import CSV file", "find slow queries", "check user permissions")' },
          limit: { type: 'number', description: 'Maximum number of recommendations to return (default: 5)', default: 5 },
        },
        required: ['intent'],
      },
    },
    {
      name: 'hana_quickstart',
      description: 'Get a beginner-friendly quick start guide with the recommended first 6 commands to run when starting with the database. Perfect for new users or initial database exploration.',
      inputSchema: { type: 'object', properties: {}, required: [] },
    },
    {
      name: 'hana_troubleshoot',
      description: 'Get troubleshooting guide for a specific command including common issues, solutions, prerequisites, and tips. Essential when a command isn\'t working as expected.',
      inputSchema: {
        type: 'object',
        properties: {
          command: { type: 'string', description: 'Command name (without hana_ prefix) to get troubleshooting help for' },
        },
        required: ['command'],
      },
    },
    {
      name: 'hana_interpret_result',
      description: 'Get AI-friendly interpretation of command results with insights, recommendations, and analysis. Provides summary, key metrics, concerns detected, and actionable recommendations.',
      inputSchema: {
        type: 'object',
        properties: {
          command: { type: 'string', description: 'The command that was executed' },
          result: { type: 'string', description: 'The command output to interpret' },
        },
        required: ['command', 'result'],
      },
    },
    {
      name: 'hana_conversation_templates',
      description: 'List available conversation templates for common scenarios. Templates provide step-by-step guided workflows for tasks like data-exploration, troubleshooting, data-migration, performance-tuning, and security-audit.',
      inputSchema: { type: 'object', properties: {}, required: [] },
    },
    {
      name: 'hana_get_template',
      description: 'Get a detailed conversation template for a specific scenario. Includes all steps, commands, expected outcomes, tips, and common questions with answers.',
      inputSchema: {
        type: 'object',
        properties: {
          scenario: { type: 'string', description: 'Scenario name (e.g., "data-exploration", "troubleshooting", "data-migration", "performance-tuning", "security-audit")' },
        },
        required: ['scenario'],
      },
    },
  ];
}

export function handleContentTool(commandName: string, args: Record<string, any>): ToolResponse | null {
  if (commandName === 'examples') {
    const command = args?.command;
    if (!command) return errorResponse('Error: command parameter is required');

    const examples = getCommandExamples(command);
    if (examples.length === 0) {
      return jsonResponse({
        error: `No examples available for command: ${command}`,
        availableCommands: getCommandsWithExamples(),
      });
    }
    return jsonResponse({
      command, examples, total: examples.length,
      usage: `To execute: Use hana_${command} with the parameters from any example`,
    });
  }

  if (commandName === 'parameter_presets') {
    const command = args?.command;
    if (!command) return errorResponse('Error: command parameter is required');

    const presets = getCommandPresets(command);
    if (presets.length === 0) {
      return jsonResponse({
        error: `No presets available for command: ${command}`,
        tip: 'Try hana_examples for usage examples instead',
        commandsWithPresets: getCommandsWithPresets(),
      });
    }
    return jsonResponse({
      command, presets, total: presets.length,
      usage: 'Replace placeholder values (e.g., <table-name>) with your actual values',
    });
  }

  if (commandName === 'recommend') {
    const intent = args?.intent;
    const limit = args?.limit || 5;
    if (!intent) return errorResponse('Error: intent parameter is required. Describe what you want to do in natural language.');

    const recommendations = recommendCommands(intent, limit);
    if (recommendations.length === 0) {
      return jsonResponse({
        message: 'No commands found matching your intent', intent,
        tip: 'Try using different words or browse by category with hana_discover_categories',
      });
    }
    return jsonResponse({
      intent,
      recommendations: recommendations.map(rec => ({
        command: `hana_${rec.command}`, confidence: rec.confidence, reason: rec.reason,
        category: rec.category, tags: rec.tags, useCases: rec.useCases,
        exampleParameters: rec.exampleParameters,
        howToUse: rec.exampleParameters
          ? `Call hana_${rec.command} with parameters: ${JSON.stringify(rec.exampleParameters)}`
          : `Call hana_${rec.command}`,
      })),
      total: recommendations.length,
    });
  }

  if (commandName === 'quickstart') {
    const guide = getQuickStartGuide();
    return jsonResponse({
      title: 'Quick Start Guide for SAP HANA CLI',
      description: 'Follow these steps to get started with your database',
      steps: guide.map(step => ({
        order: step.order, command: `hana_${step.command}`,
        description: step.description, purpose: step.purpose,
        parameters: step.parameters, tips: step.tips,
      })),
      totalSteps: guide.length,
      recommendation: 'Execute these commands in order. Each step builds on the previous one.',
    });
  }

  if (commandName === 'troubleshoot') {
    const command = args?.command;
    if (!command) return errorResponse('Error: command parameter is required');

    const guide = getTroubleshootingGuide(command);
    if (!guide) {
      return jsonResponse({
        error: `No troubleshooting guide available for command: ${command}`,
        availableGuides: ['import', 'export', 'dataProfile', 'tables', 'status', 'healthCheck'],
      });
    }
    return jsonResponse({
      command: guide.command, prerequisites: guide.prerequisites,
      commonIssues: guide.commonIssues.map((issue: any) => ({
        issue: issue.issue, solution: issue.solution,
        suggestedCommand: issue.command ? `hana_${issue.command}` : undefined,
        parameters: issue.parameters,
      })),
      tips: guide.tips,
    });
  }

  if (commandName === 'interpret_result') {
    const command = args?.command;
    const result = args?.result;
    if (!command || !result) return errorResponse('Error: both command and result parameters are required');

    const interpretation = interpretResult(command, result);
    return jsonResponse({
      ...interpretation,
      usage: interpretation.recommendations.length > 0
        ? 'Follow recommendations in priority order for best results' : undefined,
    });
  }

  if (commandName === 'conversation_templates') {
    const templates = listConversationTemplates();
    return jsonResponse({
      message: 'Available conversation templates',
      templates: templates.map(t => ({
        scenario: t.scenario, description: t.description, goal: t.goal,
        usage: `Use hana_get_template with scenario="${t.scenario}" to see full details`,
      })),
      total: templates.length,
    });
  }

  if (commandName === 'get_template') {
    const scenario = args?.scenario;
    if (!scenario) return errorResponse('Error: scenario parameter is required');

    const template = getConversationTemplate(scenario);
    if (!template) {
      return jsonResponse({
        error: `Template not found: ${scenario}`,
        availableTemplates: listConversationTemplates().map(t => t.scenario),
      });
    }
    return jsonResponse({ ...template, usage: 'Follow steps in order. Each step builds on previous results.' });
  }

  return null;
}
