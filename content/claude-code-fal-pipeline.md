---
title: 用 Claude Code 操作 AI 圖片與影片生成的兩種模式，我的實際工作流
date: 2026-04-30
description: 整理我用 Claude Code 跑 AI 圖片與影片生成的兩種主要模式，一是把 fal.ai 模型整合進自己做的工具（如 storyboard-system）內部使用，二是用 Codex CLI image_gen 做臨時的 batch 生成（如 blog hero 圖）。記錄踩過的中文渲染坑與 session 隔離 pattern。
image: attachments/claude-code-fal-pipeline-hero.png
tags:
  - vibe-coding
  - ai-practice
  - dev
draft: false
---

![Claude Code 操作 AI 圖片與影片生成的兩種模式](attachments/claude-code-fal-pipeline-hero.png)

> [!info] 本文由來
> 這是一份由 **Claude Code** 整理的草稿，內容尚未經作者人工審稿，可能有不準確的地方。
>
> 整理依據，
>
> - 我與 Claude Code 工作的 session 紀錄（`~/.claude/projects/`）裡涉及 `fal-ai/...` endpoint 的部分
> - 4 月內跨多個 codex sessions 對 image_gen 工具的使用紀錄
> - [[storyboard-system|storyboard-system 開發紀錄]]、[[article-suite|article-suite 開發記]] 兩篇我之前寫過的工具文章
>
> 本文不涉及任何特定商業案內容，只談工作流模式。文章開頭的 hero 圖由 **Codex CLI 內建的 image_gen 工具**生成（OpenAI gpt-image-2 模型）。

## 起因

過去半年陸續用 AI 生成圖片跟短影片。從一開始直接打 OpenAI image API、後來想試 ByteDance Seedance、想比較 Kling，到最後**幾乎所有 fal 上的圖片影片模型都跑過**，但**不是每個模型都是我「直接」在用**。

整理 session 紀錄後，發現我的工作流明顯分成兩種模式，

1. **模式 A，工具內整合**：把 fal 模型包進我自己做的工具，工具內部處理 prompt、queue、retry、檔案管理。我用工具 = 用模型。
2. **模式 B，臨時 batch**：不過工具，直接寫個 bash loop 用 codex / fal CLI 跑一次性 batch，例如某個專案的 hero 圖、某次靈感的影片試做。

這兩種模式在思考重點、值得投資的地方都不一樣，整理在這篇。

## 模式 A，工具內整合（主力）

最常用、最穩定的工作流，是把 fal 模型整合進我自己用 vibe coding 做的工具裡，

- **[[storyboard-system|storyboard-system]]**：影片分鏡系統，內建多個 fal 影片 / 圖片 endpoint，包含 ByteDance Seedance（v1.0、v1.5、v2.0 各種變體）、Kling 系列、以及 Google 的 Nano Banana Pro 圖片模型。我寫過詳細開發紀錄，這篇不重複。
- **[[article-suite|article-suite]]**：文章生產線，內部用 `fal-ai/flux/schnell` 生文章配圖跟縮圖。

工具內用 fal 的好處，

- **抽象掉 vendor 細節**：UI 上勾「用哪個模型」即可，不用每次手寫 endpoint 跟參數
- **內建 retry / cost 統計 / 結果管理**：fal job 失敗、quota 不夠、檔名衝突等狀況工具自己處理
- **跨 session 知識累積**：哪些 prompt 什麼模型穩定，存進工具的 templates，以後沿用

從 session 紀錄看，**這類「工具內呼叫」佔我所有 fal 使用的 90% 以上**。模型實際被呼叫的次數最多在 storyboard-system 跟 article-suite 兩個專案的 session 裡。

> [!note]
> 這也代表我寫這篇文章時，對「Claude Code 直接幫我打 fal API」的經驗其實不深 — Claude Code 多半是在**幫我建工具的時候**寫那些呼叫程式，工具建好之後就是工具自己跑了。

## 模式 B，臨時 batch（少但很實用）

另一種模式是「我有一個明確要產的素材集，但沒值得專門做工具」，例如，

- 給某篇文章生 hero 圖
- 給某個簡報生 5 張概念圖
- 試一個影片 idea 看效果

