# Copilot Customization

This page explains how GitHub Copilot is customized in this repository and when to use each customization type.

## Overview

Copilot configuration in this repo is organized to keep changes consistent with project conventions while staying lightweight:

- **Instructions** guide file-specific behavior.
- **Prompts** provide task templates you can invoke quickly.
- **Agents** focus on specific domains (docs, CLI, tooling, MCP).
- **Skills** package repeatable workflows.
- **Hooks** provide deterministic checks and reminders.

## Where the configuration lives

- **Workspace instructions**: `.github/copilot-instructions.md`
- **File instructions**: `.github/instructions/*.instructions.md`
- **Prompts**: `.github/prompts/*.prompt.md`
- **Agents**: `.github/agents/*.agent.md`
- **Skills**: `.github/skills/*/SKILL.md`
- **Hooks**: `.github/hooks/*.json` and helper scripts in `.github/hooks/`

## Prompts

Prompts are quick, parameterized tasks. Use them for focused updates.

Recommended prompts in this repo:

- **Update Markdown Docs**: docs changes under `docs/`
- **Update VitePress Config**: `docs/.vitepress/` updates
- **Update GitHub Workflow**: `.github/workflows/*.yml`
- **Update TypeScript Config**: `tsconfig.json` changes
- **Update Package Scripts**: `package.json` scripts
- **Update Tooling Configs**: lint/test/coverage configs
- **Update Automation Scripts**: root `generate-*`, `enhance-*`, `update-*`, `populate-*`
- **Update MCP Server**: `mcp-server/src/**`

See prompt details: [Prompts](./copilot/prompts.md)

## Agents

Use agents when the task spans multiple files in a domain or needs consistent decision patterns:

- **DocOps Agent**: Documentation and VitePress changes
- **CLI Agent**: CLI commands, routes, utilities, tests, i18n
- **Tooling Agent**: configs, scripts, workflows
- **MCP Agent**: MCP server implementation

See agent details: [Agents](./copilot/agents.md)

## Skills

Skills bundle repeatable workflows with supporting references:

- **docs-automation**: command docs generation and sidebar updates
- **cli-command-development**: CLI command and route workflows
- **mcp-server-workflows**: MCP server updates and tool registration

See skill details: [Skills](./copilot/skills.md)

## Hooks

Hooks run deterministic checks at runtime (pre-tool, post-tool, session stop). This repo uses hooks for:

- **PreToolUse** confirmations for risky terminal commands
- **PostToolUse** targeted checks after docs or i18n edits
- **Stop** reminders for follow-up validation

See hook details: [Hooks](./copilot/hooks.md)

## Quick selection guide

| Task type | Best fit |
| --- | --- |
| Quick, scoped change | Prompt |
| Multi-file domain work | Agent |
| Repeatable workflow | Skill |
| Enforced behavior | Hook |

## See Also

- [Documentation Development](./documentation.md)
- [Testing & QA](./testing.md)
- [Project Architecture](./architecture/project-structure.md)
