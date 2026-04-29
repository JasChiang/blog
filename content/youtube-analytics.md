---
title: 用 Claude Code 在一天內做出 YouTube Analytics MCP，然後發現它不夠用
date: 2026-01-06
description: 2026 年初，我用 Claude Code 快速做了第一版 YouTube Analytics MCP server，能查影片資料、跑 Analytics 查詢，但很快撞到配額問題與本機限制，這段過程讓我理解了「能跑」跟「好用」之間的距離。
tags:
  - dev
  - vibe-coding
image: attachments/youtube-analytics-hero.png
draft: false
---

![youtube-analytics hero](attachments/youtube-analytics-hero.png)

> [!info] 本文由來
> 這是一份由 **Claude Code 整理的草稿**，內容尚未經作者人工審稿，可能有不準確的地方。
>
> 整理依據，
>
> - GitHub repo, [JasChiang/youtube-analytics](https://github.com/JasChiang/youtube-analytics) 的 README（若有）、commit 歷史與原始碼
>
> 文章開頭的 hero 圖由 **Codex CLI 內建的 image_gen 工具**生成（OpenAI gpt-image-2 模型）。

## 起因

當時我管的 YouTube 頻道已經有一陣子，但查資料的流程很繁瑣，每次想知道某支影片的留存率或流量來源，都要打開 YouTube Studio，在不同分頁間切換，把數字截圖下來，再手動貼進 Claude 問分析。

Claude 支援 MCP，理論上可以讓 AI 直接呼叫外部工具拿資料。YouTube 有官方 API，Google Cloud Console 可以拿到 OAuth 憑證。把這兩件事連起來，用 Claude Code 直接刻，感覺不用太久。

這就是 `youtube-analytics` 的起點，一個用來驗證想法的快速原型。

## 主要功能

這個版本用 TypeScript 寫，核心依賴是 `googleapis`（Google 官方 SDK）和 `@modelcontextprotocol/sdk`。工具清單包含：

- **OAuth 認證**，`youtube_get_auth_url` 產生授權 URL，`youtube_authorize` 完成 token 交換，token 存在本機 `token.json`
- **頻道與影片查詢**，列出頻道、讀取影片清單和詳細資料
- **Analytics 查詢**，以彈性的 metrics / dimensions / filters 組合查詢資料，支援 JSON 和 Markdown 兩種回傳格式
- **群組管理**，建立、列出、刪除 YouTube Analytics 群組

工具數量不多，但已經覆蓋了我最常需要的查詢場景。

## 開發過程

`Initial commit` 在 2026/01/06 早上落地，是完整的 MCP server 骨架，OAuth 流程、YouTube API 包裝、工具定義都在。

接著補了「登入持久化 + 改善搜尋」，讓重啟 server 後不需要重新跑 OAuth，並讓影片搜尋更好用。然後加了群組功能，又馬上 revert 掉，「關閉群組功能」和隨後的 revert commit 說明了這段來回，群組功能的 YouTube Analytics API 有獨立的配額與權限要求，當下判斷不值得為了這個功能增加設定複雜度。

整個 repo 的 commit history 只有五條，週期不到一天，典型的 vibe coding 節奏，快速驗證、發現問題、決定取捨。

## 技術選擇

**為什麼從第一版就做成 MCP**

直接寫 CLI 腳本也可以拿到 YouTube 資料，但每次問問題都要我手動選 endpoint、組參數。MCP 的好處是讓 Claude 自己決定要呼叫哪個工具、要怎麼組合，問「最近哪支影片的觀眾留存率掉最多」這種問題，Claude 會自動拆成多個 tool call 去拿不同的資料，這是手寫腳本做不到的。

**stdio 模式跑在本機**

第一版只支援 stdio transport，server 從 Claude Code 的 `~/.claude.json` 啟動，config 檔裡直接帶 `GOOGLE_CLIENT_ID` 和 `GOOGLE_CLIENT_SECRET` 兩個環境變數。設定方式記在 `CONFIG_INSTRUCTIONS.md`，連去哪裡改哪個欄位都寫好了，因為這個 config 是讓自己在 Windows 機器上直接跑的。

**沒有快取**

第一版完全沒有快取設計，每次 Claude 呼叫 `youtube_list_channel_videos`，就直接打一次 YouTube Data API。YouTube Data API 的每日配額是 10,000 點，`list` 操作每次消耗不少，很快就遇到配額警告。

這是第一版最明顯的問題，也是後來重新設計的主要原因之一。

## 心得

（TODO 補上）

## 結語

`youtube-analytics` 是一個「能跑」的 prototype，它驗證了把 YouTube API 包成 MCP 這件事是可行的，OAuth 流程通了，Claude 能呼叫工具拿到真實資料，這個核心假設成立。

但「能跑」跟「好用」之間還有一段距離，配額用完的問題、只能在本機跑的限制、群組功能的去留，這些都是後來重新設計時處理的事。

後續的演進版本記在 [[youtube-analytics-mcp-server|用 MCP 把 YouTube Analytics 接進 Claude，順便解決 API 配額問題]]，包含 Gist 快取設計、遠端 HTTP 模式、OAuth bridge 和 Supabase token 持久化。這篇算是那篇的前傳。
