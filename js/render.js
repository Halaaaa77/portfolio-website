/*
File: render.js
Purpose:
- 更新既有 HTML 的內容。
- 切換既有 View 的顯示狀態。
- 不建立時間線、實作流程等主要靜態 HTML 結構。

HTML interfaces:
- [data-static-text]
- [data-view]
- [data-timeline-month]
- [data-timeline-id]
- [data-timeline-title]
- [data-timeline-story]
- [data-related-links]
- [data-file-name], [data-file-description], [data-file-preview]
- [data-practice-list], [data-practice-intro], [data-practice-object]
- [data-practice-files], [data-flow-step], [data-practice-review]
- [data-practice-file-list], [data-practice-file-intro], [data-practice-file-object]
- [data-practice-file-tabs], [data-practice-document-description], [data-practice-document-preview]

CSS classes touched by JS:
- .is-hidden
- .is-active
- .is-hover-ready
- .is-view-leaving / .is-view-entering
- .related-link
- .practice-item
- .practice-file-button
*/
(function () {
  const app = window.PortfolioV2 = window.PortfolioV2 || {};

  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  function qsa(selector, root = document) {
    return [...root.querySelectorAll(selector)];
  }

  function getPath(object, path) {
    return path.split(".").reduce((value, key) => value?.[key], object);
  }

  // Parse only the inline **bold** syntax used by timeline story data.
  // Text nodes are created explicitly so story content remains safe HTML.
  function renderInlineBold(element, text) {
    const value = String(text ?? "");
    const parts = value.split(/(\*\*[^*]+\*\*)/g);
    element.replaceChildren();
    parts.forEach((part) => {
      if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
        const strong = document.createElement("strong");
        strong.textContent = part.slice(2, -2);
        element.append(strong);
      } else if (part) {
        element.append(document.createTextNode(part));
      }
    });
  }

  /*
  renderStaticText()
  HTML: [data-static-text], [data-timeline-month], [data-timeline-id]
  CSS: .timeline-date--hidden
  Purpose:
  - 將 data.js 的固定文字填入既有 HTML，不建立時間線元素。
  - 每一個月份都有既有格位；只顯示 timelineMonths 中 showLabel=true 的日期。
  - Hover 詳細文字寫進時間區塊本身的 data-hover，交由 CSS ::after 顯示。
  */
  function renderStaticText() {
    qsa("[data-static-text]").forEach((element) => {
      const value = getPath(app.data.staticText, element.dataset.staticText);
      if (typeof value === "string") element.textContent = value;
    });

    app.data.timelineMonths.forEach((month) => {
      const date = qs(`[data-timeline-month="${month.value}"]`);
      if (!date) return;

      date.textContent = month.showLabel ? month.value : "";
      date.classList.toggle("timeline-date--hidden", !month.showLabel);
    });

    app.data.timeline.forEach((item) => {
      const segment = qs(`[data-timeline-id="${item.id}"]`);
      if (!segment) return;

      segment.dataset.hover = item.hover;
      segment.setAttribute("aria-label", `查看 ${item.date} 經歷`);
    });
  }


  function renderGuide(viewName) {
    const guide = qs("[data-guide-text]");
    if (!guide) return;
    guide.textContent = app.data.staticText.guide?.byView?.[viewName] || "";
  }

  /*
  showView(name)
  HTML: [data-view]
  CSS: .is-hidden
  Purpose: 切換 Timeline / File / Practice / Practice File 四個既有區塊。
  */
  let viewTransitionTimer = null;
  let viewTransitionToken = 0;

  function showView(name, { animate = true } = {}) {
    const views = qsa("[data-view]");
    const current = views.find((view) => !view.classList.contains("is-hidden"));
    const target = views.find((view) => view.dataset.view === name);
    const timelineReturn = qs("[data-home-link]");

    app.state.currentView = name;
    renderGuide(name);
    if (timelineReturn) timelineReturn.classList.toggle("is-hidden", name === "timeline");
    if (!target) return Promise.resolve();

    clearTimeout(viewTransitionTimer);
    const token = ++viewTransitionToken;

    if (!animate || !current || current === target) {
      views.forEach((view) => {
        view.classList.remove("is-view-leaving", "is-view-entering");
        view.classList.toggle("is-hidden", view !== target);
      });
      return Promise.resolve();
    }

    current.classList.add("is-view-leaving");

    return new Promise((resolve) => {
      viewTransitionTimer = setTimeout(() => {
        if (token !== viewTransitionToken) {
          resolve();
          return;
        }

        views.forEach((view) => {
          view.classList.remove("is-view-leaving", "is-view-entering");
          view.classList.add("is-hidden");
        });

        target.classList.remove("is-hidden");
        target.classList.add("is-view-entering");

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            target.classList.remove("is-view-entering");
            viewTransitionTimer = setTimeout(resolve, 180);
          });
        });
      }, 180);
    });
  }

  /*
  renderTimeline(id)
  HTML: [data-timeline-title], [data-timeline-story], [data-timeline-id], [data-related-links]
  CSS: .is-active, .related-link, .related-link--practice, .related-link--file
  Purpose: 更新選定時間點的文字與相關連結。時間塊本身已存在 HTML。
  */
  function renderTimeline(id) {
    const item = app.data.timeline.find((entry) => entry.id === id);
    if (!item) return false;

    app.state.timelineId = item.id;
    qs("[data-timeline-title]").textContent = item.title;
    renderInlineBold(qs("[data-timeline-story]"), item.story);

    qsa("[data-timeline-id]").forEach((button) => {
      const isActive = button.dataset.timelineId === item.id;
      button.classList.toggle("is-active", isActive);
      button.classList.toggle("is-hover-ready", isActive);
    });

    const links = qs("[data-related-links]");
    links.replaceChildren();

    item.links.forEach((link) => {
      const button = document.createElement("button");
      button.type = "button";
      const isPending = link.available === false;
      button.className = `related-link related-link--${link.action}${isPending ? " is-pending" : ""}`;
      button.textContent = link.label;
      button.disabled = isPending;
      button.setAttribute("aria-disabled", String(isPending));
      if (!isPending) {
        button.dataset.action = link.action;
        if (link.fileId) button.dataset.fileId = link.fileId;
        if (link.practiceId) button.dataset.practiceId = link.practiceId;
      }
      links.append(button);
    });

    return true;
  }

  /*
  renderFile(fileId)
  HTML: [data-file-name], [data-file-description], [data-file-preview]
  CSS: none
  Purpose: 更新「一般檔案展示區塊」。此區塊與實作檔案展示區塊不同。
  */
  function renderFile(fileId) {
    const file = app.data.files[fileId];
    if (!file) return false;

    app.state.fileId = fileId;
    qs("[data-file-name]").textContent = file.name;

    const description = qs("[data-file-description]");
    const descriptionText = String(file.description || "").trim();
    const hasDescription = descriptionText && !/如果有說明/.test(descriptionText);
    description.textContent = hasDescription ? descriptionText : "";
    description.hidden = !hasDescription;

    const image = qs("[data-file-preview]");
    const frame = qs("[data-file-preview-frame]");
    const isPdf = file.previewType === "pdf" || /\.pdf(?:$|[?#])/i.test(file.preview || "");
    if (image) {
      image.classList.toggle("is-hidden", isPdf);
      if (!isPdf) {
        image.src = file.preview;
        image.alt = `${file.name}預覽`;
      }
    }
    if (frame) {
      frame.classList.toggle("is-hidden", !isPdf);
      if (isPdf) frame.src = file.preview;
      else frame.removeAttribute("src");
      frame.title = `${file.name}預覽`;
    }
    return true;
  }

  /*
  renderPracticeList(rootSelector, activeId)
  HTML: [data-practice-list] 或 [data-practice-file-list]
  CSS: .practice-list-title, .practice-list-buttons, .practice-item, .is-active
  Purpose: 實作項目數量屬於資料，因此按鈕由 practices 資料建立。
  */
  function renderPracticeList(rootSelector, activeId) {
    const root = qs(rootSelector);
    const activePractice = app.data.practices[activeId];
    root.replaceChildren();

    const title = document.createElement("div");
    title.className = "practice-list-title";
    title.dataset.closePractice = "";
    title.setAttribute("role", "button");
    title.tabIndex = 0;
    title.textContent = activePractice?.categoryTitle || "";

    const buttonGroup = document.createElement("div");
    buttonGroup.className = "practice-list-buttons";

    Object.entries(app.data.practices)
      .filter(([, practice]) => practice.categoryTitle === activePractice?.categoryTitle)
      .forEach(([id, practice]) => {
        const button = document.createElement("button");
        button.type = "button";
        const isPending = practice.pending === true;
        const isActive = id === activeId;
        button.className = `practice-item${isActive ? " is-active" : " is-inactive"}${isPending ? " is-pending" : ""}`;
        button.textContent = practice.navLabel || practice.object || "";
        button.disabled = isPending;
        button.setAttribute("aria-disabled", String(isPending));
        button.setAttribute("aria-pressed", String(isActive));
        if (!isPending) button.dataset.switchPractice = id;
        buttonGroup.append(button);
      });

    root.append(title, buttonGroup);
  }

  /*
  renderPracticeFiles(rootSelector, practice, activeDocumentId)
  HTML: [data-practice-files] 或 [data-practice-file-tabs]
  CSS: .practice-file-button, .is-active
  Purpose: 文件數量屬於資料，因此依目前實作資料建立按鈕。
  */
  function renderPracticeFiles(rootSelector, practice, activeDocumentId = null) {
    const root = qs(rootSelector);
    root.replaceChildren();

    practice.documents.forEach((doc) => {
      const button = document.createElement("button");
      button.type = "button";
      const isPending = doc.pending === true;
      button.className = `practice-file-button${doc.id === activeDocumentId ? " is-active" : ""}${isPending ? " is-pending" : ""}`;
      button.textContent = doc.label;
      button.disabled = isPending;
      button.setAttribute("aria-disabled", String(isPending));
      if (!isPending) button.dataset.practiceDocument = doc.id;
      root.append(button);
    });
  }

  function renderPracticeCharters(practice, activeCharterId = null) {
    const section = qs("[data-practice-charter]");
    const tabs = qs("[data-charter-tabs]");
    if (!section || !tabs) return;

    const charters = Array.isArray(practice.testCharters) ? practice.testCharters : [];
    const shouldShow = practice === app.data.practices.exploratory && charters.length > 0;
    section.classList.toggle("is-hidden", !shouldShow);
    tabs.replaceChildren();

    if (!shouldShow) {
      renderPracticeCharterDetail(null);
      return;
    }

    charters.forEach((charter, index) => {
      const button = document.createElement("button");
      button.type = "button";
      const active = charter.id === activeCharterId || (!activeCharterId && index === 0);
      button.className = `practice-charter-button${active ? " is-active" : " is-inactive"}`;
      button.dataset.charterId = charter.id;
      button.setAttribute("aria-pressed", String(active));
      button.textContent = charter.label || `Test Charter ${index + 1}`;
      tabs.append(button);
    });

    const active = charters.find((item) => item.id === activeCharterId) || charters[0];
    renderPracticeCharterDetail(active);
  }

  function renderPracticeCharterDetail(charter) {
    const values = {
      "[data-charter-scope]": charter?.scope,
      "[data-charter-focus]": charter?.focus,
      "[data-charter-result]": charter?.result
    };
    Object.entries(values).forEach(([selector, value]) => {
      const element = qs(selector);
      if (element) element.textContent = value || "—";
    });

    const filesRoot = qs("[data-charter-files]");
    if (filesRoot) {
      filesRoot.replaceChildren();
      const files = Array.isArray(charter?.files) ? charter.files : [];
      if (!files.length) {
        filesRoot.textContent = "—";
      } else {
        const list = document.createElement("div");
        list.className = "practice-charter-file-list";
        files.forEach((file) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "practice-charter-file-button";
          button.textContent = [file.label, file.status].filter(Boolean).join("   ");
          button.dataset.charterFileIndex = String(files.indexOf(file));
          button.dataset.charterId = charter.id;
          list.append(button);
        });
        filesRoot.append(list);
      }
    }

    const charterFilePreview = qs("[data-charter-file-preview]");
    if (charterFilePreview) charterFilePreview.classList.add("is-hidden");

    const visualWrap = qs("[data-charter-visual-wrap]");
    const visual = qs("[data-charter-visual]");
    const hasImage = Boolean(charter?.image);
    if (visualWrap) visualWrap.classList.toggle("is-hidden", !hasImage);
    if (visual) {
      if (hasImage) visual.src = charter.image;
      else visual.removeAttribute("src");
      visual.alt = charter?.label ? `${charter.label}測試畫面` : "Test Charter 測試畫面";
    }
  }

  function renderCharterFilePreview(file) {
    const panel = qs("[data-charter-file-preview]");
    if (!panel || !file) return false;

    panel.classList.remove("is-hidden");
    const description = qs("[data-charter-file-description]");
    if (description) description.textContent = file.info || file.label || "";

    const frame = qs("[data-charter-file-frame]");
    const empty = qs("[data-charter-file-empty]");
    const open = qs("[data-charter-file-open]");
    const download = qs("[data-charter-file-download]");
    const hasExplicitPreview = Boolean(file.preview && file.preview !== "#" && file.preview !== "無");
    const hasUrl = Boolean(file.url && file.url !== "#" && file.url !== "無");
    const hasDownload = Boolean(file.download && file.download !== "#" && file.download !== "無");
    // Test Charter 檔案若沒有另外設定 preview，但已有實際下載檔，
    // 直接使用該檔案作為預覽來源；兩者皆無時才顯示空檔提示。
    const previewSource = hasExplicitPreview ? file.preview : (hasDownload ? file.download : null);
    const hasPreview = Boolean(previewSource);

    if (frame) {
      frame.classList.toggle("is-hidden", !hasPreview);
      if (hasPreview) frame.src = previewSource;
      else frame.removeAttribute("src");
    }
    if (empty) {
      empty.textContent = "當前無檔案可以展示";
      empty.classList.toggle("is-hidden", hasPreview);
    }
    if (open) {
      open.classList.toggle("is-hidden", !hasUrl);
      open.dataset.url = hasUrl ? file.url : "#";
    }
    if (download) {
      download.classList.toggle("is-hidden", !hasDownload);
      download.dataset.url = hasDownload ? file.download : "#";
    }
    return true;
  }

  function showPracticeSteps() {
    qs(".practice-flow").classList.remove("is-hidden");
    qs("[data-practice-document-panel]").classList.add("is-hidden");
  }

  function renderPracticeInlineDocument(practiceId, documentId) {
    const practice = app.data.practices[practiceId];
    const doc = practice?.documents.find((entry) => entry.id === documentId);
    if (!practice || !doc) return false;

    app.state.practiceId = practiceId;
    app.state.documentId = documentId;
    renderPracticeFiles("[data-practice-files]", practice, documentId);
    qs("[data-practice-inline-description]").textContent = doc.description;
    const inlineOpen = qs("[data-inline-open-file]");
    const inlineDownload = qs("[data-inline-download-file]");
    if (inlineOpen) inlineOpen.dataset.url = doc.url || "#";
    if (inlineDownload) inlineDownload.dataset.url = doc.download || "#";
    const inlineFrame = qs("[data-practice-inline-preview]");
    const inlinePending = qs("[data-practice-inline-pending]");
    const hasPreview = Boolean(doc.preview && doc.preview !== "#");
    if (inlineFrame) {
      if (hasPreview) inlineFrame.src = doc.preview;
      else inlineFrame.removeAttribute("src");
      inlineFrame.classList.toggle("is-hidden", !hasPreview);
      inlineFrame.title = `${doc.label}預覽`;
    }
    if (inlinePending) inlinePending.classList.toggle("is-hidden", hasPreview);
    qs(".practice-flow").classList.add("is-hidden");
    qs("[data-practice-document-panel]").classList.remove("is-hidden");
    return true;
  }

  /*
  renderPractice(practiceId)
  HTML: [data-practice-list], [data-practice-intro], [data-practice-object],
        [data-practice-files], [data-flow-step], [data-practice-review]
  CSS: .practice-item, .practice-file-button, .is-active
  Purpose: 更新既有「實作展示區塊」的資料；流程骨架本身存在 HTML。
  */
  function renderPractice(practiceId) {
    const practice = app.data.practices[practiceId];
    if (!practice) return false;

    app.state.practiceId = practiceId;
    app.state.documentId = null;

    renderPracticeList("[data-practice-list]", practiceId);
    qs("[data-practice-intro]").textContent = practice.intro;
    qs("[data-practice-object]").textContent = practice.object;
    renderPracticeCharters(practice);
    renderPracticeFiles("[data-practice-files]", practice);
    showPracticeSteps();

    const hasFlowContent = practice.flowSteps.some(Boolean) || practice.review.some(Boolean);
    const flowSection = qs(".practice-flow");
    // Test Charter 是探索測試新增區塊，不取代原本的實作流程區。
    // 探索測試目前尚未補齊流程資料時，也保留原本區塊骨架。
    const keepOriginalFlow = practiceId === "exploratory";
    if (flowSection) flowSection.classList.toggle("is-hidden", !hasFlowContent && !keepOriginalFlow);

    const flowStepElements = qsa("[data-flow-step]");
    const visibleFlowSteps = practice.flowSteps.filter(Boolean);
    flowStepElements.forEach((element, index) => {
      element.textContent = visibleFlowSteps[index] || "";
      element.hidden = index >= visibleFlowSteps.length;
      element.classList.toggle("has-arrow", index < visibleFlowSteps.length - 1);
    });

    const review = qs("[data-practice-review]");
    review.replaceChildren();
    practice.review.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      review.append(li);
    });

    return true;
  }

  /*
  renderPracticeDocument(practiceId, documentId)
  HTML: [data-practice-file-list], [data-practice-file-intro], [data-practice-file-object],
        [data-practice-file-tabs], [data-practice-document-description],
        [data-practice-document-preview], [data-open-file], [data-download-file]
  CSS: .practice-item, .practice-file-button, .is-active
  Purpose: 更新「實作檔案展示區塊」，不與一般檔案展示區共用設計。
  */
  function renderPracticeDocument(practiceId, documentId) {
    const practice = app.data.practices[practiceId];
    const doc = practice?.documents.find((entry) => entry.id === documentId);
    if (!practice || !doc) return false;

    app.state.practiceId = practiceId;
    app.state.documentId = documentId;

    renderPracticeList("[data-practice-file-list]", practiceId);
    qs("[data-practice-file-intro]").textContent = practice.intro;
    qs("[data-practice-file-object]").textContent = practice.object;
    renderPracticeFiles("[data-practice-file-tabs]", practice, documentId);
    qs("[data-practice-document-description]").textContent = doc.description;
    const frame = qs("[data-practice-document-preview]");
    const pending = qs("[data-practice-document-pending]");
    const hasPreview = Boolean(doc.preview && doc.preview !== "#");
    if (frame) {
      if (hasPreview) frame.src = doc.preview;
      else frame.removeAttribute("src");
      frame.classList.toggle("is-hidden", !hasPreview);
      frame.title = `${doc.label}預覽`;
    }
    if (pending) pending.classList.toggle("is-hidden", hasPreview);
    qs("[data-open-file]").dataset.url = doc.url;
    qs("[data-download-file]").dataset.url = doc.download;
    return true;
  }

  app.render = {
    renderStaticText,
    renderGuide,
    showView,
    renderTimeline,
    renderFile,
    renderPractice,
    renderPracticeInlineDocument,
    renderPracticeCharterDetail,
    renderCharterFilePreview,
    showPracticeSteps,
    renderPracticeDocument
  };
}());
