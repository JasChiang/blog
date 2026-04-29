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

git add content

if git diff --cached --quiet; then
  echo "==> No content changes. Nothing to publish."
  exit 0
fi

echo "==> Committing and pushing..."
git commit -m "publish: $(date '+%Y-%m-%d %H:%M')"
git push

echo "==> Done. GitHub Actions will deploy in ~1-2 minutes."
echo "    https://github.com/JasChiang/blog/actions"
