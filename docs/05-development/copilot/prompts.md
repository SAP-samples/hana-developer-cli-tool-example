# Copilot Prompts

This page documents the custom prompt templates used in this repository.

## Purpose

Prompts provide focused, parameterized task entry points for recurring work.

## When to use which prompt

- **Update Markdown Docs** (`update-markdown-docs.prompt.md`): Use for documentation changes under `docs/`, especially command docs in `docs/02-commands/`.
- **Update VitePress Config** (`update-vitepress-config.prompt.md`): Use for changes in `docs/.vitepress/` (sidebar, theme, Mermaid, nav, base URL).
- **Update GitHub Workflow** (`update-github-workflow.prompt.md`): Use for `.github/workflows/*.yml` or `.yaml` changes.
- **Update TypeScript Config** (`update-tsconfig.prompt.md`): Use for `tsconfig.json` updates (root or subprojects like `mcp-server`).
- **Update Package Scripts** (`update-package-scripts.prompt.md`): Use when adding or modifying scripts in `package.json`.
- **Update Tooling Configs** (`update-tool-configs.prompt.md`): Use for lint/test/coverage config files such as `.eslintrc.*`, `.prettierrc.*`, `.nycrc.*`, `.mocharc.*`, `.markdownlintrc.*`, `.editorconfig`.
- **Update Automation Scripts** (`update-automation-scripts.prompt.md`): Use for root automation scripts (`generate-*`, `enhance-*`, `update-*`, `populate-*`).
- **Update MCP Server** (`update-mcp-server.prompt.md`): Use for `mcp-server/src/**/*.ts` changes.

## Related customization

- [Agents](./agents.md)
- [Skills](./skills.md)
- [Workspace Instructions](./workspace-instructions.md)

## Source

- `.github/prompts/README.md`

## See Also

- [Copilot Customization Overview](../copilot.md)
- [Contributing](../index.md#contributing)