這類我多半用 **Codex CLI 的 image_gen 工具**（背後是 OpenAI gpt-image-2，不走 fal），原因是 Codex CLI 已經安裝、可以從 bash 一行呼叫、適合用 Claude Code 寫 batch script orchestrate。

最近一個典型例子是這個 blog 的 20 篇 hero 圖批次重生。寫一個 bash loop，裡面 `codex exec` 跑每一篇，

```bash
for slug in "${SLUGS[@]}"; do
  ARTICLE=$(cat content/${slug}.md)
  MARKER=$(mktemp); sleep 1

  codex exec --full-auto --skip-git-repo-check "$PROMPT_WITH_ARTICLE" > log
  
  # session-id 隔離（重要）
  SESSION_FILE=$(find ~/.codex/sessions -name 'rollout-*.jsonl' \
    -newer "$MARKER" -print0 | xargs -0 ls -t | head -1)
  SESSION_ID=$(basename "$SESSION_FILE" .jsonl | sed 's/^rollout-[0-9T-]*-//')
  IMG=$(find ~/.codex/generated_images/$SESSION_ID/ -name 'ig_*.png' | head -1)
  
  cp "$IMG" attachments/${slug}-hero.png
done
```

關鍵設計，

- **每篇文章一個 codex session** → session-id 自然隔離
- 用 `marker` 檔配 `find -newer` 找本次的 session jsonl，再從檔名 parse session-id
- 只在那個 session 對應的 generated_images 子資料夾找圖

最後一條很重要。我第一版 script 沒做 session-id 隔離，**抓圖時用了「找最新生成的圖」這個邏輯**，結果跑到一半，剛好我另一個 codex session 在做別的事情、生了一張無關的圖，被 batch script 抓回來當 hero。圖跟文章完全對不上，發現後才補 session 隔離邏輯。

## 中文渲染的坑

兩種模式都會遇到同一個問題，**模型預設生簡體中文**，即使 prompt 寫繁中描述。

> [!note]
> 為什麼會這樣？我沒查到 OpenAI 或其他 vendor 的官方說明。**最合理的猜測是訓練資料中文部分以簡中為主**（中國網際網路內容遠多於台灣 + 香港），模型對「中文」的內部表徵自然偏簡中。
>
> 但這只是猜測，沒有官方文件支持。實務上不需要知道 root cause，**接受 default 是簡中、在 prompt 強制反轉**就行。

實測，

- **gpt-image-2**（透過 Codex CLI 或 fal 端點）：預設簡體
- **Nano Banana Pro**：中等，有時繁有時簡
- **Seedance**：對中文 prompt 友善，但要混一點英文穩定度更好
- **Kling**：對中文 prompt 不穩定，建議用英文或中英雙語

要逼模型穩定輸出繁中，prompt 必須**強烈、重複**強調，並加殘體對照表，

```
中文必須是台灣繁體 zh-TW，嚴禁簡體與殘體（用繁體字寫中國用詞）：
- 鏈結 / 链接 → 連結 或 網址
- 視頻 / 视频 → 影片
- 軟件 / 软件 → 軟體
- 網絡 / 网络 → 網路
- 數據 / 数据 → 資料
- 服務器 / 服务器 → 伺服器
- 文檔 / 文档 → 文件 或 檔案
- 信息 / 信息 → 訊息 或 資訊
- 屏幕 / 屏幕 → 螢幕
- 用戶 / 用户 → 使用者
- 搜索 / 搜索 → 搜尋
- 代碼 / 代码 → 程式碼
- 內存 / 内存 → 記憶體
```

加了之後成功率明顯提升。但**還是會偶爾漏網**。例如「短鏈結」（殘體寫法），台灣應該用「短網址」（在地用詞）。對策是再加一條，

> 圖中所有中文字必須完全沿用文章原文用詞，禁止自創、翻譯、改寫、簡化

逼模型從 input 抄字而不是自創翻譯，這樣只要文章原文用對的詞，生圖就會跟著對。

對殘體警覺度要拉高。「鏈結」「視頻」這種**字本身是繁體、但詞是中國用詞**的最容易漏網，需要肉眼最後檢查一遍。

## 影片生成的特殊處理（適用兩種模式）

不管走 storyboard-system 還是 ad-hoc，影片生成跟圖片差兩點，

### 1. 時長限制

