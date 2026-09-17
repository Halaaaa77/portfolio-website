/*
File: main.js
Purpose:
- 建立目前狀態。
- 管理 View 的 URL / history 狀態。
- 重新整理時恢復原本 View。
- 非首頁 View 按瀏覽器上一頁時回到首頁 Timeline。

HTML interfaces:
- #mindmap（回首頁時的捲動目標）

CSS classes touched directly:
- none
*/
(function () {
  const app = window.PortfolioV2 = window.PortfolioV2 || {};

  app.state = {
    currentView: "timeline",
    timelineId: app.data.initialTimelineId,
    fileId: null,
    practiceId: "exploratory",
    documentId: null
  };

  const HOME_VIEW = "timeline";
  const HISTORY_KEY = "portfolioV2";

  function snapshot(overrides = {}) {
    return {
      [HISTORY_KEY]: true,
      currentView: app.state.currentView,
      timelineId: app.state.timelineId,
      fileId: app.state.fileId,
      practiceId: app.state.practiceId,
      documentId: app.state.documentId,
      ...overrides
    };
  }

  function makeUrl(state) {
    const params = new URLSearchParams();
    params.set("view", state.currentView || HOME_VIEW);

    if (state.timelineId) params.set("timeline", state.timelineId);
    if (state.currentView === "file" && state.fileId) params.set("file", state.fileId);
    if ((state.currentView === "practice" || state.currentView === "practice-file") && state.practiceId) {
      params.set("practice", state.practiceId);
    }
    if ((state.currentView === "practice" || state.currentView === "practice-file") && state.documentId) {
      params.set("document", state.documentId);
    }

    return `#${params.toString()}`;
  }

  function stateFromUrl() {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const view = params.get("view") || HOME_VIEW;
    const validViews = new Set(["timeline", "file", "practice", "practice-file"]);

    return {
      [HISTORY_KEY]: true,
      currentView: validViews.has(view) ? view : HOME_VIEW,
      timelineId: params.get("timeline") || app.data.initialTimelineId,
      fileId: params.get("file"),
      practiceId: params.get("practice") || "exploratory",
      documentId: params.get("document")
    };
  }

  function restoreState(targetState, { scrollTimeline = false, animateView = true } = {}) {
    const target = { ...snapshot(), ...targetState };

    app.render.renderTimeline(target.timelineId || app.data.initialTimelineId);

    if (target.currentView === "file") {
      if (!target.fileId || !app.render.renderFile(target.fileId)) {
        target.currentView = HOME_VIEW;
      }
    } else if (target.currentView === "practice") {
      if (!app.render.renderPractice(target.practiceId || "exploratory")) {
        target.currentView = HOME_VIEW;
      } else if (target.documentId) {
        app.render.renderPracticeInlineDocument(target.practiceId || "exploratory", target.documentId);
      }
    } else if (target.currentView === "practice-file") {
      if (!target.documentId || !app.render.renderPracticeDocument(target.practiceId || "exploratory", target.documentId)) {
        target.currentView = HOME_VIEW;
      }
    }

    if (target.currentView === HOME_VIEW) {
      app.state.fileId = null;
      app.state.documentId = null;
    }

    const viewChange = app.render.showView(target.currentView, { animate: animateView });

    if (scrollTimeline && target.currentView === HOME_VIEW) {
      viewChange.then(() => {
        document.querySelector("#view-area")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

  function replaceCurrentHistory() {
    const current = snapshot();
    history.replaceState(current, "", makeUrl(current));
  }

  function goTo(view) {
    const wasHome = app.state.currentView === HOME_VIEW;
    app.render.showView(view);
    const current = snapshot();

    if (view !== HOME_VIEW && wasHome) {
      history.pushState(current, "", makeUrl(current));
    } else {
      history.replaceState(current, "", makeUrl(current));
    }
  }

  function sync() {
    replaceCurrentHistory();
  }

  function goTimeline(timelineId = app.state.timelineId) {
    const targetTimelineId = timelineId || app.data.initialTimelineId;
    restoreState({
      currentView: HOME_VIEW,
      timelineId: targetTimelineId,
      fileId: null,
      documentId: null
    }, { scrollTimeline: true });
    replaceCurrentHistory();
  }

  function goMindmap() {
    const targetTimelineId = app.state.timelineId || app.data.initialTimelineId;
    const viewChange = restoreState({
      currentView: HOME_VIEW,
      timelineId: targetTimelineId,
      fileId: null,
      documentId: null
    }, { scrollTimeline: false });
    replaceCurrentHistory();

    Promise.resolve(viewChange).then(() => {
      requestAnimationFrame(() => {
        document.querySelector("#mindmap")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  app.navigation = {
    goTo,
    goTimeline,
    goMindmap,
    sync,
    restoreState
  };

  function init() {
    app.render.renderStaticText();

    const requested = stateFromUrl();
    const existingHistoryState = history.state?.[HISTORY_KEY] ? history.state : null;
    const initialState = existingHistoryState || requested;

    if (initialState.currentView !== HOME_VIEW && !existingHistoryState) {
      const homeState = {
        ...initialState,
        currentView: HOME_VIEW,
        fileId: null,
        documentId: null
      };
      history.replaceState(homeState, "", makeUrl(homeState));
      history.pushState(initialState, "", makeUrl(initialState));
    } else {
      history.replaceState(initialState, "", makeUrl(initialState));
    }

    restoreState(initialState, { animateView: false });
    app.events.bind();

    window.addEventListener("popstate", (event) => {
      const target = event.state?.[HISTORY_KEY] ? event.state : stateFromUrl();
      restoreState(target, { scrollTimeline: target.currentView === HOME_VIEW });
    });
  }

  init();
}());
