import { ToolDefinition, ToolResponse, jsonResponse, errorResponse } from './types.js';
import {
  CATEGORIES,
  getCommandsInCategory,
  searchCommandsByTag,
  getAllWorkflows,
  searchWorkflowsByTag,
  getWorkflowById,
} from '../command-metadata.js';

export function getDiscoveryToolDefinitions(): ToolDefinition[] {
  return [
    {
      name: 'hana_discover_categories',
      description: 'Discover available command categories and get an overview of what each category does. Use this to find commands for a specific task.',
      inputSchema: { type: 'object', properties: {}, required: [] },
    },
    {
      name: 'hana_discover_by_category',
      description: 'Get all commands in a specific category. Useful for finding commands when you know the general area (e.g., "data-tools", "performance-monitoring").',
      inputSchema: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            description: 'The category to query (e.g., "data-tools", "schema-tools", "object-inspection", "analysis-tools", "performance-monitoring", "backup-recovery", "system-admin", "system-tools", "security", "mass-operations", "connection-auth", "btp-integration", "hana-cloud", "hdi-management", "developer-tools")',
          },
        },
        required: ['category'],
      },
    },
    {
      name: 'hana_discover_by_tag',
      description: 'Search commands by tag. Tags help identify commands for specific purposes (e.g., "import", "export", "validation", "performance", "user", "privilege").',
      inputSchema: {
        type: 'object',
        properties: {
          tag: {
            type: 'string',
            description: 'The tag to search for (e.g., "import", "export", "validation", "performance", "user", "security")',
          },
        },
        required: ['tag'],
      },
    },
    {
      name: 'hana_workflows',
      description: 'List available workflows - multi-step task sequences for common scenarios like data validation, performance analysis, security audits, and backup procedures.',
      inputSchema: { type: 'object', properties: {}, required: [] },
    },
    {
      name: 'hana_workflow_by_id',
      description: 'Get detailed steps for a specific workflow. Provides complete instructions including commands, parameters, and expected outputs.',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Workflow ID (e.g., "validate-and-profile", "export-and-import", "performance-analysis", "security-audit", "backup-and-verify")',
          },
        },
        required: ['id'],
      },
    },
    {
      name: 'hana_search_workflows',
      description: 'Search for workflows by tag or purpose. Find workflows for specific scenarios.',
      inputSchema: {
        type: 'object',
        properties: {
          tag: {
            type: 'string',
            description: 'Search tag (e.g., "data-quality", "performance", "security", "backup", "migration")',
          },
        },
        required: ['tag'],
      },
    },
  ];
}

export interface DiscoveryToolOptions {
  onCategoryActivated?: (category: string) => void;
}

export function handleDiscoveryTool(commandName: string, args: Record<string, any>, options?: DiscoveryToolOptions): ToolResponse | null {
  if (commandName === 'discover_categories') {
    const categoryList = Object.entries(CATEGORIES).map(([key, value]) => ({
      id: key,
      name: value.name,
      description: value.description,
      total: getCommandsInCategory(key).length,
    }));
    return jsonResponse({
      message: 'Available command categories',
      categories: categoryList,
      usage: 'Use hana_discover_by_category to get commands in a specific category',
    });
  }

  if (commandName === 'discover_by_category') {
    const category = args?.category;
    if (!category) return errorResponse('Error: category parameter is required');

    const commands = getCommandsInCategory(category);
    if (commands.length === 0) {
      return jsonResponse({
        error: `No commands found in category: ${category}`,
        tip: 'Use hana_discover_categories to see available categories',
      });
    }
    if (options?.onCategoryActivated) {
      options.onCategoryActivated(category);
    }

    return jsonResponse({
      category,
      categoryInfo: CATEGORIES[category as keyof typeof CATEGORIES],
      commands: commands.map(cmd => ({
        command: cmd.command, category: cmd.category,
        tags: cmd.tags, useCases: cmd.useCases, relatedCommands: cmd.relatedCommands,
      })),
      total: commands.length,
    });
  }

  if (commandName === 'discover_by_tag') {
    const tag = args?.tag;
    if (!tag) return errorResponse('Error: tag parameter is required');

    const commands = searchCommandsByTag(tag);
    if (commands.length === 0) {
      return jsonResponse({
        error: `No commands found with tag: ${tag}`,
        tip: 'Try different tags or use hana_discover_by_category to browse',
      });
    }
    return jsonResponse({
      tag,
      commands: commands.map(cmd => ({
        command: cmd.command, category: cmd.category,
        tags: cmd.tags, useCases: cmd.useCases, relatedCommands: cmd.relatedCommands,
      })),
      total: commands.length,
    });
  }

  if (commandName === 'workflows') {
    const workflows = getAllWorkflows();
    return jsonResponse({
      message: 'Available workflows for common multi-step tasks',
      workflows: workflows.map(wf => ({
        id: wf.id, name: wf.name, description: wf.description,
        goal: wf.goal, estimatedTime: wf.estimatedTime, tags: wf.tags, steps: wf.steps.length,
      })),
      total: workflows.length,
      usage: 'Use hana_workflow_by_id to see detailed steps for a workflow',
    });
  }

  if (commandName === 'workflow_by_id') {
    const id = args?.id;
    if (!id) return errorResponse('Error: id parameter is required');

    const workflow = getWorkflowById(id);
    if (!workflow) {
      return jsonResponse({
        error: `Workflow not found: ${id}`,
        tip: 'Use hana_workflows to see available workflow IDs',
      });
    }
    return jsonResponse(workflow);
  }

  if (commandName === 'search_workflows') {
    const tag = args?.tag;
    if (!tag) return errorResponse('Error: tag parameter is required');

    const workflows = searchWorkflowsByTag(tag);
    if (workflows.length === 0) {
      return jsonResponse({
        error: `No workflows found with tag: ${tag}`,
        tip: 'Use hana_workflows to see available workflows',
      });
    }
    return jsonResponse({
      tag,
      workflows: workflows.map(wf => ({
        id: wf.id, name: wf.name, description: wf.description,
        goal: wf.goal, estimatedTime: wf.estimatedTime, tags: wf.tags,
      })),
      total: workflows.length,
    });
  }

  return null;
}
