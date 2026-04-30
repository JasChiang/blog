---
title: Jas 的筆記
image: https://jasboughtit.com/og-image.png
---

一個行銷從業人員的 AI 使用筆記，記錄工具實測、工作流嘗試、寫作與開發心得。

> [!info]- 關於這個 blog 的寫作流程
> 文章在這裡分兩類，請依每篇開頭的「本文由來」callout 為準。
>
> **已審稿文章**，內容大多根據我在 Threads、Facebook 社團、內部簡報或 Obsidian 上的筆記為素材，由 **Claude Code** 協助結構化與改寫，最後由我人工審稿後發布。
>
> **Claude Code 草稿（尚未審稿）**，這類文章是請 **Claude Code** 直接根據以下來源整理出的初稿，**內容尚未經我人工校對**，可能有理解錯誤或事實落差，看的時候請當開發筆記的草稿，不是定稿。整理依據包含，
>
> - 對應 GitHub repo 的 README、commit 歷史、原始碼
> - 我與 Claude Code 工作的 session 紀錄（`~/.claude/projects/`）
> - 我與 Codex CLI 工作的 session 紀錄（`~/.codex/sessions/`）
>
> 文章開頭的 hero 圖一律由 **Codex CLI 內建的 image_gen 工具**生成（OpenAI 的圖像模型），依每篇文章內容調整視覺方向。

> [!note]- Claude Code 怎麼呼叫 Codex CLI
> 整理過程裡 Claude Code 會把 Codex CLI 當 subprocess 用，主要走 `codex exec --full-auto --skip-git-repo-check "<prompt>"` 這個指令，包成一般的 Bash 呼叫，讓兩邊 CLI 接上。實際用途有三塊，
>
> - **生 hero 圖**，把整篇 markdown 連同 16:9 比例與台灣繁體渲染要求一起丟給 Codex，由 Codex 擔任 art director 自選風格、寫 visual concept，再呼叫 `image_gen` 工具（OpenAI gpt-image-2 模型）輸出 PNG，輸出檔放在 `~/.codex/generated_images/<session-id>/ig_*.png`，由 Claude Code 再 `cp` 到 attachments。
> - **讀 Codex CLI session**，遇到 Claude Code session 找不到的開發脈絡時，Claude Code 會用 `find ~/.codex/sessions/` 加 `grep`、`jq` 去掃 jsonl 紀錄，撈出 Codex CLI 的歷史對話當素材。
> - **角色委派**，比較像 art director 的判斷工作（決定畫面比喻、版面、字體位置），由 Claude Code 寫 prompt 把判斷權交給 Codex，而不是 Claude Code 自己硬寫死。



