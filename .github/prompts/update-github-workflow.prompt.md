---
description: "Create or update GitHub Actions workflows with repo CI/CD conventions"
name: "Update GitHub Workflow"
argument-hint: "Workflow file + intent (e.g., .github/workflows/deploy-docs.yml: add Node 20 cache)"
agent: "agent"
---
You are updating GitHub Actions workflow files in this repository. Use the user-provided arguments to identify the workflow file(s) and desired change.

Requirements:
- Follow the workflow rules in [GitHub workflow instructions](../instructions/github-workflow-maintenance.instructions.md).
- Use minimal, secure permissions and avoid exposing secrets.
- Preserve existing job structure and deployment logic unless explicitly requested.
- Keep changes minimal and consistent with current CI/CD patterns.

Output:
- Apply edits to the specified workflow file(s).
- Provide a concise summary of what changed and why.
