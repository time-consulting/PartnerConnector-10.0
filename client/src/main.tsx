import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Register service worker for PWA support
// Only register in production to avoid caching issues during development
if (process.env.NODE_ENV === 'production') {
  serviceWorkerRegistration.register({
    onUpdate: (registration) => {
      // Notify user when a new version is available
      const shouldUpdate = window.confirm(
        'A new version is available! Would you like to refresh?'
      );
      if (shouldUpdate && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    },
    onSuccess: (registration) => {
      console.log('Content is cached for offline use.');
    }
  });
} else {
  // Unregister service worker in development to avoid caching issues
  serviceWorkerRegistration.unregister();
}
