#!/usr/bin/env bash
set -e

KEY_NAME="$1"
if [ -z "$KEY_NAME" ]; then KEY_NAME="grok-deploy-key"; fi

ssh-keygen -t ed25519 -C "$KEY_NAME@${GITHUB_REPOSITORY}" -f "${KEY_NAME}" -N ""

echo "\nPublic key (${KEY_NAME}.pub):"
cat "${KEY_NAME}.pub"

echo "\nTo upload the public key to the repository (requires gh CLI authenticated as a user with admin access to the repo):"
echo "gh api repos/${GITHUB_REPOSITORY}/keys -f title='${KEY_NAME}' -f key=\"$(cat ${KEY_NAME}.pub)\" -f read_only=false"
