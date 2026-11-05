
import React from "react";
import { renderToString } from "react-dom/server";
import App from "./src/App";

(global as any).window = {
  matchMedia: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} })
};

(global as any).localStorage = {
  getItem: (k: string) => k === "obra_gestao_active_tab" ? "recibos" : null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};

// Also let us check RecibosView previewRecibo state
