# Copilot Agents

This page documents specialized Copilot agents available in this repository.

## Purpose

Agents provide domain-specific behavior for multi-file tasks with consistent conventions.

## When to use which agent

- **DocOps Agent** (`.github/agents/docops.agent.md`)
  - Use for documentation updates under `docs/` or VitePress config under `docs/.vitepress/`.
  - Focuses on taxonomy, formatting, and docs conventions.

- **CLI Agent** (`.github/agents/cli.agent.md`)
  - Use for CLI commands in `bin/`, routes in `routes/`, utilities in `utils/`, or related tests.
  - Enforces i18n text handling and CLI command patterns.

- **Tooling Agent** (`.github/agents/tooling.agent.md`)
  - Use for tooling configs, automation scripts, npm scripts, and GitHub workflows.
  - Emphasizes cross-platform compatibility and CI/CD safety.

- **MCP Agent** (`.github/agents/mcp.agent.md`)
  - Use for MCP server code in `mcp-server/src/**`.
  - Ensures JSON-RPC compliance and tool registration patterns.

## Usage tips

- Pick the most specific agent for the task.
- If unsure, start with the default agent and switch as needed.
- Agents are designed to align with matching instruction files.

## Source

- `.github/AGENTS.md`

## See Also

- [Copilot Customization Overview](../copilot.md)
- [Prompts](./prompts.md)
- [Skills](./skills.md)
