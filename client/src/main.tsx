import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// CRITICAL: Force unregister ALL service workers to clear cache
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister().then(() => {
        console.log('Service worker unregistered:', registration);
      });
    }
    // Clear all caches
    if ('caches' in window) {
      caches.keys().then(function(names) {
        for (let name of names) {
          caches.delete(name);
        }
      });
    }
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
