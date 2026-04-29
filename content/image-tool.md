---
title: 純前端圖片編輯工具，沒有後端、沒有上傳、只在瀏覽器跑
date: 2026-04-29
description: 用 Vite + TypeScript 做的純前端圖片處理工具，支援馬賽克、模糊、黑條遮蔽與切版，圖片不離開瀏覽器。
tags:
  - dev
  - vibe-coding
image: attachments/image-tool-hero.png
draft: false
---

![純前端圖片編輯工具概念圖](attachments/image-tool-hero.png)

> [!info] 本文由來
> 這是一份由 **Claude Code 整理的草稿**，內容尚未經作者人工審稿，可能有不準確的地方。
>
> 整理依據，
>
> - GitHub repo, [JasChiang/image-tool](https://github.com/JasChiang/image-tool) 的 README（若有）、commit 歷史與原始碼
>
> 文章開頭的 hero 圖由 **Codex CLI 內建的 image_gen 工具**生成（OpenAI gpt-image-2 模型）。

## 起因

處理截圖是一件很日常的事，要貼到文件或分享給別人之前，常常需要把畫面上的某些資訊遮起來，帳號、手機號碼、訊息內容之類的。

現有的工具大多有幾個問題，要嘛要下載桌面軟體，要嘛要把圖片上傳到某個服務，後者的隱私疑慮讓我一直不太舒服。所以就起了自己做一個的念頭，條件很簡單，**純前端、不上傳、可以直接丟到 GitHub Pages**。

## 主要功能

工具分成兩個模式，編輯和切版。

**編輯模式**做的是局部遮蔽。可以一次載入多張圖片，在圖上拖曳框選要遮蔽的區域，選完後套用效果。效果有四種可選，馬賽克、模糊、黑條、純色遮蓋，也可以調整強度或顏色。選區清單會列在側邊，可以單獨刪除或全部清除。

除了遮蔽之外，也做了幾個基本變形，裁切、旋轉、水平垂直翻轉。還有原圖比較的切換，可以隨時看遮蔽前後的差異。

輸出格式支援 PNG、JPEG、WebP，可以設定品質，也可以把所有載入的圖片一次打包成 ZIP 下載。

**切版模式**是後來加的功能。可以在圖片上加橫線和直線，把圖片切成若干區塊，再把切片打包成 ZIP 下載，主要用途是把長截圖切成社群發文用的分割圖。

## 開發過程

整個 repo 一共七個 commit，可以從紀錄看到工具從無到有的過程。

第一個 commit `Create mosaic image editor` 是最初的版本，只有馬賽克功能。第二個 commit `Add image slicing tool` 加入了切版分頁。接著 `Configure Pages deployment` 設定好 GitHub Actions 自動部署到 Pages。

之後的幾個 commit 都是在打磨細節，`Improve slicing workspace controls` 改善了切版操作的體驗，`Add adjustable workspace and grid sizing` 讓工作區和格線大小可以調整。`Fix mosaic file reload and stepwise undo` 修了重新載入檔案時的 bug，也讓復原功能變成逐步的，每次操作都可以單獨回退。

最後一個 commit `Expand static image editor workflow` 把整體的 UI 流程整合得更完整，把之前的散件串在一起。

## 技術選擇

整個工具只用了三個 devDependency，Vite、TypeScript、playwright-core（用來做 e2e 測試）。沒有 React、沒有 Vue，沒有任何 UI 框架。

圖片處理全部靠 Canvas API，馬賽克的做法是把選區分成 cell，對每個 cell 取像素平均色再填回去，模糊則是用 Canvas 的 `filter: blur()`，都是瀏覽器原生支援的能力。

工具邏輯用 `EditorTool` 介面統一，每個工具都實作 `apply` 和可選的 `applyBatch`，`apply` 處理單一選區，`applyBatch` 處理同一張圖的多個選區，讓批次套用效果可以只 draw 一次圖。控制器層負責選區管理、undo/redo 狀態、UI 綁定，工具本身保持純粹，只管怎麼算出一張 canvas。

這樣的架構讓加新工具很容易，只要實作 `EditorTool`，控制器那邊一行就可以掛進去。README 裡也提到未來可以往筆刷選取、多邊形選取、社群尺寸模板的方向擴充。

## 心得

（TODO 補上）

## 結語

[image-tool](https://jaschiang.github.io/image-tool/) 現在已經部署在 GitHub Pages，不需要安裝任何東西，用瀏覽器開就能用。圖片不離開本機，隱私上可以放心。

如果你也常需要處理截圖，可以試試看。
