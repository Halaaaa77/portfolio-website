/*
File: events.js
Purpose:
- 只處理使用者事件與流程判斷。
- 黃色流程：先更新資料內容。
- 綠色流程：判斷成立後再切換 View。

HTML interfaces:
- [data-timeline-id]
- [data-related-links], [data-action], [data-file-id], [data-practice-id]
- [data-switch-practice]
- [data-practice-document]
- [data-open-file], [data-download-file]
- [data-map-target]

CSS classes touched directly:
- none
*/
(function () {
  const app = window.PortfolioV2 = window.PortfolioV2 || {};

  /*
  bindTimelineEvents()
  HTML: [data-timeline-id]
  CSS: none
  */
  function bindTimelineEvents() {
    document.querySelectorAll("[data-timeline-id]").forEach((segment) => {
      segment.addEventListener("click", () => {
        const updated = app.render.renderTimeline(segment.dataset.timelineId);
        if (!updated) return;

        segment.classList.remove("is-hover-ready");
        segment.addEventListener("pointerleave", () => {
          if (segment.classList.contains("is-active")) {
            segment.classList.add("is-hover-ready");
          }
        }, { once: true });

        app.navigation.sync();
      });
    });
  }

  /*
  bindRelatedLinkEvents()
  HTML: [data-related-links], [data-action], [data-file-id], [data-practice-id]
  CSS: none
  IF: 一般檔案與實作使用不同更新函數、不同 View。
  */
  function bindRelatedLinkEvents() {
    document.querySelector("[data-related-links]").addEventListener("click", (event) => {
      const target = event.target.closest("[data-action]");
      if (!target) return;

      if (target.dataset.action === "file" && target.dataset.fileId) {
        const updated = app.render.renderFile(target.dataset.fileId);
        if (updated) app.navigation.goTo("file");
        return;
      }

      if (target.dataset.action === "practice" && target.dataset.practiceId) {
        const updated = app.render.renderPractice(target.dataset.practiceId);
        if (updated) app.navigation.goTo("practice");
      }
    });
  }

  /*
  bindPracticeEvents()
  HTML: [data-switch-practice], [data-practice-document], [data-open-file], [data-download-file]
  CSS: none
  IF:
  - 實作檔案 View 中切換實作：先更新，再回實作展示 View。
  - 同一份實作文件再次點擊：回實作展示 View。
  - 不同文件：更新文件內容，再切實作檔案 View。
  */
  function bindPracticeEvents() {
    document.addEventListener("click", (event) => {
      const closeFile = event.target.closest("[data-close-file]");
      if (closeFile) {
        app.navigation.goTimeline();
        return;
      }

      const closePractice = event.target.closest("[data-close-practice]");
      if (closePractice) {
        app.navigation.goTimeline();
        return;
      }

      const switchButton = event.target.closest("[data-switch-practice]");
      if (switchButton) {
        const practiceId = switchButton.dataset.switchPractice;
        const updated = app.render.renderPractice(practiceId);

        if (updated && app.state.currentView === "practice-file") {
          app.navigation.goTo("practice");
        } else if (updated) {
          app.navigation.sync();
        }
        return;
      }


      const charterFileButton = event.target.closest("[data-charter-file-index]");
      if (charterFileButton) {
        const practice = app.data.practices[app.state.practiceId];
        const charter = practice?.testCharters?.find((item) => item.id === charterFileButton.dataset.charterId);
        const file = charter?.files?.[Number(charterFileButton.dataset.charterFileIndex)];
        if (file) app.render.renderCharterFilePreview(file);
        return;
      }

      const charterButton = event.target.closest("[data-charter-id]");
      if (charterButton) {
        const practice = app.data.practices[app.state.practiceId];
        const charter = practice?.testCharters?.find((item) => item.id === charterButton.dataset.charterId);
        if (charter) {
          document.querySelectorAll("[data-charter-id]").forEach((button) => {
            const isActive = button === charterButton;
            button.classList.toggle("is-active", isActive);
            button.classList.toggle("is-inactive", !isActive);
            button.setAttribute("aria-pressed", String(isActive));
          });
          app.render.renderPracticeCharterDetail(charter);
        }
        return;
      }

      const docButton = event.target.closest("[data-practice-document]");
      if (docButton && app.state.currentView === "practice") {
        const practiceId = app.state.practiceId;
        const documentId = docButton.dataset.practiceDocument;
        const isSameOpenDocument = app.state.documentId === documentId;

        if (isSameOpenDocument) {
          app.state.documentId = null;
          app.render.renderPractice(practiceId);
          app.navigation.sync();
          return;
        }

        const updated = app.render.renderPracticeInlineDocument(practiceId, documentId);
        if (updated) app.navigation.sync();
        return;
      }

      const openButton = event.target.closest("[data-open-file], [data-inline-open-file], [data-charter-file-open]");
      if (openButton) {
        const url = openButton.dataset.url;
        if (url && url !== "#") window.open(url, "_blank", "noopener");
        return;
      }

      const downloadButton = event.target.closest("[data-download-file], [data-inline-download-file], [data-charter-file-download]");
      if (downloadButton) {
        const url = downloadButton.dataset.url;
        if (url && url !== "#") {
          const anchor = document.createElement("a");
          anchor.href = url;
          anchor.download = "";
          anchor.click();
        }
      }
    });
  }

  /*
  bindMindmapEvents()
  HTML: [data-map-target]
  CSS: none
  Purpose: 心智圖文字點擊跳轉到既有區塊；不建立新區塊。
  */
  function bindMindmapEvents() {
    document.querySelectorAll("[data-map-target]").forEach((button) => {
      button.addEventListener("click", () => {
        const target = button.dataset.mapTarget;

        if (target === "intro") {
          document.querySelector("#intro")?.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }

        if (target === "practice") {
          const updated = app.render.renderPractice(app.state.practiceId);
          if (updated) {
            app.navigation.goTo("practice");
            document.querySelector("#view-area")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      });
    });
  }

  /*
  bindFooterEvents()
  HTML: [data-home-link]
  CSS: none
  Purpose: Footer「回到時間線」回到目前來源的 Timeline 狀態並定位到時間線。
  */
  function bindFooterEvents() {
    document.querySelector(".back-to-map")?.addEventListener("click", (event) => {
      event.preventDefault();
      app.navigation.goMindmap();
    });

    document.querySelector("[data-home-link]")?.addEventListener("click", (event) => {
      event.preventDefault();
      app.navigation.goTimeline();
    });
  }

  function bindCloseKeyEvents() {
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const target = event.target.closest("[data-close-file], [data-close-practice]");
      if (!target) return;
      event.preventDefault();
      app.navigation.goTimeline();
    });
  }

  app.events = {
    bind() {
      bindTimelineEvents();
      bindRelatedLinkEvents();
      bindPracticeEvents();
      bindMindmapEvents();
      bindFooterEvents();
      bindCloseKeyEvents();
    }
  };
}());
