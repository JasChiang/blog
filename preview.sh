#!/bin/bash
set -e

VAULT="/Users/jaschiang/Library/Mobile Documents/iCloud~md~obsidian/Documents/article/blog"
REPO_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "==> Syncing from iCloud vault..."
rsync -av --delete \
  --exclude='.obsidian' \
  --exclude='.DS_Store' \
  --exclude='.trash' \
  "$VAULT/" "$REPO_DIR/content/"

cd "$REPO_DIR"
echo "==> Starting Quartz dev server at http://localhost:8080"
npx quartz build --serve --wsPort 3002
