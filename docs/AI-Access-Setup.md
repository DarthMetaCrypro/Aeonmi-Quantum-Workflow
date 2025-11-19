# AI Access Setup

This document explains how to finish the setup so AI tools (Copilot, Grok/SuperGrok, OpenAI GPT integrations) can propose and push changes in a controlled, auditable way.

## Required secrets (add these in the repository Settings → Secrets → Actions)

- `OPENAI_API_KEY` — API key for OpenAI GPT calls.
- `BOT_PAT` — a fine-grained personal access token for a machine/bot account with repo contents: Read & Write and Pull requests: Read & Write, scoped to this repository.

## Recommended approaches

1. GitHub App (recommended)
   - Create a GitHub App under your account (Settings → Developer settings → GitHub Apps) and install it on this repository with Contents: Read & Write and Pull requests: Read & Write.
   - Use the App installation token or a server-side flow to make changes.

2. Machine user (bot) + fine-grained PAT
   - Create a separate GitHub account for the bot (e.g., `aeonmi-bot`).
   - Invite the bot as a collaborator with Write permission.
   - Sign in as the bot and create a fine-grained token limited to this repository with required scopes.
   - Store the token in `BOT_PAT` repository secret.

3. Deploy key (git-only)
   - Run `scripts/create_deploy_key.sh` locally to generate an ed25519 keypair.
   - Upload the public key using the printed `gh api` command, or via the UI under Settings → Deploy keys.

## VS Code & Copilot

- When using VS Code locally, sign into GitHub in the editor (Accounts → Sign in) so your git operations use your user credentials.
- If you prefer the AI to act under a separate bot identity, use a bot account or GitHub App as shown above.
- Do NOT paste tokens or private keys directly into code. Use repository secrets for workflows and a secure store for external services.

## How the included workflow works

- `.github/workflows/ai-assistant.yml` is a manual workflow (trigger: workflow_dispatch) that runs `.github/scripts/ai-assistant.sh`.
- The script requires `OPENAI_API_KEY` and `BOT_PAT` secrets and will create a branch, commit a small change, push, and open a PR. Review PRs before merging.

## Next steps

1. Add the two required secrets to this repository: `OPENAI_API_KEY` and `BOT_PAT`.
2. Run the workflow manually from the Actions tab to verify the end-to-end flow.
3. Replace the demo step in `.github/scripts/ai-assistant.sh` with your AI logic (calls to OpenAI) once you are comfortable with the flow.