fal 上常見影片模型的單次生成上限，

| 模型 | 單次最長 |
|------|---------|
| Seedance v1.0 / v1.5 Pro | 5s 或 10s |
| Seedance 2.0 Pro | ~10s |
| Kling 2.x | 5s 或 10s |

要 15 秒以上，**單一模型一次跑不出來**。常見解法，

- 拆成兩個 5-10 秒片段
- 後一段用前一段的最後一幀當 image-to-video 起點，維持視覺連貫
- 後製拼接

### 2. Long-running job

圖片大多 5-30 秒同步回應。影片動輒 1-3 分鐘 async。fal 走 queue 模式，

```
1. POST 提交 job → 拿到 request_id
2. GET status 直到 completed
3. GET 結果，拿到視頻 URL
```

實務上**啟動後就丟著**，不在 polling loop 裡死等。Claude Code 可以跑 background task，「跑這個影片生成 job、別等它、做完了再 ping 我」，比死等回應更實際。

## Prompt 迭代是這套工作流的本質

最深的體會是，**第一次寫的 prompt 從來不是最終版**。

我的 prompt 演化通常經歷，

1. **第一版**：照模型文件範例寫，產出能跑但很 generic
2. **第二版**：加風格指引（畫風、媒材、調性）
3. **第三版**：加禁止項（不要這、不要那）
4. **第四版**：加殘體對照表、強制原文用詞
5. **第五版**：發現實際輸出的某個失敗模式，加對應修補規則

每一版都是踩到坑後才補的，**第一次很難一次想到全部該禁止的事**。接受這個 iteration 節奏比較實際。

把 iteration 過程留在 commit history，**未來換 vendor 或 model 時可以回頭參考**，這也是把 prompt 包進工具（模式 A）的好處之一。

## 什麼時候該做工具，什麼時候 ad-hoc

兩種模式各有適用場景，

| 條件 | 模式 A，做工具 | 模式 B，ad-hoc batch |
|------|----------------|---------------------|
| 重複次數 | 會跑很多次（>10 次/月） | 一次性或短期 |
| 需要 UI / 給別人用 | 是 | 否 |
| 需要參數試錯 | 是，工具方便切換 | 也行，但 bash 更快試 |
| 需要結果管理 / 比較 | 是 | 一般可以放著 |
| 投資成本 | 高（建 UI、後端、整合） | 低（一個 bash script） |

我的判斷規則大概是，**「下個月還會用嗎？」如果是，做工具；如果不是，bash 一個 loop 跑完就忘**。

## 心得

### Claude Code 在這套工作流的角色

不只是「按下生成按鈕那一下」。它在做，

- **決定要 ad-hoc 還是建工具**（看任務性質）
- **設計 orchestrator 的結構**（session 隔離、batch loop、錯誤處理）
- **看到失敗結果決定要不要重試 / 換模型 / 換 prompt**
- **跨 session 累積教訓**（殘體對照表、session 隔離 pattern 等都是踩過坑後加進來的）

這比單純的「自動化腳本」動態，又比「人類盯著每一張圖」省力。

### 別過度依賴 fal 的「一個 API 走天下」

fal.ai 的方便性確實大，但**它代理的模型可能 deprecate 或漲價**。我設計工具的時候，把每個 model 的呼叫包成一個 adapter（接同樣的 input / output），即使哪天某 model 從 fal 下架，把 adapter 換成直接打 vendor 即可。**1-2 天可遷移，風險可控**。

### 對中文圈使用者的建議

如果你跟我一樣**內容多半是繁中**，這套工作流的 prompt 部分**一定要花時間設計繁中 / 殘體規則**。default 出來的東西大機率會有簡中或殘體，後製檢查很煩。把規則 baked in 到 prompt template / 工具 config 裡是最划算的做法。

## 結語

整理這篇的感覺是，「**Claude Code 在我 AI 圖片影片工作流的角色**」其實比想像中更後設。它不是負責每次 generation，**它負責決定怎麼組織 generation 這件事本身**——要不要做工具、prompt 怎麼演化、結果怎麼比較、失敗怎麼處理。

具體模型呼叫反而是相對機械的環節，誰都可以做。難的、也是 vibe coding 真正改變的，是**在 generation 之上那一層的 orchestration 思考**。
