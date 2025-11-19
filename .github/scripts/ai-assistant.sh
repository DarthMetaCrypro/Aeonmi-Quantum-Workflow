#!/usr/bin/env bash
set -e

if [ -z "$BOT_PAT" ] || [ -z "$OPENAI_API_KEY" ]; then
  echo "This workflow requires two secrets: OPENAI_API_KEY and BOT_PAT.\nPlease add them at Settings → Secrets → Actions.\nOPENAI_API_KEY is used by AI calls; BOT_PAT must be a fine-grained token or bot PAT with repo contents and pull request write permissions."
  exit 1
fi

BRANCH="ai/assistant-run-$(date +%s)"

git config user.name "ai-assistant[bot]"
git config user.email "ai-assistant@users.noreply.github.com"

git checkout -b "$BRANCH"

mkdir -p docs
LOGFILE="docs/AI-ASSISTANT-RUNS.log"
printf "AI-assisted run at %s\n" "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" > "$LOGFILE"

git add "$LOGFILE"
git commit -m "chore: ai-assistant update @ $(date -u +"%Y-%m-%dT%H:%M:%SZ")"

# Push using PAT over HTTPS
REPO_URL="https://x-access-token:${BOT_PAT}@github.com/${GITHUB_REPOSITORY}.git"
git push "$REPO_URL" "$BRANCH"

# Create PR via API
API_PAYLOAD=$(jq -n \
  --arg title "AI assistant: proposed changes $(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
  --arg head "$BRANCH" \
  --arg base "main" \
  --arg body "Automated AI-assisted change. Review before merging." \
  '{"title":$title,"head":$head,"base":$base,"body":$body}')

curl -s -X POST -H "Authorization: token $BOT_PAT" -H "Content-Type: application/json" -d "$API_PAYLOAD" "https://api.github.com/repos/${GITHUB_REPOSITORY}/pulls" | jq .
