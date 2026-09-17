# JS 檔案框架與 HTML / CSS 接口

## data.js

只放資料，不操作 HTML / CSS。包含：固定文字、時間線資料、一般檔案資料、實作資料、實作文件資料。

## render.js

| 函數 | 主要用途 | HTML | CSS |
|---|---|---|---|
| `renderStaticText()` | 將 data.js 固定文字填入既有 HTML | `[data-static-text]`, `[data-timeline-month]`, `[data-timeline-id]` | 無 |
| `showView(name)` | 切換四個主要 View | `[data-view]` | `.is-hidden` |
| `renderTimeline(id)` | 更新標題、描述、相關連結 | `[data-timeline-title]`, `[data-timeline-story]`, `[data-related-links]`, `[data-timeline-id]` | `.is-active`, `.related-link`, `.related-link--practice`, `.related-link--file` |
| `renderFile(fileId)` | 更新一般檔案展示區 | `[data-file-name]`, `[data-file-description]`, `[data-file-preview]` | 無 |
| `renderPracticeList()` | 依資料生成實作項目按鈕 | `[data-practice-list]`, `[data-practice-file-list]` | `.practice-item`, `.is-active` |
| `renderPracticeFiles()` | 依資料生成需求規格 / 測試案例按鈕 | `[data-practice-files]`, `[data-practice-file-tabs]` | `.practice-file-button`, `.is-active` |
| `renderPractice()` | 更新實作介紹、流程、回顧 | `[data-practice-intro]`, `[data-practice-object]`, `[data-flow-step]`, `[data-practice-review]` | 上述按鈕類別 |
| `renderPracticeDocument()` | 更新實作檔案展示區 | `[data-practice-file-*]`, `[data-practice-document-*]` | 上述按鈕類別 |

### 特別規則

- 時間日期、時間塊、實作流程骨架都已存在 HTML；JS 不負責建立它們。
- `renderTimeline()` 只會動態建立「相關連結按鈕」，因為按鈕數量由目前時間資料決定。
- `renderPracticeList()` / `renderPracticeFiles()` 會建立按鈕，因為實作與文件數量來自 data.js。
- 一般檔案展示區與實作檔案展示區為兩套不同 HTML / CSS 結構。

## events.js

| 函數 | 事件 | HTML | CSS |
|---|---|---|---|
| `bindTimelineEvents()` | Hover / focus / click 時間塊 | `[data-timeline-id]` | 無 |
| `bindRelatedLinkEvents()` | 點相關連結 | `[data-action]`, `[data-file-id]`, `[data-practice-id]` | 無 |
| `bindPracticeEvents()` | 切實作、切文件、開啟、下載 | `[data-switch-practice]`, `[data-practice-document]`, `[data-open-file]`, `[data-download-file]` | 無 |
| `bindMindmapEvents()` | 心智圖跳轉 | `[data-map-target]` | 無 |

## main.js

只建立 `app.state` 並依序初始化：固定文字 → 初始時間資料 → 初始實作資料 → Timeline View → 綁定事件。


## Timeline Hover

- Timeline 每一列代表一個月份，月份格位固定存在 HTML。
- `data.js -> timelineMonths` 決定哪些月份顯示日期文字；未顯示月份仍保留間距，但不可互動。
- Hover 不再使用獨立提示元素。`renderStaticText()` 會把 `timeline[].hover` 寫入時間區塊的 `data-hover`，CSS 透過 `::after` 在時間區塊向右展開時顯示文字。
- Timeline 的列位置與區段長度仍由 CSS Grid 控制，JS 不設定 `top`、`height` 或建立 Timeline DOM。
