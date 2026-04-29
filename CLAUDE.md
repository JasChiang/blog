# 寫文章規則（Quartz blog）

這個檔案是寫 blog 文章時的固定規則。每次寫新文章請依照這份指南。

## 文章位置
- 寫作位置：`/Users/jaschiang/Library/Mobile Documents/iCloud~md~obsidian/Documents/article/blog/`（iCloud Obsidian vault）
- 圖片位置：上述資料夾的 `attachments/` 子資料夾
- 發布流程：跑 `./publish.sh` → rsync 到 `content/` → commit → push → GitHub Actions 自動部署
- 不要直接編輯 `content/` 目錄（它由 publish.sh 從 iCloud 同步）

## 檔名與標題（重要）

- **檔名一律用英文 slug**，小寫、用連字號分隔（kebab-case），例如 `my-article-name.md`
  - 原因：英文檔名 = 英文 URL slug，貼到 Slack/LINE/Twitter 都好看，SEO 友善
  - 中文檔名會 URL-encode 成 `%E4%B8%AD%E6...` 一坨難看的字
- **標題（frontmatter `title`）用中文**
- Obsidian 透過 Front Matter Title 外掛顯示中文標題，所以左側 explorer / tab 看到的還是中文

## Frontmatter 結構

新文章一律用這個結構：

```yaml
---
title: 中文標題
date: YYYY-MM-DD
description: 一句話摘要，用於 Google / 社群分享預覽
tags:
  - tag-1
  - tag-2
draft: true
---
```

- `draft: true` 預設打開，避免誤推。寫完拿掉再 publish。
- `description` 必填，會出現在 Google 搜尋結果與 OG 預覽
- `tags` 至少一個，盡量重用既有標籤（`ai-practice`、`vibe-coding`、`thinking` 等）

Templater 範本已設好預設帶 `draft: true`。

## 文字慣例

- **不用中文冒號 `：`**（用逗號 `，` 取代或重組）
- **不用中文破折號 `——`**（用逗號 `，` 取代或重組）
- frontmatter 與 callout 的 ASCII `:`（如 `title:`、`[!info]`）不在此限
- 中英夾雜時保留適當空格（例如 `用 GPT 寫文章`）

## 圖片

### Hero 圖（每篇文章開頭）

- **一律用 Codex CLI 的 image_gen 工具生成**，不用其他工具
- 指令範例：
  ```bash
  codex exec --full-auto --skip-git-repo-check "請用 image_gen 工具生成一張概念圖。主題，<主題>。風格，扁平向量插畫、灰藍色調、低飽和度、橫向 16:9。畫面內容，<具體描述>。不要文字、不要人臉。"
  ```
- **風格一致性要求**（已建立的 hero 圖視覺語言）：
  - 扁平向量插畫風 / 等距視角
  - 灰藍色調為主，低飽和度
  - 橫向 16:9 比例（約 1672×941）
  - 不含文字、不含真實人臉
- 生成後檔案在 `~/.codex/generated_images/<session-id>/ig_*.png`
- 複製到 `attachments/<slug>-hero.png`

### 文章內圖片

- 流程圖、截圖等放 `attachments/`，命名語意化（例：`attachments/llm-prediction.png`）
- markdown 引用用相對路徑：`![alt](attachments/xxx.png)`

## 本文由來 callout

若文章是基於既有素材改寫（FB、Threads、簡報、會議記錄等），文章開頭（hero 圖之後）加 callout：

```markdown
> [!info] 本文由來
> 這篇是<說明來源，例如「我整理自己在 Threads 上幾則發文」或「我內部分享簡報的整理版」>，由 Claude 協助結構化成文章後審稿發布。
> 
> <若有>原始素材建立於 YYYY/MM/DD<，最後更新 YYYY/MM/DD>。
> 
> <若使用 AI 生成圖片>文章開頭的概念圖是用 **Codex CLI 內建的 image_gen 工具**生成。
```

## 文章結構（順序）

1. frontmatter
2. hero 圖
3. 本文由來 callout（若適用）
4. 正文，用 `##` 切主要段落，`###` 切子段落
5. 結語段（用 `## 結語` 或類似）

## 內文格式

- 強調用 `**粗體**`，避免大量斜體
- 重要警告用 `> [!warning]` callout
- 技巧用 `> [!tip]` callout
- 註解、補充用 `> [!note]` 或一般 blockquote
- 列表盡量用 bullet（`-`）而非編號，除非順序重要

## 跨文章連結

如果引用本 blog 其他文章，用 Obsidian wikilink 語法：

```markdown
[[ai-video-writer|顯示文字]]
```

Quartz 的 ObsidianFlavoredMarkdown plugin 會處理。

## 發布流程

1. 在 Obsidian 完成文章，確認 `draft: false`
2. terminal：`cd ~/Documents/GitHub/blog && ./publish.sh`
   - 或在 Obsidian 用 Shell Commands 外掛的「Publish」命令
3. GitHub Actions 會自動 build & deploy（約 1-2 分鐘）
4. 上線網址：`https://jaschiang.github.io/blog/<slug>`
