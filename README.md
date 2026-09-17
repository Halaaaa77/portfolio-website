# Portfolio V2 Desktop Final

本版只處理電腦版，沒有加入手機版 media query。

結構：
- `index.html`：依既定區塊劃分；時間線本體與流程骨架為靜態 HTML。
- `css/main.css`：定位/版面屬性與設計/外觀屬性以空白行分隔，沒有在 class 內加入 Layout / Visual 註解。
- `js/data.js`：所有 JS 使用資料集中於此。
- `js/render.js`：只更新內容與 View 狀態。
- `js/events.js`：只管理事件與 if 判斷。
- `js/main.js`：只初始化。
- `JS_GUIDE.md`：每個 JS 函數、HTML 接口、CSS 依賴對照。

注意：
- `.is-hidden` 與 `.is-active` 是 JS 會使用的狀態 class。
- `[data-*]` 屬性是 HTML 與 JS 的接口，調整 HTML / CSS 時應優先保留。
- 一般檔案展示區與實作檔案展示區是不同 View、不同結構。

## Vite / Mind Elixir

此版本改用 Vite 與 npm package：

```bash
npm install
npm run dev
```

正式建置：

```bash
npm run build
```

Mind Elixir 入口在 `js/mindmap.js`：

```js
import MindElixir from 'mind-elixir'
import 'mind-elixir/style.css'
import mapTemplate from './mindmap-data.json'
```

`js/mindmap-data.json` 是 Mind Elixir 匯出的原始心智圖資料。程式初始化前只替換 `{...}` 佔位資料；佔位節點不綁點擊，其他已設定導航目標的節點沿用原始 node id 綁定網站既有 navigation。
