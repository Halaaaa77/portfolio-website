/*
File: data.js
Purpose:
- 儲存網站所有會被 JS 使用的文字、互動資料與檔案路徑。
- 不操作 HTML，不操作 CSS。
*/
(function () {
  const app = window.PortfolioV2 = window.PortfolioV2 || {};

  app.data = {
    staticText: {
      mindmap: {
        home: "個人網頁",
        practice: "專案",
        testing: "探索測試",
        hint: "點擊文字即可跳轉查看"
      },
      intro: {
        copy: "嗨～我是陳宜仟，今年24歲，牡羊座。\n在這個網站你可以看到：\n        1. 不同時期的我所留下的痕跡\n       2. 我做了哪些實作，以及完成它們的過程。\n心智圖區域可以拖拽查看、部分節點可點擊跳轉，謝謝您的到訪與觀看～"
      },
      guide: {
        byView: {
          timeline: "下方區域主要展示不同時期的經歷故事，點擊圖表內的區塊可以跳轉到想要查看的時期，將鼠標懸停在區塊上則可以看到該時期的摘要",
          file: "再次點擊檔案名稱，即可關閉檔案～",
          practice: "同類型的實作會集中展示，可以點擊左側的按鈕查看對應的實作資訊",
          "practice-file": "實作檔案說明旁邊的按鈕分別可以在新分頁查看、下載檔案；再次點擊檔案名稱，即可關閉檔案～"
        }
      },
      timeline: {
        learning: "學習",
        work: "工作"
      },
      practice: {
        objectLabel: "測試對象：",
        flowCaption: "實作過程含回顧"
      },
      footer: {
        backToMap: ">回到心智圖<",
        backToHome: ">回到時間線<"
      }
    },

    initialTimelineId: "testing-2026-08",

    timelineMonths: [
      { value: "2026.08", showLabel: true },
      { value: "2026.07", showLabel: false },
      { value: "2026.06", showLabel: true },
      { value: "2026.05", showLabel: false },
      { value: "2026.04", showLabel: false },
      { value: "2026.03", showLabel: false },
      { value: "2026.02", showLabel: true },
      { value: "2026.01", showLabel: false },
      { value: "2025.12", showLabel: false },
      { value: "2025.11", showLabel: false },
      { value: "2025.10", showLabel: true },
      { value: "2025.09", showLabel: false },
      { value: "2025.08", showLabel: false },
      { value: "2025.07", showLabel: false },
      { value: "2025.06", showLabel: false },
      { value: "2025.05", showLabel: false },
      { value: "2025.04", showLabel: true },
      { value: "2025.03", showLabel: false },
      { value: "2025.02", showLabel: false },
      { value: "2025.01", showLabel: false },
      { value: "2024.12", showLabel: false },
      { value: "2024.11", showLabel: false },
      { value: "2024.10", showLabel: false },
      { value: "2024.09", showLabel: false },
      { value: "2024.08", showLabel: true },
      { value: "2024.07", showLabel: false },
      { value: "2024.06", showLabel: true }
    ],

    timeline: [
      {
        id: "testing-2026-08",
        date: "2026.08",
        title: "歡迎來到2026.07~2026-08，此時我在：",
        story:"整理過往經歷後，我發現圖表所反映的生活狀態是**學習和工作一直是分開的**，並沒有並行發展，這意味著我感興趣的學習方向還沒有與工作對齊，因此我想嘗試以**技術實作為主**的工作類型。\n在探索期間我接觸到了**軟體測試**。我透過實作了解測試要做什麼，從教學影片認識測試是什麼，除此之外，我還試著用後端的角度理解**測試的角色與職責**，希望盡可能從不同方向探索與學習測試。\n最後我發現測試是需要**耐心、觀察和邏輯**，同時選擇**合適的測量工具和方法**也是關鍵之一，而這些能力不僅侷限於測試，在日常生活中也能運用。",
        hover: "[ 學習 ] 軟體測試學習與實作整理。",
        links: [
          { label: "探索測試→", action: "practice", practiceId: "exploratory" },
          { label: "驗收測試→", action: "practice", practiceId: "acceptance" },
          { label: "從後端學軟體測試→", action: "practice", practiceId: "backend", available: false }
        ]
      },
      {
        id: "admin-2026-06",
        date: "2026.06",
        title: "歡迎來到2026.03-2026-07，此時我在：",
        story: "3月的時候我應徵上了**好朋友生物科技公司的行政助理**，\n主要負責內勤行政、包裝出貨以及開會準備。\n這是我第一次做行政，我獲得了與以往工作不同的經驗，\n特別是在**「怎麼做」**和**「做什麼」**上有更多的收穫。\n怎麼做：\n     1. 做事前先寫下做法。\n     2.做完事情後，將經驗轉換成下次可複用的流程、提醒等。\n做什麼：\n     1. 排序：事情有輕重緩急之分。\n    2. 不能當下處理的事情應寫下來，避免遺忘。",
        hover: "[ 工作 ] 好朋友生物科技公司行政助理",
        links: []
      },
      {
        id: "certificate-2026-02",
        date: "2026.02",
        title: "歡迎來到2025-10~2026-03，此時我在：",
        story: "這段期間我陸續準備了以下證照：\n    1. TQC WORD 專業級\n    2. MOS EXCEL EXPERT\n    3. TOEIC 790分\n在準備證照的期間，我還接觸了**VBA**，並用其做了背英文單詞的工具。\n這些學習讓我更加熟悉常用軟體，同時我也希望這些能力能夠應用到工作上。",
        hover: "[ 學習 ] 各類證照考取和VBA實作",
        links: [
          { label: "VBA 英文單詞工具", action: "practice", practiceId: "vba", available: false },
          { label: "MOS EXCEL EXPERT", action: "file", fileId: "excel" },
          { label: "TQC WORD 專業級", action: "file", fileId: "word" }
        ]
      },
      {
        id: "parttime-2025-10",
        date: "2025.10",
        title: "歡迎來到202506-2025-09，此時我在：",
        story: "我在6月的時候應徵上**寵物公園的門市顧問**，與先前的門市工作不一樣，除店務執行外還需要學習產品以及養寵相關資訊，為顧客提供專業諮詢。\n在這份工作中我**最大的挑戰是精力消耗與銷售**。\n精力消耗：門市工作需要隨時關注四周，而我比較偏向專心致志的完成手上工作。\n銷售：在不確定資訊的時候，我偏向只向顧客說明自己已經掌握的資訊；同時，我也更傾向從顧客當下的實際需求出發，因此在銷售方式上有一定的侷限。",
        hover: "[ 工作 ] 寵物公園門市顧問",
        links: []
      },
      {
        id: "study-2025-04",
        date: "2025.04",
        title: "歡迎來到2024-09~2025-03，此時我在：",
        story: "這是一個比較迷茫的時期，我不太清楚自己要做什麼，因此我嘗試了不同的事情。\n在25年9月的時候，我在**短期打工**中，我得知姑姑有在經營咖啡品牌，並且希望能夠增加網路上的曝光，而我腦中第一個浮現的就是網站。\n從零開始摸索怎麼製作網站的時候我才發現，光是技術、課程的選擇與學習就需要花上大量的時間。後來我**一邊實作一邊學習**，並有過幾次**技術更換**，最終我做出**可以互動的訂單後台網頁**。\n雖然網站還有部分功能尚未完成，但經過這次的體驗，讓我了解到**網頁製作並不是一件簡單的事情**。\n在12月的時候，我偶然得知勞動部與中正大學有合開一個關於**AI、大數據、半導體和量子電腦的課程**，於是和朋友一同報名。課程總共有3個月，由於涵蓋的範圍較廣、程度也比較高，因此我的收穫比較偏向職涯探索，以及更了解不同領域是怎麼運作的。",
        hover: "[ 工作 ] 台中的鞋子活動檔期打工；\n [ 學習 ] 中正大學與勞動部 AIx量子x數據分析課程；\n[ 學習 ] 全端_訂單後台網站（未完成）",
        links: [
          { label: "訂單後台", action: "practice", practiceId: "order-management-system", available: false }
        ]
      },
      {
        id: "coding-2024-08",
        date: "2024.08",
        title: "歡迎來到2024-07~2024-08，此時我在：",
        story: "在7月，我應徵上了第一份工作，**寶雅的儲備幹部**，同時也報名了**汽車駕訓班**。\n那時候我早上7點去練習汽車一個小時，下午1點去寶雅上班，一直到晚上10點。\n後來我的汽車駕照的考試沒有通過，對門市的布局和流程也還沒有完全上手。\n我很沮喪，但這也讓我明白，**除了想要做的事情外，也要考慮自身的體能與邊界**。\n因此我辭去了工作，專心練車，最後我拿到了駕照。",
        hover: "[ 工作 ] 寶雅門市儲備組長\n[ 學習 ] 汽車駕照",
        links: []
      },
      {
        id: "graduate-2024-06",
        date: "2024.06",
        title: "歡迎來到2024-06，此時我在：",
        story: "我剛從亞洲大學數位媒體設計學系遊戲組畢業。\n我們那一組的畢業專題主要製作一款2.5D的劇情向遊戲。\n我負責遊戲的場景繪畫和程式製作，因為過程中沒有收束劇情，加上工作分配不均，導致畢業專題有部分未完成。\n但是我們**透過討論、互相幫助還是完成了專題報告、展覽**。對我來說，這是一個很寶貴的體驗，讓我實際經歷了**時間安排規劃、能力審視以及大量的程式實作**。",
        hover: "[ 學習 ] 亞洲大學數位媒體設計學系遊戲組畢業",
        links: []
      }
    ],

    files: {
      excel: {
        name: "MOS EXCEL EXPERT",
        description: "",
        preview: "assets/PDF/excel-2019-expert.pdf",
        previewType: "pdf"
      },
      word: {
        name: "TQC WORD 專業級",
        description: "",
        preview: "assets/PDF/tqc-word.pdf",
        previewType: "pdf"
      }
    },

    practices: {
      acceptance: {
        categoryTitle: "驗收測試→",
        navLabel: "Automation Exercise",
        intro: "使用 AI 模擬需求規格，在實作過程中了解驗收測試怎麼做。",
        object: "Automation Exercise",
        flowSteps: ["AI 模擬需求規格", "需求規格拆解", "測試案例設計", "測試運行"],
        review: [
          "需求規格文件外的測試案例        [ 作法 ] 在表格中將該測試案例來源另外標註",
          "撰寫步驟說明時不清楚測試對象有哪些欄位        [ 作法 ] 直接到目標網站觀察具體欄位",
          "預期結果與實際結果的文字撰寫不夠具體        [ 下次 ] 說明文字要以具體可執行為目標",
          "測試運行時採用優先測試有因果關聯的案例        [ 待確認 ] 該方法是否在正式業務上使用 ",
          "拆解測試案例後才意識到部分案例有遺漏        [下次 ] 流程圖標註與使用測試基本工具 ",
          "後續學習發現錯誤紀錄應該包含還原步驟        [ 下次 ] 紀錄還原步驟，並至少兩次觸發相同錯誤才進行記錄"
        ],
        testCharters: [],
        documents: [
          {
            id: "acceptance-requirements",
            label: "需求規格",
            description: "// AI生成需求規格以及我的測試案例拆解",
            preview: "assets/PDF/acceptance-requirements.pdf",
            url: "assets/PDF/acceptance-requirements.pdf",
            download: "assets/PDF/acceptance-requirements.pdf"
          },
          {
            id: "acceptance-test-cases",
            label: "測試案例",
            description: "// 包含測試步驟、前置條件、預期結果與測試結果。",
            preview: "assets/previews/acceptance-test-cases.html",
            url: "assets/previews/acceptance-test-cases.html",
            download: "assets/excel/acceptance-test-cases.xlsx"
          }
        ]
      },
      exploratory: {
        categoryTitle: "探索測試→",
        navLabel: "Toolshop Website",
        intro: "使用心智圖、手動和腳本進行探索，了解探索測試怎麼做",
        object: "Toolshop Website",
        flowSteps: [
          "心智圖探索測試對象",
          "手動/腳本進行區域探索",
          "拆解測試案例",
          "紀錄探索結果",
          "整理成自動化測試腳本"
        ],
        review: [
          "使用同一組測試資料導致該資料後續無法使用        [ 下次 | 邊探索就要邊建立多組資料 ]",
          "網頁探索時候遇到不知道的機制        [ 作法 | 及時調整測試方式以及紀錄遇到的情況 ]",
          "[ 作法 | 以心智圖探索測試對象，目的是找出有哪些區域可以測試，並將這些區域排出先後，再深入探索。]",
          "[ 作法 | 邊探索邊學習 Playwright 工具的使用：\n採用codegen錄製，再修改Locators和添加斷言，過程中使用Playwright Inspector與Trace Viewer 觀察並記錄測試過程 ]"
        ],
        testCharters: [
          {
            id: "login-form",
            label: "登入表單",
            scope: "登入表單填寫欄位",
            focus: "檢查用戶錯誤填寫時的文字提醒，以及欄位資料填寫的邊界",
            files: [
              {
                label: "Test_login_first.py ..    [100%]",
                info: "因為ToolShop每隔一段時間就會將帳號刪除，\n所以該檔案負責確認測試所需的帳號是否仍存在於資料庫中",
                preview: null,
                url: null,
                download: null
              },
              {
                label: "Test_login_form.py ....F..FF    [100%]",
                info: "通過：6  不通過：3\n1個可能的錯誤：密碼長度小於等於7\n2個系統機制導致的錯誤：同一帳號重複錯誤登入",
                preview: null,
                url: null,
                download: "assets/PDF/Test_login_form.pdf"
              }
            ],
            image: "assets/images/exploratory-login-scope.png"
          },
          {
            id: "forgot-password",
            label: "忘記密碼表單",
            scope: "忘記密碼表單填寫及其流程",
            focus: "檢查用戶錯誤填寫時的文字提醒、欄位資料填寫的邊界，以及忘記密碼的完整流程",
            files: [
              {
                label: "Test_forget_password_form.py ..FF.F [100%]",
                info: "通過：3 不通過：3\n1個發現的錯誤：非合法郵箱輸入\n1個測試操作不準確：郵箱輸入字數限制\n1個可能的流程錯誤：已註冊且合法郵箱輸入",
                preview: null,
                url: null,
                download: "assets/PDF/Test_forget_password_form.pdf"
              }
            ],
            image: "assets/images/forget_password_form.png"
          }
        ],
        documents: [{
            id: "exploratory-mindmap",
            label: "心智圖",
            description: "探索目標對象的網站框架和部分區域",
            preview: "assets/PDF/ToolShop User Flow.pdf",
            url: "assets/PDF/ToolShop User Flow.pdf",
            download: "assets/PDF/ToolShop User Flow.pdf"
          },]
      },
      backend: {
        categoryTitle: "從後端學軟體測試→",
        navLabel: "尚未整理",
        intro: "",
        object: "",
        flowSteps: [],
        review: [],
        testCharters: [],
        documents: [],
        pending: true
      },
      "order-management-system": {
        categoryTitle: "訂單後台→",
        navLabel: "訂單後台網站",
        intro: "",
        object: "",
        flowSteps: [],
        review: [],
        testCharters: [],
        documents: [],
        pending: true
      }
    }
  };
}());
