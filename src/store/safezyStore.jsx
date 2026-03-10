import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";

const ANALYSES_KEY = "safezy_analyses";
const SETTINGS_KEY = "safezy_settings";

const initialState = {
  analyses: [],
  liveQueue: [],
  settings: {
    theme: "dark",
    notifications: true,
    autoSaveCerts: true,
    analysisMode: "standard",
    exportFormat: "pdf",
    language: "en",
    sessionResetOnClose: false,
  },
};

function loadPersistedState() {
  let analyses = [];
  let settings = initialState.settings;
  try {
    const rawAnalyses = window.localStorage.getItem(ANALYSES_KEY);
    if (rawAnalyses) {
      analyses = JSON.parse(rawAnalyses);
    }
  } catch {
    analyses = [];
  }
  try {
    const rawSettings = window.localStorage.getItem(SETTINGS_KEY);
    if (rawSettings) {
      settings = { ...settings, ...JSON.parse(rawSettings) };
    }
  } catch {
    settings = initialState.settings;
  }
  return { analyses, settings };
}

function persistAnalyses(analyses) {
  try {
    const trimmed = analyses.slice(-50);
    window.localStorage.setItem(ANALYSES_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore
  }
}

function persistSettings(settings) {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

function reducer(state, action) {
  switch (action.type) {
    case "INIT_FROM_STORAGE": {
      const { analyses, settings } = action.payload;
      return { ...state, analyses, settings };
    }
    case "ADD_ANALYSIS": {
      const analysis = action.payload;
      const analyses = [...state.analyses, analysis];
      persistAnalyses(analyses);
      return { ...state, analyses };
    }
    case "UPDATE_LIVE": {
      const item = action.payload;
      let liveQueue = [...state.liveQueue];
      const idx = liveQueue.findIndex((q) => q.id === item.id);
      if (idx === -1) {
        liveQueue.push(item);
      } else {
        liveQueue[idx] = { ...liveQueue[idx], ...item };
      }
      liveQueue = liveQueue.filter((q) => q.status !== "done");
      return { ...state, liveQueue };
    }
    case "UPDATE_SETTINGS": {
      const settings = { ...state.settings, ...action.payload };
      persistSettings(settings);
      return { ...state, settings };
    }
    case "CLEAR_HISTORY": {
      persistAnalyses([]);
      return { ...state, analyses: [], liveQueue: [] };
    }
    default:
      return state;
  }
}

const SafezyStoreContext = createContext(null);

export function SafezyStoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const { analyses, settings } = loadPersistedState();
    dispatch({ type: "INIT_FROM_STORAGE", payload: { analyses, settings } });
  }, []);

  const value = useMemo(
    () => ({
      state,
      dispatch,
    }),
    [state],
  );

  return <SafezyStoreContext.Provider value={value}>{children}</SafezyStoreContext.Provider>;
}

export function useSafezyStore() {
  const ctx = useContext(SafezyStoreContext);
  if (!ctx) {
    throw new Error("useSafezyStore must be used within SafezyStoreProvider");
  }
  return ctx;
}

