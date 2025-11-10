import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// CRITICAL: Unregister service worker to clear cache and stop flickering
// The service worker was causing infinite reload loops and serving stale cached bundles
serviceWorkerRegistration.unregister();
